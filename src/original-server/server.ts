import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import multer from "multer"
import { getAll, getOneById, create, updateById, deleteById, addImage } from "./controllers/planets.js"
import { login, signup, authorize, logout, getUsers } from "./controllers/users.js"
import "express-async-errors"
import "./passport.js"

dotenv.config()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads") //parametro1 : error, parametro2: percorso in cui verrà salvato il file
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage })

const app = express()
const port = process.env.PORT || 3000

app.use(morgan("dev"))
app.use(express.json()) //accept json

//middleware che invia un messaggio quando la richiesta dell'utente viene ricevuta
app.use((req, res, next) => {
    console.log("client request received")
    next()
})

//per permettere all'untente di accedere a file all'interno del nostro server
//dobbiamo "esporli" impostando un url dal quale l'utente può accedere a questi file
//("/file-for-user") e indicare successivamente la cartella del server in cui si trova quel file ("uploads")
app.use("/file-for-user", express.static("uploads"))

//return all planets
app.get("/api/planets", getAll)

//return 1 planet by id
app.get("/api/planets/:id", getOneById)

//add new planet
app.post("/api/planets", create)

//modify a planet (deletes properties / columns we don't modify or copy)
app.put("/api/planets/:id", updateById)

//delete a planet
app.delete("/api/planets/:id", deleteById)

//add an image
app.post("/api/planets/:id/image", upload.single("image"), addImage) //"image" sarà una key che deve essere passata quando viene effettuato l'upload dell'immagine
app.get("/api/users", getUsers)
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
