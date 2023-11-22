const db = require("../../models/user");
const commondb = require("../../models/common/");
const Documents = commondb.documents;
const admin_db = require("../../models/admin");
const SendBillTransactions = db.sendBillTransactions;
const Debtors = db.debtors;
const PaymentHistory = admin_db.paymentHistory;

exports.create = async(req, res) => {
    try{
        // Validate request
        const debtor = await Debtors.findOne({ _id: req.body.debtorId });
        if (!debtor) {
            console.log("debtor not found", req.body.debtorId)
            return res.status(409).send({ message: "debtor not found", success: false, response: "" });
        };

        let purchaseOrderDocument = null;
        let challanDocument= null;
        let invoiceDocument= null;
        let transportationDocument=null;
        if(req.body.purchaseOrderDocument) purchaseOrderDocument = await Documents.findById(req.body.purchaseOrderDocument);
        if(req.body.purchaseOrderDocument) challanDocument = await Documents.findById(req.body.challanDocument);
        if(req.body.purchaseOrderDocument) invoiceDocument = await Documents.findById(req.body.invoiceDocument);
        if(req.body.purchaseOrderDocument) transportationDocument = await Documents.findById(req.body.transportationDocument);
        
        // Create a SendBillTransactions
        const bill = await SendBillTransactions.create({
            debtor: debtor,
            debtorId: req.body.debtorId,
            billDate: req.body.billDate,
            billDescription: req.body.billDescription,
            billNumber: req.body.billNumber,
            creditAmount: req.body.creditAmount,
            remainingAmount: req.body.creditAmount, 
            status: "PENDING",
            interestRate: req.body.interestRate,
            creditorCompanyId: req.token.companyDetails.id,
            creditLimitDays: req.body.creditLimitDays,
            remark: req.body.remark,
            items: req.body.items,
            subTotal: req.body.subTotal,
            tax: req.body.tax,

            referenceNumber: req.body.referenceNumber,
            invoiceNumber: req.body.invoiceNumber,
            dueDate: req.body.dueDate,
            percentage: req.body.percentage,

            purchaseOrderDocument: purchaseOrderDocument,
            challanDocument: challanDocument,
            invoiceDocument: invoiceDocument,
            transportationDocument: transportationDocument
        });

        res.status(201).json({ message: "sendbill added successfully.", success: true, response: bill });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }

};


exports.getAllInvoicesSentToMe = async(req, res) => {
    try{
        const dbtrs = await Debtors.find({gstin:req.token.companyDetails.gstin});
        //console.log(dbtrs);
        let crdtrs = [];
        for(const element of dbtrs){
            //console.log(dbtrs[i]);
            crdtrs.push(...( await SendBillTransactions.find({creditorCompanyId:element.creditorCompanyId})));
            //console.log(crdtrs[i]);
        }
        res.status(200).json({message: 'Invoices sent for you are fetched', success: true, response: crdtrs});
    }catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getAllInvoicesRaisedByMe = async(req, res) => {
    try{
        const invoices = await SendBillTransactions.find({creditorCompanyId:req.token.companyDetails.id});
        res.status(200).json({message: 'Invoices raised by you are fetched', success: true, response: invoices});
    }catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}


exports.getInvoicesForDefaulting = async(req, res) => {
    try{
        const currentDate = new Date();
        const invoices = await SendBillTransactions.find({status : { $ne: 'PAID'}, dueDate: { $lt: currentDate }});
        res.status(200).json({message: '', success: true, response: invoices});
    } catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}


exports.proceedToDefault = async(req, res) => {
    try{
        const invoice = await SendBillTransactions.findByIdAndUpdate(
            req.body.invoiceId
            ,
            { status: 'DEFAULTED' },
            { new: true }
          );
        res.status(200).json({message: '', success: true, response: invoice});
    } catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}


//payment history

exports.initiatePaymentVerification = async(req, res) => {
    try {
        const pmtHistory = await PaymentHistory.create({
            invoiceId: req.body.invoiceId,
            amtPaid: req.body.amtPaid,
            proofFiles: "",
            status: "PENDING",
            pendingWith: "L1"
        });

        return res.status(409).send({ message: "Payment verification started with payment history creation", success: true, response: this.pmtHistory });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};
