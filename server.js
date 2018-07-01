var express = require('express');
var app = express();

app.use(function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
});
var mongoose = require('mongoose');
  mongoose.connection.once('open', function(){
        console.log("MongoDb connected successfully");
    });
	var connectionInstance  = mongoose.createConnection('mongodb://vidhu123:vidhu123@ds121861.mlab.com:21861/bms'); //without db authentication

	//error connecting to db
	connectionInstance.on('error', function (err) {
	  if(err) {
	    throw err;
	  }
	});
	//connectionInstance connected
	connectionInstance.once('open', function() {
		console.log("MongoDb connected successfully");
	});
	    var cast_schema = {
        name: {type: String},
        as: {type: String}
    };

    var crew_schema = {
        name: {type: String},
        position: {type: String}
    };

    var access_schema = {
        name: {type: String},
        release_dt: {type: Date},
        duration: {type: String},
        type: {type: [String]},
        dimension: {type: [String]},
        audio: {type: [String]},
        cast: [cast_schema],
        crew: [crew_schema],
        review: {type: Number},
        votes: {type: Number}

    }

    var movies_schema = new mongoose.Schema(access_schema);
    var movie_model = connectionInstance.model('movies', movies_schema);


// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {

	// ejs render automatically looks in the views folder
	res.render('index');
});

    app.get('/getData/:limit', function(req, res){
        movie_model.find({},{},{ limit : parseInt(req.params.limit, 10)}, function(err, movie_docs){
            if(err){
                console.log('\nerr:',err);
                res.status(404).json({status:'failure', result:'internal server error'});
            }else{
                movie_model.count({}, function(err, count){
                    res.status(200).json({'status':'success', 'result': movie_docs, 'count': count});
                })
            }
        });
    });

    app.get('/getSingleMovie/:name', function(req, res){
        movie_model.findOne({sr_nm : req.params.name}, function(err, movie_docs){
            if(err){
                console.log('\nerr:',err);
                res.status(404).json({status:'failure', result:'internal server error'});
            }else{
                res.status(200).json({'status':'success', 'movie': movie_docs});
            }
        });
    });

    app.get('/search/:name', function(req, res){
        var con = { 'name': new RegExp((req.params.name).replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&').trim(), "i") }
        movie_model.find(con, function(err, movie_docs){
            if(err){
                console.log('\nerr:',err);
                res.status(404).json({status:'failure', result:'internal server error'});
            }else{
                res.status(200).json({'status':'success', 'searchResult': movie_docs});
            }
        });
    });

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});


