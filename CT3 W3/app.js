(()=>{'use strict';
const {Ecology,defaults}=ContourEcology,p={...defaults},$=id=>document.getElementById(id),canvas=$('canvas');
let paused=false,last=0,acc=0,statTime=0,e=null,ctx=null;
const worker=createContourWorker(canvas,p,s=>{window.contourPerformance=s;$('stats').title=`${s.renderer} · ${Math.round(s.fps)} fps · simulation ${s.simMs.toFixed(1)} ms · draw ${s.drawMs.toFixed(1)} ms`;$('stats').textContent=`${s.forms} shapes · ${s.births} births · ${Math.floor(s.time)}s`;},message);
if(worker)worker.send('hidden',{value:document.hidden});
if(!worker){ctx=canvas.getContext('2d',{alpha:false});e=new Ecology(p.seed);e.initialise(p);}
const groups=[['Growth','FLOW',[
['speed','Evolution speed',.1,4,.1],['growth','Growth force',.002,.035,.001],['anisotropy','Anisotropy',-.8,.8,.01],['direction','Direction',0,360,1],['smoothing','Smoothness',0,1,.01]]],['Noise & shape','NOISE',[
['noiseType','Noise type',{simplex3d:'Simplex · Flowing field',simplex2d:'Simplex · 2D',perlin3d:'Perlin · 3D',perlin2d:'Perlin · 2D'}],['noiseamp','Noise influence',0,1.5,.01],['frequency','Noise frequency',.25,12,.05],['roughness','Roughness',0,1,.01],['evolution','Noise evolution',0,1,.01],['offsetx','Offset X',-10,10,.1],['offsety','Offset Y',-10,10,.1],['harmonics','Octaves',0,5,1],['seed','Random seed',0,9999,1]]],['Contact & regrowth','INTERACTION',[
['contact','Contact distance',.003,.01,.0005],['decay','Local decay',.1,2,.01],['spread','Decay spread',0,.6,.01],['birthrate','Germination rate',.1,10,.1],['nesting','Interior seeding',0,1,.01],['seedsize','Seed size',.002,.008,.0005],['birthfade','Emergence time',.5,4,.1],['maxforms','Population limit',40,220,1]]],['Stroke','STROKE',[
['width','Stroke width',.7,3,.1],['widthvar','Width variation',0,1,.01],['penfrequency','Width frequency',1,9,.1],['scar','Decay trace',0,.8,.01]]],['Color & output','PALETTE',[
['paper','Background','color'],['ink','Living lines','color'],['dead','Fading lines','color'],['resolution','Export resolution',384,1536,32]]]];
const fields=new Map(),schema=new Map();
for(const [name,en,items] of groups){const section=document.createElement('details');section.open=en==='FLOW'||en==='NOISE';const summary=document.createElement('summary');summary.innerHTML=`<span>${name}</span>`;section.append(summary);const box=document.createElement('div');box.className='fields';for(const item of items){const [key,label,min,max,step]=item;schema.set(key,item);const row=document.createElement('div');row.className='control';const lab=document.createElement('label');lab.textContent=label;lab.htmlFor=key;row.append(lab);let input,number;
if(typeof min==='object'){input=document.createElement('select');for(const [value,text] of Object.entries(min)){const option=document.createElement('option');option.value=value;option.textContent=text;input.append(option);}}
else if(min==='color'){input=document.createElement('input');input.type='color';}
else{number=document.createElement('input');number.type='number';number.min=min;number.max=max;number.step=step;number.setAttribute('aria-label',label+' value');row.append(number);input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=step;number.addEventListener('input',()=>{if(number.value!==''&&Number.isFinite(number.valueAsNumber))update(key,number.value);});number.addEventListener('change',()=>update(key,number.value));}
input.id=key;input.value=p[key];if(number)number.value=p[key];input.addEventListener('input',()=>update(key,input.value));row.append(input);box.append(row);fields.set(key,{input,number});}section.append(box);$('controls').append(section);}
function validate(key,value){const [,label,min,max,step]=schema.get(key);if(typeof min==='object'){if(!(value in min))throw Error(label+' is invalid');return value;}if(min==='color'){if(!/^#[0-9a-f]{6}$/i.test(value))throw Error(label+' is invalid');return value;}let n=Number(value);if(!Number.isFinite(n))throw Error(label+' is invalid');return Math.max(min,Math.min(max,Math.round(n/step)*step));}
function update(key,value){try{p[key]=validate(key,value);const f=fields.get(key);f.input.value=p[key];if(f.number)f.number.value=Number(p[key].toFixed(5));if(worker)worker.send('settings',{p});else {if(key==='resolution')resize();if(paused)draw();}}catch(err){message(err.message);}}
function sync(){for(const [key,f] of fields){f.input.value=p[key];if(f.number)f.number.value=Number(p[key].toFixed(5));}resize();}
function resize(){if(worker){worker.send('settings',{p});return;}canvas.width=canvas.height=Math.min(p.resolution,768);draw();}
function draw(){if(!worker)e.draw(ctx,canvas.width,p);}
function message(text){$('message').textContent=text;}
$('pause').onclick=()=>{paused=!paused;acc=0;if(worker)worker.send('pause',{value:paused});$('pause').textContent=paused?'Resume':'Pause';$('pause').setAttribute('aria-pressed',String(paused));};
$('restart').onclick=()=>{p.seed=(Math.floor(p.seed)+1)%10000;fields.get('seed').input.value=p.seed;fields.get('seed').number.value=p.seed;if(worker)worker.send('restart',{p});else{e=new Ecology(p.seed);e.initialise(p);acc=0;draw();}message('New ecology. Seed '+p.seed);};
$('reset').onclick=()=>{Object.assign(p,defaults);sync();message('Controls reset. Current shapes preserved.');};
function download(data,name){const a=document.createElement('a');a.href=data;a.download=name;a.click();}
$('export').onclick=async()=>{try{if(worker){const blob=await worker.request('export');const url=URL.createObjectURL(blob);download(url,'living-contours.png');setTimeout(()=>URL.revokeObjectURL(url),1000);}else{const out=document.createElement('canvas');out.width=out.height=p.resolution;e.draw(out.getContext('2d'),p.resolution,p);download(out.toDataURL('image/png'),'living-contours.png');}message('Image saved.');}catch(err){message(err.message);}};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').requestFullscreen();}catch{message('Fullscreen is unavailable in this browser.');}};
document.addEventListener('visibilitychange',()=>{last=0;acc=0;if(worker)worker.send('hidden',{value:document.hidden});});
function frame(now){if(!last)last=now;const dt=Math.min((now-last)/1000,.06);last=now;if(!paused&&!document.hidden){acc+=dt*p.speed;let steps=0;while(acc>=.025&&steps<3){e.step(.025,p);acc-=.025;steps++;}acc=Math.min(acc,.075);draw();}if(now-statTime>500){$('stats').textContent=`${e.forms.length} shapes · ${e.births} births · ${Math.floor(e.elapsed)}s`;statTime=now;}requestAnimationFrame(frame);}
resize();if(!worker)requestAnimationFrame(frame);
// Read-only diagnostics for local validation.
window.contourStatus=()=>({worker:!!worker,paused,parameters:{...p}});
})();