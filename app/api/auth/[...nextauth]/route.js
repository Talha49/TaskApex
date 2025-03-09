import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";

export const authOptions = {
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        fullName: { label: "Full Name", type: "text", optional: true },
        contact: { label: "Contact", type: "text", optional: true },
        team: { label: "Team", type: "text", optional: true },
      },
      async authorize(credentials) {
        await dbConnect();
        const { email, password, fullName, contact, team } = credentials;

        try {
          let user = await User.findOne({ email });

          if (!user) {
            // Registration
            if (!fullName || !password || !email) {
              throw new Error("All fields are required for registration.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({
              fullName,
              email,
              password: hashedPassword,
              contact: contact || "",
              team: team || "",
              role: "user", // Hardcode default role
            });

            await user.save();
          } else {
            // Login
            if (!user.password) throw new Error("Use social login instead.");
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
              throw new Error("Invalid email or password.");
            }
          }

          return {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            contact: user.contact,
            team: user.team,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            fullName: user.name,
            email: user.email,
            image: user.image,
            isSocialLogin: true,
            role: "user", // Hardcode default role
            team: "",
          });
        }

        token.id = existingUser._id.toString();
        token.email = existingUser.email;
        token.fullName = existingUser.fullName;
        token.contact = existingUser.contact || "";
        token.team = existingUser.team || "";
        token.role = existingUser.role;
        token.image = existingUser.image || "";
        token.isSocialLogin = true;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.fullName = user.fullName;
        token.contact = user.contact;
        token.team = user.team;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.fullName = token.fullName;
      session.user.contact = token.contact;
      session.user.team = token.team;
      session.user.role = token.role;
      session.user.image = token.image || "";
      session.user.isSocialLogin = token.isSocialLogin || false;
      return session;
    },
  },
  pages: {
    signIn: "/Auth",
    error: "/Error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };