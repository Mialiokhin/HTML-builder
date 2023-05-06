const fs = require('fs');
const readline = require('readline');
const path = require('path');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
fs.writeFile(
  path.join(__dirname, 'output.txt'),
  '',
  (err) => {
    if (err) throw err;
    console.log('Hello! You can write smts to txt file right now.');
  }
);
rl.on('line', (input) => {
  if (input.toLowerCase().trim() === 'exit') {
    console.log('Goodbye!');
    process.exit(0);
  }
  fs.appendFile(
    path.join(__dirname, 'output.txt'),
    `${input}\n`,
    err => {
      if (err) throw err;
    }
  );

});

rl.on('SIGINT', () => {
  console.log('Goodbye!');
  process.exit(0);
});

