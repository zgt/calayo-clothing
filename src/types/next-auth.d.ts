// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth'

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
      user: {
        mongoId?: string
        id?: string
        picture?: string
        image?: string
        role?: string
      }
    }
    interface User {
        mongoId?: string
        picture?: string
        role?: string
    }

    interface signIn {
        user: {
            mongoId?: string
            role?: string
          }
    }
  }