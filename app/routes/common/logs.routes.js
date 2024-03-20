module.exports = app => {
    const logs = require("../../controllers/common/logs.controller.js");

    const router = require("express").Router();

    router.post("/getLogsByPaymentId", logs.getLogsByPaymentId);

    app.use("/api/logs", router);
};