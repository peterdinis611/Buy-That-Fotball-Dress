export type DeskStatus = "Opened" | "Paid" | "Shipped" | "Received" | "Disputed";

export type Settlement = {
  id: string;
  auctionId: string;
  seller: string;
  buyer: string;
  amount: number;
  club: string;
  playerName: string;
  status: DeskStatus;
  tracking?: string;
  openedAt: string;
  paidAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  disputedBy?: string;
  disputeNote?: string;
};
