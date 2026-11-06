const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Element{constructor(){this.children=[];this.hidden=false;this.value='';this.checked=false;this.style={};this.attributes={};this.classList={add:()=>{}};}replaceChildren(...xs){this.children=xs;}append(...xs){this.children.push(...xs);}setAttribute(k,v){this.attributes[k]=v;}click(){this.onclick?.();}}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};const stored=new Map();
get('category').value='all';get('count').value='20';get('training').checked=true;
const context={window:{QUESTIONS:JSON.parse(fs.readFileSync('data/questions.json')),scrollTo:()=>{}},document:{getElementById:get,createElement:()=>new Element()},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},console,URL,Blob,setTimeout};
vm.createContext(context);vm.runInContext(fs.readFileSync('static/app.js','utf8'),context);
get('start').click();assert.equal(get('options').children.length,5);assert.equal(get('nav').children.length,20);
get('options').children[0].click();assert.equal(get('feedback').hidden,false);assert.match(get('answered').textContent,/1 из 20/);get('next').click();assert.match(get('position').textContent,/2 \/ 20/);get('prev').click();assert.equal(get('options').children[0].attributes['aria-pressed'],'true');
get('home-btn').click();assert.equal(get('resume').hidden,false);get('resume').click();assert.equal(get('options').children[0].attributes['aria-pressed'],'true');
get('finish').click();assert.equal(get('result').hidden,false);assert.equal(get('review').children.length,20);assert.match(get('summary').textContent,/пропущено: 19/);get('retry').click();assert.equal(get('quiz').hidden,false);assert.equal(get('nav').children.length,19);
get('home-btn').click();get('category').value='Теория';get('count').value='all';get('training').checked=false;get('start').click();assert.equal(get('kind').textContent,'Теория');get('options').children[0].click();assert.equal(get('feedback').hidden,true);
get('home-btn').click();get('gallery-link').onclick({preventDefault(){}});assert.equal(get('gallery-items').children.length,79);
console.log('PASS: answer selection, navigation, saved progress, scoring, skipped answers, retry, category filter, exam mode, gallery.');
