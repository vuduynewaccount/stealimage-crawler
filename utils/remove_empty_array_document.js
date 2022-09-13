let playlist = require("../model/playlist.js");


let main = function() {
  return new Promise((resolve, reject) => {
    playlist.find({
      imgs:[]
    }, (err, docs)=>{
      if(docs.length!=0) console.log(docs);
      let arrId=[];
      for(let i=0;i<docs.length;i++){
        arrId.push(docs[i]._id)
      }
      playlist.deleteMany({_id: { $in: arrId}},(err)=>{
        if(err) reject(err)
        else{
         resolve()
        }
      })

    })
  })
}

module.exports=main
