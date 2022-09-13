let playlist=require('../model/playlist');

let log=require('./log.js')
let addToDb=function(validInfo){
  return new Promise((resolve,reject)=>{
    try{
      log('info','adding data to db')
      new playlist(validInfo).save((err,doc)=>{
        if(err){
          log('error',err)
          reject(err)
        }else{
          resolve()
        }
      })
    }catch(e){
      log('error',e)
      reject(e)
    }
  })
}

module.exports=addToDb
