module.exports = app => {
    const paymentHistory = require("../../controllers/admin/paymentHistory.controller.js");

    const router = require("express").Router();
    const auth = require("../../middleware/authentication.js");

    router.get("/getAllApprovedTransactions", auth, paymentHistory.getAllApprovedTransactions);
    router.get("/getAllDisputedTransactions", auth, paymentHistory.getAllDisputedTransactions);
    router.post("/approveOrRejectPayment",auth, paymentHistory.approveOrRejectPayment);
    router.post("/askForSupportingDocument",auth, paymentHistory.askForSupportingDocument);
    router.get("/getDocumentsRequiredFromPaymentId" , paymentHistory.getDocumentsRequiredFromPaymentId);

    app.use("/api/admin", router);
};