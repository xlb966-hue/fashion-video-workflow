const $=id=>document.getElementById(id);
const images={};let plan=null,busy=false;
const error=message=>{$('error').textContent=message;};
async function setImage(key,file){
 if(busy)return;
 if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))return error('请选择 JPG、PNG 或 WebP 图片');
 if(file.size>5*1024*1024)return error('每张图片不能超过 5 MB');
 try{
 const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
 await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=data;});
 images[key]=data;const zone=$(key+'-zone');zone.querySelector('img').src=data;zone.querySelector('img').hidden=false;zone.querySelector('.placeholder').hidden=true;document.querySelector(`[data-remove="${key}"]`).hidden=false;$(key).required=false;error('');
 }catch{error('图片无法读取，请选择其他图片');}
}
for(const key of ['clothing','face']){
 $(key).addEventListener('change',e=>setImage(key,e.target.files[0]));
 const zone=$(key+'-zone');zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag');});zone.addEventListener('dragleave',()=>zone.classList.remove('drag'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('drag');setImage(key,e.dataTransfer.files[0]);});
 document.querySelector(`[data-remove="${key}"]`).onclick=()=>{delete images[key];$(key).value='';$(key).required=true;zone.querySelector('img').hidden=true;zone.querySelector('img').removeAttribute('src');zone.querySelector('.placeholder').hidden=false;document.querySelector(`[data-remove="${key}"]`).hidden=true;};
}
function field(label,value,onChange){const wrap=document.createElement('label');wrap.textContent=label;const area=document.createElement('textarea');area.value=value;area.addEventListener('input',()=>onChange(area.value));wrap.append(area);return wrap;}
function render(mode){
 $('empty').hidden=true;$('results').hidden=false;$('result-tag').textContent=mode==='ai'?'AI 生成 · 可编辑':'模板草案 · 可编辑';$('result-notice').textContent=mode==='ai'?'已根据参考图整理，请核对细节并按需修改。':'当前为模板模式，尚未识别图片内容。请补充人物与服装细节，或配置 AI 服务后重新生成。';
 $('settings').replaceChildren();for(const [key,label] of [['character','人物设定'],['clothing','服装细节'],['scene','场景与氛围']]){const div=document.createElement('div');div.className='setting';div.append(field(label,plan[key],v=>plan[key]=v));$('settings').append(div);}
 $('shots').replaceChildren();plan.shots.forEach((shot,index)=>{const card=document.createElement('article');card.className='shot';const head=document.createElement('div');head.className='shot-head';const number=document.createElement('b');number.textContent=String(index+1).padStart(2,'0');const title=document.createElement('input');title.value=shot.title;title.setAttribute('aria-label',`分镜 ${index+1} 标题`);title.oninput=()=>shot.title=title.value;head.append(number,title);card.append(head);for(const [key,label] of [['time','时间区间'],['camera','景别与运镜'],['action','画面与动作'],['prompt','视频生成提示词']])card.append(field(label,shot[key],v=>shot[key]=v));$('shots').append(card);});
}
$('form').addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;if(!images.clothing||!images.face)return error('请先上传服装和人物脸部参考图');busy=true;error('');$('generate').disabled=true;$('generate').textContent='✧ 正在整理创作方案…';
 for(const control of $('form').elements)control.disabled=true;
 try{const input={...images};for(const key of ['style','scene','ratio','duration','brief'])input[key]=$(key).value;const res=await fetch('/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const data=await res.json();if(!res.ok)throw new Error(data.error);plan=data.plan;render(data.mode);}catch(e){error(e.message||'生成失败，请重试');}finally{busy=false;for(const control of $('form').elements)control.disabled=false;$('generate').innerHTML='✧ &nbsp; 生成创作方案 <span>→</span>';}
});
$('export').onclick=()=>{if(!plan)return;const url=URL.createObjectURL(new Blob([JSON.stringify(plan,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='织映-视频创作方案.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
fetch('/api/status').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>$('mode').textContent=data.mode==='ai'?'✧ AI 图片分析已就绪 · 生成时分析两张参考图':'◇ 模板模式 · 配置服务端 AI 密钥后启用图片分析').catch(()=>$('mode').textContent='服务连接失败，请刷新页面重试');
