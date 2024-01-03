const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const shell = require('shelljs');
const schedule = require('node-schedule');

const user_db = require("./app/models/user");
const admin_db = require("./app/models/admin");
const commondb = require("./app/models/common");
const Subscription = user_db.subscription;
const SubscriptionIdRemQuotaMapping = user_db.subscriptionIdRemQuotaMapping;
const SubscriptionPkgAPIQuotaMapping = admin_db.subscriptionPkgAPIQuotaMapping;

cron.schedule('2 0 * * *', function(){

    function getPreviousDay(date = new Date()) {
        const previous = new Date(date.getTime());
        previous.setDate(date.getDate() - 1);
      
        return previous;
      }
    let COB = (getPreviousDay(new Date())).toISOString();

    const sub = Subscription.updateMany({ endDate: COB, isActive: true }, {isActive: false});

    console.log("This is cron running!");
})

// setInterval(()=> {

// }, interval);

dotenv.config();

const app = express();
var allowedDomains = ['http://localhost:3000', 'https://lively-dune-09208c210.3.azurestaticapps.net', 'https://kind-mushroom-0cae51e10.3.azurestaticapps.net', "https://wonderful-glacier-0f15f7b10.3.azurestaticapps.net"];

var corsOptions = {
    origin: function (origin, callback) {
        // bypass the requests with no origin (like curl requests, mobile apps, etc )
        if (!origin) return callback(null, true);
     
        if (allowedDomains.indexOf(origin) === -1) {
          var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      }
};

app.use(cors(corsOptions));
app.use(cookieParser());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay, httpOnly: true, path: "/", sameSite: "lax", secure: "true" },
    resave: false
}));

const db = require("./app/models/user");
db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch(err => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/user/user.routes")(app);
require("./app/routes/user/debtors.routes")(app);
require("./app/routes/user/debtorsRatings.routes")(app);
require("./app/routes/user/companies.routes")(app);
require("./app/routes/user/sendBillTransactions.routes")(app);
require("./app/routes/user/creditors.routes")(app);
require("./app/routes/user/dashboard.routes")(app);
require("./app/routes/user/subscription.routes")(app);
require("./app/routes/user/paymentHistoryUser.routes")(app);
require("./app/routes/user/questions.routes")(app);
require("./app/routes/admin/admin.routes")(app);
require("./app/routes/common/mailTemplates.routes")(app);
require("./app/routes/admin/paymentHistory.routes")(app);
require("./app/routes/common/fileUpload.routes")(app);
require("./app/routes/user/defaulterEntry.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || process.env.API_PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log("started in "+ process.env.ENV+" mode")
});