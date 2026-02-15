const fs = require('fs');
const path = '.env.local';
if (!fs.existsSync(path)) {
  console.error('.env.local not found');
  process.exit(1);
}
let content = fs.readFileSync(path, 'utf8');

// Fix DATABASE_URL password @ -> %40
// Look for :password@host and replace with :password%40host
// Based on the user's provided string: :@qQ1748373939@
content = content.replace(/:@/g, ':%40');

// Fix AUTH_SECRET quotes
content = content.replace(/AUTH_SECRET=["']?([^"'\n]*)["']?/g, 'AUTH_SECRET=$1');

// Fix AUTH_URL port
content = content.replace(/localhost:3000/g, 'localhost:3001');
content = content.replace(/AUTH_URL=["']?([^"'\n]*)["']?/g, 'AUTH_URL=$1');

fs.writeFileSync(path, content);
console.log('Successfully updated .env.local');
