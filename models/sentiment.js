module.exports = function(mongoose){
  var Schema = mongoose.Schema;
  var sentimentSchema = new Schema({
    text: { type: String },
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