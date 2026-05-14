import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://pinesat.com/api/questions';
const CACHE_KEY = 'pinesat_questions_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const fetchQuestions = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    }

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    // Return cached even if expired on network error
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached).data;
    } catch {}
    return [];
  }
};

export const getFilteredQuestions = async (difficulty = null, domain = null, count = 10) => {
  const all = await fetchQuestions();

  if (!all || all.length === 0) {
    return getFallbackQuestions(difficulty, count);
  }

  let filtered = all;

  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  if (domain && domain !== 'All Domains') {
    filtered = filtered.filter(q => q.domain === domain);
  }

  // If filtering left nothing, use unfiltered
  if (filtered.length === 0) filtered = all;

  // Shuffle
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(normalizeQuestion);
};

export const normalizeQuestion = (q) => ({
  id: q.id,
  domain: q.domain || 'Information and Ideas',
  difficulty: q.difficulty || 'Medium',
  prompt: q.question?.question || q.prompt || '',
  passage: q.question?.paragraph || q.passage || null,
  choices: q.question?.choices || q.choices || {},
  correctAnswer: q.question?.correct_answer || q.correctAnswer || 'A',
  explanation: q.question?.explanation || q.explanation || '',
  hasVisuals: q.visuals?.type !== 'null' && q.visuals?.type != null,
});

