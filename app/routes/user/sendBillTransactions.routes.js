module.exports = app => {
    const sendBillTransactions = require("../../controllers/user/sendBillTransactions.controller.js");
    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");

    // send bill
    router.post("/create",auth, sendBillTransactions.create);
    router.get("/getAllInvoicesSentToMe", auth, sendBillTransactions.getAllInvoicesSentToMe);
    router.get("/getAllInvoicesRaisedByMe", auth, sendBillTransactions.getAllInvoicesRaisedByMe);
    router.get("/getInvoicesForDefaulting", auth, sendBillTransactions.getInvoicesForDefaulting);
    router.post("/proceedToDefault", auth, sendBillTransactions.proceedToDefault);


    app.use("/api/transactions", router);
};