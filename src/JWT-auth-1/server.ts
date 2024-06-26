import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import { getUsers } from "./controllers/users.js"
import "express-async-errors"
import "./passport.js"
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(morgan("dev"))
app.use(express.json()) //accept json

//middleware che invia un messaggio quando la richiesta dell'utente viene ricevuta
app.use((req, res, next) => {
    console.log("client request received")
    next()
})

app.get("/api/users", getUsers)

//manage uncaught errors
app.use((err, res, next) => {
    if (err) {
        res.status(err.statusCode || 500).json({ msg: err.statusMessage || "Internal Server Error" })
    } else {
        next()
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
