let log=require('../utils/log.js')

let main=function(){
  return new Promise(async(resolve,reject)=>{
    try{

      resolve()
    }catch(e){
      log('error',e)
      resolve(e)
    }
  })
}
module.exports=main
