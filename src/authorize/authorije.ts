import { NextFunction, Request, Response } from "express"
import passport from "passport"


const authorize = (req: Request, res: Response, next: NextFunction) => {
    //"jwt" => tipo di autneticazione, "session: false" => utilizziamo il token e non la session,
    //la callback si occupa di verificare se l'utente è autorizzato
    passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
        if (!user || err) {
            console.log(!user, err);
            
            res.status(400).json({ msg: "Unauthorized" })
        } else {
            req.user = user
            next()
        }
    })(req, res, next)
}

export {authorize}