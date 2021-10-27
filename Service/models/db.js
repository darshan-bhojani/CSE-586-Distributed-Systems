const mongoose = require('mongoose');
const axios = require('axios');
const e = require('express');

mongoose.connect(process.env.MONGODB_URI, (err) => {
    if (!err) { console.log('MongoDB connection succeeded.'); }
    else { console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2)); }
});

require('./user');
require('./constructors');
require('./constructorStandings');
require('./drivers');
require('./driverStandings');
require('./qualifying');
require('./races');
require('./results');
require('./subscriptionTopics');

const SubscriptionTopics = mongoose.model('subscriptionTopics');
const Constructors = mongoose.model('constructors');
const Drivers = mongoose.model('drivers');
const Races = mongoose.model('races');
const Results = mongoose.model('results');

async function initializeDatabase() {
    await SubscriptionTopics.count({}, function (err, count) {
        if (count == 0) {
            console.log("No topics found. Creating topics for subscription.")
            saveTopics()
        }
    })

    await Constructors.count({}, function (err, count) {
        if (count == 0) {
            console.log("No constructors data found. Fetching Constructors.")
            saveConstructors()
        }
    })

    await Drivers.count({}, function (err, count) {
        if (count == 0) {
            console.log("No drivers data found. Fetching Drivers.")
            saveDrivers()
        }
    })

    await Races.count({}, function (err, count) {
        if (count == 0) {
            console.log("No races data found. Creating races for last 5 years.")
            saveRaceAndResults()
        }
    })

    console.log("Database initialization complete.")
}

async function saveDrivers() {


    year = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {

        await axios.get('http://ergast.com/api/f1/' + (year - i) + '/drivers.json')
            .then(async (res) => {
                driver_count = 0

                driversList = res.data.MRData.DriverTable.Drivers
                for (driver_data of driversList) {

                    var driver = {
                        driverId: driver_data.driverId,
                        name: driver_data.givenName + ' ' + driver_data.familyName,
                        nationality: driver_data.nationality
                    }
                    Drivers.findOneAndUpdate(
                        { "driverId": driver.driverId },
                        {
                            $set: driver
                        },
                        {
                            upsert: true,
                            new: true
                        }, (err, driver) => {
                            driver_count += 1
                        })
                }
                console.log(driver_count + " drivers added/updated successfully")
            })
            .catch(error => {
                console.error(error)
            })
    }
}

async function saveRaceAndResults() {

    year = new Date().getFullYear();
    await Races.remove({})
    await Results.remove({})
    for (let i = 0; i < 5; i++) {
        await axios.get('http://ergast.com/api/f1/' + year + '.json')
            .then(async (res) => {
                races = []
                for (race_data of res.data.MRData.RaceTable.Races) {
                    races.push({
                        round: race_data.round,
                        year: year,
                        name: race_data.raceName
                    })
                }
                await Races.insertMany(races).then(async (races_data) => {
                    console.log("Successfully created races docs. Fetching race results.")
                    rounds = res.data.MRData.total
                    for (let round_count = 1; round_count <= rounds; round_count++) {
                        await axios.get('http://ergast.com/api/f1/' + year + '/' + round_count + '/results.json')
                            .then(async (results_res) => {
                                results = []
                                if (results_res.data.MRData.RaceTable.Races[0] != undefined) {
                                    for (results_data of results_res.data.MRData.RaceTable.Races[0].Results) {
                                        results.push({
                                            raceID: races_data[round_count - 1]._id,
                                            driverId: results_data.Driver.driverId,
                                            constructorId: results_data.Constructor.constructorId,
                                            position: results_data.position,
                                            points: results_data.points,
                                            round: results_res.data.MRData.RaceTable.Races[0].round,
                                            year: year,
                                            name: results_res.data.MRData.RaceTable.Races[0].raceName
                                        })
                                    }
                                    await Results.insertMany(results).then(async (results_data) => {
                                        // console.log("Successfully created results docs.")
                                    })
                                        .catch(err => {
                                            console.log("Error occured while creating results docs.")
                                            console.log(err)
                                        })
                                }
                            })
                    }
                })
                    .catch(err => {
                        console.log("Error occured while creating races docs.")
                        console.log(err)
                    })
            })

        year -= 1
    }
    console.log("All races data fetched.")
}

async function saveConstructors() {

    year = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
        await axios.get('http://ergast.com/api/f1/' + (year - i) + '/constructors.json')
            .then(async (res) => {
                constructor_count = 0
                constructorsList = res.data.MRData.ConstructorTable.Constructors

                for (constructor_data of constructorsList) {
                    var constructor = {
                        constructorId: constructor_data.constructorId,
                        name: constructor_data.name,
                        nationality: constructor_data.nationality
                    }
                    Constructors.findOneAndUpdate(
                        { "constructorId": constructor.constructorId },
                        {
                            $set: constructor
                        },
                        {
                            upsert: true,
                            new: true
                        }, (err, constructor) => {
                            constructor_count += 1
                        })
                }

                console.log(constructor_count + " constructors added/updated successfully")
            })
            .catch(error => {
                console.error(error)
            })
    }
}

async function saveTopics() {
    id_number = 1
    topic_names = [{
        "name": "Driver",
        "type": "main_topic",
        "isFutureTopic": false
    },
    {
        "name": "Constructor",
        "type": "main_topic",
        "isFutureTopic": false
    },
    {
        "name": "Qualifying Results",
        "type": "main_topic",
        "isFutureTopic": false
    },
    {
        "mainTopicId": 1,
        "name": "Driver Name",
        "type": "sub_topic",
        "field": "driverId",
        "isFutureTopic": false
    },
    {
        "mainTopicId": 1,
        "name": "Year",
        "type": "sub_topic",
        "isFutureTopic": false
    },
    {
        "mainTopicId": 1,
        "name": "Race Name",
        "type": "sub_topic",
        "field": "raceID",
        "isFutureTopic": false
    },
    {
        "mainTopicId": 2,
        "name": "Constructor Name",
        "type": "sub_topic",
        "field": "constructorId",
        "isFutureTopic": false
    },
    {
        "mainTopicId": 2,
        "name": "Year",
        "type": "sub_topic",
        "isFutureTopic": false
    },
    // {
    //     "mainTopicId": 2,
    //     "name": "Leading driver for the team",
    //     "type": "sub_topic",
    //     "isFutureTopic": false
    // },
    {
        "mainTopicId": 3,
        "name": "Driver Name",
        "type": "sub_topic",
        "field": "driverId",
        "isFutureTopic": false
    },
    {
        "mainTopicId": 3,
        "name": "Constructor Name",
        "type": "sub_topic",
        "field": "constructorId",
        "isFutureTopic": false
    },
    {
        "mainTopicId": 3,
        "name": "Race Name",
        "type": "sub_topic",
        "field": "raceID",
        "isFutureTopic": false
    }]
    topics = []

    for (topic of topic_names) {
        topic['topicId'] = id_number
        topics.push(topic)
        SubscriptionTopics.findOneAndUpdate(
            { "topicId": id_number },
            {
                $set: topic
            },
            {
                upsert: true,
                new: true
            }, (err, topic) => {
            })
        id_number += 1
    }
}

initializeDatabase()