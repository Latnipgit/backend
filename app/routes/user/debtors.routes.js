module.exports = app => {
    const debtors = require("../../controllers/user/debtors.controller.js");

    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");
    const Authorization = require("../../middleware/userAuthorizations.js");

    // Add a debtor
    router.post("/add",auth,debtors.add);
    router.get("/getAllDebtorsByCompanyId", auth, debtors.getAllDebtorsByCompanyId);
    router.get("/getAllCreditorsByCompanyId", auth, debtors.getAllCreditorsByCompanyId);
    router.get("/getAllCreditorsByDebtorId", auth, debtors.getAllCreditorsByDebtorId);
    // get debtors of current company
    router.post("/", auth, debtors.getDebtors);

    router.use(Authorization.companyLoginValidation);

    app.use("/api/debtors", router);
};