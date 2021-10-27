const config = require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routers = require('./routes/index.router');
const constructor_topic = require('./topics/constructor');

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

let future_topic = [{
    "topicId": 13,
    "name": "Top Results",
    "type": "main_topic",
    "isFutureTopic": true
},
{
    "topicId": 14,
    "name": "Top 3 drivers of a race",
    "type": "main_topic",
    "isFutureTopic": true
},
{
    "topicId": 15,
    "name": "Top 3 teams of a race",
    "type": "main_topic",
    "isFutureTopic": true
}]
let next_topic_count = 0

setInterval(function () {
    constructor_topic.advertize(process.env.BROKER_URL, future_topic[next_topic_count])
    next_topic_count += 1
}, 2000);

let unadvertise_topic_count = 0
setInterval(function () {
    if (future_topic[unadvertise_topic_count] != null || future_topic[unadvertise_topic_count] != undefined) {
        constructor_topic.unadvertize(process.env.BROKER_URL, future_topic[unadvertise_topic_count]['topicId'])
        unadvertise_topic_count += 1
    }
}, 15000);

app.listen(process.env.PORT, '0.0.0.0', () => console.log(`Server started at port : ${process.env.PORT}`));