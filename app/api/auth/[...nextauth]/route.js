import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";

export const authOptions = {
  debug: process.env.NODE_ENV === 'development',

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        fullName: { label: "Full Name", type: "text", optional: true },
        contact: { label: "Contact", type: "text", optional: true },
      },

      async authorize(credentials) {
        await dbConnect();
        const { email, password, fullName, contact } = credentials;

        try {
          let user = await User.findOne({ email });

          if (!user) {
            // Registration
            if (!fullName || !password || !email) {
              throw new Error("All fields are required for registration.");
            }

            const existingUser = await User.findOne({ email });

            if (existingUser) {
              throw new Error("User already exists");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({
              fullName,
              email,
              password: hashedPassword,
              contact,
            });

            await user.save();
          } else {
            // Login
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
              throw new Error("Invalid email or password.");
            }
          }

          // Generate a token
          const token = generateToken(user);

          // Save the token to the user document
          user.token = token; 
          await user.save(); 

          return {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            contact: user.contact,
            token, // Return the token as part of the user object
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error.message || "An error occurred during authentication.");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.fullName = user.fullName;
        token.contact = user.contact;
        token.token = user.token; // Save the token in the JWT
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.fullName = token.fullName;
      session.user.contact = token.contact;
      session.user.token = token.token; // Save the token in the session

      return session;
    },
  },

  pages: {
    signIn: "/Auth",
    error: "/Error"
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Function to generate a JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.NEXTAUTH_SECRET, // Use your secret
    { expiresIn: '24h' } // Set token expiry
  );
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
