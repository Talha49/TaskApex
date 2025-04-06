import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/Mongo/Connectdb";
import User from "@/modals/Users/User";
import Tenant from "@/modals/Tenant/Tenant";
import nodemailer from "nodemailer";

export const authOptions = {
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
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
        companyName: { label: "Company Name", type: "text" },
      },
      async authorize(credentials) {
        await dbConnect();
        const { email, password, fullName, contact, team, companyName } = credentials;

        if (!email || !companyName) {
          throw new Error("Email and Company Name are required.");
        }

        const tenant = await Tenant.findOne({ name: companyName });
        const existingUser = tenant ? await User.findOne({ email, tenantId: tenant._id }) : null;

        // Signup: If fullName is provided, it’s a signup attempt
        if (fullName) {
          if (existingUser) {
            throw new Error("A user with this email already exists in this company. Please log in.");
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          let tenantId;

          if (!tenant) {
            // New tenant signup
            const newTenant = new Tenant({ name: companyName, createdBy: null, createdAt: new Date() });
            await newTenant.save();
            tenantId = newTenant._id;
          } else {
            // Existing tenant, new user signup
            tenantId = tenant._id;
          }

          const otp = Math.floor(10000 + Math.random() * 90000).toString();
          const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            contact: contact || "",
            team: team || "",
            role: tenant ? "user" : "admin", // Admin for new tenant, user for existing tenant
            tenantId,
            createdBy: null,
            createdAt: new Date(),
            isVerified: false,
          });
          await newUser.save();

          if (!tenant) {
            await Tenant.updateOne({ _id: tenantId }, { createdBy: newUser._id });
          }

          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
          });
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Your Email",
            text: `Your OTP code is ${otp}. Please use this code to verify your account.`,
          });

          return {
            id: newUser._id.toString(),
            email: newUser.email,
            fullName: newUser.fullName,
            contact: newUser.contact,
            team: newUser.team,
            role: newUser.role,
            tenantId: newUser.tenantId.toString(),
            isVerified: newUser.isVerified,
            otp,
          };
        }

        // Login: No fullName provided
        if (!existingUser) {
          throw new Error("No user found with this email in the specified company. Please sign up or check your company name.");
        }

        if (!existingUser.password) {
          throw new Error("Use social login instead.");
        }

        const isValidPassword = await bcrypt.compare(password, existingUser.password);
        if (!isValidPassword) {
          throw new Error("Invalid email or password.");
        }

        if (!existingUser.isVerified) {
          const otp = Math.floor(10000 + Math.random() * 90000).toString();
          await User.updateOne({ _id: existingUser._id }, { otp });
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
          });
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Your Email",
            text: `Your OTP code is ${otp}. Please use this code to verify your account.`,
          });
          return {
            id: existingUser._id.toString(),
            email: existingUser.email,
            fullName: existingUser.fullName,
            contact: existingUser.contact,
            team: existingUser.team,
            role: existingUser.role,
            tenantId: existingUser.tenantId.toString(),
            isVerified: existingUser.isVerified,
            otp,
          };
        }

        return {
          id: existingUser._id.toString(),
          email: existingUser.email,
          fullName: existingUser.fullName,
          contact: existingUser.contact,
          team: existingUser.team,
          role: existingUser.role,
          tenantId: existingUser.tenantId.toString(),
          isVerified: existingUser.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const tempCompanyName = `${user.name}'s Company`;
          const existingTenant = await Tenant.findOne({ name: tempCompanyName });
          if (existingTenant) {
            throw new Error("A company with this name already exists. Please use credentials signup.");
          }

          const newTenant = new Tenant({ name: tempCompanyName, createdBy: null, createdAt: new Date() });
          await newTenant.save();

          const newUser = await User.create({
            fullName: user.name,
            email: user.email,
            image: user.image,
            isSocialLogin: true,
            role: "admin",
            tenantId: newTenant._id,
            team: "",
            createdBy: null,
            createdAt: new Date(),
            isVerified: false,
          });

          newTenant.createdBy = newUser._id;
          await newTenant.save();

          const otp = Math.floor(10000 + Math.random() * 90000).toString();
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
          });
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Verify Your Email",
            text: `Your OTP code is ${otp}. Please use this code to verify your account.`,
          });

          existingUser = newUser;
          return {
            id: existingUser._id.toString(),
            email: existingUser.email,
            fullName: existingUser.fullName,
            contact: existingUser.contact || "",
            team: existingUser.team || "",
            role: existingUser.role,
            tenantId: existingUser.tenantId.toString(),
            isVerified: existingUser.isVerified,
            otp,
          };
        }

        token.id = existingUser._id.toString();
        token.email = existingUser.email;
        token.fullName = existingUser.fullName;
        token.contact = existingUser.contact || "";
        token.team = existingUser.team || "";
        token.role = existingUser.role;
        token.isVerified = existingUser.isVerified;
        token.tenantId = existingUser.tenantId.toString();
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.fullName = user.fullName;
        token.contact = user.contact;
        token.team = user.team;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.isVerified = user.isVerified;
        token.otp = user.otp;
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
      session.user.tenantId = token.tenantId;
      session.user.isVerified = token.isVerified;
      session.user.otp = token.otp;
      return session;
    },
  },
  pages: { signIn: "/Auth", error: "/Error" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };