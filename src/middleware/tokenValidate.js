export default function validateToken() {
    return (req, res, next) => {
        const { authorization } = req.headers

        if (!authorization) return res.status(401).send('Você não tem autorização!')
        const token = authorization?.replace('Bearer ', '')

        next()
    }
}