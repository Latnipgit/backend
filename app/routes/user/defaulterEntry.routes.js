module.exports = app => {
    const defaulterEntry = require("../../controllers/user/defaulterEntry.controller.js");
    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");
    const Authorization = require("../../middleware/userAuthorizations.js");
    router.use(auth);
    router.use(Authorization.companyLoginValidation);

    // send bill
    router.post("/create", defaulterEntry.create);
    router.get("/getAllDefaultInvoicesSentToMe", defaulterEntry.getAllInvoicesSentToMe);
    router.get("/getAllDefaultInvoicesRaisedByMe", defaulterEntry.getAllInvoicesRaisedByMe);
    router.post("/initiatePaymentVerification", defaulterEntry.initiatePaymentVerification);
    router.post("/initiatePaymentVerificationGeneral", defaulterEntry.initiatePaymentVerificationGeneral);

    // router.post("/getAllDefaultInvoicesSentToDebtor", defaulterEntry.getAllInvoicesSentToDebtor);
    router.post("/removeDefultingByInvoiceId", defaulterEntry.removeDefultingByInvoiceId);

    app.use("/api/defaulters", router);
};