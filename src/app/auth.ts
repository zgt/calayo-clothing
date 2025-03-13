import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import connectMongoDB from "@/lib/connectMongoDB"
import User from "@/app/model/User"


 
export const { handlers, signOut, auth } = NextAuth({
  providers: [ Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    async profile(profile) {
      if(profile.email === "matt@mattcalayo.com"){
        profile.role = "admin"
      }
      return {  role: profile.role ?? "user", ...profile}
    },
    
  }),],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {


        if (user) { // User is available during sign-in
          token.id = user.id
          token.picture = user.picture
          token.mongoId = user.mongoId
          token.role = user.role
        }
        return token
      },
    session({ session, token }) {

      session.user.id = token.id as string
      session.user.picture = token.picture as string
      session.user.mongoId = token.mongoId as string
      session.user.role = token.role as string

      return session
    },
    async signIn({user, account}) {

      if (account?.provider === "google") {
        const { name, email } = user;
        try {
          await connectMongoDB();
          const userExists = await User.findOne({ email });

          if (!userExists) {
            const res = await fetch("http://localhost:3000/api/user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name,
                email,
              }),
            });

            if (res.ok) {
              return true;
            }
          } else{
            console.log("existing user", userExists)
            user.mongoId = userExists._id.toString()
          }
        } catch (error) {
          console.log(error);
        }
          
      return true
      }
      return true
    },
  }
})