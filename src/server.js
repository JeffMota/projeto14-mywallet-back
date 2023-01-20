import express from 'express'
import cors from 'cors'
import authRouter from './routes/AuthRoutes.js'
import registriesRouter from './routes/RegistriesRoutes.js'

const server = express()
server.use(cors())
server.use(express.json())

server.use(authRouter)
server.use(registriesRouter)

const PORT = 5000
server.listen(PORT, () => console.log(`Rodando na porta: ${PORT}`))