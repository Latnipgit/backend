module.exports = mongoose => {
    var schema = mongoose.Schema({
        questionId: String,
        questionDesc: String,
        questionType: String,
        values: [],
        response: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Questions = mongoose.model("questions", schema);
    return Questions;
};