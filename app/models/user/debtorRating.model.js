module.exports = mongoose => {
    var schema = mongoose.Schema({
        debtorId: String,
        questionId: String,
        response: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Debtor = mongoose.model("debtorRating", schema);
    return Debtor;
};