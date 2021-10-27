const mongoose = require('mongoose');

const User = mongoose.model('users');
const SubscriptionTopics = mongoose.model('subscriptionTopics');
const Constructors = mongoose.model('constructors');
const Drivers = mongoose.model('drivers');
const Races = mongoose.model('races');
const Results = mongoose.model('results');
const nodemailer = require("nodemailer");

const bcrypt = require('bcryptjs');




module.exports.unadvertizeFutureTopics = (req, res, next) => {
    let topicId = req.body.topicId

    SubscriptionTopics.deleteOne({ topicId: topicId }, (err, new_topic) => {
        if (err) {
            res.send({
                "msg": "Error occured while unadvertising future topic."
            })
        }
        else {
            res.send({
                "msg": "Successfully unadvertized future topic."
            })
        }
    })

}


module.exports.advertizeFutureTopics = (req, res, next) => {

    let topic = req.body

    SubscriptionTopics.findOneAndUpdate(
        { "topicId": topic.topicId },
        {
            $set: topic
        },
        {
            upsert: true,
            new: true
        }, async (err, new_topic) => {
            if (err) {
                res.send({
                    "msg": "Error occured while advertising new topic."
                })
            }
            else {
                res.send({
                    "msg": "New topic advertised successfully."
                })

                User.find({}, async (err, users) => {

                    let transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "darshan007bhojani@gmail.com", // generated ethereal user
                            pass: "@@dar123@@", // generated ethereal password
                        }
                    });



                    for (let user of users) {
                        var mailOptions = {
                            from: 'darshan007bhojani@gmail.com',
                            to: user.username,
                            subject: "F1: New Topic going to be released.",
                            html: `Hey,
                            A new topic is going to be released soon. Go ahead and check it.`
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            //console.log('Message sent: %s', info.messageId);
                        });
                    }




                })
            }
            console.log("email sent")
        })
}


module.exports.publishDriverStandings = (req, res, next) => {
    var race = {
        round: req.body['MRData']['RaceTable']['Races'][0]['round'],
        year: req.body['MRData']['RaceTable']['Races'][0]['season'],
        name: req.body['MRData']['RaceTable']['Races'][0]['raceName']
    }

    Races.findOneAndUpdate(
        {
            "name": race.name,
            "year": race.year,
            "round": race.round
        },
        {
            $set: race
        },
        {
            upsert: true,
            new: true
        },
        async (err, race_data) => {
            if (err) {
                res.send({
                    "msg": "Error while publishing driver standings."
                });
            }
            else {
                console.log(race_data)
                results = []
                for (results_data of req.body['MRData']['RaceTable']['Races'][0]['Results']) {
                    results.push({
                        raceID: race_data._id,
                        driverId: results_data.Driver.driverId,
                        constructorId: results_data.Constructor.constructorId,
                        position: results_data.position,
                        points: results_data.points,
                        round: race_data.round,
                        year: race_data.year,
                        name: race_data.name
                    })
                }
                await Results.insertMany(results).then(async (results_data) => {
                    res.send({
                        "msg": "Driver standings published successfully."
                    });
                })
                    .catch(err => {
                        console.log("Error occured while creating results docs.")
                        console.log(err)
                        res.send({
                            "msg": "Error while publishing driver standings."
                        });
                    })
            }
        })

}
module.exports.register = (req, res, next) => {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;

    user.save((err, user_data) => {
        if (!err) {
            res.send({
                "msg": "Register Successful"
            });
        }
        else {
            if (err.code == 11000) {
                res.send({
                    "msg": "User already exists. Try a different username."
                });
            }
            else {
                res.send({
                    "msg": "Error occured. Please try again after sometime."
                });
            }

        }
    });
}

module.exports.login = (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({ username: username }, (err, user) => {
        if (err) {
            res.send({
                "msg": "Error from database.",
                "error": err
            })
        }
        else if (user) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    console.log(hash, user.password)
                });
            });
            bcrypt.compare(password, user.password, (err, matched) => {
                if (matched)
                    res.send({
                        "msg": "User authenticated",
                        "username": username
                    })
                else
                    res.send({
                        "msg": "Invalid Credentials."
                    })
            })
        }
        else {
            res.send({
                "msg": "Invalid Credentials."
            })
        }

    });
}


