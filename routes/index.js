var twilio = require('twilio');
var mongoose = require('mongoose');
var sentiment = mongoose.model('Sentiment');
var feedback = mongoose.model('Feedback');
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('2094dd01fd7cbceb7e1bb916840e40e81f25d16f');


exports.index = function(req, res){
	sentiment.find({}).sort('-timestamp').limit(10).exec(function(err, sents){
		res.render('index.ejs', { sentiments: sents });
	});
};

exports.feedback = function(req, res){
	alchemy.keywords(req.body.Body, {sentiment: 1}, function(err, response){
		console.log(response);
		if (!err){
			var sent = new sentiment({
				text: req.body.Body,
				timestamp: Date.now(),
				keywords: response.keywords
			});
			sent.save(function(err, docs){
				console.log(err);
			});

			var twiml = new twilio.TwimlResponse();
			twiml.message('Thanks! Your feedback has been recorded!');
			res.type('text/xml');
			res.send(twiml.toString());
		}
	});
}

exports.keyword = function(req, res){
	var regex = new RegExp(req.params.keyword, 'i');
	var data = [];
	sentiment.find(
		{'keywords.text': regex},
		{
			'keywords': {'$elemMatch': {'text': regex}},
			'text': true,
			'timestamp': true
		},
		function(err, sents){
			sents.forEach(function(sent){
				var rel = parseFloat(sent.keywords[0].relevance, 10);
				var s = parseFloat(sent.keywords[0].sentiment.score, 10);
				var product = 0;
				if (s){
					product = rel * rel * s;
				}
				var node = {
					text: sent.text,
					x: sent.timestamp,
					y: product
				}
				data.push(node);
			});
			res.render('chart.jade', {data: data});
	});
}

exports.fake = function(req, res){
	alchemy.keywords(req.body.Body, {sentiment: 1}, function(err, response){
		if (!err){
			var sent = new sentiment({
				text: req.body.Body,
				timestamp: Date.now(),
				keywords: response.keywords
			});
			sent.save(function(err, docs){
				console.log(err);
			});
		}
	});
}

exports.sentiment = function(req, res){
	feedback.find({}, function(err, feedbacks){
		feedbacks.forEach(function(fb){
			alchemy.keywords(fb.body, {sentiment: 1}, function(err, response){
				var rel = parseInt(response.keywords.relevance, 10);
				var sent = parseInt(response.keywords.sentiment, 10);
				if (!err){
					console.log(response);
					var sent = new sentiment({
						text: fb.body,
						timestamp: fb.timestamp,
						sentiment: rel * rel * sent
					});
					sent.save(function(err, docs){
						console.log(err);
					});
				}
			});
		});
	});
	res.send('sentiment and shit');
}


