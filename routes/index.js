var twilio = require('twilio');
var mongoose = require('mongoose');
var feedback = mongoose.model('Feedback');

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
