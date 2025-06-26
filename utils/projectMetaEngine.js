// utils/projectMetaEngine.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Meta directory in the project root
const META_DIR = path.resolve(__dirname, '../.meta_dev');
const INDEX_JSON = path.join(META_DIR, 'project.index.json');
const INDEX_TXT = path.join(META_DIR, 'project.index.txt');
const TODO_TXT = path.join(META_DIR, 'project.todo.txt');

// Text file extensions to process
const TEXT_FILE_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.json', 
  '.html', '.css', '.scss', '.md', '.txt',
  '.py', '.rb', '.java', '.c', '.cpp', '.h',
  '.php', '.sh', '.bash', '.zsh', '.yml', '.yaml',
  '.xml', '.csv', '.sql'
]);

// Function to check if file is binary
function isBinaryFile(filePath) {
  try {
    const output = execSync(`file -b --mime-encoding "${filePath}"`).toString().trim();
    return output === 'binary';
  } catch (err) {
    // If 'file' command fails, fall back to extension check
    const ext = path.extname(filePath).toLowerCase();
    return !TEXT_FILE_EXTENSIONS.has(ext);
  }
}

function ensureMetaDirExists() {
  if (!fs.existsSync(META_DIR)) {
    fs.mkdirSync(META_DIR, { recursive: true });
  }
}

function analyzeFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const modified = new Date(stats.mtime).toISOString();
    
    if (isBinaryFile(filePath)) {
      return {
        size: `${size} B`,
        modified,
        status: 'binary',
        summary: '[BINARY FILE - NOT PROCESSED]'
      };
    }

    const status = size === 0 ? 'empty' : 'complete';
    let summary = '';

    if (size > 0) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').slice(0, 5);
      for (const line of lines) {
        if (line.includes('//') || line.includes('#') || line.includes('/*')) {
          summary = line.replace(/\/\/|\/\*|#/g, '').trim();
          break;
        }
      }
    }

    return {
      size: `${size} B`,
      modified,
      status,
      summary
    };
  } catch (err) {
    return { 
      error: err.message,
      status: 'error'
    };
  }
}

function runProjectMetaEngine() {
  ensureMetaDirExists();

  const ROOT_DIR = path.resolve('./');
  const projectIndex = {};
  const todoList = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(ROOT_DIR, fullPath);

      // Skip these directories
      if (entry.isDirectory() && (
        entry.name === 'node_modules' || 
        entry.name === '.meta_dev' ||
        entry.name.startsWith('.')
      )) {
        continue;
      }

      const relDir = path.relative(ROOT_DIR, dir);

      if (!projectIndex[relDir]) {
        projectIndex[relDir] = { files: {}, status: 'unknown' };
      }

      if (entry.isFile()) {
        const fileInfo = analyzeFile(fullPath);
        projectIndex[relDir].files[entry.name] = fileInfo;
        
        if (fileInfo.status === 'empty') {
          projectIndex[relDir].status = 'incomplete';
          todoList.push(`${relPath} — ${fileInfo.status}`);
        }
      } else if (entry.isDirectory()) {
        walk(fullPath);
      }
    }
  }

  walk(ROOT_DIR);

  // Final status pass
  for (const folder in projectIndex) {
    if (projectIndex[folder].status !== 'incomplete') {
      projectIndex[folder].status = 'complete';
    }
  }

  // Write output files
  fs.writeFileSync(INDEX_JSON, JSON.stringify(projectIndex, null, 2), 'utf-8');

  let indexTxt = 'PROJECT INDEX\n=============\n';
  for (const folder in projectIndex) {
    indexTxt += `\n📁 ${folder} [${projectIndex[folder].status}]\n`;
    for (const [fname, meta] of Object.entries(projectIndex[folder].files)) {
      indexTxt += `  └── ${fname} (${meta.size}, ${meta.status})`;
      if (meta.summary) indexTxt += ` — ${meta.summary}`;
      indexTxt += '\n';
    }
  }
  fs.writeFileSync(INDEX_TXT, indexTxt, 'utf-8');

  const todoTxt = todoList.length > 0 
    ? ['TO-DO LIST\n=========='].concat(todoList.map(item => `- ${item}`)).join('\n')
    : 'TO-DO LIST\n==========\n- No empty files found!';
  fs.writeFileSync(TODO_TXT, todoTxt, 'utf-8');

  console.log('✅ Project metadata generated:');
  console.log(`- ${path.relative(ROOT_DIR, INDEX_JSON)}`);
  console.log(`- ${path.relative(ROOT_DIR, INDEX_TXT)}`);
  console.log(`- ${path.relative(ROOT_DIR, TODO_TXT)}`);
}

module.exports = runProjectMetaEngine;