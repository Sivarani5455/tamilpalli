import type {
  ThirukkuralLesson,
  ThirukkuralQuizQuestion,
} from "@/types";

export type ThirukkuralPracticeSet = {
  quiz: ThirukkuralQuizQuestion[];
  fillBlanks: GeneratedThirukkuralFillBlankExercise[];
  reconstructions: ThirukkuralReconstructionExercise[];
};

export type GeneratedThirukkuralFillBlankExercise = {
  id: string;
  template: string;
  blanks: Array<{
    id: string;
    answer: string;
    options: string[];
  }>;
};

export type ThirukkuralReconstructionExercise = {
  id: string;
  scrambledWords: string[];
  correctWords: string[];
};

const fallbackWords = ["அறம்", "அன்பு", "உலகு", "வாழ்வு", "கல்வி", "மனம்", "நன்மை", "ஒழுக்கம்"];

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]];
  }

  return shuffled;
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function wordsFromLines(lines: string[]) {
  return unique(
    lines
      .join(" ")
      .split(/\s+/)
      .map((word) => word.replace(/[\p{P}\p{S}]/gu, "").trim())
      .filter((word) => word.length >= 2),
  );
}

function fullKural(lesson: ThirukkuralLesson) {
  return lesson.kuralLines.join("\n").trim() || lesson.title;
}

function kuralTokens(lesson: ThirukkuralLesson) {
  return lesson.kuralLines.flatMap((line) => line.trim().split(/\s+/).filter(Boolean));
}

function scrambleWords(words: string[]) {
  let scrambled = shuffle(words);

  for (let attempt = 0; attempt < 5 && scrambled.every((word, index) => word === words[index]); attempt += 1) {
    scrambled = shuffle(words);
  }

  if (words.length > 1 && scrambled.every((word, index) => word === words[index])) {
    scrambled = [...words].reverse();
  }

  return scrambled;
}

function buildChoices(answer: string, candidates: string[], fallbacks: string[] = []) {
  const distractors = shuffle(unique(candidates).filter((candidate) => candidate !== answer)).slice(0, 3);
  const availableFallbacks = fallbacks.filter((item) => item !== answer && !distractors.includes(item));

  while (distractors.length < 3 && availableFallbacks.length > 0) {
    distractors.push(availableFallbacks.shift()!);
  }

  return shuffle([answer, ...distractors.slice(0, 3)]);
}

function createQuizQuestion(id: string, question: string, answer: string, candidates: string[]) {
  const choices = buildChoices(answer, candidates);

  return {
    id,
    question,
    choices,
    correctChoiceIndex: choices.indexOf(answer),
  } satisfies ThirukkuralQuizQuestion;
}

function selectLessonSequence(lessons: ThirukkuralLesson[], count: number) {
  if (!lessons.length || count <= 0) return [];

  const sequence: ThirukkuralLesson[] = [];

  while (sequence.length < count) {
    sequence.push(...shuffle(lessons).slice(0, count - sequence.length));
  }

  return sequence;
}

export function generateThirukkuralPractice(
  lessons: ThirukkuralLesson[],
  questionCount = 20,
): ThirukkuralPracticeSet {
  const usableLessons = lessons.filter((lesson) => fullKural(lesson) && lesson.porul.trim());
  const quizLessons = selectLessonSequence(usableLessons, questionCount);
  const kuralPool = unique(usableLessons.map(fullKural));
  const porulPool = unique(usableLessons.map((lesson) => lesson.porul));

  const quiz = quizLessons.map((lesson, index) => {
    const kural = fullKural(lesson);

    if (index % 2 === 0) {
      return createQuizQuestion(
        `porul-to-kural-${index}-${lesson.id}`,
        `இந்தப் பொருளுக்குரிய குறளைத் தேர்ந்தெடுக்கவும்:\n“${lesson.porul}”`,
        kural,
        kuralPool,
      );
    }

    return createQuizQuestion(
      `kural-to-porul-${index}-${lesson.id}`,
      `இந்தக் குறளின் சரியான பொருளைத் தேர்ந்தெடுக்கவும்:\n“${kural}”`,
      lesson.porul,
      porulPool,
    );
  });

  const wordPool = unique([...usableLessons.flatMap((lesson) => wordsFromLines(lesson.kuralLines)), ...fallbackWords]);
  const fillBlanks: GeneratedThirukkuralFillBlankExercise[] = [];
  const blankLessons = selectLessonSequence(usableLessons, questionCount * 2);

  for (const lesson of blankLessons) {
    if (fillBlanks.length >= questionCount) break;

    const lessonWords = wordsFromLines(lesson.kuralLines);
    if (!lessonWords.length) continue;

    const blankCount = Math.floor(Math.random() * Math.min(3, lessonWords.length)) + 1;
    const fullText = fullKural(lesson);
    const answers = shuffle(lessonWords)
      .slice(0, blankCount)
      .sort((first, second) => fullText.indexOf(first) - fullText.indexOf(second));
    let template = fullText;

    for (const answer of answers) {
      template = template.replace(answer, "____");
    }

    fillBlanks.push({
      id: `blank-${fillBlanks.length}-${lesson.id}`,
      template,
      blanks: answers.map((answer, blankIndex) => ({
        id: `blank-${fillBlanks.length}-${lesson.id}-${blankIndex}-${answer}`,
        answer,
        options: buildChoices(answer, wordPool, fallbackWords),
      })),
    });
  }

  const reconstructions = selectLessonSequence(usableLessons, questionCount)
    .map((lesson, index) => {
      const correctWords = kuralTokens(lesson);

      return {
        id: `reconstruct-${index}-${lesson.id}`,
        scrambledWords: scrambleWords(correctWords),
        correctWords,
      } satisfies ThirukkuralReconstructionExercise;
    })
    .filter((exercise) => exercise.correctWords.length > 1);

  return { quiz, fillBlanks, reconstructions };
}
