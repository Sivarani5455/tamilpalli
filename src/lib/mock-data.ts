import type {
  AppUser,
  ContentCategory,
  SplashSlide,
  FillBlankExercise,
  ImageHuntExercise,
  Plan,
  Subscription,
  WordSearchGrid,
} from "@/types";

export const demoUser: AppUser = {
  id: "user-demo-1",
  fullName: "Ahalya Raman",
  email: "ahalya@example.com",
  role: "admin",
  preferredLanguage: "en",
};

export const demoSubscription: Subscription = {
  id: "sub-demo-1",
  planSlug: "standard",
  status: "active",
  startedAt: "2026-06-01T00:00:00.000Z",
  expiresAt: "2026-07-01T00:00:00.000Z",
};

export const plans: Plan[] = [
  {
    id: "plan-discovery",
    name: "Discovery",
    slug: "discovery",
    price: 9.99,
    currency: "EUR",
    durationDays: 30,
    description: "Essential Tamil vocabulary and beginner-ready games.",
    features: ["Word Search basics", "Limited weekly challenges", "Progress dashboard"],
    accent: "from-amber-300 to-orange-400",
  },
  {
    id: "plan-standard",
    name: "Standard",
    slug: "standard",
    price: 14.99,
    currency: "EUR",
    durationDays: 30,
    description: "Balanced plan for serious learners who want variety and feedback.",
    features: ["All Discovery content", "Fill in the Blanks", "Image Hunt challenges"],
    accent: "from-teal-300 to-cyan-400",
  },
  {
    id: "plan-elite",
    name: "Elite",
    slug: "elite",
    price: 29.99,
    currency: "EUR",
    durationDays: 30,
    description: "Complete access with premium content, analytics and admin-friendly insights.",
    features: ["All Standard content", "Advanced game packs", "Priority pedagogical feedback"],
    accent: "from-rose-300 to-fuchsia-400",
  },
];

export const categories: ContentCategory[] = [
  {
    id: "category-word-search",
    slug: "word-search",
    title: "Word Search",
    description: "Find Tamil words in interactive grids and build script recognition.",
    type: "word_search",
    requiredPlan: "discovery",
    isActive: true,
  },
  {
    id: "category-fill-blanks",
    slug: "fill-in-the-blanks",
    title: "Fill in the Blanks",
    description: "Complete Tamil sentences with guided grammar and vocabulary feedback.",
    type: "fill_in_the_blanks",
    requiredPlan: "standard",
    isActive: true,
  },
  {
    id: "category-image-hunt",
    slug: "image-hunt",
    title: "Image Hunt",
    description: "Tap the right targets, learn Tamil labels and reinforce visual memory.",
    type: "image_hunt",
    requiredPlan: "standard",
    isActive: true,
  },
  {
    id: "category-agarathi",
    slug: "agarathi",
    title: "Agarathi",
    description: "Browse the Tamil picture dictionary, categories and word cards.",
    type: "lesson",
    requiredPlan: "discovery",
    isActive: true,
  },
  {
    id: "category-home-word-of-the-day",
    slug: "home-word-of-the-day",
    title: "Home · Word of the Day",
    description: "Show the rotating daily vocabulary card on the home page.",
    type: "exercise",
    requiredPlan: "discovery",
    isActive: true,
  },
  {
    id: "category-home-daily-quiz",
    slug: "home-daily-quiz",
    title: "Home · Daily Quiz",
    description: "Show the daily Tamil quiz block on the home page.",
    type: "quiz",
    requiredPlan: "discovery",
    isActive: true,
  },
];

