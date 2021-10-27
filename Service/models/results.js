const mongoose = require('mongoose');

var resultsSchema = new mongoose.Schema({
    raceID: {
        type: mongoose.Schema.Types.ObjectId, ref: 'races'
    },
    driverId: {
        type: String
    },
    constructorId: {
        type: String
    },
    position: {
        type: Number
    },
    points: {
        type: Number
    },
    round: {
        type: Number
    },
    year: {
        type: Number
    },
    name: {
        type: String
    },
    saltSecret: String
}, { collection: 'results' });


mongoose.model('results', resultsSchema);