// module.exports.getTopicList = (req, res, next) => {
//     SubscriptionTopics.find({}, (err, topics) => {
//         res.send(topics)
//     })
// }

module.exports.getDriverList = (req, res, next) => {
    Drivers.find({}, (err, drivers) => {
        res.send(drivers)
    })
}

module.exports.getConstructorList = (req, res, next) => {
    Constructors.find({}, (err, constructors) => {
        res.send(constructors)
    })
}

module.exports.subscribeToTopics = (req, res, next) => {

    username = req.body.username
    topics = req.body.topics

    User.findOneAndUpdate({
        "username": username
    },
        {
            $set: {
                "subscribedTopics": topics
            }
        },
        {
            upsert: false,
            new: true
        }, (err, topics_data) => {
            res.send({
                "msg": "Topics subscription updated successfully.",
                "topics": topics_data
            })
        })
}

module.exports.getTopicList = (req, res, next) => {

    SubscriptionTopics.aggregate([
        {
            $match: {}
        },
        {
            $group: { _id: "$type", type: { $first: "$type" }, topics: { $push: { name: "$name", topicId: "$topicId", mainTopicId: "$mainTopicId", isFutureTopic: "$isFutureTopic" } } }
        },
        {
            $project: {
                _id: 0
            }
        }
    ], async (err, topics_data) => {
        if (!err) {
            main_topics = topics_data.filter(topics => topics.type == 'main_topic')[0].topics
            sub_topics = topics_data.filter(topics => topics.type == 'sub_topic')[0].topics

            groupBy = function (data, key) {
                return data.reduce(function (storage, item) {
                    var group = item[key];

                    storage[group] = storage[group] || [];

                    storage[group].push(item);
                    return storage;
                }, {});
            };

            sub_topic_group = groupBy(sub_topics, "mainTopicId")
            for (let i = 0; i < main_topics.length; i++) {
                main_topics[i]['sub_topics'] = sub_topic_group[main_topics[i]['topicId']]
            }

            drivers = await Drivers.find({})
            constructors = await Constructors.find({})
            races = await Races.aggregate([
                {
                    $match: {}
                },
                {
                    $group: { _id: "$name", name: { $first: "$name" } }
                }])

            year = new Date().getFullYear();
            years = []
            for (let i = 0; i < 5; i++) {
                years.push({ "name": year - i })
            }
            res.send({
                "msg": "Topics list fetched successfully.",
                "topics": main_topics,
                "drivers": drivers,
                "constructors": constructors,
                "races": races,
                "years": years
            })
        }
        else {
            res.send({
                "msg": "Error while fetching topics list."
            })
        }
    })
}

module.exports.unsubscribeUserTopics = (req, res, next) => {

    var username = req.body.username
    var topic_ids = req.body.topic_ids

    User.updateOne(
        {
            "username": username
        },
        {
            $pull: {
                subscribedTopics: {
                    topicId: { $in: topic_ids }
                }
            }
        },
        {
            multi: false, new: true
        }
        , async (err, user_data) => {
            if (!err) {
                res.send({
                    "msg": "Unsubscription successful. Sorry to see you leaving, you can check out other topics that you like."
                })
            }
            else {
                console.log(err)
                res.send({
                    "msg": "Oops some error occured. Please try again in some time."
                })
            }
        })
}

