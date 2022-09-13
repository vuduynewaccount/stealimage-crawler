let log=require('../utils/log.js')
const axios = require('axios');
const cheerio = require('cheerio');
let playlist=require('../model/playlist');

//Lấy 1 link để crawl
let getPlaylistLink;
let checkExist;
// crawl link đó
let crawlPage;
// parse raw data thành data có cấu trúc
let parseInfo;
// lấy danh sách link và ảnh trong link đó
let crawlPagination;
let crawlImages;
//validate để đưa vào database
let validate;
let addToDb=require('../utils/addToDb.js');

let main=function(){
  return new Promise(async (resolve,reject)=>{
    try{
      log('info','crawling jpxgyw.vip')
      let init= await getPlaylistLink();
      let rawInfo=await crawlPage(init.href,init.thumbnail);
      let info=await parseInfo(rawInfo.obj);
      let arrImages=await crawlPagination(rawInfo.arrHref);
      info['imgs']=arrImages;
      let validInfo=await validate(info);
      await addToDb(validInfo)
      log('info','crawler JpxgywVip xong')
      resolve()
    }catch(e){
      log('error',e)
      log('info','crawler JpxgywVip xong')
      resolve(e)
    }
  })
}



getPlaylistLink=function(){
  return new Promise(async(resolve,reject)=>{
    try{
      log('info','getting 1 link')
      let res = await axios.get('https://www.jpxgyw.vip/new.html')
      const $ = cheerio.load(res.data);
      let arrPlaylist=$('.related_box');
      let arrUrl=[];
      for(let i=0;i<arrPlaylist.length;i++){
        let obj={};
        obj.href='https://www.jpxgyw.vip'+arrPlaylist.eq(i).children('a').eq(0).attr('href');
        obj.thumbnail='https://www.jpxgyw.vip'+arrPlaylist.eq(i).children('a').eq(0).children('img').eq(0).attr('src');
        arrUrl.push(obj)
      }

      let idx=0;
      while(idx<arrUrl.length){
        let status =await checkExist(arrUrl[idx].thumbnail);
        if(status=='0') resolve(arrUrl[idx])
        else{
          idx++;
        }
      }
      log('info','no remain item to crawl')
      reject('no remain item to crawl')
    }catch(e){
      log('error',e)
      reject(e)
    }
  })
}
checkExist=function(thumbnail){
   return new Promise((resolve,reject)=>{
     playlist.findOne({'thumbnail':thumbnail},(err,doc)=>{
       if(err==null&&doc==null) resolve('0')
       else resolve('1')
     });
   })
}
crawlPage=function(url,playlist_thumbnail){
  return new Promise(async(resolve,reject)=>{
    try{
      let obj={}
      log('info','crawling page '+url);
      let res = await axios.get(url)
      const $ = cheerio.load(res.data);
      //name playlist
      obj["playlist-name"]=$('.article-title').eq(0).text()
      obj["studio"]=url.split('www.jpxgyw.vip/')[1].split('/')[0];
      let listInfo=$('.article-meta .item');
      for(let i=0;i<listInfo.length;i++){
        let s=listInfo.eq(i).text()
        if(s.includes('：')){
          let field=listInfo.eq(i).text().split('：')[0];
          let value=listInfo.eq(i).text().split('：')[1];
          if(field&&value)
          obj[field]=value;
        }
      }
      let allHref=$('.pagination').eq(0).children('ul').eq(0).children('a')
      //href
      log('info',' number of href: '+allHref.length);
      let arrHref=[];
      if(allHref.length>0){
        for(let i=0;i<allHref.length;i++){
          if(!arrHref.includes(allHref.eq(i).attr('href')))
          arrHref.push(allHref.eq(i).attr('href'))
        }
      }else{
        arrHref.push(url.split('www.jpxgyw.vip')[1])
      }
      obj['playlist-thumbnail']=playlist_thumbnail;
      obj['origin-url']=url;
      resolve({obj:obj,arrHref:arrHref})

    }catch(e){
      log('error', e);
      reject(e)
    }

  })
}
parseInfo=function(obj){
  return new Promise((resolve,reject)=>{
    try{
      let info=require('../model/playlist-json');
      info['thumbnail']=obj['playlist-thumbnail'];
      info['title']=obj['playlist-name'];
      info['href']=info['title'];
      info['tags'].push(obj['模特'].toUpperCase());
      info['tags'].push(obj['studio'].toUpperCase());
      for(let i=0;i<info['title'].split(' ').length;i++){
        if(!info['tags'].includes(info['title'].split(' ')[i].toUpperCase()))
        info['tags'].push(info['title'].split(' ')[i].toUpperCase())
      }
      info['tags'] = [...new Set(info['tags'])];
      resolve(info)
    }catch(e){
      log('error',e)
      reject(e)
    }
  })
}
crawlPagination=function(arrHref){
  return new Promise(async(resolve,reject)=>{
    try{
      let arrImages=[];
      let i=0;
      while(i<arrHref.length){
        log('info','crawling page '+(i+1)+'/'+arrHref.length);
        let arrImage=await crawlImages(arrHref[i]);
        for(let j=0;j<arrImage.length;j++){
          arrImages.push(arrImage[j]);
        }
        i++;
      }
      resolve(arrImages)
    }catch(e){
      log('error',e)
      reject(e)
    }
  })
}
crawlImages=function(urlImg){
  return new Promise(async(resolve,reject)=>{
    try{
      let arrImage=[]
      let res = await axios.get('https://www.jpxgyw.vip'+urlImg);
      const $ = cheerio.load(res.data);
      //số ảnh
      let listImage=$('.article-content').eq(0).children('p').eq(0).children('img');
      for(let k=0;k<listImage.length;k++){
        let obj='https://www.jpxgyw.vip'+listImage.eq(k).attr('src');
        arrImage.push(obj)
      }
      resolve(arrImage)
    }catch(e){
      log('error',e)
      reject(e)
    }
  })
}
validate=function(info){
  return new Promise((resolve,reject)=>{
    try{
      log('info','validate info')
      for(let i=0;i<info['imgs'].length;i++){
        info['imgs'][i]=info['imgs'][i].trim()
      }
      resolve(info)
    }catch(e){
      log('error',e)
      reject(e)
    }
  })
}
module.exports=main
