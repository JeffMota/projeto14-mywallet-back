import { listRegistries, resgistry } from '../controller/Registries.js'
import { Router } from 'express'

const registriesRouter = Router()

//Rotas de registros
registriesRouter.get('/registries', listRegistries)
registriesRouter.post('/registries', resgistry)

export default registriesRouter