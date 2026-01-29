const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function readFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('\n--- File Content ---');
    console.log(content);
  } catch (err) {
    console.error('Error reading file:', err.message);
  }
}

async function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('File written successfully');
  } catch (err) {
    console.error('Error writing file:', err.message);
  }
}

async function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log('File copied successfully');
  } catch (err) {
    console.error('Error copying file:', err.message);
  }
}

async function deleteFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log('File deleted successfully');
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
}

async function listDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    console.log('\n--- Directory Contents ---');
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      const type = stat.isDirectory() ? '[DIR]' : '[FILE]';
      console.log(`${type} ${file}`);
    });
  } catch (err) {
    console.error('Error listing directory:', err.message);
  }
}

async function showMenu() {
  console.log('\n=== File Manager ===');
  console.log('1. Read file');
  console.log('2. Write file');
  console.log('3. Copy file');
  console.log('4. Delete file');
  console.log('5. List directory');
  console.log('6. Exit');
}

async function main() {
  let running = true;
  
  while (running) {
    await showMenu();
    const choice = await question('Choose an option: ');
    
    switch (choice) {
      case '1': {
        const filePath = await question('Enter file path: ');
        await readFile(filePath);
        break;
      }
      case '2': {
        const filePath = await question('Enter file path: ');
        const content = await question('Enter content: ');
        await writeFile(filePath, content);
        break;
      }
      case '3': {
        const source = await question('Enter source file path: ');
        const dest = await question('Enter destination file path: ');
        await copyFile(source, dest);
        break;
      }
      case '4': {
        const filePath = await question('Enter file path to delete: ');
        await deleteFile(filePath);
        break;
      }
      case '5': {
        const dirPath = await question('Enter directory path: ');
        await listDirectory(dirPath);
        break;
      }
      case '6': {
        running = false;
        console.log('Goodbye!');
        break;
      }
      default:
        console.log('Invalid option');
    }
  }
  
  rl.close();
}

main().catch(console.error);
