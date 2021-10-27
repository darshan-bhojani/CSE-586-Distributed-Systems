const axios = require('axios');

module.exports = {

    publish: function (broker_url, new_race_results, next_race_count) {

        new_race_results['MRData']['RaceTable']['round'] = parseInt(new_race_results['MRData']['RaceTable']['round']) + next_race_count
        new_race_results['MRData']['RaceTable']['Races'][0]['round'] = parseInt(new_race_results['MRData']['RaceTable']['Races'][0]['round']) + next_race_count
        for (let i = 0; i < new_race_results['MRData']['RaceTable']['Races'][0]['Results'].length; i++) {
            new_race_results['MRData']['RaceTable']['Races'][0]['Results'][i]['points'] = parseInt(new_race_results['MRData']['RaceTable']['Races'][0]['Results'][i]['points']) + (10 * next_race_count)
        }
        axios.post(broker_url + '/publishDriverStandings', new_race_results)
            .then(async (res) => {
                console.log(res.data.msg)
            })
    }
}