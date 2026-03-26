export type Rarity = "Common" | "Rare" | "Legendary";
export type Category = "Smileys" | "Animals" | "Food" | "Objects";

export interface Listing {
  id: string;
  emoji: string;
  name: string;
  owner: string;
  rarity: Rarity;
  category: Category;
  description: string;
  wanted: string;
  status: "available" | "traded";
}

export interface ExchangeRequest {
  id: string;
  listingId: string;
  listingEmoji: string;
  listingName: string;
  fromUser: string;
  offeredEmoji: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}
