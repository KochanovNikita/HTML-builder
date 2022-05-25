const path = require('path');
const {stat, mkdir, ReadStream, copyFile, rm} = require('fs');
const {readdir, appendFile} = require('fs/promises');
const {createReadStream} = require('node:fs');
const {stdout} = process;
const componentsPath = path.join(__dirname, 'components');
const distPath = path.join(__dirname, 'project-dist');
const assetsPath = path.join(__dirname, 'assets');

async function replaceElement(template){
  const files = await readdir(componentsPath, {withFileTypes: true});
  for(const file of files.reverse()){
    if(file.isFile() && path.extname(file.name) == '.html'){
      let section = path.basename(file.name, path.extname(file.name));
      if(template.includes('{{' + section + '}}')){
        const stream = createReadStream(componentsPath + `\\${file.name}`, {encoding: 'utf-8'});
        stream.on('readable', () => {
          let data = stream.read();
          if(typeof data === 'string'){
            template = template.replace('{{' + section + '}}', data);
            appendFile(distPath+'\\index.html',
              template,
              {flag: 'w'},
              err => {
                if(err) stdout.write('error');
              });   
          }
        });
      }
    }
  }
}

async function createIndexHTML(){
  let template = '';
  const stream = createReadStream(path.join(__dirname, 'template.html'), {autoClose: true, encoding: 'utf-8'});
  stream.on('readable', () => {
    let data = stream.read();
    if(typeof data === 'string'){
      template = data;
      replaceElement(template);
    }
  });
  createBundleFile();
}

async function copyFileCustom(src, dist){
  copyFile(src, dist, (err)=>{
    if(err){
      if(err.code === 'ENOENT'){
        copyFileCustom(src, dist);
      }else if(err.code === 'EBUSY'){
        copyFileCustom(src, dist);
      }else{
        console.log(err);
      }
    }
  });
}

async function copyFolder(pathToDir){
  const folder = await readdir(pathToDir, {withFileTypes: true});
  for(const file of folder){
    if(file.isDirectory()){
      createFolder(pathToDir.replace('assets', 'project-dist\\assets') + `\\${file.name}`, pathToDir + `\\${file.name}`);
      copyFolder(pathToDir + `\\${file.name}`);
    }else if(file.isFile()){
      copyFileCustom(pathToDir + `\\${file.name}`, pathToDir.replace('assets', 'project-dist\\assets')  + `\\${file.name}`);
    }
  }
}

function createFolder(distpath, copypath){
  mkdir(distpath, {recursive: true}, (err) => {
    if(err){
      stdout.write('не создал');
    }
    if(copypath){
      copyFolder(copypath);
    }
  });
}

async function removeFolder(){
  await rm(path.join(__dirname, 'project-dist'), {recursive: true, force: true}, (err)=>{
    if(!err){
      createSolution();
    }
  });
}

async function addStyles(style){
  appendFile(path.join(__dirname, 'project-dist', 'style.css'),
    style,
    err => {
      if(err) console.log(err);
    }
  );
}

async function createBundleFile(){
  const files = await readdir(path.join(__dirname, 'styles'), {withFileTypes: true, encoding: 'utf-8'});
  for(const file of files.reverse()){
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

async function createSolution(){
  stat(distPath, (err, stats) => {
    if(err){
      createFolder(distPath, assetsPath);
      createFolder(distPath+'\\assets');
      createIndexHTML();
    }else{
      if(stats.isDirectory()){
        removeFolder();
      }else{
        createFolder(distPath, assetsPath);
        createFolder(distPath+'\\assets');
        createIndexHTML();
      }
    }
  });
}

createSolution();