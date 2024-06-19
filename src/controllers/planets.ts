import Joi from "joi"
import { Request, Response } from "express"
import pgPromise from "pg-promise"

const db = pgPromise(/* {options} */)("postgres://ilyas:ilyas@localhost:5432/my_project")

//setup databse
const setupDB = async () => {
    //create table
    await db.none(
        //returns nothing
        `
        DROP TABLE IF EXISTS planets;

        CREATE TABLE planets (
            id SERIAL NOT NULL PRIMARY KEY,
            name TEXT NOT NULL
        );
    `
    )
    //populate table
    await db.none(`INSERT INTO planets (name) VALUES ('Mercury');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Venus');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Earth');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Mars');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Jupiter');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Saturn');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Uranus');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Neptune');`)

    const planets = await db.many(`SELECT * FROM planets`)

    console.log(planets)
    return planets
}

setupDB()

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
    name: Joi.string().alphanum().min(3).max(30).required(),
})

const planetIdValidation = Joi.object({
    id: Joi.number().integer().required(),
})

const getAll = async (req: Request, res: Response) => {
    const planets = await db.many(`SELECT * FROM planets;`)
    res.status(200).json(planets)
}

const getOneById = async (req: Request, res: Response) => {
    const { error, value } = planetIdValidation.validate(req.params)
    const { id } = value
    if (!error) {
        const planet = await db.oneOrNone(`SELECT * FROM planets WHERE id=${Number(id)};`)
        if (planet) {
            res.status(200).json(planet)
        } else {
            res.status(400).send({ err: `there is no planet with id ${id}` })
        }
    } else {
        res.status(400).send({ err: error.details[0].message })
    }
}

const create = async (req: Request, res: Response) => {
    const { error, value } = planetValidation.validate(req.body)
    if (!error) {
        const { name } = value
        console.log(value);
        
        const alreadyExists = await db.oneOrNone(`SELECT * FROM planets WHERE name='${name}';`)
        if (!alreadyExists) {
            await db.none(`
                INSERT INTO planets (name)
                VALUES ('${name}');
                `)
            res.status(201).json({ msg: "planet successfully added" })
        } else if (alreadyExists) {
            res.status(400).send({ err: "there is already a planet with this name" })
        }
    } else {
        res.status(400).send({ err: error.details[0].message })
    }
}

const updateById = async (req: Request, res: Response) => {
    const { id } = req.params
    const { error, value } = planetValidation.validate( req.body )
    const {name} = value
    if (!error) {
        const planetToUpdate = await db.oneOrNone(`SELECT * FROM planets WHERE id=${Number(id)};`)
        if (planetToUpdate) {
            await db.none(`
                UPDATE planets
                SET name='${name}'
                WHERE id=${Number(id)};
            `)
            planets = planets.map((p) => (p.id === Number(id) ? { ...p, name } : p))
            res.status(200).send({ msg: "planet modified successfully" })
        } else {
            res.status(400).send({ err: `there is no planet with id ${id}` })
        }
    } else {
        res.status(400).send({ err: error.details[0].message })
    }
}

const deleteById = async (req: Request, res: Response) => {
    const { error, value } = planetIdValidation.validate(req.params)
    const { id } = value
    if (!error) {
        const planetToDelete = await db.oneOrNone(`SELECT * FROM planets WHERE id=${Number(id)};`)
        if (planetToDelete) {
            await db.none(`DELETE FROM planets WHERE id=${Number(id)};`)
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
