const fs = require('fs');
const path = require('path');

let stream = new fs.ReadStream(path.join(__dirname, 'text.txt'), 'utf-8');

stream.on('readable', ()=>{
  let data = stream.read();
  if(data !== null){
    console.log(data);
  }
});

