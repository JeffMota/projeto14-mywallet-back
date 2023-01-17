import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import joi from 'joi'
dotenv.config()

const server = express()
server.use(cors())
server.use(express.json())

const mongoClient = new MongoClient(process.env.DATABASE_URL)

try {
    await mongoClient.connect()
    console.log("Servidor conectado!")
} catch (error) {
    console.error(error)
}

const db = mongoClient.db()

//Cadastrar usuário
server.post('/cadastro', async (req, res) => {
    const body = req.body

    const userSchema = joi.object({
        nome: joi.string().min(3).max(40).required(),
        email: joi.string().email().max(30).required(),
        senha: joi.string().min(3).max(30).required()
    })

    const { error } = userSchema.validate(body, { abortEarly: false })

    if (error) {
        const err = error.details.map(detail => detail.message)
        return res.status(422).send(err)
    }

    res.send(body)
})

const PORT = 5000
server.listen(PORT, () => console.log(`Rodando na porta: ${PORT}`))