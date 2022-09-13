let express=require('express');
let app=new express();

app.get('/',(req,res)=>{
  res.send('server running please check log')
})
app.listen(process.env.PORT||8080,()=>{

  let mongoose = require("mongoose");
  let uri = "mongodb+srv://master:worker@cluster0.ei9y2.mongodb.net/stealimage?retryWrites=true&w=majority"
  mongoose.connect(uri)


  //init
  let remove_empty_array_document = require('./utils/remove_empty_array_document.js')
  //module strategy
  let crawlJpxgywVip=require('./web-strategy/jpxgyw.vip.js');

  let crawl = function() {
    return new Promise(async (resolve, reject) => {
      try {
        await remove_empty_array_document();
        await crawlJpxgywVip();
        await delay(5*60*1000);
        resolve()
      }catch(e){
        reject(e)
      }
    })
  }
let delay=function(t){
  return new Promise((res,rej)=>{
    setTimeout(()=>{
      res()
    },t)
  })
}

  let crawlAll = function(timeCount) {
    if(timeCount>=10) process.exit();
    crawl().then(() => {
      timeCount++
      crawlAll(timeCount);
    })
  }

  let timeCount=0;
  crawlAll(timeCount)
})
