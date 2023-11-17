const mongoose = require('mongoose')

const courseSchema = mongoose.Schema({
    title: {
        type:String,
        unique:[true,"This title has exist, please give new title"],
        required: [true, 'Title is required'],
        minlength: [8, 'Title must be atleast 8 characters'],
        maxlength: [50, 'Title cannot be more than 50 characters'],
        trim: true,
    },
    description: {
        type:String,
        required: [true, 'Description is required'],
        minlength: [20, 'Description must be atleast 20 characters long'],
    },
    category: {
        type:String,
        required: [true, 'Category is required'],
    },
    thumbnail : {
        type:String
    },
    lectures: [{
        title: String,
        description : String,
        lecture:String,
    }],
    numberOfLectures :{
        type:Number,
        default:0
    },
    createdby : {
        type:String,
        required: [true, 'Course instructor name is required'],
    }
},
{
    timestamps : true,
})

const courseModel = mongoose.model("Course",courseSchema)
module.exports = courseModel

