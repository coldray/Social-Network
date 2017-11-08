var express = require('express');
var router = express.Router();
var request = require('request');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var username = req.query.name;
    var headers = {
        'User-Agent': 'Social-Network'
    };
    var client_id='49ef62012cc3ba67b776';
    var client_secret='5805517448af865dd9bde0eae0797599d8f3e006';
    console.log(username);
    var options = {
        url: 'https://api.github.com/users/' + username + '?client_id=' + client_id + '&client_secret=' + client_secret,
        method: 'GET',
        headers: headers
    };

    console.log(options.url);
    request(options, function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            res.json(data);
            console.log(data);
        } else {
            console.log(body);
            console.log(error);
        }
    });
});

module.exports = router;
