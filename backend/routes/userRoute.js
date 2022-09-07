const express=require('express');
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getUser, getAllUser, updateUserRole, deleteUser } = require('../controllers/userController');
const router=express.Router();
const { isAuthenticated ,authorizeRoles} =require('../middleware/auth');

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").post(resetPassword);

router.route("/logout").get(logout );

router.route("/me").get(isAuthenticated,getUserDetails);

router.route("/password/update").put(isAuthenticated,updatePassword);

router.route("/me/update").put(isAuthenticated,updateProfile);

router.route("/admin/users").get(isAuthenticated,authorizeRoles("admin"),getAllUser);

router.route("/admin/user/:id").get(isAuthenticated,authorizeRoles("admin"),getUser).put(isAuthenticated,authorizeRoles("admin"),updateUserRole).delete(isAuthenticated,authorizeRoles("admin"),deleteUser);

module.exports=router;