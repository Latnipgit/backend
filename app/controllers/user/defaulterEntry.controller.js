const db = require("../../models/user");
const commondb = require("../../models/common");
const Documents = commondb.documents;
const admin_db = require("../../models/admin");
const SendBillTransactions = db.sendBillTransactions;
const DefaulterEntry = db.defaulterEntry; 
const Debtors = db.debtors;
const PaymentHistory = admin_db.paymentHistory;
const fs = require('fs');
const PDFDocument = require('pdfkit');
const constants = require('../../constants/userConstants');
const service = require("../../service/user");
const sendBillTransactionsService = service.sendBillTransactions;
const defaulterEntryService = service.defaulterEntry; 
const paymentHistoryService = require("../../service/admin").paymentHistoryService; 
const path = require('path');

var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

function createInvoicePDF(pdfInvObj, debtor, outputPath) {
    let doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Add metadata and styles here, like fonts or images
    generateInformation(doc, debtor, pdfInvObj);
    // Add other sections like items, totals, etc.
    const outputDir = path.dirname(outputPath);

    // Ensure the directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    doc.end();
    doc.pipe(fs.createWriteStream(outputPath));
}

function generateInformation(doc, debtor, pdfInvObj) {
    doc
        .fontSize(15)
        .text('INVOICE', { align: 'right' })
        .fontSize(10)
        .text(`Invoice Number: ${pdfInvObj.invoiceNumber}`, { align: 'right' })
        .text(`Invoice Date: ${new Date(pdfInvObj.billDate).toLocaleDateString()}`, { align: 'right' })
        .text(`Due Date: ${new Date(pdfInvObj.dueDate).toLocaleDateString()}`, { align: 'right' })
        .moveDown();

    // Debtor Information
    doc
        .fontSize(12)
        .text('Bill To:')
        .fontSize(10)
        .text(debtor.ownerName)
        .text(debtor.ownerMobile)
        .text(debtor.companyName)
        .text(`GSTIN: ${debtor.gstin}`)
        .text(`Company PAN: ${debtor.companyPan}`)
        .moveDown();

    // Invoice Details Table
    doc
        .moveDown()
        .fontSize(10)
        .text('Items & Description', { continued: true, width: 250 })
        .text('Qty', { continued: true, width: 50 })
        .text('Cost', { width: 70 })
        .moveDown();

    for (let i = 0; i < pdfInvObj.items.length; i++) {
            // Example Item
            doc
                .fontSize(10)
                .text(`${pdfInvObj.items[i].name}`, { continued: true, width: 250 })
                .text(`${pdfInvObj.items[i].quantity}`, { continued: true, width: 50 }) // Quantity
                .text(`${pdfInvObj.items[i].cost}`, { width: 70 }) // Amount
                .moveDown();
    }

    // Total
    doc
        .fontSize(10)
        .text('Sub Total', { continued: true })
        .text(`${pdfInvObj.subTotal}`, { align: 'right' })
        .text('Tax', { continued: true })
        .text(`${pdfInvObj.tax}`, { align: 'right' })
        .text('Total', { continued: true })
        .text(`${pdfInvObj.creditAmount+pdfInvObj.remainingAmount}`, { align: 'right' })
        .text('Payment Made', { continued: true })
        .text(`(${pdfInvObj.creditAmount})`, { align: 'right' })
        .text('Balance Due', { continued: true })
        .text(`(${pdfInvObj.remainingAmount})`, { align: 'right' })
        .text(`Total: ${inWords(pdfInvObj.creditAmount)}`, { align: 'right' })
        .moveDown();

    // Footer
    doc
        .fontSize(10)
        .text('Notes:')
        .fontSize(9)
        .text('Thank you for your business.')
        .text('Authorized Signature: ______________________', { align: 'right' })
        .moveDown();
}

