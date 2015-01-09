// server.js
// by Michal Novemsky


var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var request    = require('request');
var md5        = require('MD5');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var Director  = require('./director');

var router = express.Router();

function isValidJson(o) {
    json = JSON.stringify(o);
    if (json === '{}' || json === null || json === undefined)
        return false;
    return true;

}

function isAuthorized(req, toValidate) {
    var bearer_token = req.get('Authorization');                
    if(bearer_token)
        var token = bearer_token.replace('Bearer', '').trim();
        if (token === md5(toValidate))
            return true;
        return false;
    return false;
}


// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging each time there is a request
    console.log('A request is happening.');
    next(); //pass control to next route
});


// Test that everything is working
// GET http://localhost:8080/api
router.get('/', function(req, res) {
    res.json({ message: 'This is working!' });   
});


router.route('/directors')

    // Add a new director
    // POST http://localhost:8080/api/directors
    // params: {livestream_id: 12345}
    .post(function(req, res) {
        if(!isValidJson(req.body))
            res.status(400).json({message: 'Error! Bad JSON in request.'});
        var ls_id = req.body.livestream_id;
        request('https://api.new.livestream.com/accounts/' + ls_id,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body);
                    if(body.hasOwnProperty('id') && body.hasOwnProperty('full_name') && body.hasOwnProperty('dob'))
                    {
                        var director = new Director();
                        director.livestream_id = body.id;
                        director.full_name = body.full_name;
                        director.dob = body.dob;
                        director.favorite_camera = ''; // empty since this is optional && doesn't come from Livestream
                        director.favorite_movies = ['']; // see above comment 
                        director.save(function(err) {
                        if (err)
                            res.send(err);
                        res.json({ message: 'The director was added!' });
                        });
                    }
                    else
                        res.status(400).json({message: 'Error! The director is malformed.'});
                }
                else
                    res.status(400).json({message: 'Error! Make sure the director ID is valid.'});
                        // e.g. try using ID 100, which does not exist
            }
            );
    })



    // List all the directors
    // GET http://localhost:8080/api/directors
    .get(function(req, res) {
        Director.find(function(err, directors) {
            if (err)
                res.send(err);
            res.json(directors);
        });
    });


router.route('/directors/:livestream_id')

    // Get the director with the specified Livestream ID (which is unique)
    // GET http://localhost:8080/api/directors/:livestream_id
    .get(function(req, res) {
        Director.findOne({livestream_id: req.params.livestream_id}, function(err, director) {
            if (err)
                res.send(err);
            if(director)
                res.json(director);
            else
                res.status(400).json({message: 'Livestream ID not found!'});
        });
    })

    // Update the director with the specified (unique) Livestream ID
    // PUT http://localhost:8080/api/directors/:livestream_id
    // headers: {Authorization: Bearer 8f16c898e9bde71964315671f808cbd8}
    // params: {favorite_camera: 'GoPro HERO4',
    //          favorite_movies: 'Citizen Kane', 'Casablanca', 'The Godfather'}
    .put(function(req, res) {

        // find the matching director record
        Director.findOne({livestream_id: req.params.livestream_id}, function(err, director) {
            if (err)
                res.send(err);
            if(director)
            {
                var full_name = director.full_name;
                if(isAuthorized(req, full_name))
                {
                    req_body = req.body;
                    if(!isValidJson(req_body))
                        res.status(400).json({message: 'Error! Bad JSON in request.'});
                    if(!req_body.hasOwnProperty('favorite_camera') && !req_body.hasOwnProperty('favorite_movies'))
                        res.status(400).json({message: 'Nothing to update!'})
                    if(req_body.hasOwnProperty('favorite_camera'))
                        director.favorite_camera = req_body.favorite_camera;  // update the camera
                    if(req_body.hasOwnProperty('favorite_movies'))
                        director.favorite_movies = req_body.favorite_movies; // update the movies
                    director.save(function(err) {
                        if (err)
                            res.send(err);
                        res.json({ message: 'Director updated!' });
                    });
                }
                else
                    res.status(401).json({message: 'Authentication failed!'});
            }
            else
                res.status(400).json({message: 'Livestream ID not found!'});
        });
    });


// all of the routes are prefixed with /api
app.use('/api', router);


// connect to the database
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/MNovDirectorsDB');



//start the app
app.listen(port);
console.log('Listening on port ' + port);

