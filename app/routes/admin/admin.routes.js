module.exports = app => {
    const admin = require("../../controllers/admin/admin.controller.js");

    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");

    // Create a new Tutorial
    router.post("/add", auth, admin.addAdmin);
    router.post("/logout", auth, admin.logout);
    router.get("/getLoginInfo", auth, admin.getLoginInfo);
    router.get("/getAllAdmins", auth, admin.getAllAdmins);
    router.post("/getalltransactions", auth, admin.getAllTransactions);
    router.post("/getalltransactionsMerged", auth, admin.getalltransactionsMerged);
    router.get("/getAllUsers", auth, admin.getAllUsers);
    router.post("/escalateRequest", auth, admin.escalateRequest);
    router.post("/removeQuestionById", auth, admin.removeQuestion);
    router.get("/companiesFilter", auth, admin.companiesFilter);
    router.get("/getAllCompanies", auth, admin.getAllCompanies);
    router.post("/getCompanyCountStateWise", auth, admin.getCompanyCountStateWise);
    router.post("/getCompanyCountCityWiseForState", auth, admin.getCompanyCountCityWiseForState);
    router.post("/getDisputedTransactionsStateCityWise", auth, admin.getDisputedTransactionsStateCityWise);
    // router.get("/getDefaulterCountForSelectedCompanies", auth, admin.getDefaulterCountForSelectedCompanies);

    // subscription pkg routes
    router.post("/addSubscriptionPkg", auth, admin.addSubscriptionPkg);
    router.post("/getServicesListForSubPkg", auth, admin.getServicesListForSubPkg);
    router.get("/getAllSubscriptionPkg", auth, admin.getAllSubscriptionPkg);
    router.post("/getSubscriptionPkgById", auth, admin.getSubscriptionPkgById);
    router.post("/updateSubscriptionPkgById", auth, admin.updateSubscriptionPkgById);
    router.post("/deleteSubscriptionPkg", auth, admin.deleteSubscriptionPkg);

    // subscription pkg quota mapping routes
    router.post("/addSubPkgAPIQtMapping", auth, admin.addSubPkgAPIQtMapping);
    router.get("/getAllSubPkgAPIQtMapping", auth, admin.getAllSubPkgAPIQtMapping);
    router.post("/getSubPkgAPIQtMappingById", auth, admin.getSubPkgAPIQtMappingById);
    router.post("/updateSubPkgAPIQtMappingById", auth, admin.updateSubPkgAPIQtMappingById);
    router.post("/deleteSubPkgAPIQtMappingById", auth, admin.deleteSubPkgAPIQtMappingById);

    router.post("/login", admin.authenticateAdmin);
    router.post("/refreshToken", admin.refreshToken);
    router.post("/changePasswordUsingToken", admin.changePasswordUsingToken);
    router.post("/changePasswordUsingOldPass", auth, admin.changePasswordUsingOldPass);
    router.post("/forgetPassword", admin.forgetPassword);
    router.post("/password-reset/:userId/:token", admin.forgetPasswordLink);

    router.post("/delete", auth, admin.deleteUser);

    app.use("/api/admin", router);
};