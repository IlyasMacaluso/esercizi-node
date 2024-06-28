import pgPromise from "pg-promise"
import dotenv from "dotenv"

dotenv.config()

const dbUrl = process.env.DB_URL

if (!dbUrl) {
    throw new Error("Database url not found in .env file")
}

const db = pgPromise()(dbUrl)

const setupDB = async () => {
    await db.none(`
        DROP TABLE IF EXISTS users;
        
        CREATE TABLE users (
        ID SERIAL NOT NULL, 
        username VARCHAR(50),
        password TEXT,
        token TEXT
    )`)
    await db.none(`INSERT INTO users (username, password) VALUES ('amazinguser', 'secretpassword')`)
}

setupDB()

export { db }
