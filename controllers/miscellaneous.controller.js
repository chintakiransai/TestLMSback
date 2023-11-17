const userModel = require('../schema/user.model.js');
const AppError= require('../utils/appError.js')
const sendEmail = require('../utils/sendEmail.js')

const contactUs = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return next(new AppError('Name, Email, Message are required'));
    }

      const subject = 'Contact Us Form';
      const textMessage = `${name} - ${email} <br /> ${message}`;

      await sendEmail(email, subject, textMessage);

    res.status(200).json({
      success: true,
      message: 'Your request has been submitted successfully',
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};


const userStats = async (req,res,next) => {
    try {
      const allUsersCount = await userModel.countDocuments()
      const subscriptionCount = await userModel.countDocuments({'subscription.status':'active'})
      res.status(200).json({
        success: true,
        message: 'All registered users count',
        allUsersCount,
        subscriptionCount,
      });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
}

module.exports = {contactUs, userStats }