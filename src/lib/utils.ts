const SPECIAL_CODE_LENGTH = 6;
const SPECIAL_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Removed similar looking characters

const ADJECTIVES = [
  "Happy",
  "Brave",
  "Super",
  "Mighty",
  "Magic",
  "Swift",
  "Clever",
  "Bright",
  "Lucky",
  "Sunny",
  "Jolly",
  "Fancy",
  "Wild",
  "Cool",
  "Smart",
  "Kind",
  "Dancing",
  "Flying",
  "Jumping",
  "Glowing",
  "Sparkly",
  "Amazing",
  "Cosmic",
  "Dashing",
  "Friendly",
  "Gentle",
  "Playful",
  "Shining",
  "Speedy",
  "Bouncy",
  "Cheerful",
  "Peaceful",
  "Radiant",
  "Smiling",
  "Wonderful",
  "Zesty",
];

const NOUNS = [
  "Panda",
  "Tiger",
  "Dragon",
  "Unicorn",
  "Dolphin",
  "Eagle",
  "Lion",
  "Fox",
  "Wizard",
  "Knight",
  "Hero",
  "Star",
  "Rocket",
  "Robot",
  "Ninja",
  "Pirate",
  "Phoenix",
  "Mermaid",
  "Pegasus",
  "Butterfly",
  "Dinosaur",
  "Penguin",
  "Koala",
  "Puppy",
  "Kitten",
  "Monkey",
  "Elephant",
  "Giraffe",
  "Rainbow",
  "Dolphin",
  "Princess",
  "Astronaut",
  "Explorer",
  "Adventurer",
  "Champion",
  "Warrior",
];

export function generateSpecialCode(): string {
  let code = "";
  for (let i = 0; i < SPECIAL_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * SPECIAL_CODE_CHARS.length);
    code += SPECIAL_CODE_CHARS[randomIndex];
  }
  return code;
}

export function generateCodeName(count: number = 3): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    codes.push(`${adjective} ${noun}`);
  }
  return codes;
}

export function normalizeCode(code: string): string {
  return code.toLowerCase().replace(/[\s-]+/g, "-");
}

export function formatCode(code: string): string {
  return code
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
