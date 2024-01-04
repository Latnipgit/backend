module.exports = app => {
    const paymentHistory = require("../../controllers/admin/paymentHistory.controller.js");

    const router = require("express").Router();
    const auth = require("../../middleware/authentication.js");

    router.get("/getAllApprovedTransactions", auth, paymentHistory.getAllApprovedTransactions);
    router.get("/getAllDisputedTransactions", auth, paymentHistory.getAllDisputedTransactions);
    router.post("/approveOrRejectPayment",auth, paymentHistory.approveOrRejectPayment);

    app.use("/api/admin", router);
};