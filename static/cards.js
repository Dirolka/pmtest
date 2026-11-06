'use strict';
const el=id=>document.getElementById(id),cards=window.SUPPLEMENT,storageKey='pm-add-cards-v1';
let saved={};try{const parsed=JSON.parse(localStorage.getItem(storageKey));if(parsed&&typeof parsed==='object')saved=parsed;}catch{}
let visible=[],index=0;
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}}
function state(c){return saved[c.id]||{};}
function select(){const category=el('card-category').value,variant=el('card-variant').value;visible=cards.filter(c=>(category==='all'||(category==='mistakes'?state(c).correct!==true:c.category===category))&&(variant==='all'||c.references.some(r=>r.startsWith(`Variant ${variant},`))));index=0;render();}
function render(){const c=visible[index],done=cards.filter(c=>typeof state(c).correct==='boolean').length,right=cards.filter(c=>state(c).correct===true).length;el('card-progress').textContent=`В дополнении: ${cards.length} · проверено: ${done} · верно: ${right} · осталось без оценки: ${cards.length-done}`;el('card-bar').style.width=100*done/Math.max(cards.length,1)+'%';el('card-position').textContent=c?`КАРТОЧКА ${index+1} / ${visible.length}`:'НЕТ ВОПРОСОВ';el('card-cue').textContent=c?c.cue:'В этом фильтре нет вопросов. Выберите другой раздел.';el('card-reference').textContent=c?c.references.join(' · '):'';el('card-category-label').textContent=c?c.category:'';el('card-input').value=c?(state(c).draft||''):'';el('card-input').disabled=!c;el('card-reveal').disabled=!c;el('card-answer').hidden=!c||!state(c).revealed;el('card-expected').textContent=c?`${c.expected} (${c.sourceAnswers.map(a=>a.reference+': '+a.letter).join('; ')})`:'';el('card-status').textContent=!c?'':state(c).correct===true?'✓ Отмечено: ответил верно':state(c).correct===false?'↻ Отмечено: нужно повторить':'';el('card-prev').disabled=index===0;el('card-next').disabled=!c||index===visible.length-1;}
function update(patch){const c=visible[index];if(!c)return;saved[c.id]={...state(c),...patch};persist();}
el('card-input').oninput=()=>update({draft:el('card-input').value});
el('card-reveal').onclick=()=>{update({revealed:true});render();};
el('card-right').onclick=()=>{update({correct:true});render();};
el('card-wrong').onclick=()=>{update({correct:false});render();};
el('card-prev').onclick=()=>{if(index>0){index--;render();}};
el('card-next').onclick=()=>{if(index<visible.length-1){index++;render();}};
el('card-category').onchange=select;el('card-variant').onchange=select;
el('card-shuffle').onclick=()=>{for(let i=visible.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[visible[i],visible[j]]=[visible[j],visible[i]];}index=0;render();};
el('card-reset').onclick=()=>{saved={};persist();select();};
select();
