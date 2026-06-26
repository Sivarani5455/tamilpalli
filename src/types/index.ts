export type Locale = "en" | "ta" | "fr";
export type Role = "user" | "admin";
export type PlanSlug = "discovery" | "standard" | "elite";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending_payment";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type ContentType =
  | "word_search"
  | "fill_in_the_blanks"
  | "image_hunt"
  | "quiz"
  | "lesson"
  | "exercise";

export type MessageDictionary = Record<string, string>;

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  preferredLanguage: Locale;
};

export type Plan = {
  id: string;
  name: string;
  slug: PlanSlug;
  price: number;
  currency: string;
  durationDays: number;
  description: string;
  features: string[];
  accent: string;
};

export type Subscription = {
  id: string;
  planSlug: PlanSlug;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
};

export type AuthState = {
  ok: boolean;
  message: string;
};

export type ContentCategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ContentType;
  requiredPlan: PlanSlug;
  isActive: boolean;
  enabledPlans?: PlanSlug[];
  accessConfigured?: boolean;
};

export type ContentCategoryAccess = ContentCategory & {
  enabledPlans: PlanSlug[];
};

export type AdminUserSummary = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  preferredLanguage: Locale;
  currentPlan: PlanSlug | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionExpiresAt: string | null;
};

export type WordSearchWord = {
  word: string;
  translation: Record<Locale, string>;
};

export type WordSearchGrid = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  timeLimitSeconds: number;
  gridData: string[][];
  words: WordSearchWord[];
  isActive?: boolean;
};

export type FillBlankQuestion = {
  id: string;
  sentenceTemplate: string;
  translation: Record<Locale, string>;
  options: string[];
  correctAnswer: string;
  explanation: Record<Locale, string>;
};

export type FillBlankExercise = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  timeLimitSeconds: number;
  questions: FillBlankQuestion[];
};

export type ImageHuntTarget = {
  id: string;
  labelTa: string;
  translation: Record<Locale, string>;
  x: number;
  y: number;
};

export type ImageHuntExercise = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  instruction: Record<Locale, string>;
  timeLimitSeconds: number;
  targets: ImageHuntTarget[];
};

export type DictionaryTranslation = {
  word: string;
  description: string | null;
  isPrimary?: boolean;
};

export type DictionaryEntry = {
  id: string;
  slug: string;
  imageUrl: string | null;
  category: string | null;
  subcategory: string | null;
  type: string | null;
  example: string | null;
  translations: Partial<Record<Locale, DictionaryTranslation>>;
  tamilSynonyms: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type DictionaryProgressSummary = {
  totalViewed: number;
  totalLearned: number;
  totalMastered: number;
  reviewedToday: number;
};

export type AdminDictionaryInsight = {
  entryId: string;
  slug: string;
  englishWord: string;
  tamilWord: string;
  category: string | null;
  viewsTotal: number;
  learnedTotal: number;
  learnerCount: number;
};

export type SplashSlideKind = "intro" | "fullscreen";

export type SplashSlide = {
  id: string;
  kind: SplashSlideKind;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
