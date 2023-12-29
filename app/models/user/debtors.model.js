module.exports = mongoose => {
    var schema = mongoose.Schema({
        debtorId: String,
        companyName: String,
        gstin: String,
        companyPan: String,
        creditorCompanyId: String,

        debtorType: String,
        salutation: String,
        firstname: String,
        lastname: String,
        customerEmail: String,
        customerMobile: String,
        address1:String,
        address2: String,
        city: String,
        state: String,
        zipcode: String,
        ratings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'debtorRating',
        }]

    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Debtor = mongoose.model("debtor", schema);
    return Debtor;
};