const {readdir, appendFile} = require('fs/promises');
const {ReadStream, unlink, stat} = require('fs');
const path = require('path');

async function removebundleFile(){
  unlink((path.join(__dirname, 'project-dist', 'bundle.css')), err =>{
    if(err) createBundleFile;
    else{ createBundleFile(); }
  });
}

async function addStyles(style){
  appendFile(path.join(__dirname, 'project-dist', 'bundle.css'),
    style,
    err => {
      if(err) console.log(err);
    }
  );
}

async function createBundleFile(){
  const files = await readdir(path.join(__dirname, 'styles'), {withFileTypes: true, encoding: 'utf-8'});
  for(const file of files){
    if(file.isFile() && path.extname(file.name) == '.css'){
      const stream = ReadStream(path.join(__dirname, 'styles', file.name));
      stream.on('readable', ()=>{
        let data = stream.read();
        if(data !== null){
          addStyles(data);
        }
      });
    }
  }
}

async function fileExists(){
  stat(path.join(__dirname, 'project-dist', 'bundle.css'), (err, stats) => {
    if(err) createBundleFile();
    else{
      if(stats.isFile){
        removebundleFile();
      }else{
        createBundleFile();
      }
    }
  });
}

fileExists();