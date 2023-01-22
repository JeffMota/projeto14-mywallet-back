import joi from 'joi'
import dayjs from 'dayjs'
import db from '../config/database.js'

//Buscar registros
export async function listRegistries(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

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
    const token = authorization?.replace('Bearer ', '')

    try {

        const checkSession = await db.collection('session').findOne({ token })
        if (!checkSession) return res.status(401).send('Você não tem autorização!')

        await db.collection(`registries${checkSession.name}`).insertOne({
            date: dayjs().format('DD/MM'),
            description,
            value: Number(value),
            type
        })

        res.sendStatus(201)

    } catch (error) {
        res.status(500).send(error.message)
    }
}
