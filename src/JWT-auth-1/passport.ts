import dotenv from "dotenv"
import passport from "passport"
import passportJWT from "passport-jwt"
import { db } from "./db.js"

dotenv.config()

//prendiamo la chiave dal file .env
const secretKey = process.env.KEY

//se la chiave non viene trovata lanciamo un errore
if (!secretKey) {
    throw new Error("JWT secret key 'KEY' is not defined in environment variables")
}

const { ExtractJwt, Strategy } = passportJWT

passport.use(
    new Strategy(
        {
            secretOrKey: secretKey,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (payload, done) => {
            try {
                const user = await db.oneOrNone(`SELECT * FROM users WHERE id=$1`, [payload.id])
                return user ? done(null, user) : done(null, false, {msg: "User not found"})
            } catch (error) {
                done(error, false)
            }
        }
    )
)

export default passport
