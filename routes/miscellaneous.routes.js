const express = require('express')
const contactRoutes = express.Router()
const {contactUs,userStats} = require('../controllers/miscellaneous.controller')
const {authorizationroles, isLoggedIn }  = require('../middleware/auth.middleware.js')


contactRoutes.post('/contactus',contactUs)
contactRoutes.get('/user/stats',isLoggedIn,authorizationroles('ADMIN'),userStats)


  module.exports = contactRoutes;
