const { ObjectID } = require("mongodb");

module.exports = function (mongoose) {
    let schema = mongoose.Schema;
    let feedbackSchema = new schema({
        tick: Number,
        title: String,
        type: [String],
        body: String,
        users: [
            {
                type: ObjectID,
                ref: "userModel"
            }
        ],
        attachments: [
            {
                type: ObjectID,
                ref: 'fileModel'
            }
        ],
        status: Number,
        rating:  [
            {
                type: ObjectID,
                ref: "userModel"
            }
        ],
        parent: mongoose.Schema.Types.Mixed
    }, { collection: 'feedbackDB' });
    return mongoose.model('feedbackModel', feedbackSchema);
}