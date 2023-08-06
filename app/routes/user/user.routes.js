module.exports = app => {
    const user = require("../controllers/user.controller.js");

    var router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../middleware/auth.js");

    // Create a new Tutorial
    router.post("/signup", user.signup);
    router.post("/login", user.authenticateUser);
    router.post("/logout", auth, user.logout);
    router.get("/getLoginInfo",auth, user.getLoginInfo);
    router.get("/getAllUsers",auth, user.getAllUsers);

    app.use("/api/user", router);
};