import * as dotenv from "dotenv"
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

const { Strategy, ExtractJwt } = passportJWT
passport.use(
    //utilizziamo passportJWT per gestire l'autenticazione
    new Strategy(
        {
            secretOrKey: secretKey,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (payload, done) => {
            try {
                const user = await db.oneOrNone(`SELECT * FROM users WHERE id=$1`, payload.id)
                return user ? done(null, user) : done(new Error("User not found"), null)
            } catch (error) {
                done(error)
            }
        }
    )
)

export default passport
