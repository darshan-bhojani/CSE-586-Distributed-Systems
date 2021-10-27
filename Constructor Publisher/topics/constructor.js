const axios = require('axios');

module.exports.advertize = function (broker_url, future_topic) {
    if (future_topic != null) {
        axios.post(broker_url + '/advertizeFutureTopics', future_topic)
            .then(async (res) => {
                console.log(res)
            })
    }
}

module.exports.unadvertize = function (broker_url, future_topic_id) {

    axios.post(broker_url + '/unadvertizeFutureTopics', { topicId: future_topic_id })
        .then(async (res) => {
            console.log(res)
        })

}