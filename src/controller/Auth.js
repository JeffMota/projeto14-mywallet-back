import joi from 'joi'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import { v4 as uuid } from 'uuid'
import db from '../config/database.js'

import { loginSchema, userSchema } from '../schemas/AuthSchema.js'

//Cadastrar usuário
export async function signUp(req, res) {
    const body = req.body

    const { error } = userSchema.validate(body, { abortEarly: false })

    if (error) {
        const err = error.details.map(detail => detail.message)
        return res.status(422).send(err)
    }

    try {

        const userExist = await db.collection('users').findOne({ email: body.email })
        if (userExist) return res.status(409).send('Usuário já cadastrado')

        const hashedPass = bcrypt.hashSync(body.password, 10)

        await db.collection('users').insertOne(
            {
                name: (body.name).toLowerCase(),
                email: body.email,
                password: hashedPass
            })

        res.sendStatus(201)

    } catch (error) {
        res.status(500).send(error.message)
    }
}

//Login
export async function signIn(req, res) {
    const body = req.body

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
                        name: userExist.name,
                        userId: userExist._id,
                        token
                    }
                }
            )

            return res.send({ token, name: userExist.name })

        }

        const token = uuid()

        await db.collection('session').insertOne({
            name: userExist.name,
            userId: userExist._id,
            token
        })

        res.send({ token, name: userExist.name })

    } catch (error) {
        return res.status(500).send(error.message)
    }
}
