import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      currency: string;
    } & DefaultSession["user"];
  }

  interface User {
    currency?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    currency: string;
  }
}
