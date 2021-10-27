const mongoose = require('mongoose');

var driverStandingsSchema = new mongoose.Schema({
    driverStandingsID: {
        type: Number,
        unique: true
    },
    driverId: {
        type: String
    },
    raceID: {
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
}, { collection: 'driverStandings' });


mongoose.model('driverStandings', driverStandingsSchema);