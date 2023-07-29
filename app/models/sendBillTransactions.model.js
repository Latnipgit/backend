module.exports = mongoose => {

    var schema = mongoose.Schema({
        invoiceId: String,
        debtor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'debtor'
        },
        debtorId: String,
        billDate: String,
        billDescription: String,
        billNumber: Number,
        creditAmount: Number,
        interestRate: Number,
        creditLimitDays: Number,
        creditorCompanyId: String,
        Remark: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const SendBillTransactions = mongoose.model("sendBillTransactions", schema);
    return SendBillTransactions;
};