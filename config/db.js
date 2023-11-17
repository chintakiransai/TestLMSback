const mongoose = require('mongoose')
const dbToConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URL|| "mongodb+srv://KiranSai:scyzEuN3jY6PYO20@cluster0.5jdzdvt.mongodb.net/project1").then(conn =>
{
    if(conn)
    {
        console.log("Database Connected Sucessfully");
    }
})     
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = dbToConnect


