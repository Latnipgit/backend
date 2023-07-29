module.exports = app => {
    const user = require("../controllers/user.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/signup", user.signup);
    router.post("/login", user.authenticateUser);
    router.post("/logout", user.logout);
    router.get("/getLoginInfo", user.getLoginInfo);

    app.use("/api/user", router);
};