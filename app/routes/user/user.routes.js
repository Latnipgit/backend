module.exports = app => {
    const user = require("../../controllers/user/user.controller.js");

    var router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/auth.js");

    // Create a new Tutorial
    router.post("/signup", user.signup);
    router.post("/login", user.authenticateUser);
    router.post("/logout", auth, user.logout);
    router.get("/getLoginInfo",auth, user.getLoginInfo);

    // router.post("/changePassword",auth, user.changePassword);
    router.post("/changePasswordUsingToken", user.changePasswordUsingToken);
    router.post("/changePasswordUsingOldPass", auth, user.changePasswordUsingOldPass);
    router.post("/forgetPassword", user.forgetPassword);
    router.post("/password-reset/:userId/:token", user.forgetPasswordLink);

    app.use("/api/user", router);
};