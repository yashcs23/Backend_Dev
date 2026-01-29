const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileSyncTool {
  constructor(sourceDir, targetDir) {
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
    this.syncStats = {
      copied: 0,
      deleted: 0,
      skipped: 0,
      errors: []
    };
  }

  getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  syncFiles() {
    try {
      if (!fs.existsSync(this.sourceDir)) {
        throw new Error(`Source directory not found: ${this.sourceDir}`);
      }

      this.ensureDirectoryExists(this.targetDir);

      const sourceFiles = this.getAllFiles(this.sourceDir);
      const targetFiles = this.getAllFiles(this.targetDir);

      sourceFiles.forEach(relPath => {
        const sourcePath = path.join(this.sourceDir, relPath);
        const targetPath = path.join(this.targetDir, relPath);

        try {
          if (!fs.existsSync(targetPath)) {
            this.copyFileWithDirectory(sourcePath, targetPath);
            this.syncStats.copied++;
          } else {
            const sourceHash = this.getFileHash(sourcePath);
            const targetHash = this.getFileHash(targetPath);
            
            if (sourceHash !== targetHash) {
              fs.copyFileSync(sourcePath, targetPath);
              this.syncStats.copied++;
            } else {
              this.syncStats.skipped++;
            }
          }
        } catch (err) {
          this.syncStats.errors.push(`Error syncing ${relPath}: ${err.message}`);
        }
      });

      targetFiles.forEach(relPath => {
        const sourcePath = path.join(this.sourceDir, relPath);
        const targetPath = path.join(this.targetDir, relPath);

        if (!fs.existsSync(sourcePath)) {
          try {
            fs.unlinkSync(targetPath);
            this.syncStats.deleted++;
          } catch (err) {
            this.syncStats.errors.push(`Error deleting ${relPath}: ${err.message}`);
          }
        }
      });

    } catch (err) {
      this.syncStats.errors.push(`Critical error: ${err.message}`);
    }
  }

  getAllFiles(dirPath) {
    let files = [];

    const walkDir = (currentPath, baseDir) => {
      fs.readdirSync(currentPath).forEach(file => {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile()) {
          const relPath = path.relative(baseDir, fullPath);
          files.push(relPath);
        } else if (stat.isDirectory()) {
          walkDir(fullPath, baseDir);
        }
      });
    };

    walkDir(dirPath, dirPath);
    return files;
  }

  copyFileWithDirectory(sourcePath, targetPath) {
    const targetDir = path.dirname(targetPath);
    this.ensureDirectoryExists(targetDir);
    fs.copyFileSync(sourcePath, targetPath);
  }

  printReport() {
    console.log('\n=== Sync Report ===');
    console.log(`Files Copied: ${this.syncStats.copied}`);
    console.log(`Files Deleted: ${this.syncStats.deleted}`);
    console.log(`Files Skipped: ${this.syncStats.skipped}`);
    
    if (this.syncStats.errors.length > 0) {
      console.log('\n--- Errors ---');
      this.syncStats.errors.forEach(err => console.log(`• ${err}`));
    }
  }
}

async function main() {
  const source = process.argv[2];
  const target = process.argv[3];

  if (!source || !target) {
    console.error('Usage: node file-sync.js <source-dir> <target-dir>');
    process.exit(1);
  }

  console.log(`Syncing from ${source} to ${target}...`);
  
  const syncer = new FileSyncTool(source, target);
  syncer.syncFiles();
  syncer.printReport();
}

main().catch(console.error);
