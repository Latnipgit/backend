module.exports = mongoose => {
    var schema = mongoose.Schema({
        adminId: String,
        userName: { type: String, unique: true },
        name: String,
        emailId: { type: String, unique: true },
        phoneNumber: String,
        joinedOn: Date,
        password: String,
        adminRole: String,
        passwordChangeNeeded: Boolean,
        token: { type: String },
        refreshToken: { type: String }
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Admin = mongoose.model("admins", schema);
    return Admin;
};