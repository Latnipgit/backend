module.exports = app => {
    const subscription = require("../../controllers/user/subscription.controller.js");

    const router = require("express").Router();
    const jwt = require('jsonwebtoken');
    const auth = require("../../middleware/authentication.js");

    // subscription pkg quota mapping routes
    router.post("/addSubPkgAPIQtMapping", auth, subscription.addSubPkgAPIQtMapping);
    router.get("/getAllSubPkgAPIQtMapping", auth, subscription.getAllSubPkgAPIQtMapping);
    router.post("/getSubPkgAPIQtMappingById", auth, subscription.getSubPkgAPIQtMappingById);
    router.post("/updateSubPkgAPIQtMappingById", auth, subscription.updateSubPkgAPIQtMappingById);
    router.post("/deleteSubPkgAPIQtMappingById", auth, subscription.deleteSubPkgAPIQtMappingById);

    // subscription Id remaining Quota Mapping routes
    router.post("/addSubIdRemQtMapping", auth, subscription.addSubIdRemQtMapping);
    router.get("/getAllSubIdRemQtMapping", auth, subscription.getAllSubIdRemQtMapping);
    router.post("/getSubIdRemQtMappingById", auth, subscription.getSubIdRemQtMappingById);
    router.post("/updateSubIdRemQtMappingById", auth, subscription.updateSubIdRemQtMappingById);
    router.post("/deleteSubIdRemQtMappingById", auth, subscription.deleteSubIdRemQtMappingById);

    // subscription routes
    router.post("/addSubscription", auth, subscription.addSubscription);
    router.get("/getAllSubscription", auth, subscription.getAllSubscription);
    router.post("/getSubscriptionById", auth, subscription.getSubscriptionById);
    router.post("/updateSubscriptionById", auth, subscription.updateSubscriptionById);
    router.post("/deleteSubscriptionById", auth, subscription.deleteSubscriptionById);

    app.use("/api/subscription", router);
};