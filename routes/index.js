var twilio = require('twilio');
var mongoose = require('mongoose');
var sentiment = mongoose.model('Sentiment');
var feedback = mongoose.model('Feedback');
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('b03910ecf00dceb5040c7ffbb61be5a1cf856aba');


exports.index = function(req, res){
	sentiment.find({}).sort('-timestamp').limit(10).exec(function(err, sents){
		console.log(sents);
		res.render('index.ejs', { sentiments: sents });
	});
};

exports.feedback = function(req, res){
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

			var twiml = new twilio.TwimlResponse();
			twiml.message('Thanks! Your feedback has been recorded!');
			res.type('text/xml');
			res.send(twiml.toString());
		}
	});
}

exports.keyword = function(req, res){
	sentiment.find({ 'keywords.text':
			{'$regex': req.params.keyword, '$options': 'i'}},
			{'keywords.text.$': true}, function(err, sents){
		res.send(sents);
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
				if (!err){
					console.log(response);
					var sent = new sentiment({
						text: fb.body,
						timestamp: fb.timestamp,
						keywords: response.keywords
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
