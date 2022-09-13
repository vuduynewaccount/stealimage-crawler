
let mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlist = new Schema({
  title:{type:String,index:true},
  href:{type:String,index:true},
  thumbnail:{type:String,index:true},
  imgs:[String],
  tags:[{type:String,index:true}]
});

module.exports = mongoose.model("playlist", playlist)
