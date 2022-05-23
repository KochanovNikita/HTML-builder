const {stdout} = process;
const {readdir} = require('fs/promises');
const {stat, rmdir, mkdir, unlink} = require('fs');
const {copyFile} = require('node:fs/promises');
const path = require('path');
const pathToFolderCopy = path.join(__dirname, 'copy folder');
const pathToFolderOrigin = path.join(__dirname, 'files');

async function copyFolder(){
  try{
    const folder = await readdir(pathToFolderOrigin, {withFileTypes: true});
    for(const file of folder){
      copyFile(pathToFolderOrigin + `\\${file.name}`, pathToFolderCopy + `\\${file.name}`);
    }
  }catch(err){
    stdout.write('не копирует\n');
    stdout.write(err);
  }
}

function createFolder(){
  mkdir(pathToFolderCopy, (err) => {
    if(err){
      stdout.write('не создал');
    }
    copyFolder();
  });
}

function removeFolder(){
  rmdir(pathToFolderCopy, (err)=>{
    if(err){
      stdout.write('не удалил\n');
    }else{
      createFolder();
    }
  });
}

async function removeAllFilesinFolder(){
  const files = await readdir(pathToFolderCopy, {withFileTypes: true});
  for (const file of files){
    unlink((pathToFolderCopy + '\\' + file.name), err =>{
      if(err) stdout.write('не удаляет файл ' + file.name + '\n');
    });
  }
  removeFolder();
}

async function folderExists(){
  stat(pathToFolderCopy, (err, stats) => {
    if(err){
      createFolder();
    }else{
      if(stats.isDirectory()){
        removeAllFilesinFolder();
      }else{
        createFolder();
      }
    }
  });
}

folderExists();
