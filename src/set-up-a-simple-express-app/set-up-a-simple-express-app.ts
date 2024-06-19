import express from "express"
import "express-async-errors"
import morgan from "morgan"
import dotenv from "dotenv"

type Planet = {
    id: number
    name: string
}

let planets: Planet[] = [
    { id: 1, name: "Mercury" },
    { id: 2, name: "Venus" },
    { id: 3, name: "Mars" },
    { id: 4, name: "Jupiter" },
    { id: 5, name: "Saturn" },
    { id: 6, name: "Uranus" },
    { id: 7, name: "Neptune" },
]

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(morgan("dev"))
app.use(express.json()) //accept json
app.use((req, res, next) => {
    console.log("client request received:", req)
    next()
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