module.exports.getUserSubscriptionData = (req, res, next) => {

    var username = req.body.username
    var main_topic_id = req.body.main_topic_id

    let user = User.findOne(
        { "username": username }
        , async (err, user_data) => {

            subscribed_main_topics = user_data.subscribedTopics.filter(topic => topic.type == "main_topic" && topic.topicId == main_topic_id)

            subscribed_sub_topics = user_data.subscribedTopics.filter(topic => topic.type == "sub_topic" && topic.mainTopicId == main_topic_id)

            if (subscribed_main_topics.length == 0 && subscribed_sub_topics.length == 0) {
                res.send({
                    "msg": "Please subscribe to this topic to get its live updates."
                })
            }
            else {
                if (subscribed_main_topics.length != 0) {
                    if (main_topic_id == 1) {
                        Results.aggregate([
                            { $match: {} },
                            {
                                $lookup: {
                                    from: "drivers",
                                    localField: "driverId",
                                    foreignField: "driverId",
                                    as: "driver"
                                }
                            },
                            { $unwind: "$driver" },
                            {
                                $lookup: {
                                    from: "constructors",
                                    localField: "constructorId",
                                    foreignField: "constructorId",
                                    as: "constructor"
                                }
                            },
                            { $unwind: "$constructor" },
                            {
                                $lookup: {
                                    from: "races",
                                    localField: "raceID",
                                    foreignField: "_id",
                                    as: "race"
                                }
                            },
                            { $unwind: "$race" }
                            // {
                            //     $group: { _id: "$driverId", type: { $first: "$type" }, topics: { $push: { name: "$name", topicId: "$topicId", mainTopicId: "$mainTopicId" } } }
                            // }
                            // {
                            //     $project: {
                            //         _id: 0,
                            //         username: 1,
                            //         subscribedTopics: 1
                            //     }
                            // }
                        ], async (err, drivers_data) => {
                            let drivers = []

                            for (driver of drivers_data) {
                                let driver_data = {
                                    "driver_name": driver.driver.name,
                                    "driver_nationality": driver.driver.nationality,
                                    "position": driver.position,
                                    "points": driver.points,
                                    "constructor_name": driver.constructor.name,
                                    "constructor_nationality": driver.constructor.nationality,
                                    "race_name": driver.race.name,
                                    "race_round": driver.race.round,
                                    "race_year": driver.race.year,
                                }
                                drivers.push(driver_data)
                            }
                            res.send(drivers)
                        })
                    }

                    if (main_topic_id == 2) {
                        Results.aggregate([
                            { $match: {} },
                            {
                                $lookup: {
                                    from: "constructors",
                                    localField: "constructorId",
                                    foreignField: "constructorId",
                                    as: "constructor"
                                }
                            },
                            { $unwind: "$constructor" },
                            {
                                $lookup: {
                                    from: "races",
                                    localField: "raceID",
                                    foreignField: "_id",
                                    as: "race"
                                }
                            },
                            { $unwind: "$race" },
                            {
                                $group: {
                                    _id: { constructor: "$constructorId", year: "$year" },
                                    constructor_name: { $first: "$constructor.name" },
                                    constructor_nationality: { $first: "$constructor.nationality" },
                                    race_year: { $first: "$year" },
                                    points: { $sum: "$points" },
                                    race_name: { $first: "$race.name" },
                                }
                            },
                            { $sort: { constructor_name: 1 } }
                            // {
                            //     $project: {
                            //         _id: 0,
                            //         username: 1,
                            //         subscribedTopics: 1
                            //     }
                            // }
                        ], async (err, constructors_data) => {
                            let constructors = []

                            for (constructor of constructors_data) {
                                let constructor_data = {
                                    // "position": driver.position,
                                    "points": constructor.points,
                                    "constructor_name": constructor.constructor_name,
                                    "constructor_nationality": constructor.constructor_nationality,
                                    "race_name": constructor.race_name,
                                    "race_year": constructor.race_year,
                                }
                                constructors.push(constructor_data)
                            }

                            groupBy = function (data, key) {
                                return data.reduce(function (storage, item) {
                                    var group = item[key];

                                    storage[group] = storage[group] || [];

                                    storage[group].push(item);
                                    return storage;
                                }, {});
                            };

                            compare = function (a, b) {
                                if (a.points < b.points) {
                                    return 1;
                                }
                                if (a.points > b.points) {
                                    return -1;
                                }
                                return 0;
                            }

                            constructors_data = []
                            year = new Date().getFullYear();
                            for (let i = 0; i < 5; i++) {
                                grouped_constructors = constructors.filter(cons => cons.race_year == (year - i))
                                grouped_constructors.sort(compare);

                                position = 1
                                for (let i = 0; i < grouped_constructors.length; i++) {
                                    grouped_constructors[i]['position'] = position
                                    position += 1
                                }
                                constructors_data.push(...grouped_constructors)
                            }

                            res.send(constructors_data)
                        })
                    }

                    // if (main_topic_id == 3) {
                    //     Results.aggregate([
                    //         { $match: {} },
                    //         {
                    //             $lookup: {
                    //                 from: "constructors",
                    //                 localField: "constructorId",
                    //                 foreignField: "constructorId",
                    //                 as: "constructor"
                    //             }
                    //         },
                    //         { $unwind: "$constructor" },
                    //         {
                    //             $lookup: {
                    //                 from: "races",
                    //                 localField: "raceID",
                    //                 foreignField: "_id",
                    //                 as: "race"
                    //             }
                    //         },
                    //         { $unwind: "$race" },
                    //         {
                    //             $group: {
                    //                 _id: { constructor: "$constructorId", year: "$year" },
                    //                 constructor_name: { $first: "$constructor.name" },
                    //                 constructor_nationality: { $first: "$constructor.nationality" },
                    //                 race_year: { $first: "$year" },
                    //                 points: { $sum: "$points" },
                    //                 race_name: { $first: "$race.name" },
                    //             }
                    //         },
                    //         { $sort: { constructor_name: 1 } }
                    //         // {
                    //         //     $project: {
                    //         //         _id: 0,
                    //         //         username: 1,
                    //         //         subscribedTopics: 1
                    //         //     }
                    //         // }
                    //     ], async (err, constructors_data) => {
                    //         let constructors = []

                    //         for (constructor of constructors_data) {
                    //             let constructor_data = {
                    //                 // "position": driver.position,
                    //                 "points": constructor.points,
                    //                 "constructor_name": constructor.constructor_name,
                    //                 "constructor_nationality": constructor.constructor_nationality,
                    //                 "race_name": constructor.race_name,
                    //                 "race_year": constructor.race_year,
                    //             }
                    //             constructors.push(constructor_data)
                    //         }

                    //         groupBy = function (data, key) {
                    //             return data.reduce(function (storage, item) {
                    //                 var group = item[key];

                    //                 storage[group] = storage[group] || [];

                    //                 storage[group].push(item);
                    //                 return storage;
                    //             }, {});
                    //         };

                    //         compare = function (a, b) {
                    //             if (a.points < b.points) {
                    //                 return 1;
                    //             }
                    //             if (a.points > b.points) {
                    //                 return -1;
                    //             }
                    //             return 0;
                    //         }

                    //         constructors_data = []
                    //         year = new Date().getFullYear();
                    //         for (let i = 0; i < 5; i++) {
                    //             grouped_constructors = constructors.filter(cons => cons.race_year == (year - i))
                    //             grouped_constructors.sort(compare);

                    //             position = 1
                    //             for(let i = 0; i < grouped_constructors.length; i++){
                    //                 grouped_constructors[i]['position'] = position
                    //                 position += 1
                    //             }
                    //             constructors_data.push(...grouped_constructors)
                    //         }

                    //         res.send(constructors_data)
                    //     })
                    // }
                }
                else {

                    if (main_topic_id == 1) {
                        Results.aggregate([
                            { $match: {} },
                            {
                                $lookup: {
                                    from: "drivers",
                                    localField: "driverId",
                                    foreignField: "driverId",
                                    as: "driver"
                                }
                            },
                            { $unwind: "$driver" },
                            {
                                $lookup: {
                                    from: "constructors",
                                    localField: "constructorId",
                                    foreignField: "constructorId",
                                    as: "constructor"
                                }
                            },
                            { $unwind: "$constructor" },
                            {
                                $lookup: {
                                    from: "races",
                                    localField: "raceID",
                                    foreignField: "_id",
                                    as: "race"
                                }
                            },
                            { $unwind: "$race" }
                            // {
                            //     $group: { _id: "$driverId", type: { $first: "$type" }, topics: { $push: { name: "$name", topicId: "$topicId", mainTopicId: "$mainTopicId" } } }
                            // }
                            // {
                            //     $project: {
                            //         _id: 0,
                            //         username: 1,
                            //         subscribedTopics: 1
                            //     }
                            // }
                        ], async (err, drivers_data) => {
                            let drivers = []


                            for (let sub_topic of subscribed_sub_topics) {
                                if (sub_topic.name == "Driver Name") {
                                    drivers_data = drivers_data.filter(driver => sub_topic.value.includes(driver.driverId))
                                }
                                if (sub_topic.name == "Race Name") {
                                    drivers_data = drivers_data.filter(driver => sub_topic.value.includes(driver.race.name))
                                }
                                if (sub_topic.name == "Year") {
                                    drivers_data = drivers_data.filter(driver => sub_topic.value.includes(driver.year))
                                }
                            }
                            for (driver of drivers_data) {
                                let driver_data = {
                                    "driver_name": driver.driver.name,
                                    "driver_nationality": driver.driver.nationality,
                                    "position": driver.position,
                                    "points": driver.points,
                                    "constructor_name": driver.constructor.name,
                                    "constructor_nationality": driver.constructor.nationality,
                                    "race_name": driver.race.name,
                                    "race_round": driver.race.round,
                                    "race_year": driver.race.year,
                                }
                                drivers.push(driver_data)
                            }
                            res.send(drivers)
                        })
                    }

                    if (main_topic_id == 2) {
                        Results.aggregate([
                            { $match: {} },
                            {
                                $lookup: {
                                    from: "drivers",
                                    localField: "driverId",
                                    foreignField: "driverId",
                                    as: "driver"
                                }
                            },
                            { $unwind: "$driver" },
                            {
                                $lookup: {
                                    from: "constructors",
                                    localField: "constructorId",
                                    foreignField: "constructorId",
                                    as: "constructor"
                                }
                            },
                            { $unwind: "$constructor" },
                            {
                                $lookup: {
                                    from: "races",
                                    localField: "raceID",
                                    foreignField: "_id",
                                    as: "race"
                                }
                            },
                            { $unwind: "$race" },
                            {
                                $group: {
                                    _id: { constructor: "$constructorId", year: "$year" },
                                    constructor_name: { $first: "$constructor.name" },
                                    constructor_nationality: { $first: "$constructor.nationality" },
                                    race_year: { $first: "$year" },
                                    points: { $sum: "$points" },
                                    race_name: { $first: "$race.name" },
                                }
                            },
                            { $sort: { constructor_name: 1 } }
                            // {
                            //     $group: { _id: "$driverId", type: { $first: "$type" }, topics: { $push: { name: "$name", topicId: "$topicId", mainTopicId: "$mainTopicId" } } }
                            // }
                            // {
                            //     $project: {
                            //         _id: 0,
                            //         username: 1,
                            //         subscribedTopics: 1
                            //     }
                            // }
                        ], async (err, constructors_data) => {
                            let constructors = []

                            for (constructor of constructors_data) {
                                let constructor_data = {
                                    // "position": driver.position,
                                    "points": constructor.points,
                                    "constructor_name": constructor.constructor_name,
                                    "constructor_nationality": constructor.constructor_nationality,
                                    "race_name": constructor.race_name,
                                    "race_year": constructor.race_year,
                                }
                                constructors.push(constructor_data)
                            }

                            groupBy = function (data, key) {
                                return data.reduce(function (storage, item) {
                                    var group = item[key];

                                    storage[group] = storage[group] || [];

                                    storage[group].push(item);
                                    return storage;
                                }, {});
                            };

                            compare = function (a, b) {
                                if (a.points < b.points) {
                                    return 1;
                                }
                                if (a.points > b.points) {
                                    return -1;
                                }
                                return 0;
                            }

                            constructors_data = []
                            year = new Date().getFullYear();
                            for (let i = 0; i < 5; i++) {
                                grouped_constructors = constructors.filter(cons => cons.race_year == (year - i))
                                grouped_constructors.sort(compare);

                                position = 1
                                for (let i = 0; i < grouped_constructors.length; i++) {
                                    grouped_constructors[i]['position'] = position
                                    position += 1
                                }
                                constructors_data.push(...grouped_constructors)
                            }

                            for (let sub_topic of subscribed_sub_topics) {
                                if (sub_topic.name == "Race Name") {
                                    constructors_data = constructors_data.filter(constructor => sub_topic.value.includes(constructor.race_name))
                                }
                                if (sub_topic.name == "Year") {
                                    constructors_data = constructors_data.filter(constructor => sub_topic.value.includes(constructor.race_year))
                                }
                            }

                            constructors = []
                            for (constructor of constructors_data) {
                                let constructor_data = {
                                    "position": constructor.position,
                                    "points": constructor.points,
                                    "constructor_name": constructor.constructor_name,
                                    "constructor_nationality": constructor.constructor_nationality,
                                    "race_name": constructor.race_name,
                                    "race_year": constructor.race_year,
                                }
                                constructors.push(constructor_data)
                            }
                            res.send(constructors)
                        })
                    }

                }
            }

        })
}

