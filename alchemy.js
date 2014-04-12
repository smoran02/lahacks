var mongoose = require('mongoose');
var feedback = mongoose.model('Feedback');
var sentiment = mongoose.model('Sentiment');
var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();

feedback.find({}, function(err, feedbacks){
	//fb is the array of all feedbacks
	feedbacks.forEach(function(fb){
		//run each one through alchemy and save to sentiment collection
		alchemyapi.keywords("text", fb, {sentiment:1}, function(response){
			var sent = new sentiment({
				text: response.text,
				keywords: response.keywords
			});
			sent.save(function(err, docs){
				console.log(err);
			});


		});

	});
}