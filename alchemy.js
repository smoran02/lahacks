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
require('./models/sentiment')(mongoose);
require('./models/feedback')(mongoose);
var sentiment = mongoose.model("Sentiment");
var feedback = mongoose.model("Feedback");
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('b03910ecf00dceb5040c7ffbb61be5a1cf856aba');

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