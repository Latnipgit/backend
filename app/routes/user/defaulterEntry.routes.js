module.exports = app => {
    const defaulterEntry = require("../../controllers/user/defaulterEntry.controller.js");
    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");
    const Authorization = require("../../middleware/userAuthorizations.js");
    router.use(auth);
    router.use(Authorization.commpanyLoginValidation);

    // send bill
    router.post("/create", auth, defaulterEntry.create);
    router.get("/getAllDefaultInvoicesSentToMe", auth, defaulterEntry.getAllInvoicesSentToMe);
    router.get("/getAllDefaultInvoicesRaisedByMe", auth, defaulterEntry.getAllInvoicesRaisedByMe);
    router.post("/initiatePaymentVerification", auth, defaulterEntry.initiatePaymentVerification);

    router.post("/getAllDefaultInvoicesSentToDebtor", auth, defaulterEntry.getAllInvoicesSentToDebtor);
    router.post("/removeDefultingByInvoiceId", auth, defaulterEntry.removeDefultingByInvoiceId);

    app.use("/api/defaulters", router);
};