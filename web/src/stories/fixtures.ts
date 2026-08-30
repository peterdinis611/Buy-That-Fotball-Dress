import type { KitListing } from "@/lib/types";

export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export const kane: KitListing = {
  id: "kane",
  reservePrice: 210,
  seller: "kitvault",
  currentHighBid: 230,
  auctionEnd: daysFromNow(3),
  status: "Live",
  club: "Bayern Munich",
  playerName: "Harry Kane",
  playerNumber: 9,
  season: "2024/25",
  size: "XL",
  color: "red",
  kitType: "Home",
  condition: "Match-worn",
  league: "Bundesliga",
};

export const salah: KitListing = {
  id: "salah",
  reservePrice: 190,
  seller: "anfield",
  currentHighBid: 240,
  auctionEnd: daysFromNow(1),
  status: "Live",
  club: "Liverpool",
  playerName: "Mohamed Salah",
  playerNumber: 11,
  season: "2024/25",
  size: "L",
  color: "red",
  kitType: "Home",
  condition: "Match-worn",
  league: "Premier League",
  match: "Premier League",
  matchDate: "2024-03-10T12:00:00.000Z",
  opponent: "Manchester City",
  pitchPhotoUrl: "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass",
};

export const vini: KitListing = {
  id: "vini",
  reservePrice: 250,
  seller: "bernabeu",
  currentHighBid: 310,
  auctionEnd: daysFromNow(5),
  status: "Live",
  club: "Real Madrid",
  playerName: "Vinícius Júnior",
  playerNumber: 7,
  season: "2024/25",
  size: "M",
  color: "white",
  kitType: "Home",
  condition: "Match-worn",
  league: "La Liga",
  match: "El Clasico",
  matchDate: "2024-04-21T12:00:00.000Z",
  opponent: "Barcelona",
  pitchPhotoUrl: "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass",
};

export const cantona: KitListing = {
  id: "cantona",
  reservePrice: 400,
  seller: "oldtrafford",
  currentHighBid: 400,
  auctionEnd: daysFromNow(-1),
  status: "Finished",
  club: "Manchester United",
  playerName: "Eric Cantona",
  playerNumber: 7,
  season: "1995/96",
  size: "L",
  color: "red",
  kitType: "Home",
  condition: "Match-worn",
  league: "Premier League",
  match: "FA Cup final",
  matchDate: "1996-05-11T12:00:00.000Z",
  opponent: "Liverpool",
  pitchPhotoUrl: "https://placehold.co/800x500/1a5c2a/e8eadc?text=On+the+grass",
};

export const liveWall: KitListing[] = [kane, salah, vini];
