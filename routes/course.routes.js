const express = require('express')
const { createCourse, getAllCourses, createLecture, getLecturesByCourseId, updateCourse, deleteCourse, deleteLecture  } = require('../controllers/course.controllers')
const {authorizationroles, isLoggedIn, authorizeSubscription }  = require('../middleware/auth.middleware.js')
const courseRoutes = express.Router()

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() });


courseRoutes.route('/')
.get(getAllCourses)
.post(isLoggedIn, authorizationroles('ADMIN'), upload.single('thumbnail'), createCourse)
.delete(isLoggedIn, authorizationroles('ADMIN'),deleteLecture)

courseRoutes.route('/:courseId')
.post(isLoggedIn, authorizationroles('ADMIN'), upload.single('lecture'),createLecture)
.get(isLoggedIn, authorizeSubscription, getLecturesByCourseId)
.put(isLoggedIn, authorizationroles('ADMIN'),updateCourse)
.delete(isLoggedIn, authorizationroles('ADMIN'),deleteCourse)

module.exports = courseRoutes