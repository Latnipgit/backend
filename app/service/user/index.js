
const service = {};
service.user = require("./user.service.js");
service.company = require("./company.service.js");
service.sendBillTransactions = require("./sendBillTransactions.service.js");
service.debtor = require("./debtor.service.js");

module.exports = service;