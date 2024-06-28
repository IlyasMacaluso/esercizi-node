import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import multer from "multer"
import "express-async-errors"
import "./passport.js"

import { getAll, getOneById, create, updateById, deleteById, addImage } from "./controllers/planets.js"
import { signup, login, logout } from "./controllers/users.js"
import { authorize } from "./authorize/authorije.js"

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads") //parametro1 : error, parametro2: percorso in cui verrà salvato il file
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage })
app.use("/file-for-user", express.static("uploads"))

//planets routes
app.get("/api/planets", getAll) //return all planets
app.get("/api/planets/:id", getOneById) //return 1 planet by id
app.post("/api/planets", create) //add new planet
app.put("/api/planets/:id", updateById) //modify a planet (deletes properties / columns we don't modify or copy)
app.delete("/api/planets/:id", deleteById) //delete a planet
app.post("/api/planets/:id/image", authorize, upload.single("image"), addImage) //"image" sarà una key che deve essere passata quando viene effettuato l'upload dell'immagine

//user routes
app.post("/api/users/login", login)
app.post("/api/users/signup", signup)
app.get("/api/users/logout", authorize, logout)

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
