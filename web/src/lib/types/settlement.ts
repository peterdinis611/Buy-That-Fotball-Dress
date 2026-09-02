export type DeskStatus = "Opened" | "Paid" | "Shipped" | "Received" | "Disputed";

export type Settlement = {
  id: string;
  auctionId: string;
  seller: string;
  buyer: string;
  hammer: number;
  desk: number;
  amount: number;
  club: string;
  playerName: string;
  status: DeskStatus;
  paymentRef?: string;
  tracking?: string;
  checkoutUrl?: string;
  openedAt: string;
  paidAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  disputedBy?: string;
  disputeNote?: string;
};
