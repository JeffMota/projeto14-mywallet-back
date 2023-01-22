import joi from "joi"

export const regSchema = joi.object({
    value: joi.string().max(1000000000).required(),
    description: joi.string().min(1).max(100).required(),
    type: joi.string().valid('entrada', 'saida').required(),
})