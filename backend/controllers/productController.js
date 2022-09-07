const { findByIdAndUpdate } = require("../models/productModel");
const Product=require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");


//Create Product --admin
exports.createProduct=catchAsyncErrors(async(req,res,next)=>{
    req.body.user=req.body.id;
    const product=await Product.create(req.body);
    res.status(201).json({
        success:true,
        product,
    });
});

//get all product
exports.getAllProducts=catchAsyncErrors(async(req,res,next)=>{
    const resultPerPage=5;
    const productCount=await Product.countDocuments();
    const apifeature=new ApiFeatures(Product.find(),req.query).search().filter();
    apifeature.pagination(resultPerPage);
    let products=await apifeature.query;
    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage
    });
});

//Get product details
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    res.status(200).json({
        success:true,
        product,
        // productCount
    })
})

//update product --Admin
exports.updateProduct=catchAsyncErrors(async(req,res,next)=>{
    let product=Product.findById(req.params.id);
    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
        })
    }

    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        product
    })
})

//Delete Product
exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })
})

//Create new review or update the review
exports.createProductReview=catchAsyncErrors(async(req,res,next)=>{
    const {rating,comment,productId}=req.body;
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }

    const product=await Product.findById(productId);

    const isReviewed=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach(rev=>{
            if(rev.user.toString()===req.user._id.toString())
            (review.rating=rating),
            (rev.comment=comment)
        });
    }
    else{
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length;
    }

    let avg=0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
      });
    
      product.ratings = avg / product.reviews.length;
    
    await product.save({
        validateBeforeSave:false
    });

    res.status(200).json({
        success:true,
    });
});

//Get all reviews of a product
exports.getProductReviews=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("product not found",404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews,
    });
});

//delete reviews
exports.deleteReview=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.producId);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    const reviews=product.reviews.filter((rev)=>rev._id.toString()!==req.query.id.toString());

    let avg=0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
      });
    
    const ratings = avg /reviews.length;

    const numOfReviews=reviews.length;

    await Product.findByIdAndUpdate(req.query.producId,{
        reviews,
        ratings,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    
    res.status(200).json({
        success:true,
    })
})