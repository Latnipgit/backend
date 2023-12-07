module.exports = app => {
    const user = require("../../controllers/user/paymentHistoryUser.controller.js");

    const router = require("express").Router();
    const auth = require("../../middleware/authentication.js");

    router.get("/addReceivedPayment", auth, user.confirmPaymentByCreditor);

    app.use("/api/user", router);
};