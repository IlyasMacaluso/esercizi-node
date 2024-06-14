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
    console.log("client request received")
    next()
})

app.get("/api/planets", (req, res) => {
    res.status(200).json(planets)
})

app.get("/api/planets/:id", (req, res) => {
    const { id } = req.params
    const planet = planets.find((p) => p.id === Number(id))
    if (planet) {
        res.status(200).json(planet)
    } else {
        res.status(400).send("planet not found")
    }
})

//inviamo una rischiesta che aggiunge un nuovo pianeta all'array
app.post("/api/newplanet", (req, res) => {
    const { id, name } = req.body
    const newPlanet: Planet = { id, name }
    const alreadyExists = planets.some((p) => p.id === id || p.name === name)
    if (id && name && !alreadyExists) {
        planets = [...planets, newPlanet]
        res.status(200).json(planets)
    } else if (alreadyExists) {
        res.status(500).send("There is already a planet with this id or name")
    } else {
        res.status(400).send("Insert and id and a name to add a planet")
    }
})

//modifica di una riga dalla tabella di un database.
//i valori che non vengono specificati non vengono mantenuti, ma eliminati !!!!attenzione!!!!!
app.put("/api/updateplanet/:id", (req, res) => {
    const { id } = req.params
    const { name } = req.body
    console.log(id, name)

    if (id && name) {
        planets = planets.map((p) => (p.id === Number(id) ? { ...p, name } : p))
        res.status(200).send(planets)
    } else {
        res.status(400).send({ msg: "Please, specify an id and a name" })
    }
})

//eliminare una riga
app.delete("/api/deleteplanet/:id", (req, res) => {
    const { id } = req.params
    const planetToDelete = planets.find((p) => p.id === Number(id))

    if (planetToDelete) {
        planets = planets.filter((p) => p.id !== Number(id))
        res.status(200).send(planets)
    } else {
        res.status(400).send("planet not found")
    }
})

//gestione errori
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
