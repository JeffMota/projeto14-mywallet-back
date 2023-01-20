import joi from 'joi'
import dayjs from 'dayjs'
import db from '../config/database.js'

//Buscar registros
export async function listRegistries(req, res) {
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

        const registries = await db.collection(`registries${checkSession.name}`).find().toArray()

        let total = 0
        registries.forEach(reg => {
            if (reg.type === 'saida') {
                total = total - reg.value
            }
            else {
                total += reg.value
            }
        })

        res.send({ registries, total })

    } catch (error) {
        res.status(500).send(error.message)
    }
}

//Registrar
export async function resgistry(req, res) {
    const { value, description, type } = req.body
    const { authorization } = req.headers
    const token = authorization.replace('Bearer ', '')

    const headerSchema = joi.object({
        value: joi.number().max(1000000000).required(),
        description: joi.string().min(1).max(100).required(),
        type: joi.string().valid('entrada', 'saida').required(),
        token: joi.string().required().max(100)
    })

    const { error } = headerSchema.validate({ token, value, description, type })
    if (error) {
        const err = error.details.map(detail => detail.message)
        return res.status(422).send(err)
    }

    try {

        const checkSession = await db.collection('session').findOne({ token })
        if (!checkSession) return res.status(401).send('Você não tem autorização!')

        await db.collection(`registries${checkSession.name}`).insertOne({
            date: dayjs().format('DD/MM'),
            description,
            value,
            type
        })

        res.send(201)

    } catch (error) {
        res.status(500).send(error.message)
    }
}
