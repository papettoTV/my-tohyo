import passport from "passport"
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20"
import { getDataSource } from "../data-source"
import { User } from "../models/User"
import { SocialAccount } from "../models/SocialAccount"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || ""

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        // ... (existing logic)
        try {
          const ds = await getDataSource()

          const socialAccountRepo = ds.getRepository(SocialAccount)
          const userRepo = ds.getRepository(User)

          const provider = "google"
          const account_identifier = profile.id

          let socialAccount = await socialAccountRepo.findOne({
            where: { provider, account_identifier },
            relations: ["user"],
          })

          if (socialAccount && socialAccount.user) {
            return done(null, socialAccount.user)
          }

          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null
          if (!email) {
            return done(new Error("Googleアカウントにemailがありません"))
          }

          let user = await userRepo.findOne({ where: { email } })

          if (!user) {
            user = new User()
            user.name = profile.displayName
            user.email = email
            user.region = "unknown"
            await userRepo.save(user)
          }

          const newSocialAccount = new SocialAccount()
          newSocialAccount.user = user
          newSocialAccount.user_id = user.user_id
          newSocialAccount.provider = provider
          newSocialAccount.account_identifier = account_identifier
          await socialAccountRepo.save(newSocialAccount)

          return done(null, user)
        } catch (err) {
          return done(err)
        }
      }
    )
  )
} else {
  console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google OAuth will not be available.")
}

// セッション管理（JWT運用なら不要だが、必要に応じて）
passport.serializeUser(
  (user: Express.User, done: (err: any, id?: unknown) => void) => {
    done(null, user)
  }
)
passport.deserializeUser((obj: any, done: (err: any, user?: any) => void) => {
  done(null, obj)
})

export default passport
