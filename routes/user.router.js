const Router = require('express')
const router = new Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration', userController.createUser)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.auth)
router.get('/', userController.getUsers)
router.get('/:id', userController.getOneUser)
router.put('/', userController.updateUser)
router.delete('/:id', userController.deleteUser)


module.exports = router