const mongoose = require('mongoose');

var subscriptionTopicsSchema = new mongoose.Schema({
    topicId: {
        type: Number,
        unique: true
    },
    name: {
        type: String
    },
    type: {
        type: String,
        enum: ['main_topic', 'sub_topic']
    },
    mainTopicId: {
        type: Number,
        default: null
    },
    isFutureTopic: {
        type: Boolean,
        default: false
    },
    field: {
        type: String
    },
    saltSecret: String
}, { collection: 'subscriptionTopics' });


mongoose.model('subscriptionTopics', subscriptionTopicsSchema);

const SubscriptionTopics = mongoose.model('subscriptionTopics');

SubscriptionTopics.findOneAndUpdate(
    { "name" : "A. MacDyver" },
    { $inc : { "points" : 5 } },
    { sort : { "points" : 1 } }
 )
