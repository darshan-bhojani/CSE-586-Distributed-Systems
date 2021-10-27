const mongoose = require('mongoose');

var constructorStandingsSchema = new mongoose.Schema({
    constructorStandingsID: {
        type: Number,
        unique: true
    },
    constructorId: {
        type: String
    },
    raceId: {
        type: Number
    },
    points: {
        type: Number
    },
    position: {
        type: Number
    },
    wins: {
        type: Number
    },
    saltSecret: String
}, { collection: 'constructorStandings' });


mongoose.model('constructorStandings', constructorStandingsSchema);