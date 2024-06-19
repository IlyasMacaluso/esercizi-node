import Joi from "joi"
import { Request, Response } from "express"

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

const planetValidation = Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().alphanum().min(3).max(30).required(),
})

const planetIdValidation = Joi.object({
    id: Joi.number().integer().required(),
})

const getAll = (req: Request, res: Response) => {
    res.status(200).json(planets)
}

const getOneById = (req: Request, res: Response) => {
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
}

const create = (req: Request, res: Response) => {
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
}

const updateById = (req: Request, res: Response) => {
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
}

const deleteById = (req: Request, res: Response) => {
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
}

export { getAll, getOneById, create, updateById, deleteById }
