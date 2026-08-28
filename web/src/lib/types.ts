export type AuctionStatus = "Live" | "Finished" | "ReserveNotMet";

export type AuctionItem = {
  id: string;
  club: string;
  playerName: string;
  playerNumber?: number;
  season: string;
  size: string;
  color: string;
  kitType: string;
  condition: string;
  league?: string;
  imageUrl?: string;
};

export type Auction = {
  id: string;
  reservePrice: number;
  seller: string;
  winner?: string;
  soldAmount?: number;
  currentHighBid?: number;
  createdAt: string;
  updatedAt: string;
  auctionEnd: string;
  status: AuctionStatus;
  item: AuctionItem;
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
  status: AuctionStatus;
  club: string;
  playerName: string;
  playerNumber?: number;
  season: string;
  size: string;
  color: string;
  kitType: string;
  condition: string;
  league?: string;
  imageUrl?: string;
};

export type PagedResult<T> = {
  results: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type KitListing = {
  id: string;
  reservePrice: number;
  seller: string;
  winner?: string;
  soldAmount?: number;
  currentHighBid?: number;
  auctionEnd: string;
  status: AuctionStatus;
  club: string;
  playerName: string;
  playerNumber?: number;
  season: string;
  size: string;
  color: string;
  kitType: string;
  condition: string;
  league?: string;
  imageUrl?: string;
};

export type SearchQuery = {
  club?: string;
  playerName?: string;
  status?: string;
  size?: string;
  kitType?: string;
  condition?: string;
  season?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

export type CreateAuctionPayload = {
  reservePrice: number;
  seller: string;
  auctionEnd: string;
  item: {
    club: string;
    playerName: string;
    playerNumber?: number;
    season: string;
    size: string;
    color: string;
    kitType: string;
    condition: string;
    league?: string;
    imageUrl?: string;
  };
};

export function fromAuction(auction: Auction): KitListing {
  return {
    id: auction.id,
    reservePrice: auction.reservePrice,
    seller: auction.seller,
    winner: auction.winner,
    soldAmount: auction.soldAmount,
    currentHighBid: auction.currentHighBid,
    auctionEnd: auction.auctionEnd,
    status: auction.status,
    club: auction.item.club,
    playerName: auction.item.playerName,
    playerNumber: auction.item.playerNumber,
    season: auction.item.season,
    size: auction.item.size,
    color: auction.item.color,
    kitType: auction.item.kitType,
    condition: auction.item.condition,
    league: auction.item.league,
    imageUrl: auction.item.imageUrl,
  };
}

export function fromSearchItem(item: SearchItem): KitListing {
  return { ...item };
}
