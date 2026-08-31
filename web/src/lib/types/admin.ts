export type ClipMark = {
  id: string;
  at: string;
  steward: string;
  verb: string;
  subject: string;
  detail: string;
};

export type OfficeBoard = {
  squad: number;
  livePegs: number;
  finishedPegs: number;
  openTills: number;
  disputedTills: number;
  clip: ClipMark[];
};

export type SquadCard = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
};

export type PegCard = {
  id: string;
  seller: string;
  status: string;
  auctionEnd: string;
  currentHighBid?: number;
  item: {
    club: string;
    playerName: string;
    season: string;
  };
};

export type TillCard = {
  id: string;
  auctionId: string;
  seller: string;
  buyer: string;
  amount: number;
  club: string;
  playerName: string;
  status: string;
  disputeNote?: string;
  disputedBy?: string;
  openedAt: string;
};
