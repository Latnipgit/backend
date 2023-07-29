module.exports = app => {
    const admin = require("../../controllers/admin/admin.controller.js");

    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/auth.js");

    // Create a new Tutorial
    router.post("/add", auth, admin.addAdmin);
    router.post("/logout", auth, admin.logout);
    router.get("/getLoginInfo", auth, admin.getLoginInfo);

    router.post("/login", admin.authenticateAdmin);

    app.use("/api/admin", router);
};