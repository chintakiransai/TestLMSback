const express = require('express')
const paymentRoutes= express.Router()
const {isLoggedIn, authorizationroles, authorizeSubscription} = require('../middleware/auth.middleware.js')
const { allPayments, buySubscription, verifySubscription, cancelSubscription, getRazorpayApiKey } = require('../controllers/payment.controllers.js')


paymentRoutes.get('/payments',isLoggedIn,authorizationroles('ADMIN'),allPayments)
paymentRoutes.post('/subscription',isLoggedIn,buySubscription)
paymentRoutes.post('/verify',isLoggedIn,verifySubscription)
paymentRoutes.post('/unSubscription',isLoggedIn,authorizeSubscription,cancelSubscription)
paymentRoutes.get('/razorpayKey',isLoggedIn,getRazorpayApiKey)


module.exports = paymentRoutes