module.exports = app => {
    const debtors = require("../../controllers/user/debtors.controller.js");

    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");
    const Authorization = require("../../middleware/userAuthorizations.js");
    router.use(auth);
    router.use(Authorization.companyLoginValidation);

    // Add a debtor
    router.post("/add",debtors.add);
    router.get("/getAllDebtorsByCompanyId", debtors.getAllDebtorsByCompanyId);
    router.get("/getAllCreditorsByCompanyId", debtors.getAllCreditorsByCompanyId);
    router.get("/getAllCreditorsByDebtorId", debtors.getAllCreditorsByDebtorId);
    // get debtors of current company
    router.post("/", debtors.getDebtors);


    app.use("/api/debtors", router);
};