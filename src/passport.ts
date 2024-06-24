import * as dotenv from "dotenv"
import passport from "passport"
import passportJWT from "passport-jwt"
import { db } from "./db"


dotenv.config()
const secretKey = process.env.KEY

if (!secretKey) {
    throw new Error("JWT secret key 'KEY' is not defined in environment variables")
}

passport.use(
    new passportJWT.Strategy(
        {
            secretOrKey: secretKey,
            jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (payload, done) => {
            const { id } = payload
            try {
                const user = await db.oneOrNone(`SELECT * FROM users WHERE id=${Number(id)}`)
                return user ? done(null, user) : done(new Error("User not found"), null)
            } catch (error) {
                done(error)
            }
        }
    )
)

export default passport
