import dotenv from "dotenv"
dotenv.config()
import { Request, Response } from "express"
import { db } from "../db.js"
import jwt from "jsonwebtoken"

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
        const user = await db.oneOrNone(`SELECT * FROM users WHERE email=$1`, email)
        if (user && user.password === password) {
            const secretKey = process.env.KEY
            if (secretKey) {
                console.log(secretKey);
                
                const token = jwt.sign(user, secretKey)
                await db.none(`UPDATE users SET token=$2 WHERE id=$1`, [user.id, token])
            } else {
                throw new Error("JWT secret key 'KEY' is not defined in environment variables")
            }
            res.status(200).json({ msg: "user succesfully logged in" })
        } else {
            res.status(400).json({ error: "incorrect credentials" })
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
    }
}

export { login }
