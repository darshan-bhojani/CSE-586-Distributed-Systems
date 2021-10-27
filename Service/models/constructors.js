const mongoose = require('mongoose');

var constructorsSchema = new mongoose.Schema({
    constructorId: {
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
}, { collection: 'constructors' });


mongoose.model('constructors', constructorsSchema);