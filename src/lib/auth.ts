import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'MqwWoacIslM16L9/bZi+wQ2OBhGxQGGkyDQpSWgRp1o=',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          // Get user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .single();

          if (error || !user) {
            throw new Error('No user found with this email');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          } as any;
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};


