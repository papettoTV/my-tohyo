import passport from "passport"
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20"
import { AppDataSource } from "../data-source"
import { User } from "../models/User"
import { SocialAccount } from "../models/SocialAccount"
import { v4 as uuidv4 } from "uuid"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      // GoogleアカウントID（sub）でSocialAccountを検索
      try {
        await AppDataSource.initialize()

        const socialAccountRepo = AppDataSource.getRepository(SocialAccount)
        const userRepo = AppDataSource.getRepository(User)

        // provider名
        const provider = "google"
        // Googleのsub
        const account_identifier = profile.id

        // SocialAccount検索
        let socialAccount = await socialAccountRepo.findOne({
          where: { provider, account_identifier },
          relations: ["user"],
        })

        if (socialAccount && socialAccount.user) {
          // 既存Userがあれば認証済みとして返す
          return done(null, socialAccount.user)
        }

        // Googleプロフィールからemail取得
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null
        if (!email) {
          return done(new Error("Googleアカウントにemailがありません"))
        }

        // emailでUser検索
        let user = await userRepo.findOne({ where: { email } })

        if (!user) {
          // User新規作成
          user = new User()
          user.name = profile.displayName
          user.email = email
          user.region = "unknown" // regionはGoogleから取得不可のため仮値
          await userRepo.save(user)
        }

        // SocialAccount新規作成
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
