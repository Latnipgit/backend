module.exports = mongoose => {
    var schema = mongoose.Schema({
        defaulterEntryId: String,
        defaulterEntry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'defaulterEntry'
        },
        amtPaid: String,
        requestor: String,
        paymentDate: String,
        paymentMode: String,
        documentsRequiredFromCreditor: [String],
        documentsRequiredFromDebtor: [String],
        creditorcacertificate: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'documents',
        }],
        creditoradditionaldocuments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'documents',
        }],
        debtorcacertificate:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'documents',
        }],
        debtoradditionaldocuments:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'documents',
        }],
        status: String,
        pendingWith: String,
        debtorRemarks: String,
        adminRemarksForDebtor: String,
        adminRemarksForCreditor: String,
        approvedByCreditor: String,
        documentsPendingSince: Date,
        isDocumentsRequiredByCreditor: Boolean,
        isDocumentsRequiredByDebtor: Boolean,
        isDispute: Boolean,
        disputeType: Boolean
    },
    {
        timestamps: true
    }
);

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const PaymentHistory = mongoose.model("paymentHistory", schema);
    return PaymentHistory;
};