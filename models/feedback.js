module.exports = function(mongoose){
	var Schema = mongoose.Schema;
	var feedbackSchema = new Schema({
		body: { type: String },
		timestamp: { type: Date }
	});
	mongoose.model('Feedback', feedbackSchema);
}