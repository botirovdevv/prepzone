// Reading & Writing bo'limining rasmiy 4 ta mavzu bloki (domain) va
// har biriga tez-tez takrorlanadigan savol shablonlari (stem'lar).
// Bu College Board'ning rasmiy digital SAT tuzilishiga mos.

export const RW_DOMAINS = [
  {
    id: "craft-structure",
    label: "Craft and Structure",
    hint: "Words in Context, Text Structure and Purpose, Cross-Text Connections",
  },
  {
    id: "info-ideas",
    label: "Information and Ideas",
    hint: "Central Ideas and Details, Command of Evidence, Inferences",
  },
  {
    id: "conventions",
    label: "Standard English Conventions",
    hint: "Grammar & Punctuation",
  },
  {
    id: "expression",
    label: "Expression of Ideas",
    hint: "Transitions, Rhetorical Synthesis",
  },
];

// Har bir domain bo'yicha tez-tez takrorlanadigan savol matnlari.
// Admin domainni tanlagach, shu ro'yxatdan birini bosib, savol
// maydonini bir zumda to'ldirishi mumkin.
export const RW_PROMPT_TEMPLATES = {
  "craft-structure": [
    {
      label: "Words in Context",
      text: "Which choice completes the text with the most logical and precise word or phrase?",
    },
    {
      label: "Text Structure — funksiya",
      text: "Which choice best describes the function of the underlined sentence in the text as a whole?",
    },
    {
      label: "Text Structure — maqsad",
      text: "Which choice best states the main purpose of the text?",
    },
    {
      label: "Cross-Text Connections",
      text: "Based on the texts, how would the author of Text 2 most likely respond to the underlined claim in Text 1?",
    },
  ],
  "info-ideas": [
    {
      label: "Central Ideas — asosiy g'oya",
      text: "Which choice best states the main idea of the text?",
    },
    {
      label: "Central Ideas — matn bo'yicha",
      text: "According to the text, which of the following is true?",
    },
    {
      label: "Command of Evidence — iqtibos",
      text: "Which quotation from the text would most effectively illustrate the claim?",
    },
    {
      label: "Command of Evidence — topilma",
      text: "Which finding, if true, would most directly support the researchers' hypothesis?",
    },
    {
      label: "Inferences",
      text: "Which choice most logically completes the text?",
    },
  ],
  conventions: [
    {
      label: "Grammar & Punctuation",
      text: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    },
  ],
  expression: [
    {
      label: "Transitions",
      text: "Which choice completes the text with the most logical transition?",
    },
    {
      label: "Rhetorical Synthesis",
      text: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    },
  ],
};
