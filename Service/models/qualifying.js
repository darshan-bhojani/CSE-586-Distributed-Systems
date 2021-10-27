const mongoose = require('mongoose');

var qualifyingsSchema = new mongoose.Schema({
    qualifyID: {
        type: Number,
        unique: true
    },
    driverId: {
        type: String
    },
    raceId: {
        type: Number
    },
    constructorId: {
        type: String
    },
    position: {
        type: Number
    },
    q1: {
        type: String
    },
    q2: {
        type: String
    },
    q3: {
        type: String
    },
    saltSecret: String
}, { collection: 'qualifyings' });


mongoose.model('qualifyings', qualifyingsSchema);