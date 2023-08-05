module.exports = app => {
    const debtors = require("../controllers/debtors.controller.js");

    var router = require("express").Router();

    // Add a debtor
    router.post("/add", debtors.add);

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