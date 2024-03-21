module.exports = mongoose => {
    var schema = mongoose.Schema({
        pmtHistoryId: String,
        logs: [String]
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Logs = mongoose.model("logs", schema);
    return Logs;
};