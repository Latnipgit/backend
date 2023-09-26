module.exports = app => {
    const admin = require("../../controllers/admin/admin.controller.js");

    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");

    // Create a new Tutorial
    router.post("/add", auth, admin.addAdmin);
    router.post("/logout", auth, admin.logout);
    router.get("/getLoginInfo", auth, admin.getLoginInfo);
    router.get("/getAllAdmins",auth,admin.getAllAdmins);
    router.post("/getalltransactions",auth,admin.getAllTransactions);
    router.get("/getAllUsers",auth, admin.getAllUsers);

    router.post("/login", admin.authenticateAdmin);
    router.post("/changePasswordUsingToken", admin.changePasswordUsingToken);
    router.post("/changePasswordUsingOldPass",auth, admin.changePasswordUsingOldPass);
    router.post("/forgetPassword", admin.forgetPassword);
    router.post("/password-reset/:userId/:token", admin.forgetPasswordLink);

    app.use("/api/admin", router);
};