export type BoardLetter = {
  id: string;
  toUsername: string;
  kind: string;
  subject: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
};
