const { ObjectID } = require("mongodb");

module.exports = function (mongoose) {
    let schema = mongoose.Schema;
    let activeuserSchema = new schema({
        user: {
            type: ObjectID,
            ref: "userModel"
        },
        socketio: String,
        session: String,
        tick: Number,
        where: String,
        action: String
    }, { collection: 'activeuserDB' });
    return mongoose.model('activeuserModel', activeuserSchema);
}