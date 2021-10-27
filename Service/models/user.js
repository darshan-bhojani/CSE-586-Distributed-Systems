const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    subscribedTopics: [{
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
            type: Number
        },
        value: {
            type: [String],
            default: null
        },
        field: {
            type: String
        }
    }],
    saltSecret: String
}, { collection: 'users' });

userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});


mongoose.model('users', userSchema);