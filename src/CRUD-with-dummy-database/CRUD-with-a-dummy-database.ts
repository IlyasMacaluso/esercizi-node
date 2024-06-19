import express from "express"
import "express-async-errors"
import morgan from "morgan"
import dotenv from "dotenv"
import Joi from "joi"

const planetValidation = Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().alphanum().min(3).max(30).required(),
})

const planetIdValidation = Joi.object({
    id: Joi.number().integer().required(),
})

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

//middleware che invia un messaggio quando la richiesta dell'utente viene ricevuta
app.use((req, res, next) => {
    console.log("client request received")
    next()
})

//return all planets
app.get("/api/planets", (req, res) => {
    res.status(200).json(planets)
})

//return 1 planet by id
app.get("/api/planets/:id", (req, res) => {
    const { error, value } = planetIdValidation.validate(req.params)
    const { id } = value
    if (!error) {
        const planet = planets.find((p) => p.id === Number(id))
        if (planet) {
            res.status(200).json(planet)
        } else {
            res.status(400).send({ err: `there is no planet with id ${id}` })
        }
    } else {
        res.status(400).send({ err: error.details[0].message })
    }
})

//add new planet
app.post("/api/planets", (req, res) => {
    const { error, value } = planetValidation.validate(req.body)
    if (!error) {
        const { id, name } = value
        const newPlanet: Planet = { id, name }
        const alreadyExists = planets.some((p) => p.id === id || p.name === name)
        if (!alreadyExists) {
            planets = [...planets, newPlanet]
            res.status(201).json({ msg: "planet successfully added" })
        } else if (alreadyExists) {
            res.status(400).send({ err: "there is already a planet with this id or name" })
        }
    } else {
        res.status(400).send({ err: error.details[0].message })
    }
})

//modify a planet (deletes properties / columns we don't modify or copy)
app.put("/api/planets/:id", (req, res) => {
    const { id } = req.params
    const { name } = req.body
    const { error, value } = planetValidation.validate({ id, name })
    if (!error) {
        const planetToUpdate = planets.find((p) => p.id === Number(id))
        if (planetToUpdate) {
            planets = planets.map((p) => (p.id === Number(id) ? { ...p, name } : p))
            res.status(200).send({ msg: "planet modified successfully" })
        } else {
            res.status(400).send({ err: `there is no planet with id ${id}` })
        }
    } else {
        res.status(400).send({ err: error.details[0].message })
    }
})

//delete a planet
app.delete("/api/planets/:id", (req, res) => {
    const { error, value } = planetIdValidation.validate(req.params)
    const { id } = value
    if (!error) {
        const planetToDelete = planets.find((p) => p.id === Number(id))
        if (planetToDelete) {
            planets = planets.filter((p) => p.id !== Number(id))
            res.status(200).send({ msg: "planet deleted succesfully" })
        } else {
            res.status(400).send({ err: `there is no planet with id ${id}` })
        }
    } else {
        res.status(400).send({ msg: error.details[0].message })
    }
})

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
