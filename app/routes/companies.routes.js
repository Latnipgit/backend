module.exports = app => {
    const companies = require("../controllers/companies.controller.js");

    var router = require("express").Router();

    // // Create a new Tutorial
    // router.post("/", tutorials.create);

    // Retrieve all companies
    router.post("/", companies.findAll);

    router.post("/search", companies.findOne);

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

    app.use("/api/companies", router);
};