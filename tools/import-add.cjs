// Import the user's answer summary without inventing missing questions/options.
const fs=require('fs');
const text=fs.readFileSync('add','utf8'),bank=JSON.parse(fs.readFileSync('data/questions.json'));
const mapping={
1:[1,2,3,54,4,5,6,7,8,51,10,11,12,13,14,52,15,16,17,18,19,20,21,null,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,185,42,186,43,44,45,46],
2:[137,138,null,null,4],
3:[null,null,null,null,null,55,56,57,58,59,null,null,null,null,null,null,null,null,null,null,null,60,61,62,70,71,63,64,65,66,67,80,81,82,83,84,72,73,74,75,76,85,86,87,88,89,187,77,78,79],
4:[137,138,139,140,null,141,142,null,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,null,null,null,null,null,null,162,163,164,165,null,null,null,null,null,166,167,168,169,170],
5:[null,null,null,null,90,91,92,93,94,95,118,119,96,97,98,188,99,100,174,175,101,null,null,104,177,105,106,107,108,178,120,121,122,123,109,110,111,112,113,182,114,115,116,125,126,127,128,129,130]
};
let variant=0;const rows=[];for(const line of text.split(/\r?\n/)){const v=line.match(/^VARIANT (\d)/);if(v){variant=+v[1];continue;}const m=line.match(/^(\d+)\t([^\t]+)\t(.+)$/);if(m&&variant)rows.push({variant,number:+m[1],cue:m[2],rawAnswer:m[3]});}
const cards=[],audit=[];let skipped=0,matched=0;
for(const r of rows){const ref=`Variant ${r.variant}, №${r.number}`;if(/НЕ ПРОВЕРЕНО|не подтвержд|требует фото/i.test(r.rawAnswer)){audit.push({...r,status:'unverified'});skipped++;continue;}
const m=r.rawAnswer.match(/^([A-E]) — (.+)$/);if(!m)throw Error(ref);const answer=m[2],id=(r.variant===2&&r.number===48)?77:mapping[r.variant]?.[r.number-1];if(id){const q=bank.find(x=>x.id===id);if(!q)throw Error('Missing '+id);q.keyReferences=[...new Set([...(q.keyReferences||[]),ref])];audit.push({...r,status:'existing',questionId:id});matched++;continue;}
const alias={"2-24":"add-1-24","5-22":"add-2-22","5-23":"add-2-23"};
let same=cards.find(c=>c.id===alias[`${r.variant}-${r.number}`]);if(same){same.references.push(ref);same.cues.push(r.cue);same.sourceAnswers.push({reference:ref,letter:m[1],answer});audit.push({...r,status:'duplicate-supplement',cardId:same.id});continue;}
const card={id:'add-'+r.variant+'-'+r.number,cue:r.cue,cues:[r.cue],expected:answer,originalLetter:m[1],references:[ref],sourceAnswers:[{reference:ref,letter:m[1],answer}],category:r.number<=15?'Теория':'Ситуации'};cards.push(card);audit.push({...r,status:'new-short-question',cardId:card.id});}
// Explicit source correction: this question is about unidentified tasks, not contract changes.
const budget=bank.find(q=>q.id===137);budget.answer=3;budget.keyNote='Исправлено по add: Variant 4, №1 — The unallocated budget.';
fs.writeFileSync('data/questions.json',JSON.stringify(bank,null,2));fs.writeFileSync('static/questions.js','window.QUESTIONS = '+JSON.stringify(bank)+';\n');
fs.writeFileSync('data/supplement.json',JSON.stringify(cards,null,2));fs.writeFileSync('static/supplement.js','window.SUPPLEMENT = '+JSON.stringify(cards)+';\n');
fs.writeFileSync('data/add-audit.json',JSON.stringify(audit,null,2));fs.copyFileSync('add','static/add-source.txt');
console.log(JSON.stringify({sourceRows:rows.length,matched,unverified:skipped,newShortQuestions:cards.length},null,2));
