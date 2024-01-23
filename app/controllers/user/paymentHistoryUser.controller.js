const db = require("../../models/admin/");
const user_db = require("../../models/user");
const mongoose = require('mongoose');

const PaymentHistory = db.paymentHistory;
const SendBillTrans = user_db.sendBillTransactions;
const Debtors = user_db.debtors;
const constants = require('../../constants/userConstants');

exports.confirmPaymentByCreditor = async(req, res) => {
    try {

        const pHistory = await PaymentHistory.findOne({ invoiceId: req.body.invoiceId, status: "PENDING" });
        if (pHistory) {
            const pmtHistory = await PaymentHistory.findByIdAndUpdate(pHistory._id,{
                invoiceId: req.body.invoiceId,
                amtPaid: req.body.amtPaid,
                proofFiles: "",
                status: "APPROVED",
                pendingWith: "",
                approvedByCreditor: "true"
            }, {new: true});
    
        }else{
            const pmtHistory = await PaymentHistory.create({
                invoiceId: req.body.invoiceId,
                amtPaid: req.body.amtPaid,
                proofFiles: "",
                status: "APPROVED",
                pendingWith: "",
                approvedByCreditor: "true"
            });
        };
        
        let invoice = await SendBillTrans.findOne({_id: req.body.invoiceId});
        let newRemainingAmount = invoice.remainingAmount - amtPaid;
        let updatedSendBill = await SendBillTrans.findByIdAndUpdate({_id: result.invoiceId}, {remainingAmount: newRemainingAmount});
        
        return res.status(200).send({ message: "Payment verification Done directly from creditor side", success: true, response: this.pmtHistory });

        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};



exports.getTransactionsPendingForDocs = async(req, res) => {
    try {
        let debtorIds = await Debtors.find({ gstin: req.token.companyDetails.gstin}).select('_id').lean();
        debtorIds = debtorIds.map(id => id._id)
        // let pHistoryCreditor = await PaymentHistory.find({
        //     status: constants.PAYMENT_HISTORY_STATUS.DOCUMENTS_NEEDED,
        // }).populate({
        //     path: 'defaulterEntry',
        //     match: { creditorCompanyId: req.token.companyDetails.id }
        //   }).exec();
        //   pHistoryCreditor = pHistoryCreditor.filter(ph => ph.defaulterEntry);

        let pHistoryCreditor = await PaymentHistory.aggregate([
            {
              $match: {
                status: constants.PAYMENT_HISTORY_STATUS.DOCUMENTS_NEEDED,
                isDocumentsRequiredByCreditor: true
              }
            },
            {
              $lookup: {
                from: "defaulterentries", // This should be the name of the collection, in plural and lowercase
                localField: "defaulterEntry",
                foreignField: "_id",
                as: "defaulterEntry"
              }
            },
            {
              $unwind: {
                path:"$defaulterEntry", // Deconstructs the array field from the previous $lookup stage
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $match: {
                "defaulterEntry.creditorCompanyId": req.token.companyDetails.id
              }
            },
            {
              $lookup: {
                from: "debtors",
                localField: "defaulterEntry.debtor",
                foreignField: "_id",
                as: "defaulterEntry.debtor"
              }
            },
            // Unwind debtor for further population
            {
              $unwind: {
                path: "$defaulterEntry.debtor",
                preserveNullAndEmptyArrays: true
              }
            },            
            {
                $lookup: {
                  from: "companies",
                  let: { companyId: "$defaulterEntry.creditorCompanyId" },
                  pipeline: [
                    { 
                      $match: {
                        $expr: {
                          $eq: ["$_id", { $toObjectId: "$$companyId" }]
                        }
                      }
                    }
                  ],
                  as: "defaulterEntry.creditor"
                }
              },
              {
                $unwind: {
                  path: "$defaulterEntry.creditor",
                  preserveNullAndEmptyArrays: true
                }
              },
            //   {
            //     $lookup: {
            //         from: "sendbilltransactions", // Replace with your actual invoices collection name
            //         localField: "defaulterEntry.invoices",
            //         foreignField: "_id",
            //         as: "defaulterEntry.invoices"
            //     }
            // },
              {
                $lookup: {
                    from: "sendbilltransactions", // Replace with your actual invoices collection name
                    localField: "defaulterEntry.invoices",
                    foreignField: "_id",
                    as: "defaulterEntry.invoices",
                    pipeline: [
                      // Additional $lookup stages to populate fields within each invoice
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "purchaseOrderDocument",
                              foreignField: "_id",
                              as: "purchaseOrderDocument"
                          }
                      },
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "challanDocument",
                              foreignField: "_id",
                              as: "challanDocument"
                          }
                      },
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "invoiceDocument",
                              foreignField: "_id",
                              as: "invoiceDocument"
                          }
                      },
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "transportationDocument",
                              foreignField: "_id",
                              as: "transportationDocument"
                          }
                      },
                      {
                        $lookup: {
                            from: "documents", // Replace with the actual collection name
                            localField: "otherDocuments",
                            foreignField: "_id",
                            as: "otherDocuments"
                        }
                      },
                    ]
                }
  
              }
      
            // {
            //     $project: {
            //         defaulterEntry: 0 // Optionally remove the temporary field
            //     }
            // }
          ]);

          
          console.log(pHistoryCreditor);
          
        let pHistoryDebtor = await PaymentHistory.aggregate([
            {
              $match: {
                status: constants.PAYMENT_HISTORY_STATUS.DOCUMENTS_NEEDED,
              }
            },
            {
              $lookup: {
                from: "defaulterentries", // This should be the name of the collection, in plural and lowercase
                localField: "defaulterEntry",
                foreignField: "_id",
                as: "defaulterEntry"
              }
            },
            {
              $unwind: {
                path:"$defaulterEntry", // Deconstructs the array field from the previous $lookup stage
                preserveNullAndEmptyArrays: true
              }
            },
              
            {
                $lookup: {
                  from: "debtors",
                  localField: "defaulterEntry.debtor",
                  foreignField: "_id",
                  as: "defaulterEntry.debtor"
                }
              },
              // Unwind debtor for further population
              {
                $unwind: {
                  path: "$defaulterEntry.debtor",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $match: {
                  "defaulterEntry.debtor._id": { $in: debtorIds } // Assuming debtorIds is an array of ObjectId values
                }
              },
              {
                $lookup: {
                  from: "companies",
                  let: { companyId: "$defaulterEntry.creditorCompanyId" },
                  pipeline: [
                    { 
                      $match: {
                        $expr: {
                          $eq: ["$_id", { $toObjectId: "$$companyId" }]
                        }
                      }
                    }
                  ],
                  as: "defaulterEntry.creditor"
                }
              },
              {
                $unwind: {
                  path: "$defaulterEntry.creditor",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $lookup: {
                    from: "sendbilltransactions", // Replace with your actual invoices collection name
                    localField: "defaulterEntry.invoices",
                    foreignField: "_id",
                    as: "defaulterEntry.invoices",
                    pipeline: [
                      // Additional $lookup stages to populate fields within each invoice
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "purchaseOrderDocument",
                              foreignField: "_id",
                              as: "purchaseOrderDocument"
                          }
                      },
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "challanDocument",
                              foreignField: "_id",
                              as: "challanDocument"
                          }
                      },
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "invoiceDocument",
                              foreignField: "_id",
                              as: "invoiceDocument"
                          }
                      },
                      {
                          $lookup: {
                              from: "documents", // Replace with the actual collection name
                              localField: "transportationDocument",
                              foreignField: "_id",
                              as: "transportationDocument"
                          }
                      },
                      {
                        $lookup: {
                            from: "documents", // Replace with the actual collection name
                            localField: "otherDocuments",
                            foreignField: "_id",
                            as: "otherDocuments"
                        }
                      },
                    ]
                }
  
          }
          ]);
    
        //   pHistoryCreditor = pHistoryCreditor.filter(ph => ph.defaulterEntry);

        
        return res.status(200).send({ message: "List fethed", success: true, response: {transactionsRaisedByMe: pHistoryCreditor, transactionsSentToMe: pHistoryDebtor  }});

        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};

