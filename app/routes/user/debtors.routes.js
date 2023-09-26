module.exports = app => {
    const debtors = require("../../controllers/user/debtors.controller.js");

    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");

    // Add a debtor
    router.post("/add",auth,debtors.add);
    router.get("/getAllDebtorsByCompanyId", auth, debtors.getAllDebtorsByCompanyId);
    router.get("/getAllCreditorsByCompanyId", auth, debtors.getAllCreditorsByCompanyId);
    router.get("/getAllInvoicesSentToMe", auth, debtors.getAllInvoicesSentToMe);
    router.get("/getAllInvoicesRaisedByMe", auth, debtors.getAllInvoicesRaisedByMe);

    // get debtors of current company
    router.post("/", debtors.getDebtors);


    // // Retrieve all Tutorials
    // router.get("/", tutorials.findAll);

    // // Retrieve all published Tutorials
    // router.get("/published", tutorials.findAllPublished);

    // // Update a Tutorial with id
    // router.put("/:id", tutorials.update);

    // // Delete a Tutorial with id
    // router.delete("/:id", tutorials.delete);

    // // Create a new Tutorial
    // router.delete("/", tutorials.deleteAll);

    app.use("/api/debtors", router);
};