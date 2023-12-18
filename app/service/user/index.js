
const service = {};
service.user = require("./user.service.js");
service.company = require("./company.service.js");
service.sendBillTransactions = require("./sendBillTransactions.service.js");

module.exports = service;