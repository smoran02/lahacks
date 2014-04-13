module.exports = function(mongoose){
  var Schema = mongoose.Schema;
  var sentimentSchema = new Schema({
    text: { type: String },
    timestamp: { type: Date },
    keywords: [{
      text: { type: String },
      relevance: { type: String }, 
      sentiment: {
        type: { type: String },
        score: { type: String }
      }
    }]
  });
  mongoose.model('Sentiment', sentimentSchema);
}