module.exports.getUserSubscriptions = (req, res, next) => {

    var username = req.body.username

    User.aggregate([
        {
            $match: { "username": username }
        },
        {
            $project: {
                _id: 0,
                username: 1,
                subscribedTopics: 1
            }
        }
    ], async (err, user_data) => {

        groupBy = function (data, key) {
            return data.reduce(function (storage, item) {
                var group = item[key];

                storage[group] = storage[group] || [];

                storage[group].push(item);
                return storage;
            }, {});
        };

        main_topics = await SubscriptionTopics.find({ type: "main_topic" })
        topics = []
        subscribed_main_topics = []

        for (let topic of user_data[0].subscribedTopics) {
            if (topic.type == "main_topic" && !subscribed_main_topics.includes(topic.topicId)) {
                subscribed_main_topics.push(topic.topicId)
            }
            else if (topic.type == "sub_topic" && !subscribed_main_topics.includes(topic.mainTopicId)) {
                subscribed_main_topics.push(topic.mainTopicId)
            }
        }


        for (main_topic_id of subscribed_main_topics) {
            main_topic_data = main_topics.filter(topic => topic.topicId == main_topic_id)[0]
            let topic = {
                "topicId": main_topic_id,
                "mainTopicId": null,
                "name": main_topic_data.name,
                "type": "main_topic",
                "sub_topics": []
            }

            topic['also_subscribed_to_all_of_main_topic'] = user_data[0].subscribedTopics.filter(topic => topic.type == "main_topic" && topic.topicId == main_topic_id).length > 0 ? true : false
            topic['sub_topics'] = user_data[0].subscribedTopics.filter(topic => topic.type == "sub_topic" && topic.mainTopicId == main_topic_id)
            topics.push(topic)
        }

        // topics_by_type = groupBy(user_data[0].subscribedTopics, "type")

        // main_topic_ids = []

        // for (let topic of user_data[0].subscribedTopics) {
        //     let main_topic = {
        //         "topicId": topic.topicId,
        //         "mainTopicId": topic.topicId,
        //         "name": topic.name,
        //         "type": "main_topic",
        //         "field": topic.field,
        //         "sub_topics": []
        //     }
        //     topics.push(main_topic)

        //     if (topic.mainTopicId == null) {
        //         main_topic['also_subscribed_to_all_of_main_topic'] = true
        //     }
        //     else {
        //         sub_topics_by_main_topic = topics_by_type.sub_topic.filter(sub_topic => sub_topic.mainTopicId == topic.topicId)
        //         // main_topic = topics_by_type.main_topic.filter(main_topic_data => main_topic_data.topicId == topic.topicId)[0]
        //         for (let i = 0; i < topics.length; i++) {
        //             if (topic.mainTopicId == topics[i].mainTopicId) {
        //                 topics[i].sub_topics.push(sub_topics_by_main_topic)
        //             }
        //         }
        //         topic.mainTopicId == false

        //         main_topic['sub_topics'] = sub_topics_by_main_topic
        //     }
        // }


        res.send({
            "username": username,
            "topics": topics,
            "all_main_topic_names": main_topics.map(topic => topic.name.toUpperCase())
        })
    })
}
