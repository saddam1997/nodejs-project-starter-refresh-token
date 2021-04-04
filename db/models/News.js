const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let NewsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },        
    createdAt: {
        type: Number,
        default: () => Date.now()
    }
});
NewsSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};
module.exports = mongoose.model("News", NewsSchema, "News");
