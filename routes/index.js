var twilio = require('twilio');
var mongoose = require('mongoose');

var sentiment = mongoose.model('Sentiment');
var feedback = mongoose.model('Feedback');
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('b03910ecf00dceb5040c7ffbb61be5a1cf856aba');


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.feedback = function(req, res){
	var fb = new feedback({
		body: req.body.Body,
		timestamp: Date.now()
	});
	fb.save(function(err, docs){
		console.log(err);
	});
}

exports.sentiment = function(req, res){
	feedback.find({}, function(err, feedbacks){
		feedbacks.forEach(function(fb){
			alchemy.keywords(fb.body, {sentiment: 1}, function(err, response){
				if (!err){
					var sent = new sentiment({
						text: response.text,
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