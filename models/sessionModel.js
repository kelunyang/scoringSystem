const { ObjectID } = require("mongodb");

module.exports = function (mongoose) {
    let schema = mongoose.Schema;
    let sessionSchema = new schema({
        session: String,
        expires: Date
    }, { collection: 'sessions' });
    return mongoose.model('sessionModel', sessionSchema);
}