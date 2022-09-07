const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const User=require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail.js");
const crypto=require("crypto");


//Register a user
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const user=await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"this is a simple id",
            url:"profilepicUrl"
        }
    });

    sendToken(user,201,res);
});


//Login User
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;

    //Checking if user has given password and email both

    if(!email || !password){
        return next(new ErrorHandler("please enter email and apssword",400));
    }

    const user=await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched=user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res);
});

//Logout User
exports.logout=catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })

    res.status(200).json({
        success:true,
        message:"Logout successfully"
    })
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return next(new ErrorHander("User not found", 404));
    }
  
    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
  
    await user.save({ validateBeforeSave: false });
  
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
  
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHander(error.message, 500));
    }
  });

  //Reset Password
  exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{

    //creating token hash
    const resetPasswordToken=crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!user){
      return next(new ErrorHandler("Reset Password token is invalid and has been expired",404));
  }

  if(req.body.password!=req.body.confirmPassword){
    return next(new ErrorHandler("password does not match",400));
  }

  user.password=req.body.password;
  user.resetPasswordToken=undefined;
  user.resetPasswordExpire=undefined;

  await user.save();
  sendToken(user,200,res);
  });


  // Get user details
  exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id);

    res.status(200).json({
      sucess:true,
      user,
    })
  });


// Update user password
  exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id).select("+password");

    const isPasswordMatched=user.comparePassword(req.body.oldpassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is oncorrect password",400));
    }

    if(req.body.newPassword!==req.body.confirmPassword){
      return next(new ErrorHandler("password doesnot match",400));

    }

    user.password=req.body.newPassword;

    await user.save();
    
    sendToken(user,200,res);
  });


  //Update  user profile
  exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
    
    const newUserData={
      name:req.body.name,
      email:req.body.email,
    }

    //We will coudinary later
    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
      new:true,
      runValidators:true,
      useFindAndModify:false
    })

    res.status(200).json({
      success:true,
    })
  });


  //Get all users
  exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
    const users=await User.find();

    res.status(200).json({
      success:true,
      users,
    });
  });


    //Get single users--admin
    exports.getUser=catchAsyncErrors(async(req,res,next)=>{
      const user=await User.findById(req.params.id);

      if(!user){
        return next(new ErrorHandler("`User does not exist with Id"))
      }
  
      res.status(200).json({
        success:true,
        user,
      });
    });


  //Update  user role --admin
  exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
    
    const newUserData={
      name:req.body.name,
      email:req.body.email,
      role:req.body.role
    }

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
      new:true,
      runValidators:true,
      useFindAndModify:false
    })

    res.status(200).json({
      success:true,
      user
    })
  });

  
  //Delete user --admin
  exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{

    //We will remove cloudinary

    const user=await User.findById(req.params.id);

    if(!user){
      return next(new ErrorHandler(`User doesnt exist with Id:${req.params.id}`));  
    }

    await user.remove();

    res.status(200).json({
      success:true,
      message:"User deleted successfully"
    })
  });

 