export const wordSearchGrids: WordSearchGrid[] = [
  {
    id: "grid-family",
    slug: "family",
    title: "Family Essentials",
    difficulty: "beginner",
    description: "A short Tamil family vocabulary grid for first-time learners.",
    timeLimitSeconds: 210,
    gridData: [
      ["அ", "ம", "்", "ம", "ா", "க"],
      ["க", "அ", "ப்", "ப", "ா", "ற"],
      ["ந", "ீ", "ர", "்", "வ", "ீ"],
      ["ட", "ு", "ப", "ா", "ல", "்"],
      ["அ", "ர", "ி", "ச", "ி", "த"],
      ["ம", "ர", "ம", "்", "க", "ு"],
    ],
    words: [
      {
        word: "அம்மா",
        translation: {
          en: "mother",
          fr: "maman",
          ta: "அம்மா",
          de: "Mutter",
          da: "mor",
          no: "mor",
          it: "mamma",
        },
      },
      {
        word: "அப்பா",
        translation: {
          en: "father",
          fr: "papa",
          ta: "அப்பா",
          de: "Vater",
          da: "far",
          no: "far",
          it: "papà",
        },
      },
      {
        word: "நீர்",
        translation: {
          en: "water",
          fr: "eau",
          ta: "நீர்",
          de: "Wasser",
          da: "vand",
          no: "vann",
          it: "acqua",
        },
      },
    ],
  },
];

export const fillBlankExercises: FillBlankExercise[] = [
  {
    id: "fill-food",
    slug: "daily-food",
    title: "Daily Food Phrases",
    difficulty: "beginner",
    timeLimitSeconds: 180,
    questions: [
      {
        id: "q1",
        sentenceTemplate: "நான் ___ சாப்பிடுகிறேன்.",
        translation: {
          en: "I am eating ___.",
          fr: "Je mange ___.",
          ta: "நான் ___ சாப்பிடுகிறேன்.",
          de: "Ich esse ___.",
          da: "Jeg spiser ___.",
          no: "Jeg spiser ___.",
          it: "Sto mangiando ___.",
        },
        options: ["சாதம்", "வீடு", "புத்தகம்", "தண்ணீர்"],
        correctAnswer: "சாதம்",
        explanation: {
          en: "சாதம் means cooked rice, which fits the eating verb.",
          fr: "சாதம் signifie riz cuit, ce qui convient au verbe manger.",
          ta: "சாதம் என்பது சாப்பிடப்படும் உணவு.",
          de: "சாதம் bedeutet gekochter Reis und passt zum Verb essen.",
          da: "சாதம் betyder kogte ris og passer til handlingen at spise.",
          no: "சாதம் betyr kokt ris og passer til verbet spise.",
          it: "சாதம் significa riso cotto e si adatta al verbo mangiare.",
        },
      },
    ],
  },
];

export const imageHuntExercises: ImageHuntExercise[] = [
  {
    id: "hunt-animals",
    slug: "jungle-animals",
    title: "Jungle Animals",
    difficulty: "beginner",
    instruction: {
      en: "Tap every bird in the illustration.",
      fr: "Touchez chaque oiseau dans l'illustration.",
      ta: "படத்தில் உள்ள எல்லா பறவைகளையும் தொட்டு கண்டுபிடிக்கவும்.",
      de: "Tippe jeden Vogel in der Illustration an.",
      da: "Tryk på hver fugl i illustrationen.",
      no: "Trykk på hver fugl i illustrasjonen.",
      it: "Tocca ogni uccello nell'illustrazione.",
    },
    timeLimitSeconds: 240,
    targets: [
      {
        id: "bird-1",
        labelTa: "பறவை",
        translation: {
          en: "bird",
          fr: "oiseau",
          ta: "பறவை",
          de: "Vogel",
          da: "fugl",
          no: "fugl",
          it: "uccello",
        },
        x: 22,
        y: 30,
      },
      {
        id: "bird-2",
        labelTa: "கோழி",
        translation: {
          en: "hen",
          fr: "poule",
          ta: "கோழி",
          de: "Henne",
          da: "høne",
          no: "høne",
          it: "gallina",
        },
        x: 70,
        y: 58,
      },
    ],
  },
];

export const homeSplashSlides: SplashSlide[] = [
  {
    id: "splash-intro",
    kind: "intro",
    imageUrl: "/thiruvalluvar-splash.png",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "splash-2",
    kind: "fullscreen",
    imageUrl: "/thiruvalluvar-splash-2.png",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "splash-3",
    kind: "fullscreen",
    imageUrl: "/thiruvalluvar-splash-3.png",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "splash-4",
    kind: "fullscreen",
    imageUrl: "/thiruvalluvar-splash-4.png",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "splash-5",
    kind: "fullscreen",
    imageUrl: "/thiruvalluvar-splash-5.png",
    sortOrder: 4,
    isActive: true,
  },
];
