const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.tutorials = require("./tutorial.model.js")(mongoose);
db.user = require("./user.model.js")(mongoose);
db.companies = require("./companies.model.js")(mongoose);
db.sendBillTransactions = require("./sendBillTransactions.model.js")(mongoose);
db.debtors = require("./debtors.model.js")(mongoose);
db.admin = require("./admin/admin.model.js")(mongoose);

module.exports = db;