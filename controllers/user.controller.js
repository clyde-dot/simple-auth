const db = require('../db')
const bcrypt = require('bcrypt')
const ApiError = require('../error/ApiError')
const jwt = require('jsonwebtoken')

function generateJwtToken({id, username, email}) {
    return jwt.sign({
            id,
            username,
            email
        }, process.env.SECRET_KEY,
        {expiresIn: '24h'})
}

class UserController {
    async createUser(req, res, next) {
        try {
            const {
                username,
                email,
                password,
            } = req.body
            if (!username || !email || !password) {
                return next(ApiError.badRequest('Некорректные данные'))
            }
            const candidate = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email])
            if (candidate.rows[0]) {
                return next(ApiError.badRequest('Пользователь с таким именем или почтой уже зарегистрирован'))
            }
            const hashPassword = await bcrypt.hash(password, 5)
            let newUser = await db.query(`INSERT INTO USERS(username,email,password) VALUES($1,$2,$3) RETURNING *`, [username,
                email,
                hashPassword,
            ])
            newUser = newUser.rows[0]
            const token = generateJwtToken(newUser)
            return res.json(token)
        } catch (e) {
            next({message: "Что-то пошло не так"})
        }
    }

    async login(req, res, next) {
        try {
            const {username, password} = req.body
            let user = await db.query('SELECT * FROM users where username = $1', [username])
            user = user.rows[0]
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'))
            }
            const comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.internal('Указан не верный пароль'))
            }
            const token = generateJwtToken(user)
            return res.json(token)
        } catch (e) {
            return next(ApiError.badRequest('Непредвиденная ошибка'))
        }
    }

    async auth(req, res, next) {
        try {
            const token = generateJwtToken({id: req.user.id, username: req.user.username, email: req.user.email})
            return res.json(token)
        } catch (e) {
            return next(ApiError(e.message))
        }

    }

    async getUsers(req, res, next) {
        try {
            const users = await db.query('select * from users')
            return res.json(users.rows)
        } catch (e) {
            return next(ApiError(e.message))
        }

    }

    async getOneUser(req, res, next) {
        try {
            const {id} = req.params
            const user = await db.query(`select * from users where id=${id}`)
            res.json(user.rows[0])
        } catch (e) {
            return next(ApiError(e.message))

        }
    }

    async updateUser(req, res, next) {
        try {
            const {
                id,
                username,
                email,
                password
            } = req.body
            const updatedUser = await db.query('UPDATE USERS SET username = $1, email = $2, password = $3 where id = $4 RETURNING * ', [
                username,
                email,
                password, id])
            res.json(updatedUser.rows[0])
        } catch (e) {
            return next(ApiError(e.message))
        }
    }

    async deleteUser(req, res, next) {
        try {
            const {id} = req.params
            const deletedUser = await db.query('DELETE FROM USERS where id = $1 RETURNING * ', [id])
            res.json(deletedUser.rows[0])
        } catch (e) {
            return next(ApiError(e.message))
        }
    }
}

module.exports = new UserController()