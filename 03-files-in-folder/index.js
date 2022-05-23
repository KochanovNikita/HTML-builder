const path = require('path');
const {readdir} = require('fs/promises');
const {stat} = require('fs');
const {stdout} = process;
const pathToFolder = path.join(__dirname, 'secret-folder');

async function filesInfo(){
  try{
    const folder = await readdir(pathToFolder, {withFileTypes: true, encoding: 'utf-8'});
    for(const file of folder){
      if(file.isFile()){
        stat(pathToFolder+`\\${file.name}`, (err, stats) => {
          if(err){
            console.log(err);
          }
          else{
            stdout.write(`${path.basename(file.name, path.extname(file.name))} - ${path.extname(file.name).slice(1)} - ${stats.size} byte \n`);
          }
        });
       
      }
    }
  }
  catch (err){
    stdout.write('error');
  }  
}

filesInfo();