exports.uploadSupportingDocuments = async(req, res) => {
  try {

      const pHistory = await PaymentHistory.findOne({ _id: req.body.paymentId }).populate(
        [
            // { path: 'defaulterEntry' },
            { path: 'defaulterEntry', populate: ['invoices']},
        ]);
      if(req.body.type == "DEBTOR"){
        pHistory.debtorcacertificate = mongoose.Types.ObjectId(req.body.debtorcacertificate)
        pHistory.debtoradditionaldocuments = mongoose.Types.ObjectId(req.body.debtoradditionaldocuments)
        pHistory.isDocumentsRequiredByDebtor = false
      }
      else if(req.body.type == "CREDITOR"){
        pHistory.creditorcacertificate =  mongoose.Types.ObjectId(req.body.creditorcacertificate)
        pHistory.creditoradditionaldocuments = mongoose.Types.ObjectId(req.body.creditoradditionaldocuments)
        
        for( let item of req.body.attachment){
          let invoices = pHistory.defaulterEntry.invoices
          let invoice =  invoices.find( obj => obj._id.toString() == item._id)
          if(invoice){
              if(item.purchaseOrderDocument)
                invoice.purchaseOrderDocument = mongoose.Types.ObjectId(item.purchaseOrderDocument)
              if(item.challanDocument)
                invoice.challanDocument = mongoose.Types.ObjectId(item.challanDocument)
              if(item.invoiceDocument)
                invoice.invoiceDocument = mongoose.Types.ObjectId(item.invoiceDocument)
              if(item.transportationDocument)
                invoice.transportationDocument = mongoose.Types.ObjectId(item.transportationDocument)
              if(item.otherDocuments)
                invoice.otherDocuments = mongoose.Types.ObjectId(item.otherDocuments)
              await invoice.save()
          }
        }
        pHistory.isDocumentsRequiredByCreditor = false

      }
      if(!(pHistory.isDocumentsRequiredByCreditor && pHistory.isDocumentsRequiredByDebtor)){
        pHistory.status = constants.PAYMENT_HISTORY_STATUS.PENDING
        pHistory.pendingWith = "L1"
      }
      await pHistory.save();
      
      return res.status(200).send({ message: "Successful upload", success: true, response: pHistory });

      
  } catch (err) {
      console.log(err)
      res
          .status(500)
          .send({ message: "Something went wrong", reponse: "", success: false });
  }
};