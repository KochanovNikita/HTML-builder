const {stdin, stdout} = process;
const fs = require('fs');
const path = require('path');

async function addText(text){
  fs.appendFile(
    path.join(__dirname, 'text.txt'),
    text,
    err => {
      if(err) throw err;
    }
  );
}

stdin.on('data', (data)=>{
  const stringData = data.toString();
  stringData.startsWith('exit') ? process.exit() : addText(stringData);
});

process.on('exit', () => stdout.write('end.'));