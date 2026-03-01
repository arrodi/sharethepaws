export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';

export type PetProfile = {
  id: string;
  displayName: string;
  species: Species;
  breed?: string;
  ageLabel?: string;
  bio?: string;
  avatarUrl?: string;
};

export type Post = {
  id: string;
  petId: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
};

export type DMMessage = {
  id: string;
  threadId: string;
  senderPetId: string;
  text: string;
  createdAt: string;
};
