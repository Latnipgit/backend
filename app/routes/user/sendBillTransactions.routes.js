module.exports = app => {
    const sendBillTransactions = require("../../controllers/user/sendBillTransactions.controller.js");
    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");
    const Authorization = require("../../middleware/userAuthorizations.js");

    // send bill
    router.post("/create",auth, sendBillTransactions.create);
    router.get("/getAllInvoicesSentToMe", auth, sendBillTransactions.getAllInvoicesSentToMe);
    router.get("/getAllInvoicesRaisedByMe", auth, sendBillTransactions.getAllInvoicesRaisedByMe);
    router.get("/getInvoicesForDefaulting", auth, sendBillTransactions.getInvoicesForDefaulting);
    router.post("/proceedToDefault", auth, sendBillTransactions.proceedToDefault);
    router.post("/initiatePaymentVerification",auth, sendBillTransactions.initiatePaymentVerification);
    router.post("/updateInvoiceDocuments",auth, sendBillTransactions.updateInvoiceDocuments);
    router.post("/updateInvoiceDocumentsCACertificate",auth, sendBillTransactions.updateInvoiceDocumentsCACertificate);

    router.post("/updateInvoice",auth, sendBillTransactions.updateInvoice);
    router.get("/getAllInvoicesSentToDebtor", auth, sendBillTransactions.getAllInvoicesSentToDebtor);

    router.use(Authorization.commpanyLoginValidation);

    app.use("/api/transactions", router);
};