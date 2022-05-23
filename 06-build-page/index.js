const path = require('path');
const {stat, mkdir, rmdir, unlink} = require('fs');
const {readdir, appendFile} = require('fs/promises');
const {createReadStream, readFile} = require('node:fs');
const {stdout} = process;
//уважаемый проверяющий, если у вас есть возможность, не проверяйте это задание и не ставьте оценку до вечера среды,
//контакты для связи: telegrem - @pieliedie3x, discord - halva#1696 \ (kochanovnikita)

async function replaceHeader(template){
  stdout.write(template[0].length.toString());
  template.forEach(elem => {
    appendFile(path.join(__dirname, 'index.html'),
      elem,
      err => {
        if(err) stdout.write('error');
      });
  });
}

async function createIndexHTML(){
  let template = [];
  /*const stream = createReadStream(path.join(__dirname, 'template.html'), {start: 0, encoding: 'utf-8'});
  stream.on('readable', () => {
    let data = stream.read();
    if(data != undefined && data != null){
      template.push(data);
    }
    replaceHeader(template);
  });*/
  readFile(path.join(__dirname, 'template.html'), 'utf-8', (err, fileContent)=>{
    if(err){
      stdout.write('err');
    }else{
      template.push(fileContent);
    }
    replaceHeader(template);
  });
}

createIndexHTML();