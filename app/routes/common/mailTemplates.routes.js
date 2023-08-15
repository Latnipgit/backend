module.exports = app => {
    const mailTemplates = require("../../controllers/common/mailTemplates.controller.js");

    const router = require("express").Router();

    // Create a new Tutorial
    router.post("/addTemplate", mailTemplates.addMailTemplate);

    app.use("/api/mail", router);
};