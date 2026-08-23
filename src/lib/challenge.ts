// Field Ranger Challenge questions and badge progression system

export interface QuizQuestion {
  id: string;
  speciesId: string;
  image: string;
  question: string;
  options: string[];
  correctAnswer: string;
  clue: string;
  fact: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or symbol
  requiredScore: number;
}

export const RANGER_BADGES: Badge[] = [
  {
    id: 'badge-novice',
    title: 'Junior Field Scout',
    description: 'Scored 1 correct species identification.',
    icon: '🧭',
    requiredScore: 1,
  },
  {
    id: 'badge-tracker',
    title: 'Wildlife Tracker',
    description: 'Scored 3 correct identification challenges.',
    icon: '🐾',
    requiredScore: 3,
  },
  {
    id: 'badge-ranger',
    title: 'Senior Wildlife Ranger',
    description: 'Achieved a perfect score on the Field Challenge.',
    icon: '🛡️',
    requiredScore: 5,
  },
];

export const RANGER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-001',
    speciesId: 'tiger',
    image: '/images/animals/tiger-001.jpg',
    question: 'Identify this solitary apex predator known for its distinct black stripes and aquatic swimming abilities:',
    options: ['African Lion', 'Bengal Tiger', 'Amur Leopard', 'Jaguar'],
    correctAnswer: 'Bengal Tiger',
    clue: 'Native to Asia, each individual has a unique stripe pattern like a human fingerprint.',
    fact: 'Tigers are excellent swimmers and can easily cross rivers up to 7 km wide.',
  },
  {
    id: 'q-002',
    speciesId: 'panda',
    image: '/images/animals/panda-001.jpg',
    question: 'Which vulnerable bamboo-eating species possesses a modified wrist bone that acts as a false thumb?',
    options: ['Red Panda', 'Koala', 'Giant Panda', 'Bornean Orangutan'],
    correctAnswer: 'Giant Panda',
    clue: 'Spends up to 12 hours a day consuming bamboo in bamboo forests of China.',
    fact: 'A giant panda eats between 12 and 38 kg of bamboo every day to meet its energy needs.',
  },
  {
    id: 'q-003',
    speciesId: 'arctic-tern',
    image: '/images/animals/arctic-tern-001.jpg',
    question: 'Which migratory bird undertakes the longest annual migration of any animal on Earth (up to 90,000 km)?',
    options: ['Emperor Penguin', 'Arctic Tern', 'Bald Eagle', 'Albatross'],
    correctAnswer: 'Arctic Tern',
    clue: 'Travels from the Arctic breeding grounds to the Antarctic pack ice and back every year.',
    fact: 'Over its lifetime, an Arctic tern flies a distance equivalent to three round trips to the Moon.',
  },
  {
    id: 'q-004',
    speciesId: 'humpback-whale',
    image: '/images/animals/humpback-whale-001.jpg',
    question: 'Which marine mammal uses "bubble-net feeding" co-operatively to trap krill and small fish?',
    options: ['Dolphin', 'Vaquita', 'Humpback Whale', 'Leatherback Turtle'],
    correctAnswer: 'Humpback Whale',
    clue: 'Known for spectacular breaching behavior and long, complex underwater songs.',
    fact: 'Humpback whale tail flukes are unique to every individual, used by scientists like fingerprints.',
  },
  {
    id: 'q-005',
    speciesId: 'axolotl',
    image: '/images/animals/axolotl-001.jpg',
    question: 'Name this critically endangered amphibian capable of fully regenerating lost limbs, heart, and brain tissue:',
    options: ['Komodo Dragon', 'Axolotl', 'Saiga Antelope', 'Golden Lion Tamarin'],
    correctAnswer: 'Axolotl',
    clue: 'Native exclusively to the Lake Xochimilco complex in Mexico City.',
    fact: 'Axolotls exhibit neoteny, retaining their larval features (like feathery gills) throughout adult life.',
  },
];
