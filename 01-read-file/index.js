const fs = require('fs');
const path = require('path');
const {stdout} = require('process');
const fileStream = fs.createReadStream(path.join(__dirname, 'text.txt'), 'utf-8');
fileStream.on('data', data => stdout.write(data));
fileStream.on('error', error => stdout.write(error.toString()));