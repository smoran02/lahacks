
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/test';

mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});
require('./models/feedback')(mongoose);
require('./models/sentiment')(mongoose);

var feedback = mongoose.model('Feedback');


var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var twitter = require('twitter');
var twit = new twitter({
    consumer_key: '1135571256-FRw0q3uRFfAAzKDfDfeCd6F9Dferdq1lBHgWR1x',
    consumer_secret: 'lBRUKcA4l5LnY1gO0jYSDPIWAsf8Uvr0kRzRKO2QiW3hu',
    access_token_key: 'yrkhvLIGnHj1AFcIbOe16w',
    access_token_secret: '6z05fwnwZ9HXDFJRfAdNUegTLOF7hyojlttoaEUS8'
});
var OAuth2 = require('oauth').OAuth2;
var https = require('https');

var sentiment = mongoose.model('Sentiment');
var feedback = mongoose.model('Feedback');
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('b03910ecf00dceb5040c7ffbb61be5a1cf856aba');

// Twitter Information
var bearer_token = null;
var access_token_key = encodeURIComponent('ao4hRWSySVStN4fJoTi8g');
var access_token_secret = encodeURIComponent('WhcBpUm30tvdsMffoWkTxh1GeuvRLAt0vsEQdJtTDs');
var update_period = 5000;
var tweets_per_call = 3;
var timeout = null;
var old_tweets = [];



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/keyword/:keyword, routes.keyword');
app.post('/', routes.feedback);

app.post("/event_name", function(req, res){
	var event_name = req.body.event_name;
	var keyword_array = req.body.keywords;
	twitter_loop(event_name, keyword_array);
	sentiment.find({}).sort('-timestamp').limit(10).exec(function(err, sents){
		res.render('index.ejs', { sentiments: sents });
	});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));

  // Remove the call below to not start the twitter loop when the server starts
  twitter_loop("LAHacks");
});



var twitter_loop = function(event_name, keyword_array){
  clearTimeout(timeout);
  var oauth2 = new OAuth2(access_token_key, access_token_secret, 'https://api.twitter.com/', null, 'oauth2/token', null);
  oauth2.getOAuthAccessToken('',
    {
      'grant_type': 'client_credentials'
    },
    function(e, access_token, args){
      bearer_token = access_token;
      timeout = setTimeout(search_tweets, update_period, event_name, keyword_array);
    }
  );
}


var search_tweets = function(event_name, keyword_array){
  var query = encodeURIComponent(event_name);
  var options = {
    hostname: 'api.twitter.com',
    path: '/1.1/search/tweets.json?q='+query+"&count="+String(tweets_per_call),
    headers: {
      Authorization: 'Bearer '+bearer_token
    }
  }

  https.get(options, function(res){
    var json_string = "";
    res.on('data', function(data){
      json_string += String(data);
    });

    res.on('end', function(data){
    	save_and_throttle(json_string);
  	});
  });  
  
  timeout = setTimeout(search_tweets, update_period, event_name);

}

var parse_twitter_date = function(text) {
	return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
}

var create_sentiment = function(content, time){
	alchemy.keywords(content, {sentiment: 1}, function(err, response){
		if (!err){
			var sent = new sentiment({
				text: content,
				timestamp: time,
				keywords: response.keywords
			});
			sent.save(function(err, docs){
				console.log(err);
			});
		}
	});
}

// Throttling functions

var save_and_throttle = function(json_string){
    var tweets = JSON.parse(json_string);
    var current_tweets = [];

    // Build a list of the tweets we just got from our 
    // GET request to the search endpoint
    for(var i = 0; i < tweets.statuses.length; i++){
    	var tweet = tweets.statuses[i];
    	current_tweets.push(tweet);    	
    }

    // Find the tweets in the list we just got that are
    // actually new (that we haven't seen before)
    var new_tweets = get_new_tweets(current_tweets, old_tweets);
    //console.log(String(new_tweets.length) + " new tweets");

    // Go through all new tweets and save them in the database
    for(var i = 0; i < new_tweets.length; i++){
    	var tweet = new_tweets[i];
      	var time = parse_twitter_date(tweet.created_at);
   		var content = tweet.text;
   		console.log("Time: "+time+" Content: "+tweet.text);
   		create_sentiment(content, time);
	}

	// Throttle the rate of GET requests/the amount of tweets
	// accessed per request using the old/new tweets list
   	throttle(current_tweets, old_tweets);
   	old_tweets = current_tweets; 
   	console.log("Update period: "+String(update_period));

}    

var loop_faster = function(){
	update_period *= 0.99;
}

var loop_slower = function(){
	update_period *= 1.01;
}

var more_tweets = function(){
	if(tweets_per_call >= 30){
		loop_faster();
	}
	else{
		tweets_per_call += 1;			
	}
}

var fewer_tweets = function(){
	if(tweets_per_call == 1){
		loop_slower()	
	}
	else{
		tweets_per_call -= 1;		
	}
	
}

// Returns the elements of current_tweets not in old_tweets
var get_new_tweets = function(current_tweets, old_tweets){
	var dictionary = {};
	var new_tweets = [];
	for(var i = 0; i < old_tweets.length; i++){
		dictionary[old_tweets[i].id] = true;
	}

	for(var j = 0; j < current_tweets.length; j++){
		if(dictionary[current_tweets[j].id] == undefined){
			new_tweets.push(current_tweets[j]);
		}
	}

	return new_tweets;
}

var throttle = function(current_tweets, old_tweets){
	var new_tweets = get_new_tweets(current_tweets, old_tweets);
	if(new_tweets.length < current_tweets.length){
		fewer_tweets();
	}
	else if(new_tweets.length > current_tweets.length){
		more_tweets();
	}

}