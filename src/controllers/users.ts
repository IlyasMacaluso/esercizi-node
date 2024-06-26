import dotenv from "dotenv"
import { db } from "../db.js"
import { Request, Response } from "express"
dotenv.config()

//ci servirà per login/signup
const secretKey = process.env.KEY

if (!secretKey) {
    throw new Error("JWT secret key 'KEY' is not defined in environment variables")
}

const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await db.manyOrNone(`SELECT * FROM users`)
        res.status(200).json({ msg: "Success:", users })
    } catch (error) {
        res.status(400).json({ msg: "No users found" })
    }
}

export {getUsers}