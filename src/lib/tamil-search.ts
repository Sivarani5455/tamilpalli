const independentVowels: Record<string, string> = {
  அ: "a",
  ஆ: "aa",
  இ: "i",
  ஈ: "ii",
  உ: "u",
  ஊ: "uu",
  எ: "e",
  ஏ: "ee",
  ஐ: "ai",
  ஒ: "o",
  ஓ: "oo",
  ஔ: "au",
};

const consonants: Record<string, string> = {
  க: "k",
  ங: "ng",
  ச: "c",
  ஞ: "nj",
  ட: "t",
  ண: "n",
  த: "th",
  ந: "n",
  ப: "p",
  ம: "m",
  ய: "y",
  ர: "r",
  ல: "l",
  வ: "v",
  ழ: "zh",
  ள: "l",
  ற: "r",
  ன: "n",
  ஜ: "j",
  ஶ: "sh",
  ஷ: "sh",
  ஸ: "s",
  ஹ: "h",
};

const vowelSigns: Record<string, string> = {
  "ா": "aa",
  "ி": "i",
  "ீ": "ii",
  "ு": "u",
  "ூ": "uu",
  "ெ": "e",
  "ே": "ee",
  "ை": "ai",
  "ொ": "o",
  "ோ": "oo",
  "ௌ": "au",
};

const virama = "்";

export function transliterateTamilToLatin(value: string) {
  const characters = Array.from(value.normalize("NFC"));
  let transliterated = "";

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];

    if (independentVowels[character]) {
      transliterated += independentVowels[character];
      continue;
    }

    const consonant = consonants[character];
    if (consonant) {
      const nextCharacter = characters[index + 1];

      if (nextCharacter === virama) {
        transliterated += consonant;
        index += 1;
      } else if (nextCharacter && vowelSigns[nextCharacter]) {
        transliterated += consonant + vowelSigns[nextCharacter];
        index += 1;
      } else {
        transliterated += `${consonant}a`;
      }

      continue;
    }

    transliterated += character === "ஃ" ? "h" : character;
  }

  return transliterated;
}

export function normalizeTamilSearch(value: string) {
  return transliterateTamilToLatin(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9\p{L}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}
