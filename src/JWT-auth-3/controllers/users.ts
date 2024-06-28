import { Request, Response } from "express"
import { db } from "../db.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const signup = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const user = await db.oneOrNone(`SELECT * FROM users WHERE username=$1`, username) //mi assicusa che l'utente non esista già
        if (!user) {
            //aggiungiamo al database le informazioni del nuovo utente, e in più utilizziamo RETURNING per ottenere
            //l'id dell'utente una volta completata l'operazione (ci servirà in futuro)
            const { id } = await db.one(`INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`, [
                username,
                password,
            ])
            res.status(201).json({ msg: "user registered successfully", id })
        } else {
            res.status(400).json({ msg: "a user with this username already exists " })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ err: "Internal server error" })
    }
}

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body
    try {
        const user = await db.oneOrNone(`SELECT * FROM users WHERE username=$1`, username)
        console.log(user)

        if (user && user.password === password) {
            const secretKey = process.env.KEY
            if (secretKey) {
                const token = jwt.sign(user, secretKey, { expiresIn: "7d" })
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

const logout = async (req: Request, res: Response) => {
    try {
        const user: any = req.user //prop di request impostata da noi in authorize
        const { token } = await db.oneOrNone(`SELECT token FROM users WHERE id=$1`, user.id)
        console.log(token)

        if (token) {
            await db.none(`UPDATE users SET token=$2 WHERE id=$1`, [user?.id, null]) //resettiamo il token se l'autorizzazzione è andata a buon fine nella middleware authorize
            res.status(200).json({ msg: "User logged out" })
        } else {
            res.status(400).json({ msg: "The user is already logged out" })
        }
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export { signup, login, logout }
