const path = require('path');
const {stat, mkdir, unlink, ReadStream} = require('fs');
const {readdir, appendFile} = require('fs/promises');
const {createReadStream} = require('node:fs');
const {copyFile} = require('node:fs/promises');
const {stdout} = process;
const componentsPath = path.join(__dirname, 'components');
const distPath = path.join(__dirname, 'project-dist');
const assetsPath = path.join(__dirname, 'assets');

async function replaceElement(template){
  const files = await readdir(componentsPath, {withFileTypes: true});
  for(const file of files){
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

async function copyFolder(pathToDir){
  try{
    const folder = await readdir(pathToDir, {withFileTypes: true});
    for(const file of folder){
      if(file.isDirectory()){
        createFolder(pathToDir.replace('assets', 'project-dist\\assets') + `\\${file.name}`, pathToDir + `\\${file.name}`);
        copyFolder(pathToDir + `\\${file.name}`);
      }else if(file.isFile()){
        copyFile(pathToDir + `\\${file.name}`, pathToDir.replace('assets', 'project-dist\\assets')  + `\\${file.name}`);
      }
    }
  }catch(err){
    stdout.write('не копирует\n');
    console.log(err);
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

async function removeAllFilesinFolder(folderpath){
  const files = await readdir(folderpath, {withFileTypes: true});
  for (const file of files){
    if(file.isDirectory()){
      removeAllFilesinFolder(folderpath+`\\${file.name}`);
    }else if(file.isFile()){
      unlink((folderpath + '\\' + file.name), err =>{
        if(err) stdout.write('не удаляет файл ' + file.name + '\n');
      });
    }
  }
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
        removeAllFilesinFolder(distPath);
        copyFolder(assetsPath);
        createIndexHTML();
      }else{
        createFolder(distPath, assetsPath);
        createFolder(distPath+'\\assets');
        createIndexHTML();
      }
    }
  });
}

createSolution();