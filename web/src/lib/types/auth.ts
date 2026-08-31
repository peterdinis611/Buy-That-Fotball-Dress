export type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles?: string[];
  token?: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  displayName?: string;
};
