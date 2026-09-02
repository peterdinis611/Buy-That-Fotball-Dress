export type AuctionStatus = "Live" | "Finished" | "ReserveNotMet";

export type AuctionItem = {
  id: string;
  club: string;
  playerName: string;
  playerNumber?: number;
  season: string;
  size: string;
  pitToPit?: number;
  backLength?: number;
  backNumber?: number;
  color: string;
  kitType: string;
  condition: string;
  league?: string;
  imageUrl?: string;
  match?: string;
  matchDate?: string;
  opponent?: string;
  pitchPhotoUrl?: string;
  collarPhotoUrl?: string;
  washPhotoUrl?: string;
  labelPhotoUrl?: string;
  coaUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
};

export type Auction = {
  id: string;
  reservePrice: number;
  seller: string;
  winner?: string;
  highBidder?: string;
  soldAmount?: number;
  currentHighBid?: number;
  createdAt: string;
  updatedAt: string;
  auctionEnd: string;
  injury?: boolean;
  injuryCount?: number;
  status: AuctionStatus;
  item: AuctionItem;
};

export type Bid = {
  id: string;
  auctionId: string;
  bidder: string;
  previousBidder?: string;
  amount: number;
  maxAmount?: number;
  snag?: boolean;
  createdAt: string;
};

export type SearchItem = {
  id: string;
  reservePrice: number;
  seller: string;
  winner?: string;
  soldAmount?: number;
  currentHighBid?: number;
  createdAt: string;
  updatedAt: string;
  auctionEnd: string;
  injury?: boolean;
  status: AuctionStatus;
  club: string;
  playerName: string;
  playerNumber?: number;
  season: string;
  size: string;
  pitToPit?: number;
  backLength?: number;
  backNumber?: number;
  color: string;
  kitType: string;
  condition: string;
  league?: string;
  imageUrl?: string;
  match?: string;
  matchDate?: string;
  opponent?: string;
  pitchPhotoUrl?: string;
  collarPhotoUrl?: string;
  washPhotoUrl?: string;
  labelPhotoUrl?: string;
  coaUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
};

export type PagedResult<T> = {
  results: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type PlayerSheet = {
  listed: Auction[];
  chasing: Auction[];
  won: Auction[];
  watching: Auction[];
};

export type KitListing = {
  id: string;
  reservePrice: number;
  seller: string;
  winner?: string;
  highBidder?: string;
  soldAmount?: number;
  currentHighBid?: number;
  auctionEnd: string;
  injury?: boolean;
  injuryCount?: number;
  status: AuctionStatus;
  club: string;
  playerName: string;
  playerNumber?: number;
  season: string;
  size: string;
  pitToPit?: number;
  backLength?: number;
  backNumber?: number;
  color: string;
  kitType: string;
  condition: string;
  league?: string;
  imageUrl?: string;
  match?: string;
  matchDate?: string;
  opponent?: string;
  pitchPhotoUrl?: string;
  collarPhotoUrl?: string;
  washPhotoUrl?: string;
  labelPhotoUrl?: string;
  coaUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
};

export type SearchQuery = {
  q?: string;
  club?: string;
  playerName?: string;
  status?: string;
  size?: string;
  kitType?: string;
  condition?: string;
  season?: string;
  league?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

export type CreateAuctionPayload = {
  reservePrice: number;
  auctionEnd: string;
  item: {
    club: string;
    playerName: string;
    playerNumber?: number;
    season: string;
    size: string;
    pitToPit?: number;
    backLength?: number;
    backNumber?: number;
    color: string;
    kitType: string;
    condition: string;
    league?: string;
    imageUrl?: string;
    match?: string;
    matchDate?: string;
    opponent?: string;
    pitchPhotoUrl?: string;
    collarPhotoUrl?: string;
    washPhotoUrl?: string;
    labelPhotoUrl?: string;
    coaUrl?: string;
  };
};

export type UpdateAuctionPayload = {
  reservePrice?: number;
  auctionEnd?: string;
  club?: string;
  playerName?: string;
  playerNumber?: number;
  season?: string;
  size?: string;
  pitToPit?: number;
  backLength?: number;
  backNumber?: number;
  color?: string;
  kitType?: string;
  condition?: string;
  league?: string;
  imageUrl?: string;
  match?: string;
  matchDate?: string;
  opponent?: string;
  pitchPhotoUrl?: string;
  collarPhotoUrl?: string;
  washPhotoUrl?: string;
  labelPhotoUrl?: string;
  coaUrl?: string;
};

export function fromAuction(auction: Auction): KitListing {
  return {
    id: auction.id,
    reservePrice: auction.reservePrice,
    seller: auction.seller,
    winner: auction.winner,
    highBidder: auction.highBidder,
    soldAmount: auction.soldAmount,
    currentHighBid: auction.currentHighBid,
    auctionEnd: auction.auctionEnd,
    injury: auction.injury,
    injuryCount: auction.injuryCount,
    status: auction.status,
    club: auction.item.club,
    playerName: auction.item.playerName,
    playerNumber: auction.item.playerNumber,
    season: auction.item.season,
    size: auction.item.size,
    pitToPit: auction.item.pitToPit,
    backLength: auction.item.backLength,
    backNumber: auction.item.backNumber,
    color: auction.item.color,
    kitType: auction.item.kitType,
    condition: auction.item.condition,
    league: auction.item.league,
    imageUrl: auction.item.imageUrl,
    match: auction.item.match,
    matchDate: auction.item.matchDate,
    opponent: auction.item.opponent,
    pitchPhotoUrl: auction.item.pitchPhotoUrl,
    collarPhotoUrl: auction.item.collarPhotoUrl,
    washPhotoUrl: auction.item.washPhotoUrl,
    labelPhotoUrl: auction.item.labelPhotoUrl,
    coaUrl: auction.item.coaUrl,
    verifiedBy: auction.item.verifiedBy,
    verifiedAt: auction.item.verifiedAt,
  };
}

export function fromSearchItem(item: SearchItem): KitListing {
  return { ...item };
}

export function isOpenLot(listing: { status: AuctionStatus; auctionEnd: string }) {
  return listing.status === "Live" && new Date(listing.auctionEnd).getTime() > Date.now();
}

export type SavedPeg = {
  id: string;
  username: string;
  club?: string;
  league?: string;
  size?: string;
  kitType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  hungAt: string;
};
