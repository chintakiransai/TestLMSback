const courseModel = require("../schema/course.model");
const AppError = require("../utils/appError");
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require("firebase/storage");


exports.createCourse= async (req,res,next) =>
{
   try {
    const { title,description,category, createdby} = req.body

    if(!title || !description || !category || !createdby)
    {
        return next(new AppError("All fields are required",400))
    }

    const course = await courseModel.create({ title,description,category,createdby})
       
   if(!course) {
        return next(new AppError("Course failed to create",400))
   }

   if(req.file) 
   {
        const storage = getStorage();
        const storageRef = ref(storage, `LMSProject/CourseImages/${Date.now()}${req.file.originalname}`);
        const metadata = {contentType: 'image/jpeg', };
        await uploadBytes(storageRef, req.file.buffer,metadata)
        const downloadURL = await getDownloadURL(storageRef);
        course.thumbnail = downloadURL
    }
    await course.save()

    res.status(200).json({
        success: true,
        message:"Course created Successfully"
    })
    } catch (error) {
    if(error.code===11000)
    {
        return next(new AppError("This title has already existed. Please provide a new title",500))
    }
    else {
        return next(new AppError(error.message,500))
    }
   }
}


exports.getAllCourses = async (req,res,next) => {
    try {
        const courses = await courseModel.find({}).select('-lectures')
        res.status(200).json({
            success:true,
            message:"get courses details",
            courses,
        })  
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.updateCourse = async (req,res,next) => {
    try {
        const { courseId } = req.params

        const course = await courseModel.findByIdAndUpdate(courseId,
        {
            $set:req.body
        },
        {
            runValidators: true,
        })
            
        if(!course) {
            return next(new AppError("course not found",400))
        }  

        res.status(200).json({
            success: true,
            message:"course updated"
        })

    } catch (error) {
        if(error.code===11000) {
            return next(new AppError("This title has already existed. Please provide a new title",500))
        }
        else {
            return next(new AppError(error.message,500))
        }
    }
}


exports.deleteCourse = async (req,res,next) => {
    try {
        const { courseId } = req.params
        const course = await courseModel.findById(courseId)
        if(!course) {
           return next(new AppError("course not found",400))
        }

        await courseModel.findByIdAndDelete(courseId)

        res.status(200).json({
        success:true,
        message:"course deleted"
        })  
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.createLecture = async(req,res,next) => {
    try {
        const { title, description } = req.body
        const { courseId } = req.params

        if(!title || !description) {
           return next(new AppError("All fields are required",400))
        }

        const course = await courseModel.findById(courseId)

        if(!course) {
           return next(new AppError("course not found",400))
        }

        if(req.file)
        {
            const storage = getStorage();
            const storageRef = ref(storage, `LMSProject/LectureVideos/${Date.now()}${req.file.originalname}`);
            const metadata = {contentType: req.file.mimetype };
            await uploadBytes(storageRef, req.file.buffer,metadata)
            const downloadURL = await getDownloadURL(storageRef);
            lecture = downloadURL 
        }

        course.lectures.push({title, description, lecture})
        course.numberOfLectures = course.lectures.length
        await course.save()

        res.status(200).json({
            success:true,
            message:"Lecture created successfully",
            Lecture: course.lectures,
        }) 
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.getLecturesByCourseId = async(req,res,next) => {
    try {
        const {courseId} = req.params
        const course = await courseModel.findById(courseId)
        if(!course) {
           return next(AppError("Course not found",400))
        }
        res.status(200).json({
            success:true,
            message:"Course lectures fetched successfully",
            Lectures: course.lectures,
            
        })
    } catch (error) {
        return next(new AppError(error.message,500))
    }
    
}


exports.deleteLecture = async(req,res,next) => {
    try {
        const { courseId, lectureId } = req.query

        if(!courseId) {
           return next(new AppError("Course is required",400))
        }

        if(!lectureId) {
           return next(new AppError("Lecture is required",400))
        }

        const course = await courseModel.findById(courseId)

        if(!course) {
           return next(new AppError("Course does not exist",400))
        }
        
        const lectureIndex = course.lectures.findIndex((lecture)=>lecture._id.toString()===lectureId.toString())
        if(lectureIndex === -1) {
            return next(new AppError("Lecture does not exist",400))
        }

        const oldLectureVideo = course.lectures[lectureIndex].lecture
        const storage = getStorage();

        course.lectures.splice(lectureIndex,1)
            
        const oldStorageRef = ref(storage, oldLectureVideo);
        await deleteObject(oldStorageRef);

        course.numberOfLectures = course.lectures.length
        await course.save()

        res.status(200).json({
            success:true,
            message:"Lecture deleted successfully",
            Lecture: course.lectures,
        }) 
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}
