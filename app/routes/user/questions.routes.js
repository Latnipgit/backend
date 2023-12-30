module.exports = app => {
    const user = require("../../controllers/user/questions.controller.js");

    const router = require("express").Router();
    const auth = require("../../middleware/authentication.js");

    router.post("/addQuestion", auth, user.addQuestion);

    app.use("/api/user", router);
};