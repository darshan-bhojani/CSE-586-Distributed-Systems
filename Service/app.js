require('./config/config');
require('./models/db');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routers = require('./routes/index.router');

var app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/api', routers);

app.use(cors({
    origin: '*'
}));

app.use((err, req, res, next) => {
    if (err) {
        res.status(500).send(err)
    }
});

app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server started at port: ${process.env.PORT}`)
});
