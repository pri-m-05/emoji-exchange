import type { ExchangeRequest, Listing } from "./types";

export const DEFAULT_USER = "Priyanka";

export const seedListings: Listing[] = [
  {
    id: "1",
    emoji: "🦄",
    name: "Unicorn",
    owner: "Ava",
    rarity: "Legendary",
    category: "Animals",
    description: "Ultra cute and weirdly hard to find.",
    wanted: "Looking for something magical or food-themed.",
    status: "available"
  },
  {
    id: "2",
    emoji: "🍓",
    name: "Strawberry",
    owner: "Noah",
    rarity: "Rare",
    category: "Food",
    description: "Bright, sweet, and very tradable.",
    wanted: "Would trade for another fun food emoji.",
    status: "available"
  },
  {
    id: "3",
    emoji: "😎",
    name: "Cool Face",
    owner: "Mia",
    rarity: "Common",
    category: "Smileys",
    description: "Reliable classic for any collection.",
    wanted: "Open to almost anything.",
    status: "available"
  },
  {
    id: "4",
    emoji: "🪩",
    name: "Mirror Ball",
    owner: "Jules",
    rarity: "Rare",
    category: "Objects",
    description: "Party energy in a single emoji.",
    wanted: "Trade me something equally chaotic.",
    status: "available"
  }
];

export const seedRequests: ExchangeRequest[] = [
  {
    id: "r1",
    listingId: "2",
    listingEmoji: "🍓",
    listingName: "Strawberry",
    fromUser: "Priyanka",
    offeredEmoji: "🍕",
    message: "Food for food. This feels fair and iconic.",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];
