import express from 'express'
import cors from 'cors'
import authRouter from './routes/AuthRoutes.js'
import registriesRouter from './routes/RegistriesRoutes.js'

const server = express()
server.use(cors())
server.use(express.json())

server.use(authRouter)
server.use(registriesRouter)

server.listen(process.env.PORT, () => console.log(`Rodando na porta: ${process.env.PORT}`))