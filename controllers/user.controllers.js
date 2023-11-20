const userModel = require("../schema/user.model.js")
const AppError = require("../utils/appError.js")
const emailValidator = require('email-validator')
const sendEmail = require('../utils/sendEmail.js')
const crypto = require('crypto')

const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require("firebase/storage");

exports.userCreate= async (req,res,next) =>
{
    try {
        const { name,email,password} =req.body
        if(! name || ! email || ! password)
        {
            return next(new AppError("All fields are required",400))
        }

        const userExists = await userModel.findOne({email})

        if(userExists)
        {
            return next(new AppError("User already register",400,))
        }

        if(!emailValidator.validate(email))
        {
            return next(new AppError("Email format is invalid",400))
        }
        const user = await userModel.create({name,email,password, avatar:null})
    
        if(!user)
        {
            return next(
                new AppError('User registration failed, please try again later', 400));
        }

        if(req.file)
        {
            const storage = getStorage();
            const storageRef = ref(storage, `LMSProject/UserProfiles/${Date.now()}${req.file.originalname}`);
            const metadata = {contentType: 'image/jpeg', };
            await uploadBytes(storageRef, req.file.buffer,metadata)
            const downloadURL = await getDownloadURL(storageRef);
            user.avatar = downloadURL
        }
        
        await user.save();
        
        const token = await user.jwtToken()
        const cookieOption = {
            maxAge: 24* 60 * 60 *1000,
            httpOnly:true
        }
        res.cookie("token",token,cookieOption)
        user.password = undefined
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user,
        });
        } catch(error) {
            return next(new AppError(error.message,400))
        }
}


exports.userLogin = async (req,res,next) => {
    try {
        const {email, password} = req.body
    if(!email || !password )
    {
        return next(new AppError("All fields are required",400))
    }
    const user = await userModel.findOne({email}).select('+password')
    if(!user)
    {
        return next(new AppError("email has not register",400))
    }
    
    const userMatch =await user.comparePass(password)
    if(!userMatch || !user)
    {
        return next(new AppError("Incorrect password",400))
    }
        await user.save()

        const token =await user.jwtToken()
        const cookieOption = {
            secure: true,
            maxAge: 24* 60 * 60 *1000,
            httpOnly: true,
            sameSite: "none",
        }
        res.cookie("token",token,cookieOption)

        user.password = undefined

        res.status(200).json({
            success:true,
            message:"User login successfully",
            user
           })
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

exports.userDetails = async (req,res,next) => {
    try {
        const userdetails = req.user.id
        if(!userdetails)
        {
            return next(new AppError("user not logged in",400))
        }
        else {
            const user = await userModel.findById(userdetails)
            user.password = undefined
            res.status(200).json({
                success: true,
                message:"User fetched details successfully",
                user,
        })
    }
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

exports.userLogout = (req,res,next) => 
{
    try {
        res.cookie("token",null,0)
        res.status(200).json({
            success: true,
            message:"User logout successfully"
           })
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

exports.forgetPassword = async (req,res,next) => {
    try {
        const {email} = req.body
        if(!email) {
            return next(new AppError("Email field is required",400))
        }
        const user = await userModel.findOne({email})
        if(!user) {
            return next(new AppError("Email not registered",400))
        }
        const resetToken = await user.generatePasswordResetToken()
        await user.save();
        const frontendUrl="http://localhost:5173"
        const resetPasswordUrl = `${frontendUrl}/resetPassword/${resetToken}`
        const subject = "Password Reset"
        const message =`You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`
        await sendEmail(email,subject,message)
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`,
          });
    } catch (error) {
        // user.forgotPasswordToken = undefined;
        // user.forgotPasswordExpiry = undefined;
        // await user.save();
        return next(new AppError(error.message,500))
    }
}


exports.resetPassword = async(req,res,next) => {
    try {
        const {password} = req.body
        const {resetToken} = req.params
        if(!password)
        {
            return next(new AppError("Password is required",400))
        }
        const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        const user = await userModel.findOne(
            {
                forgotPasswordToken,
                forgotPasswordExpiry: {$gt:Date.now()},   
            })
        if(!user)
        {
            return next(new AppError("Token is invalid or expired, please try again",400))
        }
        user.password = password
        user.forgotPasswordToken= undefined
        user.forgotPasswordExpiry= undefined
        user.save()
        res.status(200).json({
            success: true,
            message:"User password changed successfully"
           })
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.changePassword = async (req,res,next) => {
    try {
        const { oldPassword, newPassword } =req.body 
        if(!oldPassword || !newPassword )
        {
            return next(new AppError("All fields are required",400))
        }
        const { id } =req.user
        const userExists = await userModel.findById(id).select('+password')
        if(!userExists)
        {
            return next(new AppError("User doesn't exists",400))
        }
        const isMatch = await userExists.comparePass(oldPassword)
        if(isMatch)
        {
            userExists.password = newPassword
            await userExists.save()
            userExists.password = undefined
            res.status(200).json({
                success: true,
                message:"User password changed successfully"
               })
        }
        else {
            return next(new AppError("Incorrect password",400))
        }

    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

exports.updateProfile = async(req,res,next) => {
    try {
        const {name} = req.body
        const {id} = req.user
        const user = await userModel.findById(id)

        if(!user)
        {
            return next(new AppError('Invalid user id or user does not exist'));
        }

        if(name) {
            user.name = name
        }
        
        if(req.file)
        {   
            const oldImage = user.avatar
            const storage = getStorage();
            const storageRef = ref(storage, `LMSProject/UserProfiles/${Date.now()}${req.file.originalname}`);
            const metadata = {contentType: 'image/jpeg', };
            await uploadBytes(storageRef, req.file.buffer,metadata)
            const downloadURL = await getDownloadURL(storageRef);
            user.avatar = downloadURL
            if(oldImage) {
                const oldStorageRef = ref(storage, oldImage);
                await deleteObject(oldStorageRef);
            }
        }
        await user.save();
        user.password = undefined
        res.status(200).json({
            success: true,
            message:"User details updated successfully",
            user,
           })
        
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}
