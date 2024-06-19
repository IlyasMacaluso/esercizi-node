import express from "express"
import "express-async-errors"
import morgan from "morgan"
import dotenv from "dotenv"
import { getAll, getOneById, create, updateById, deleteById } from "./controllers/planets.js"

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

//return all planets
app.get("/api/planets", getAll)

//return 1 planet by id
app.get("/api/planets/:id", getOneById)

//add new planet
app.post("/api/planets", create)

//modify a planet (deletes properties / columns we don't modify or copy)
app.put("/api/planets/:id",updateById)

//delete a planet
app.delete("/api/planets/:id", deleteById)


//manage uncaught errors
app.use((err, res, next) => {
    if (err) {
        res.status(err.statusCode || 500).send({ msg: err.statusMessage || "Internal Server Error" })
    } else {
        next()
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
