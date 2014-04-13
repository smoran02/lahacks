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

// Twitter Information
var bearer_token = null;
var access_token_key = encodeURIComponent('ao4hRWSySVStN4fJoTi8g');
var access_token_secret = encodeURIComponent('WhcBpUm30tvdsMffoWkTxh1GeuvRLAt0vsEQdJtTDs');
var update_period = 10000;
var tweets_per_call = 1;



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
app.post('/', routes.feedback);
app.post('/fake', routes.fake);
app.get('keyword/:keyword', routes.keyword);

app.get('/users', user.list);
app.get('/sentiment', routes.sentiment);

app.post("/event_name", function(req, res){
	var event_name = req.body.event_name;
	var keyword_array = req.body.keywords;
	twitter_main(event_name, keyword_array);
	res.render("index");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var twitter_main = function(event_name, keyword_array){
  var oauth2 = new OAuth2(access_token_key, access_token_secret, 'https://api.twitter.com/', null, 'oauth2/token', null);
  oauth2.getOAuthAccessToken('',
    {
      'grant_type': 'client_credentials'
    },
    function(e, access_token, args){
      bearer_token = access_token;
      setInterval(search_tweets, update_period, event_name, keyword_array);
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
      /*console.log("\n\n\n\n\n");
      console.log("Printing data: ")
      console.log(String(data));*/
      json_string += String(data);
    });

    res.on('end', function(data){
      var tweets = JSON.parse(json_string);
      var last = tweets.statuses.length - 1
      var last_tweet = tweets.statuses[last];

      for(var i = 0; i < tweets.statuses.length; i++){
      	var tweet = tweets.statuses[i];
      	var time = parseTwitterDate(tweet.created_at);
   		var content = tweet.text;
   		console.log("Time: "+time+" Content: "+tweet.text);
   		//post_sentiment(content, time);
      }
    });    
  });
}

function parseTwitterDate(text) {
	return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
}

var post_sentiment = function(text, time, from_twitter){
	if(from_twitter){
		// Post to mongoDB with anonymous = false, cause
		// the information came from twitter
		mongoose.post(text, time, false);
	}
	else{
		mongoose.post(text, time, true);
	}
}