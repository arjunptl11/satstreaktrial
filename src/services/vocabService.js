import { SAT_VOCAB } from '../data/satVocab';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Build a quiz of N words. Prefers unseen words; falls back to seen if exhausted.
// Each item: { word, correctDefinition, partOfSpeech, choices: [4 defs], correctIndex }
export const buildVocabQuiz = (seenWords = [], count = 10) => {
  if (!SAT_VOCAB || SAT_VOCAB.length === 0) return [];

  const seenSet = new Set((seenWords || []).map(w => w.toLowerCase()));
  const unseen = SAT_VOCAB.filter(v => !seenSet.has(v.word.toLowerCase()));
  const pool = unseen.length >= count ? unseen : SAT_VOCAB;
  const isMastered = unseen.length === 0 && SAT_VOCAB.length > 0;

  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));

  const quiz = picked.map(entry => {
    // Pull 3 distractors from other vocab (excluding the current word)
    const distractorPool = SAT_VOCAB.filter(v => v.word !== entry.word);
    const distractors = shuffle(distractorPool).slice(0, 3);
    const choices = shuffle([entry.definition, ...distractors.map(d => d.definition)]);
    const correctIndex = choices.indexOf(entry.definition);

    return {
      word: entry.word,
      partOfSpeech: entry.partOfSpeech,
      correctDefinition: entry.definition,
      choices,
      correctIndex,
    };
  });

  quiz._allMastered = isMastered;
  return quiz;
};

export const vocabCount = () => SAT_VOCAB?.length || 0;
