module.exports = app => {
    const sendBillTransactions = require("../../controllers/user/sendBillTransactions.controller.js");
    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/auth.js");

    // send bill
    router.post("/create",auth, sendBillTransactions.create);

    // // Retrieve all Tutorials
    // router.get("/", tutorials.findAll);

    // // Retrieve all published Tutorials
    // router.get("/published", tutorials.findAllPublished);

    // // Retrieve a single Tutorial with id
    // router.get("/:id", tutorials.findOne);

    // // Update a Tutorial with id
    // router.put("/:id", tutorials.update);

    // // Delete a Tutorial with id
    // router.delete("/:id", tutorials.delete);

    // // Create a new Tutorial
    // router.delete("/", tutorials.deleteAll);

    app.use("/api/transactions", router);
};