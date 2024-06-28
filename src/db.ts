import pgPromise from "pg-promise"

const db = pgPromise(/* {options} */)("postgres://ilyas:ilyas@localhost:5432/my_project")

const setupDB = async () => {
    //create table
    await db.none(
        //returns nothing
        `
        DROP TABLE IF EXISTS planets;

        CREATE TABLE planets (
            id SERIAL NOT NULL PRIMARY KEY,
            name TEXT NOT NULL,
            image TEXT
        );

        DROP TABLE IF EXISTS users;

        CREATE TABLE users (
            id SERIAL NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            token TEXT
        );
    `
    )
    //populate tables
    await db.none(`INSERT INTO planets (name) VALUES ('Mercury');`)
    await db.none(`INSERT INTO planets (name) VALUES ('Venus');`)

    await db.none(`INSERT INTO users (username, password) VALUES ('amazinguser', 'password');`)
    await db.none(`INSERT INTO users (username, password) VALUES ('amazinguser2', 'password');`)

}
setupDB()

export { db }