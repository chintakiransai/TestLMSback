const jsonwebtoken = require('jsonwebtoken')
const AppError = require("../utils/appError.js")
const isLoggedIn = (req,res,next) => {
    try {
        const getToken = req.cookies.token || null
        console.log(getToken);
        if(getToken)
        {
            const playload = jsonwebtoken.verify(getToken,'SECERT')
            if(playload)
            {
                req.user =playload
                next()
            }
            else {
                return next(new AppError("Unauthenicated user, please login again",400))
            }
        }
        else {
            return next(new AppError("Unauthenicated user, please login again",400))
        }
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

const authorizationroles = (...roles) => (req,res,next) => {
    try {
        const currentrole = req.user.role
        if(!roles.includes(currentrole))
          {
            return next(new AppError("Unauthenicated user, Admin can only login",400))
         }
         else{
            next()
         }
      
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

const authorizeSubscription = (req,res,next) => {
    try {
        const user = req.user
        if(user.role !=="ADMIN" && user.subscription.status !== 'active' ) {
            return next(new AppError("You do not have permission to access",403))
        }
        else {
            next()
        }
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


module.exports = {isLoggedIn
, authorizationroles, authorizeSubscription  }