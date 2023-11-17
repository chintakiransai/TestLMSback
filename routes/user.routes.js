const express =require('express')
const userRoutes = express.Router()
const { userCreate, userLogin, userDetails, userLogout, forgetPassword, resetPassword, changePassword, updateProfile } = require('../controllers/user.controllers')
const {isLoggedIn} = require('../middleware/auth.middleware.js')

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() });

userRoutes.post('/userCreate',upload.single('avatar'),userCreate)
userRoutes.post('/userLogin',userLogin)
userRoutes.get('/userDetails',isLoggedIn,userDetails)
userRoutes.get('/userLogout',userLogout)
userRoutes.post('/reset',forgetPassword)
userRoutes.post('/reset/:resetToken',resetPassword)
userRoutes.post('/changePassword',isLoggedIn,changePassword)
userRoutes.put('/updateProfile',isLoggedIn,upload.single('avatar'),updateProfile)


module.exports=userRoutes
