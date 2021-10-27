const mongoose = require('mongoose');

var driversSchema = new mongoose.Schema({
    driverId: {
        type: String,
        unique: true
    },
    name: {
        type: String
    },
    nationality: {
        type: String
    },
    saltSecret: String
}, { collection: 'drivers', strict: false });


mongoose.model('drivers', driversSchema);