const path = require('path');
const fs = require('fs/promises');
const {stdout} = process;
const pathToFolder = path.join(__dirname, 'secret-folder');

fs.stat('D:\\basic-js\\HTML-builder\\03-files-in-folder\\secret-folder\\text.txt', (err, stats)=>{
  if(err) console.log('err');
  console.log(stats.size);
});

async function filesInfo(){
  fs.readdir(pathToFolder, {withFileTypes: true}).then((folder)=>{
    let fileSize;
    let filePath;

    for(const file of folder){
      if(file.isFile()){
        filePath = path.resolve(path.join(pathToFolder, file.name));
        fs.stat( filePath, (err, stats)=>{
          if(err) stdout.write('err');
          fileSize = stats.size;
        });
        stdout.write(`${path.basename(file.name, path.extname(file.name))} - ${path.extname(file.name).slice(1)} - ${fileSize} \n`);
      }
    }
  });
}

filesInfo();