let fs=require('fs');
let
  main=function(status, log){
  fs.appendFileSync('./logs/'+status,new Date()+' : '+log+'\n')
  fs.appendFileSync('./logs/debug',new Date()+' : '+log+'\n')
  console.log(new Date()+' : ['+status+'] '+log+'\n')
}

module.exports=main
