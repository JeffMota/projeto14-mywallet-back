import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { MongoClient, ObjectId } from 'mongodb'
import joi from 'joi'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
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

//Buscar registros
server.get('/registries', async (req, res) => {
    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')

    const headerSchema = joi.object({
        token: joi.string().required().max(100)
    })

    const { error } = headerSchema.validate({ token })
    if (error) return res.status(422).send(error.details[0].message)

    try {

        const checkSession = await db.collection('session').findOne({ token })
        if (!checkSession) return res.status(401).send('Você não tem autorização para acessar esses dados!')

        const user = await db.collection('users').findOne({ _id: ObjectId(checkSession.userId) })

        const registries = await db.collection(`registries${user.name}`).find().toArray()

        res.send(registries)

    } catch (error) {
        res.status(500).send(error.message)
    }

})

//Cadastrar usuário
server.post('/sign-up', async (req, res) => {
    const body = req.body

    const userSchema = joi.object({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().max(30).required(),
        password: joi.string().min(3).max(30).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required()
    })

    const { error } = userSchema.validate(body, { abortEarly: false })

    if (error) {
        const err = error.details.map(detail => detail.message)
        return res.status(422).send(err)
    }

    try {

        const userExist = await db.collection('users').findOne({ email: body.email })
        if (userExist) return res.status(409).send('Usuário já cadastrado')

        const hashedPass = bcrypt.hashSync(body.password, 10)

        await db.collection('users').insertOne({ name: body.name, email: body.email, password: hashedPass })

        res.sendStatus(201)

    } catch (error) {
        res.status(500).send(error.message)
    }

})

//Login
server.post('/sign-in', async (req, res) => {
    const body = req.body

    const loginSchema = joi.object({
        email: joi.string().email().max(30).required(),
        password: joi.string().min(3).max(30).required()
    })

    const { error } = loginSchema.validate(body, { abortEarly: false })
    if (error) {
        const err = error.details.map(detail => detail.message)
        return res.status(422).send(err)
    }

    try {

        const userExist = await db.collection('users').findOne({ email: body.email })

        if (!userExist) return res.status(404).send('Dados incorretos!')

        if (!bcrypt.compareSync(body.password, userExist.password)) return res.status(404).send('Dados incorretos!')

        const alreadyExist = await db.collection('session').findOne({ _id: ObjectId(userExist._id) })

        if (alreadyExist) {
            const token = uuid()

            await db.collection('session').updateOne(
                {
                    _id: ObjectId(userExist._id)
                },
                {
                    $set: {
                        userId: userExist._id,
                        token
                    }
                }
            )

            return res.send(token)

        }

        const token = uuid()

        await db.collection('session').insertOne({
            userId: userExist._id,
            token
        })

        res.send(token)

    } catch (error) {
        return res.status(500).send(error.message)
    }

})

const PORT = 5000
server.listen(PORT, () => console.log(`Rodando na porta: ${PORT}`))