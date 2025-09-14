import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  plugins: [nextCookies()],
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-key',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: ['http://localhost:3000'],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        input: false,
      },
      language: {
        type: 'string',
        defaultValue: 'en',
      },
      tradingLevel: {
        type: 'string',
        defaultValue: 'beginner',
      },
      riskTolerance: {
        type: 'string',
        defaultValue: 'low',
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
