import * as dotenv from "dotenv"
import passport from "passport"
import passportJWT from "passport-jwt"
import { db } from "./db.js"


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
            const user = await db.one(`SELECT * FROM users WHERE id=$1`, payload.id)
            try {
                return user ? done(null, user) : done(new Error("User not found"), null)
            } catch (error) {
                done(error)
            }
        }
    )
)

export default passport
