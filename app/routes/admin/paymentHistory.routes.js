module.exports = app => {
    const admin = require("../../controllers/admin/paymentHistory.controller.js");

    const router = require("express").Router();
    const auth = require("../../middleware/authentication.js");

    router.get("/getAllApprovedTransactions", auth, admin.getAllApprovedTransactions);
    router.get("/getAllDisputedTransactions", auth, admin.getAllDisputedTransactions);

    app.use("/api/admin", router);
};