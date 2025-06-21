import { getServerSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        if (
          credentials.email === 'admin@bizfocus.com' &&
          credentials.password === 'admin1234'
        ) {
          return {
            id: '1',
            email: 'admin@bizfocus.com',
            name: 'Admin'
          };
        }

        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development',
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}