import { normalizeDifficulty } from "./bankQuestion";

// Matn ko'rinishida joylashtirilgan (bulk) savollarni parslab,
// QuestionEditor formatiga o'giradi.
//
// Kutilayotgan format (har bir savol "---" bilan ajratiladi):
//
//   Passage: (ixtiyoriy, faqat RW uchun)
//
//   Savol matni...
//
//   A) variant matni
//   B) variant matni
//   C) variant matni
//   D) variant matni
//
//   Javob: B
//   Qiyinlik: oson | o'rta | qiyin   (ixtiyoriy, default o'rta)
//
//   ---
//
//   Keyingi savol...
//
// Qaytaradi: { items: [...], errors: [...] }
export function parseBulkQuestions(raw) {
  const blocks = raw
    .split(/\n\s*-{3,}\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const items = [];
  const errors = [];

  blocks.forEach((block, idx) => {
    const lines = block.split("\n");
    let passage = "";
    let cursor = 0;

    // Ixtiyoriy "Passage: ..." bloki — bo'sh qatorgacha davom etadi.
    if (/^passage\s*:/i.test(lines[0] || "")) {
      const passageLines = [lines[0].replace(/^passage\s*:/i, "").trim()];
      cursor = 1;
      while (cursor < lines.length && lines[cursor].trim() !== "") {
        passageLines.push(lines[cursor]);
        cursor++;
      }
      passage = passageLines.join("\n").trim();
      while (cursor < lines.length && lines[cursor].trim() === "") cursor++;
    }

    const choiceRe = /^([A-D])\)\s*(.+)$/;
    const answerRe = /^(javob|answer)\s*:\s*([A-D])/i;
    const difficultyRe = /^(qiyinlik|difficulty)\s*:\s*(\S+)/i;

    const promptLines = [];
    const choices = {};
    let correctAnswer = null;
    let difficulty = "medium";

    for (; cursor < lines.length; cursor++) {
      const line = lines[cursor];
      const choiceMatch = line.trim().match(choiceRe);
      const answerMatch = line.trim().match(answerRe);
      const difficultyMatch = line.trim().match(difficultyRe);
      if (difficultyMatch) {
        difficulty = normalizeDifficulty(difficultyMatch[2]);
      } else if (choiceMatch) {
        choices[choiceMatch[1]] = choiceMatch[2].trim();
      } else if (answerMatch) {
        correctAnswer = answerMatch[2].toUpperCase();
      } else if (Object.keys(choices).length === 0) {
        // Hali variantlar boshlanmagan — bu savol matnining qismi.
        promptLines.push(line);
      }
    }

    const prompt = promptLines.join("\n").trim();
    const choiceLabels = ["A", "B", "C", "D"];
    const missingChoices = choiceLabels.filter((l) => !choices[l]);

    if (!prompt) {
      errors.push(`${idx + 1}-blok: savol matni topilmadi.`);
      return;
    }
    if (missingChoices.length > 0) {
      errors.push(`${idx + 1}-blok ("${prompt.slice(0, 40)}..."): ${missingChoices.join(", ")} varianti topilmadi.`);
      return;
    }
    if (!correctAnswer) {
      errors.push(`${idx + 1}-blok ("${prompt.slice(0, 40)}..."): to'g'ri javob ("Javob: X") topilmadi.`);
      return;
    }

    items.push({
      passage,
      prompt,
      choices: choiceLabels.map((l) => ({ label: l, text: choices[l] })),
      correctAnswer,
      difficulty,
    });
  });

  return { items, errors };
}
