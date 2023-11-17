const paymentModel = require('../schema/payment.model.js');
require('dotenv').config()
const userModel = require('../schema/user.model.js')
const AppError = require('../utils/appError.js');
const crypto = require('crypto')
const Razorpay = require('razorpay')
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });


exports.getRazorpayApiKey = async (req,res,next) => { 
    try {
        res.status(201).json({
        success: true,
        message: 'Razorpay API key',
        key: process.env.RAZORPAY_KEY_ID,
        });
          
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.buySubscription = async(req,res,next) => {
    try {
        const {id} = req.user
        const user = await userModel.findById(id)

        if(!user) {
            return next(new AppError('Unauthorized, please login'));
        }
        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot purchase a subscription', 400));
        }
        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            total_count: 12,
        });
        user.subscription.id =  subscription.id
        user.subscription.status = subscription.status
        await user.save()
        res.status(201).json({
            success: true,
            message: 'Buyed subscription successfully',
            subscription_id:subscription.id
        });    
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.verifySubscription = async(req,res,next) => {
    try {
        const {id} = req.user
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
        req.body;
        const user = await userModel.findById(id)

        const subscriptionId = user.subscription.id;
        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_SECRET)
          .update(`${razorpay_payment_id}|${subscriptionId}`)
          .digest('hex');

        if(generatedSignature != razorpay_signature) {
            return next(new AppError('Payment not verified, please try again.', 400));
        }
        await paymentModel.create({razorpay_payment_id, razorpay_subscription_id, razorpay_signature})
        user.subscription.status = 'active'
        await user.save()
        res.status(201).json({
            success: true,
            message: 'Payment verified successfully',
            user,
        });    
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.cancelSubscription = async(req,res,next) => {
    try {
        const {id} = req.user
        const user = await userModel.findById(id)
 

        if(!user) {
            return next(new AppError('Unauthorized, please login'));
        }
        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot cancel the subscription', 400));
        }
         const subscriptionId = user.subscription.id
        try {
            const subscriptionDetails = await razorpay.subscriptions.fetch(subscriptionId);

            if (subscriptionDetails.status === 'completed') {
                return next(new AppError('Subscription is already completed. Cancellation not allowed', 400));
            }

            const subscription=await razorpay.subscriptions.cancel(subscriptionId)
            user.subscription.status = subscription.status
            await user.save();
        } catch (error) {
            return next(new AppError("hello"));
        }
        res.status(201).json({
            success: true,
            message: 'subscription Cancelled successfully',
            user,
        });    
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}


exports.allPayments = async(req,res,next) => {
    try {
        const {count} = req.query
        const subscription = await razorpay.subscriptions.all({
            count: count || 10
        })

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const finalMonths = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  const monthlyWisePayments = allPayments.items.map((payment) => {
    // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
    const monthsInNumbers = new Date(payment.start_at * 1000);

    return monthNames[monthsInNumbers.getMonth()];
  });

  monthlyWisePayments.map((month) => {
    Object.keys(finalMonths).forEach((objMonth) => {
      if (month === objMonth) {
        finalMonths[month] += 1;
      }
    });
  });

  const monthlySalesRecord = [];

  Object.keys(finalMonths).forEach((monthName) => {
    monthlySalesRecord.push(finalMonths[monthName]);
  });
     
        res.status(201).json({
            success: true,
            message: 'Get payment status',
            subscription,
            allPayments,
            finalMonths,
            monthlySalesRecord,
        });    
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}