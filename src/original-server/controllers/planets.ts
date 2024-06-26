import Joi from "joi"
import { Request, Response } from "express"
import { db } from "../db.js"

const planetNameValidation = Joi.object({
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
    if (!error) {
        const { id } = value
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
    const { error, value } = planetNameValidation.validate(req.body)
    if (!error) {
        const { name } = value
        const alreadyExists = await db.oneOrNone(`SELECT * FROM planets WHERE name='${name}';`)

        if (!alreadyExists) {
            await db.none(`
                INSERT INTO planets (name)
                VALUES ('${name}');
                `)
            res.status(201).json({ msg: "planet successfully added" })
        } else {
            res.status(400).send({ err: "there is already a planet with this name" })
        }
    } else {
        res.status(400).send({ err: error.details[0].message || "bad request" })
    }
}

const updateById = async (req: Request, res: Response) => {
    const { error: nameError, value: nameValue } = planetNameValidation.validate(req.body)
    const { error: idError, value: idValue } = planetIdValidation.validate(req.params)
    if (!nameError && !idError) {
        const { id } = idValue
        const { name } = nameValue
        const planetToUpdate = await db.oneOrNone(`SELECT * FROM planets WHERE id=${Number(id)};`)
        if (planetToUpdate) {
            await db.none(`
                UPDATE planets
                SET name='${name}'
                WHERE id=${Number(id)}
                ;
            `)
            res.status(200).send({ msg: "planet modified successfully" })
        } else {
            res.status(400).send({ err: `there is no planet with id ${id}` })
        }
    } else {
        res.status(400).send({ err: nameError ? nameError.details[0].message : idError?.details[0].message || "bad request" })
    }
}

const deleteById = async (req: Request, res: Response) => {
    const { error, value } = planetIdValidation.validate(req.params)
    const { id } = value
    if (!error) {
        const planetToDelete = await db.oneOrNone(`SELECT * FROM planets WHERE id=${Number(id)};`)
        if (planetToDelete) {
            await db.none(`DELETE FROM planets WHERE id=${Number(id)};`)
            res.status(200).send({ msg: "planet deleted succesfully" })
        } else {
            res.status(400).send({ err: `there is no planet with id ${id}` })
        }
    } else {
        res.status(400).send({ msg: error.details[0].message })
    }
}

const addImage = async (req: Request, res: Response) => {
    const { error, value } = planetIdValidation.validate(req.params)
    const { id } = value
    const filePath = req.file?.path
    if (!error && req.file) {
        db.none(`
            UPDATE planets
            SET image='${filePath}'
            WHERE id=${Number(id)}
            `)
        res.status(201).json({ msg: "Planet image added successfully" })
    } else {
        res.status(400).json({ msg: error?.details[0].message })
    }
}

export { getAll, getOneById, create, updateById, deleteById, addImage }
