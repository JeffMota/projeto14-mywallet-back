import joi from "joi"

export const loginSchema = joi.object({
    email: joi.string().email().max(30).required(),
    password: joi.string().min(3).max(30).required()
})

export const userSchema = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email().max(30).required(),
    password: joi.string().min(3).max(30).required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required()
})