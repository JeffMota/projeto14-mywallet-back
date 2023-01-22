import { signIn, signUp } from '../controller/Auth.js'
import { Router } from 'express'
import validateSchema from '../middleware/validateSchema.js'
import { loginSchema, userSchema } from '../schemas/AuthSchema.js'

const authRouter = Router()

//Rotas de autenticação
authRouter.post('/sign-up', validateSchema(userSchema), signUp)
authRouter.post('/sign-in', validateSchema(loginSchema), signIn)

export default authRouter