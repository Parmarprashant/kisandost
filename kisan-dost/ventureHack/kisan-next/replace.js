const fs = require('fs');
const glob = require('glob'); // wait, glob might not be installed, we can just walk dirs

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = dir + '/' + file;
    try {
      if (fs.statSync(dirFile).isDirectory()) {
        filelist = walkSync(dirFile, filelist);
      } else {
        if(dirFile.endsWith('.ts') || dirFile.endsWith('.tsx')) {
          filelist.push(dirFile);
        }
      }
    } catch (err) {
      if (err.code === 'OOM' || err.code === 'EMFILE') throw err;
    }
  });
  return filelist;
}

const files = walkSync('src');
let changedCount = 0;

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;

  // For API routes
  if(c.includes('@clerk/nextjs/server')) {
    c = c.replace(/import\s+{\s*auth\s*,?\s*currentUser\s*}\s+from\s+["']@clerk\/nextjs\/server["'];?/g, "import { auth, currentUser } from '@/lib/auth';");
    c = c.replace(/import\s+{\s*currentUser\s*,?\s*auth\s*}\s+from\s+["']@clerk\/nextjs\/server["'];?/g, "import { auth, currentUser } from '@/lib/auth';");
    c = c.replace(/import\s+{\s*auth\s*}\s+from\s+["']@clerk\/nextjs\/server["'];?/g, "import { auth } from '@/lib/auth';");
    c = c.replace(/import\s+{\s*currentUser\s*}\s+from\s+["']@clerk\/nextjs\/server["'];?/g, "import { currentUser } from '@/lib/auth';");
    changed = true;
  }
  
  // For other components might still have @clerk/nextjs if not removed by Navbar
  if(c.includes('@clerk/nextjs') && !(f.includes('layout.tsx') || f.includes('Navbar.tsx') || f.includes('auth/page.tsx'))) {
    c = c.replace(/import\s+{\s*(?:useUser|UserButton|useAuth)\s*,?\s*(?:useUser|UserButton|useAuth)?\s*}\s+from\s+["']@clerk\/nextjs["'];?/g, "import { useAuth } from '@/components/providers/AuthProvider';");
    
    // Also naive replacement for usage
    c = c.replace(/useUser\(\)/g, "useAuth()");
    changed = true;
  }

  // Next auth returns an object directly in our implementation, clerk returns async await if in latest. We must ensure `await auth()` works. Our auth() is async, so `await auth()` is perfectly returning `{ userId }` as expected by existing code! 

  if(changed) {
    fs.writeFileSync(f, c);
    console.log('Updated:', f);
    changedCount++;
  }
});

console.log('Changed', changedCount, 'files.');
