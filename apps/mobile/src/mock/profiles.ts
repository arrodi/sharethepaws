import { PetProfile } from '../types';

export type PetPrompt = {
  question: string;
  answer: string;
};

export type PetDatingProfile = PetProfile & {
  photos: string[];
  prompts: PetPrompt[];
  distanceKm: number;
};

export const fakeProfiles: PetDatingProfile[] = [
  {
    id: 'pet-1',
    displayName: 'Luna',
    species: 'cat',
    breed: 'British Shorthair',
    ageLabel: '2y',
    bio: 'Professional nap strategist. Amateur feather hunter.',
    photos: ['https://placecats.com/neo/600/600', 'https://placecats.com/millie/600/600'],
    prompts: [
      { question: 'My ideal playdate is…', answer: 'A sunny window and polite small talk.' },
      { question: 'I get excited when…', answer: 'Someone opens a tuna can.' },
    ],
    distanceKm: 2.1,
  },
  {
    id: 'pet-2',
    displayName: 'Milo',
    species: 'dog',
    breed: 'Golden Retriever',
    ageLabel: '3y',
    bio: 'Tail wagger, puddle jumper, tennis ball philosopher.',
    photos: ['https://placedog.net/640/640?id=12', 'https://placedog.net/640/640?id=13'],
    prompts: [
      { question: 'My perfect weekend is…', answer: 'Park zoomies then a peanut butter reward.' },
      { question: 'Green flag in a friend…', answer: 'Shares sticks fairly.' },
    ],
    distanceKm: 1.8,
  },
  {
    id: 'pet-3',
    displayName: 'Poppy',
    species: 'dog',
    breed: 'Beagle',
    ageLabel: '4y',
    bio: 'Nose first, questions later.',
    photos: ['https://placedog.net/640/640?id=21', 'https://placedog.net/640/640?id=22'],
    prompts: [
      { question: 'I am known for…', answer: 'Finding snacks no one else can detect.' },
      { question: 'I’ll vibe with you if…', answer: 'You respect scent-based decision-making.' },
    ],
    distanceKm: 3.2,
  },
  {
    id: 'pet-4',
    displayName: 'Oreo',
    species: 'rabbit',
    breed: 'Mini Lop',
    ageLabel: '1y',
    bio: 'Fast feet, softer heart.',
    photos: ['https://loremflickr.com/640/640/rabbit?lock=4', 'https://loremflickr.com/640/640/rabbit?lock=14'],
    prompts: [
      { question: 'Best first date activity…', answer: 'Parallel carrot munching.' },
      { question: 'My love language…', answer: 'Gentle nose boops.' },
    ],
    distanceKm: 4.5,
  },
  {
    id: 'pet-5',
    displayName: 'Kiwi',
    species: 'bird',
    breed: 'Cockatiel',
    ageLabel: '2y',
    bio: 'Whistles, drama, and flawless feathers.',
    photos: ['https://loremflickr.com/640/640/parrot?lock=5', 'https://loremflickr.com/640/640/parrot?lock=15'],
    prompts: [
      { question: 'I fall for…', answer: 'Good rhythm and respectful volume.' },
      { question: 'Fun fact…', answer: 'I can remix your ringtone.' },
    ],
    distanceKm: 5.7,
  },
  {
    id: 'pet-6',
    displayName: 'Nori',
    species: 'cat',
    breed: 'Siamese',
    ageLabel: '5y',
    bio: 'Elegant chaos in a tuxedo soul.',
    photos: ['https://placecats.com/louie/600/600', 'https://placecats.com/bella/600/600'],
    prompts: [
      { question: 'My type…', answer: 'Confident but not clingy.' },
      { question: 'I’ll ghost if…', answer: 'You touch my tail without consent.' },
    ],
    distanceKm: 2.9,
  },
  {
    id: 'pet-7',
    displayName: 'Rocket',
    species: 'dog',
    breed: 'Border Collie',
    ageLabel: '2y',
    bio: 'Needs tasks. Invents tasks. Completes tasks.',
    photos: ['https://placedog.net/640/640?id=31', 'https://placedog.net/640/640?id=32'],
    prompts: [
      { question: 'Dream date…', answer: 'Agility course followed by hydration.' },
      { question: 'Turn on…', answer: 'Clear communication and fetch accuracy.' },
    ],
    distanceKm: 6.4,
  },
  {
    id: 'pet-8',
    displayName: 'Mochi',
    species: 'cat',
    breed: 'Ragdoll',
    ageLabel: '3y',
    bio: 'Soft as a cloud, judgments included.',
    photos: ['https://placecats.com/kitten/600/600', 'https://placecats.com/cat/600/600'],
    prompts: [
      { question: 'My green flags…', answer: 'Quiet energy and tidy litter etiquette.' },
      { question: 'Best compliment…', answer: '“You look very moisturized.”' },
    ],
    distanceKm: 1.2,
  },
  {
    id: 'pet-9',
    displayName: 'Biscuit',
    species: 'dog',
    breed: 'Corgi',
    ageLabel: '4y',
    bio: 'Low to the ground, high standards.',
    photos: ['https://placedog.net/640/640?id=41', 'https://placedog.net/640/640?id=42'],
    prompts: [
      { question: 'My toxic trait…', answer: 'I herd everyone at brunch.' },
      { question: 'I melt for…', answer: 'Crunchy treats and praise.' },
    ],
    distanceKm: 7.1,
  },
  {
    id: 'pet-10',
    displayName: 'Clover',
    species: 'rabbit',
    breed: 'Dutch Rabbit',
    ageLabel: '2y',
    bio: 'Curious explorer with deluxe whiskers.',
    photos: ['https://loremflickr.com/640/640/bunny?lock=10', 'https://loremflickr.com/640/640/bunny?lock=20'],
    prompts: [
      { question: 'First impression…', answer: 'Shy for 3 minutes, then bestie.' },
      { question: 'Sunday plan…', answer: 'Garden patrol and zoom circles.' },
    ],
    distanceKm: 2.6,
  },
];
