const errorMiddleware = (error,req,res,next) => {
    req.statusCode = error.statusCode  || 500
    req.message = error.message || "something went wrong"
    res.status(req.statusCode).json({
        message:req.message,
        success:false,
        stack:error.stack
    })
}

module.exports =errorMiddleware