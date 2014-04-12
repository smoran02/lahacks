var twilio = require('twilio');
var mongoose = require('mongoose');
var feedback = mongoose.model('Feedback');
var sentiment = mongoose.model('Sentiment');


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


	// feedback.find({}, function(err, feedbacks){
	// 	feedbacks.forEach(function(fb){
	// 		alchemyapi.keywords("text", fb, {sentiment:1}, function(response){
	// 			var sent = new sentiment({
	// 				text: response.text,
	// 				keywords: response.keywords
	// 			});
	// 			sent.save(function(err, docs){
	// 				console.log(err);
	// 			});
	// 		});
	// 	});
	// });
