const mongoose = require('mongoose');

var racesSchema = new mongoose.Schema({
    year: {
        type: Number
    },
    round: {
        type: Number
    },
    name: {
        type: String
    },
    saltSecret: String
}, { collection: 'races' });


mongoose.model('races', racesSchema);