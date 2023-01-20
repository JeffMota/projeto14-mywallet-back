import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config()


const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

try {
    await mongoClient.connect()
    db = mongoClient.db()
    console.log("Servidor conectado!")
} catch (error) {
    console.error(error)
}

export default db

