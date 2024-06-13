import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/User";
import { signInSchema } from "@/schemas/signInSchema";
import dbConnect from "@/lib/dbConnect";
import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        identifier: { label: "Identifier", type: "text", placeholder: "", required: true },
        password: { label: "Password" },
      },
      async authorize(credentials: any): Promise<any> {
        if (!credentials || !credentials?.identifier || !credentials?.password) {
          return null;
        }

        const credentialsValidation = signInSchema.safeParse(credentials);

        if (!credentialsValidation.success) {
          return null;
        }
        await dbConnect();
        try {

          const existingUser = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          });

          if (!existingUser) {
            throw new Error("User not found");
          }

          if (!existingUser.isVerified) {
            throw new Error("Please verify your account");
          }

          /* const hashedPassword = await bcrypt.hash(credentials.password, 10); */

          const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);

          if (passwordValidation) {
            return existingUser;
          }

          throw new Error("Incorrect password");

        } catch (error: any) {
          console.error(error);
          throw new Error(error);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }

      return token;
    }
    , async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: "/sign-in"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
};