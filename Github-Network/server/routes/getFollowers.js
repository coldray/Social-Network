var express = require('express');
var router = express.Router();
var request = require('request');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var headers = {
        'User-Agent': 'Social-Network'
    };
    var client_id='xxxxxxxxxxxx';    // put your client_id
    var client_secret='xxxxxxxxxxx'; // put your client_secret
    var username = req.query.name;

    var options = {
        url: 'https://api.github.com/users/' + username + '/followers' + '?client_id=' + client_id + '&client_secret=' + client_secret,
        method: 'GET',
        headers, headers,
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let data = JSON.parse(body);
          res.json(data);
        } else {
            console.log(body);
            console.log(error);
        }

    });
});

module.exports = router;
