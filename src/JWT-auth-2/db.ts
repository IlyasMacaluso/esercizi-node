import pgPromise from "pg-promise"

const db = pgPromise(/* {options} */)("postgres://ilyas:ilyas@localhost:5432/my_project")

//databse setup
const setupDB = async () => {
    //create table
    await db.none(
        `
        DROP TABLE IF EXISTS users;

        CREATE TABLE users (
            id SERIAL NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            token TEXT
        );
    `
    )
    //populate table
    await db.none(`INSERT INTO users (username, password) VALUES ('amazinguser', 'password');`)
}

setupDB()

export { db }
