module.exports = app => {
    const sendBillTransactions = require("../../controllers/user/sendBillTransactions.controller.js");
    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");

    // send bill
    router.post("/create",auth, sendBillTransactions.create);

    app.use("/api/transactions", router);
};