// Fallback questions for when API is unavailable
const getFallbackQuestions = (difficulty, count) => {
  const questions = [
    {
      id: 'fallback_1',
      domain: 'Information and Ideas',
      difficulty: 'Medium',
      prompt: 'The author most likely includes the detail about the scientist\'s early childhood to suggest that her curiosity was',
      passage: 'Marie Curie\'s fascination with science began at an unusually young age. As a child in Warsaw, she would spend hours examining her father\'s scientific instruments, carefully noting the way light refracted through glass prisms. Despite being denied formal education due to her gender, she pursued knowledge with remarkable tenacity.',
      choices: { A: 'cultivated through formal education', B: 'innate and developed early in life', C: 'the result of her father\'s direct instruction', D: 'unusual for someone of her background' },
      correctAnswer: 'B',
      explanation: 'The passage describes Marie Curie\'s curiosity as beginning at "an unusually young age" and shows her examining instruments on her own, suggesting her curiosity was innate (B). The passage explicitly states she was denied formal education, eliminating A and C.',
    },
    {
      id: 'fallback_2',
      domain: 'Standard English Conventions',
      difficulty: 'Easy',
      prompt: 'Which choice completes the text with the most logical and precise word or phrase?',
      passage: 'The new environmental policy, which was ______ by the city council after months of deliberation, requires all businesses to reduce their carbon emissions by 30% within five years.',
      choices: { A: 'rejected', B: 'adopted', C: 'questioned', D: 'delayed' },
      correctAnswer: 'B',
      explanation: '"Adopted" (B) is correct because the policy is described as being implemented and requiring businesses to act, which means it was officially accepted. "Rejected" (A) contradicts the policy being in effect. "Questioned" (C) and "delayed" (D) don\'t fit the context of a policy already requiring action.',
    },
    {
      id: 'fallback_3',
      domain: 'Craft and Structure',
      difficulty: 'Hard',
      prompt: 'The author\'s use of the word "paradoxically" in the final paragraph primarily serves to',
      passage: 'Digital technology has transformed how we communicate, enabling instant connection across vast distances. Yet researchers have documented a loneliness epidemic in countries with the highest rates of internet usage. Paradoxically, our unprecedented ability to connect has coincided with profound social disconnection.',
      choices: { A: 'introduce a counterargument to the author\'s main claim', B: 'highlight an unexpected contradiction in the described phenomenon', C: 'signal a shift from objective data to personal opinion', D: 'emphasize the positive aspects of digital technology' },
      correctAnswer: 'B',
      explanation: '"Paradoxically" signals an unexpected contradiction: technology meant to connect people has coincided with increased loneliness. This makes B correct. The author isn\'t introducing a counterargument (A), shifting to opinion (C), or emphasizing positives (D).',
    },
    {
      id: 'fallback_4',
      domain: 'Expression of Ideas',
      difficulty: 'Medium',
      prompt: 'Which sentence, if added after the underlined sentence, would best support the author\'s argument?',
      passage: 'Urban green spaces provide measurable benefits to city residents. Studies consistently show that access to parks reduces stress hormones and improves mental well-being. ______',
      choices: { A: 'Many cities were founded near rivers and other natural features.', B: 'Furthermore, neighborhoods with abundant tree cover report lower rates of anxiety and depression.', C: 'Some people prefer indoor exercise to outdoor activities.', D: 'The history of urban planning dates back thousands of years.' },
      correctAnswer: 'B',
      explanation: 'The paragraph argues that green spaces benefit city residents. Choice B directly extends this argument with additional evidence about trees and mental health outcomes. Choices A, C, and D introduce unrelated topics that don\'t support the argument about green space benefits.',
    },
    {
      id: 'fallback_5',
      domain: 'Information and Ideas',
      difficulty: 'Hard',
      prompt: 'Based on the data in the table, which conclusion is best supported?',
      passage: 'A study tracked student performance before and after implementing a new tutoring program. Results: Group A (tutoring): pre-test avg 62%, post-test avg 78%. Group B (no tutoring): pre-test avg 61%, post-test avg 64%. Both groups had similar initial scores and demographics.',
      choices: { A: 'The tutoring program was the sole cause of improved performance.', B: 'Students in Group A showed greater improvement than students in Group B.', C: 'Group B students did not improve at all during the study period.', D: 'Tutoring programs always improve student performance significantly.' },
      correctAnswer: 'B',
      explanation: 'Group A improved 16 percentage points (62% to 78%) while Group B improved only 3 percentage points (61% to 64%), so B is clearly supported. A overstates causation. C is wrong since Group B did improve slightly. D makes an absolute generalization not supported by one study.',
    },
    {
      id: 'fallback_6',
      domain: 'Standard English Conventions',
      difficulty: 'Medium',
      prompt: 'Which choice best maintains the sentence pattern established in the passage?',
      passage: 'The chef prepared the ingredients with care, arranged them on the plate with precision, and ______.',
      choices: { A: 'the presentation was completed beautifully', B: 'completing the presentation beautifully', C: 'completed the presentation beautifully', D: 'a beautiful presentation was created' },
      correctAnswer: 'C',
      explanation: 'The sentence uses parallel structure with past tense verbs: "prepared," "arranged," and the missing verb. Choice C "completed" maintains this parallel structure with a simple past tense verb in active voice, matching the established pattern.',
    },
    {
      id: 'fallback_7',
      domain: 'Craft and Structure',
      difficulty: 'Easy',
      prompt: 'As used in the passage, the word "cultivate" most nearly means',
      passage: 'Successful entrepreneurs often cultivate relationships with mentors who can provide guidance during challenging times. These connections, built over years of networking and mutual support, frequently prove invaluable.',
      choices: { A: 'grow crops in', B: 'develop and nurture', C: 'formally study', D: 'quickly establish' },
      correctAnswer: 'B',
      explanation: '"Cultivate" in this context means to develop and nurture over time, as supported by "built over years." While "cultivate" can literally mean to grow crops (A), that\'s not the meaning here. The passage shows gradual development, not formal study (C) or quick establishment (D).',
    },
    {
      id: 'fallback_8',
      domain: 'Expression of Ideas',
      difficulty: 'Hard',
      prompt: 'Which revision of the underlined sentence would most effectively introduce the central claim of the paragraph?',
      passage: 'Climate change represents one of the most pressing challenges of our era. ______ Glaciers are retreating at unprecedented rates, sea levels are rising, and extreme weather events are becoming more frequent.',
      choices: {
        A: 'Weather patterns have changed throughout Earth\'s history.',
        B: 'The evidence for significant human impact on Earth\'s climate is now overwhelming.',
        C: 'Scientists have been studying climate for many decades.',
        D: 'Some regions are experiencing more rainfall than others.'
      },
      correctAnswer: 'B',
      explanation: 'The paragraph presents evidence of climate change impacts. Choice B introduces the central claim that humans are significantly impacting climate, which is then supported by the evidence in the following sentences. A and C are too general or historical. D is too narrow and specific.',
    },
    {
      id: 'fallback_9',
      domain: 'Information and Ideas',
      difficulty: 'Easy',
      prompt: 'According to the passage, what was the primary reason the bridge project was delayed?',
      passage: 'The construction of the Golden Gate Bridge faced numerous obstacles. While funding challenges initially slowed progress, it was ultimately the unprecedented engineering difficulties—specifically, working in the strong tidal currents and deep water—that caused the most significant delays. Workers had to develop entirely new techniques to anchor the structure.',
      choices: { A: 'Lack of sufficient funding', B: 'Opposition from local residents', C: 'Engineering challenges posed by the water conditions', D: 'Shortage of qualified workers' },
      correctAnswer: 'C',
      explanation: 'The passage explicitly states that "engineering difficulties—specifically, working in the strong tidal currents and deep water—caused the most significant delays." While funding challenges (A) are mentioned, they are explicitly secondary. B and D are not mentioned.',
    },
    {
      id: 'fallback_10',
      domain: 'Standard English Conventions',
      difficulty: 'Hard',
      prompt: 'Which punctuation correctly joins these two independent clauses?',
      passage: 'The research findings were groundbreaking ______ they challenged decades of established scientific consensus.',
      choices: { A: 'groundbreaking, they', B: 'groundbreaking; they', C: 'groundbreaking: they', D: 'groundbreaking they' },
      correctAnswer: 'B',
      explanation: 'A semicolon (B) correctly joins two independent clauses. A comma alone (A) creates a comma splice error. A colon (C) is typically used to introduce a list or explanation when the first clause sets up the second more formally. No punctuation (D) creates a run-on sentence.',
    },
  ];

  let filtered = questions;
  if (difficulty && difficulty !== 'All') {
    const diff = questions.filter(q => q.difficulty === difficulty);
    if (diff.length > 0) filtered = diff;
  }

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => ({ ...q }));
};
