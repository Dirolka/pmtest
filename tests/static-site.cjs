const fs=require('fs'),assert=require('assert');
// Validate assets and navigation for local files and a GitHub Pages project subpath.
for(const page of ['index.html','supplement.html','static/index.html','static/supplement.html']){
 const html=fs.readFileSync(page,'utf8');
 for(const [,attr,ref] of html.matchAll(/\b(href|src)="([^"]+)"/g)){
  if(ref.startsWith('#')||/^https?:/.test(ref))continue;
  assert(!ref.startsWith('/'),`Absolute path in ${page}: ${ref}`);
  for(const base of ['file:///site/','https://example.github.io/pmtest/']){
   const url=new URL(ref,new URL(page,base));assert(url.href.startsWith(base),`Escapes project: ${url}`);
   const relative=decodeURIComponent(url.href.slice(base.length));assert(fs.existsSync(relative),`Missing ${attr}: ${relative}`);
  }
 }
}
assert(fs.existsSync('.nojekyll'));
const app=fs.readFileSync('static/app.js','utf8');assert(!app.includes("'/picture/"));assert(!app.includes('`/picture/'));
const questions=JSON.parse(fs.readFileSync('data/questions.json'));assert.equal(questions.length,164);
assert.equal(JSON.parse(fs.readFileSync('data/supplement.json')).length,77);
console.log('PASS: HTML entry points, file:// links, GitHub Pages subpath, assets and question banks.');
