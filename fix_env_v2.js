const fs = require('fs');
const path = '.env.local';
if (!fs.existsSync(path)) {
  process.exit(1);
}
let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

let newLines = lines.map(line => {
  let l = line.trim();
  if (l.startsWith('DATABASE_URL=')) {
    // 移除所有引号，转义密码中的 @
    l = l.replace(/DATABASE_URL=["']?/, 'DATABASE_URL=');
    l = l.replace(/["']$/, '');
    // 专门针对 :@qQ 这种格式进行转义
    l = l.replace(/:@/, ':%40');
    return l;
  }
  if (l.startsWith('AUTH_SECRET=')) {
    l = l.replace(/AUTH_SECRET=["']?/, 'AUTH_SECRET=');
    l = l.replace(/["']$/, '');
    return l;
  }
  if (l.startsWith('AUTH_URL=')) {
    l = l.replace(/AUTH_URL=["']?/, 'AUTH_URL=');
    l = l.replace(/["']$/, '');
    l = l.replace('3000', '3001');
    return l;
  }
  return line;
});

// 移除可能存在的重复项
const seen = new Set();
const finalLines = [];
for (const line of newLines) {
  const key = line.split('=')[0];
  if (['DATABASE_URL', 'AUTH_SECRET', 'AUTH_URL'].includes(key)) {
    if (!seen.has(key)) {
      seen.add(key);
      finalLines.push(line);
    }
  } else {
    finalLines.push(line);
  }
}

fs.writeFileSync(path, finalLines.join('\n'));
console.log('Cleaned .env.local');
