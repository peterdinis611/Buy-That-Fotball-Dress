import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    username: string;
    displayName: string;
    accessToken: string;
    roles: string[];
  }

  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      username: string;
      displayName: string;
      roles: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    username?: string;
    displayName?: string;
    roles?: string[];
  }
}
