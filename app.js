const express = require('express');
const dbToConnect = require('./config/db');
const userRoutes = require('./routes/user.routes');
const cookieParser = require('cookie-parser');
const courseRoutes = require('./routes/course.routes');
const errorMiddleware = require('./middleware/error.middleware');
const app = express();
const cors = require("cors")
const contactRoutes = require('./routes/miscellaneous.routes');
const paymentRoutes = require('./routes/payment.routes');

dbToConnect()

app.use(cors({
    origin:["http://localhost:5173","https://master--dashing-sprinkles-08ca64.netlify.app","https://fanciful-florentine-70900d.netlify.app/aboutus"],
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use('/avatar', express.static('uploads'))


// const miscRoutes = require('./routes/miscellaneous.routes');
// app.use('/misc', miscRoutes);

app.use('/user',userRoutes)
app.use('/course',courseRoutes)
app.use('/payment',paymentRoutes)
app.use('/contact',contactRoutes)
app.all('*',(req,res)=> {
    res.status(400).json({
        message:`can't find ${req.originalUrl}`
    })
})

app.use(errorMiddleware)

module.exports =app