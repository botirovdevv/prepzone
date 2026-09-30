// ------------------------------------------------------------------
// IELTS Writing — Claude orqali baholash (faqat serverda).
//
// Model: AI_WRITING_MODEL env (standart: claude-sonnet-5 — sifat/narx
// bo'yicha eng yaxshi muvozanat; arzonroq variant: claude-haiku-4-5).
// Rubrika system prompt'da va prompt caching bilan keshlanadi, javob
// structured output (JSON schema) orqali olinadi.
// Env: ANTHROPIC_API_KEY.
// ------------------------------------------------------------------
import Anthropic from "@anthropic-ai/sdk";
import { roundBand, wordCount } from "../src/utils/ieltsScoring.js";

const MODEL = process.env.AI_WRITING_MODEL || "claude-sonnet-5";

const RUBRIC = `You are a senior IELTS Academic Writing examiner. You grade candidate scripts strictly and consistently against the public IELTS Writing band descriptors, exactly as a trained examiner would. You never inflate scores to be encouraging.

## Criteria (each scored as a whole band 0-9)

### Task Achievement (Task 1) / Task Response (Task 2) — "ta"
- Task 1 (report on visual data): Band 9 fully satisfies all requirements with a clear, fully developed overview and accurately selected, highlighted and illustrated key features. Band 7 covers the requirements, presents a clear overview of main trends/differences/stages, and clearly highlights key features but could be more fully extended. Band 6 addresses requirements, presents an overview with information appropriately selected, but details may be irrelevant, inappropriate or inaccurate. Band 5 recounts detail mechanically with no clear overview, may have no data to support description, or focuses on details. Band 4 attempts the task but does not cover all key features; may confuse key features with detail. A missing overview normally caps this criterion at 5. Inaccurate data lowers the score. Personal opinions are irrelevant in Task 1.
- Task 2 (essay): Band 9 fully addresses all parts with a fully developed position and relevant, fully extended, well-supported ideas. Band 7 addresses all parts; presents a clear position throughout; main ideas extended and supported but may over-generalise or lack focus. Band 6 addresses all parts though some more fully than others; relevant position though conclusions may be unclear or repetitive; some ideas inadequately developed. Band 5 addresses the task only partially; position expressed but development not always clear; limited ideas, not sufficiently developed, possibly irrelevant detail. Band 4 responds minimally or tangentially; position unclear; ideas difficult to identify or repetitive.
- Under-length scripts (Task 1 under 150 words, Task 2 under 250 words) are penalised in this criterion. Scripts that are memorised, off-topic or copied from the prompt score very low; words copied from the prompt do not count.

### Coherence and Cohesion — "cc"
Band 9: cohesion attracts no attention; skilful paragraphing. Band 7: logically organises information; clear progression; a range of cohesive devices used appropriately with some under- or over-use; a clear central topic in each paragraph. Band 6: coherent arrangement and clear overall progression; cohesive devices effective but cohesion within or between sentences may be faulty or mechanical; referencing not always clear; paragraphing not always logical. Band 5: some organisation but no overall progression; inadequate, inaccurate or over-used cohesive devices; repetitive because of weak referencing; paragraphing inadequate or missing. Band 4: information not arranged coherently; basic cohesive devices inaccurate or repetitive; may not write in paragraphs.

### Lexical Resource — "lr"
Band 9: wide range, very natural and sophisticated control; rare minor slips. Band 7: sufficient range for flexibility and precision; less common items used with awareness of style and collocation; occasional errors in word choice, spelling or word formation. Band 6: adequate range; attempts less common vocabulary with some inaccuracy; spelling or word-formation errors that do not impede communication. Band 5: limited range, minimally adequate; noticeable spelling or word-formation errors that may cause some difficulty. Band 4: basic vocabulary used repetitively or inappropriately; limited control of word formation and spelling; errors may cause strain.

### Grammatical Range and Accuracy — "gra"
Band 9: wide range with full flexibility and accuracy; rare slips. Band 7: a variety of complex structures; frequent error-free sentences; good control with a few errors. Band 6: a mix of simple and complex forms; some grammar and punctuation errors that rarely reduce communication. Band 5: limited range; complex sentences attempted but less accurate than simple ones; frequent errors that may cause difficulty. Band 4: very limited range; rare subordinate clauses; some accurate structures but errors predominate; punctuation often faulty.

## Output rules
- Score each criterion as a whole number 0-9. An empty or "(no answer)" script scores 0 in every criterion.
- Write all feedback text (feedback, strengths, improvements, corrections.explanation) in Uzbek (Latin script). Keep it concise and specific to this script, quoting the candidate's words where useful.
- corrections: up to 6 of the most important real errors. Each has the original fragment exactly as written, a corrected English version, and a short Uzbek explanation. Do not invent errors.
- improvements: 2-4 actionable steps that would raise the band.
- strengths: 1-3 genuine strengths (an empty list if there are none).`;

const taskSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ta", "cc", "lr", "gra", "feedback", "strengths", "improvements", "corrections"],
  properties: {
    ta: { type: "integer" },
    cc: { type: "integer" },
    lr: { type: "integer" },
    gra: { type: "integer" },
    feedback: {
      type: "object",
      additionalProperties: false,
      required: ["ta", "cc", "lr", "gra"],
      properties: {
        ta: { type: "string" },
        cc: { type: "string" },
        lr: { type: "string" },
        gra: { type: "string" },
      },
    },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    corrections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["original", "corrected", "explanation"],
        properties: {
          original: { type: "string" },
          corrected: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
  },
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["task1", "task2"],
  properties: { task1: taskSchema, task2: taskSchema },
};

function chartText(chart) {
  if (!chart) return "";
  const rows = chart.series.map((s) => `${s.name}: ${s.values.join(", ")}`).join("\n");
  return `\nChart data (${chart.type}, "${chart.title}"; unit: ${chart.unit}; categories: ${chart.categories.join(", ")}):\n${rows}`;
}

function scriptBlock(label, meta, text) {
  const body = String(text || "").trim();
  return `<${label}>
<prompt>
${meta.prompt}${label === "task1" ? chartText(meta.chart) : ""}
</prompt>
<minimum_words>${meta.minWords}</minimum_words>
<candidate_word_count>${wordCount(body)}</candidate_word_count>
<candidate_script>
${body || "(no answer)"}
</candidate_script>
</${label}>`;
}

const clampInt = (v) => Math.max(0, Math.min(9, Math.round(Number(v) || 0)));
const clip = (s, n) => String(s ?? "").slice(0, n);

function normalizeTask(raw, text) {
  const empty = wordCount(text) === 0;
  const criteria = {
    ta: empty ? 0 : clampInt(raw.ta),
    cc: empty ? 0 : clampInt(raw.cc),
    lr: empty ? 0 : clampInt(raw.lr),
    gra: empty ? 0 : clampInt(raw.gra),
  };
  return {
    criteria,
    band: roundBand((criteria.ta + criteria.cc + criteria.lr + criteria.gra) / 4),
    feedback: Object.fromEntries(["ta", "cc", "lr", "gra"].map((k) => [k, clip(raw.feedback?.[k], 1200)])),
    strengths: (raw.strengths || []).slice(0, 3).map((s) => clip(s, 400)),
    improvements: (raw.improvements || []).slice(0, 4).map((s) => clip(s, 400)),
    corrections: (raw.corrections || []).slice(0, 6).map((c) => ({
      original: clip(c.original, 300),
      corrected: clip(c.corrected, 300),
      explanation: clip(c.explanation, 400),
    })),
  };
}

export const aiConfigured = () => !!process.env.ANTHROPIC_API_KEY;

// writingMeta: test.writing (prompt, minWords, chart); texts: { task1, task2 }.
export async function gradeWritingWithAi(writingMeta, texts) {
  const client = new Anthropic({ maxRetries: 2, timeout: 90_000 });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: [{ type: "text", text: RUBRIC, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `Grade both tasks of this IELTS Academic Writing test.\n\n${scriptBlock(
          "task1",
          writingMeta.task1,
          texts.task1
        )}\n\n${scriptBlock("task2", writingMeta.task2, texts.task2)}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new Error("AI baholashni rad etdi");
  if (response.stop_reason === "max_tokens") throw new Error("AI javobi to'liq emas");
  const text = response.content.find((b) => b.type === "text")?.text;
  const parsed = JSON.parse(text);

  const task1 = normalizeTask(parsed.task1, texts.task1);
  const task2 = normalizeTask(parsed.task2, texts.task2);
  return {
    model: response.model,
    task1,
    task2,
    band: roundBand((task1.band + 2 * task2.band) / 3),
  };
}
