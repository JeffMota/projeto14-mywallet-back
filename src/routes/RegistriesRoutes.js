import { listRegistries, resgistry } from '../controller/Registries.js'
import { Router } from 'express'
import validateToken from '../middleware/tokenValidate.js'
import { regSchema } from '../schemas/RegistriesSchemas.js'
import validateSchema from '../middleware/validateSchema.js'

const registriesRouter = Router()

//Rotas de registros
registriesRouter.use(validateToken())
registriesRouter.get('/registries', listRegistries)
registriesRouter.post('/registries', validateSchema(regSchema), resgistry)

export default registriesRouter