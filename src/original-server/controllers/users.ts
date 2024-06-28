import { NextFunction, Request, Response } from "express"
import { db } from "../db.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import passport from "passport"
dotenv.config()

const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await db.manyOrNone(`SELECT * FROM users`)
        res.status(200).json({ users })
    } catch (error) {
        res.status(400).json({ msg: "No users found" })
    }
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
        const user = await db.oneOrNone(`SELECT * FROM users WHERE email=$1`, email)
        if (user && user.password === password) {
            const secretKey = process.env.KEY
            if (secretKey) {
                const token = jwt.sign(user, secretKey, {expiresIn: "24h"})
                await db.none(`UPDATE users SET token=$2 WHERE id=$1`, [user.id, token])
                res.status(200).json({ msg: "user succesfully logged in" })
            } else {
                throw new Error("JWT secret key 'KEY' is not defined in environment variables")
            }
        } else {
            res.status(400).json({ error: "incorrect credentials" })
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
    }
}

const signup = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const user = await db.oneOrNone(`SELECT * FROM users WHERE email=$1`, email)
        if (!user) {
            //aggiungiamo al database le informazioni del nuovo utente, e in più utilizziamo RETURNING per ottenere
            //l'id dell'utente una volta completata l'operazione (ci servirà per il token)
            const { id } = await db.one(`INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`, [email, password])
            res.status(201).json({ msg: "user registered successfully" })
        } else {
            res.status(400).json({ msg: "a user with this email is already registered" })
        }
    } catch (error) {
        res.status(500).json({ err: "Internal server error" })
    }
}

const authorize = (req: Request, res: Response, next: NextFunction) => {
    //"jwt" => tipo di strategia, "session: false" => utilizziamo il token e non la session,
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

const logout = async (req: Request, res: Response) => {
    try {
        const user: any = req.user
        await db.none(`UPDATE users SET token=$2 WHERE id=$1`, [user?.id, null])
        res.status(200).json({ msg: "User logged out" })
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export { login, signup, authorize, logout, getUsers }
