const dbConfig = require("../../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.admin = require("./admins.model.js")(mongoose);
db.adminNotifications = require("./adminNotifications.model.js")(mongoose);
db.email = require("./email.model.js")(mongoose);
db.manualTransactions = require("./manualTransactions.model.js")(mongoose);
db.notification = require("./notification.model.js")(mongoose);
db.subscriptionPkg = require("./subscriptionPkg.model.js")(mongoose);

module.exports = db;