exports.create = async(req, res) => {
    try{
        let invoicesList = req.body.invoicesList;
        let newStatus = req.body.status;
        // Validate request
        const debtor = await Debtors.findOne({ _id: invoicesList[0].debtorId });
        if (!debtor) {
            console.log("debtor not found", invoicesList[0].debtorId)
            return res.status(409).send({ message: "debtor not found", success: false, response: "" });
        };

        let defaulterEntryList = [];
        let totalAmount = 0;

        for(let i = 0; i < invoicesList.length; i++){

            if(invoicesList[i].purchaseOrderDocument) invoicesList[i].purchaseOrderDocument = await Documents.findById(invoicesList[i].purchaseOrderDocument);
            if(invoicesList[i].challanDocument) invoicesList[i].challanDocument = await Documents.findById(invoicesList[i].challanDocument);
            if(invoicesList[i].invoiceDocument) invoicesList[i].invoiceDocument = await Documents.findById(invoicesList[i].invoiceDocument);
            if(invoicesList[i].transportationDocument) invoicesList[i].transportationDocument = await Documents.findById(invoicesList[i].transportationDocument);
            
            invoicesList[i].type="EXTERNAL"
            // Create a SendBillTransactions
            const bill = await sendBillTransactionsService.createInvoice(invoicesList[i], req.token.companyDetails);

            //append to store in defaultEntry and calculate totalAmount of invoices
            defaulterEntryList.push(bill);
            totalAmount += Number(invoicesList[i].remainingAmount);

            //create pdf here
            // createInvoicePDF(bill, debtor, './temp/invoices/'+bill._id+'.pdf');

        }
        const defEnt = await defaulterEntryService.createEntry(defaulterEntryList, debtor, newStatus, totalAmount, req.token.companyDetails);

        res.status(201).json({ message: "sendbill/s added successfully.", success: true, response: defEnt });
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
        let defaulterEntries = [];
        for(const element of dbtrs){

            let entry = await defaulterEntryService.getCompleteDefaultEntryData({debtor:element});
            defaulterEntries.push(...( entry));
        }
        res.status(200).json({message: 'Invoices sent for you are fetched', success: true, response: defaulterEntries});
    }catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getAllInvoicesRaisedByMe = async(req, res) => {
    try{
        // const invoices = await defaulterEntryService.getCompleteDefaultEntryData({creditorCompanyId:req.token.companyDetails.id}).populate("debtor debtor.ratings purchaseOrderDocument challanDocument invoiceDocument transportationDocument");
        const invoices = await defaulterEntryService.getCompleteDefaultEntryData({creditorCompanyId:req.token.companyDetails.id}).populate(
            [
            { path: 'invoices', populate: [
                { path: 'purchaseOrderDocument' },
                { path: 'challanDocument' },
                { path: 'invoiceDocument' },
                { path: 'transportationDocument' }
              ]
            },
            { path: 'debtor' },
            { path: 'debtor.ratings' }
          ]
          );
        res.status(200).json({message: 'Invoices raised by you are fetched', success: true, response: invoices});
    }catch(error){
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
            defaulterEntryId: req.body.defaulterEntryId,
            amtPaid: req.body.amtPaid,
            proofFiles: "",
            status: "PENDING",
            pendingWith: "L1",
            approvedByCreditor: "false"
        });

        return res.status(409).send({ message: "Payment verification started with payment history creation", success: true, response: this.pmtHistory });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};

exports.initiatePaymentVerificationGeneral = async(req, res) => {
    try {
        const dbtrs = await Debtors.findOne({gstin:req.token.companyDetails.gstin, creditorCompanyId:req.body.creditorId});
        //console.log(dbtrs);
        let defaulterEntries = [];
        if(dbtrs){
            let entry = await defaulterEntryService.getCompleteDefaultEntryData({debtor:element});
            if(!entry){
                return res.status(200).send({ message: "You don't have any invoices in Pending state", success: false, response: "" });
            }
            defaulterEntries.push(...( entry));
        }
        let remAmount=req.body.amtPaid
        for(element of defaulterEntries){
            if(remAmount>0){
                let amount = 0
                if(remAmount >= element.totalAmount){
                    amount = element.totalAmount
                    element.status=constants.INVOICE_STATUS.PAID
                } else {
                    amount = remAmount
                }
                remAmount = remAmount-element.totalAmount
                // element.totalAmount = element.totalAmount - amount
                // element.save()

                const pmtHistory = await paymentHistoryService.addPaymentHistory(req.body, amount);
            } else {
                break
            }
        }
        return res.status(200).send({ message: "Payment verification started with payment history creation", success: true, response: this.pmtHistory });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};

// currently not required
// exports.getAllInvoicesSentToDebtor = async(req, res) => {
//     try{
//         let crdtrs = [];
//         // for(const element of dbtrs){
//         let invoices = await SendBillTransactions.find({debtorId: req.body.debtorId}).populate("debtor purchaseOrderDocument challanDocument invoiceDocument transportationDocument");
//         crdtrs.push(...( invoices));
        
//         res.status(200).json({message: 'Invoices sent for debtor are fetched', success: true, response: crdtrs});
//     }catch(error){
//         console.log(error)
//         res
//             .status(500)
//             .send({ message: "Something went wrong", success: false });
//     }
// }

exports.removeDefultingByInvoiceId = async(req, res) => {
    try{
        let defaulterEntry=   await defaulterEntryService.defaultInvoiceById(req.body.defaulterEntryId)
        res.status(200).json({message: 'Given invoices has been defaulted', success: true, response: defaulterEntry});
    }catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.disputedTransactions = async(req, res) => {
    try {
        dEId = req.body.defaulterEntryId;

    }catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

