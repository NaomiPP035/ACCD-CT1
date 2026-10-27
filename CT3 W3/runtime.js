/* Keep both simulation and rendering off the UI thread. Blob worker also works on file://. */
function createContourWorker(canvas,parameters,onStats,onError){
 if(!canvas.transferControlToOffscreen||!window.Worker)return null;
 const source=`'use strict';const TAU=Math.PI*2,N=80,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));const defaults=${JSON.stringify(ContourEcology.defaults)};const Ecology=${ContourEcology.Ecology.toString()};const ContourGPU=${ContourGPU.toString()};
 let canvas,ctx,gpu,e,p,paused=false,hidden=false,last=0,acc=0,lastStats=0,previewSize=768,dirty=false;
 function draw(){if(gpu&&e)gpu.draw(e,p);else if(ctx&&e)e.draw(ctx,canvas.width,p);}
 function size(){if(canvas.width!==previewSize)canvas.width=canvas.height=previewSize;}
 let frames=0,frameMs=0,simMs=0,drawMs=0;
 function loop(){const start=performance.now(),elapsed=Math.min((start-last)/1000,.05);if(e&&!paused&&!hidden){const t=performance.now();e.step(Math.min(elapsed*p.speed,.05),p);simMs=performance.now()-t;dirty=true;}if(dirty&&!hidden){const t=performance.now();draw();drawMs=performance.now()-t;dirty=false;frames++;}last=start;frameMs=performance.now()-start;if(e&&start-lastStats>500){postMessage({stats:{forms:e.forms.length,births:e.births,time:e.elapsed,fps:frames*1000/(start-lastStats),simMs,drawMs,renderer:gpu?'WebGL2':'Canvas2D'}});lastStats=start;frames=0;}setTimeout(loop,Math.max(0,16.667-(performance.now()-start)));}
 onmessage=async({data:m})=>{try{let result;switch(m.type){
 case 'init':canvas=m.canvas;try{gpu=new ContourGPU(canvas);}catch(err){ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw err;}p=m.p;e=new Ecology(p.seed);e.initialise(p);size();draw();last=performance.now();loop();break;
 case 'settings':p=m.p;dirty=true;break;
 case 'pause':paused=m.value;acc=0;last=performance.now();break;
 case 'hidden':hidden=m.value;acc=0;last=performance.now();break;
 case 'restart':p=m.p;e=new Ecology(p.seed);e.initialise(p);acc=0;draw();break;
 case 'save':result=e.snapshot();break;
 case 'load':{const next=new Ecology(m.p.seed);next.restore(m.state);e=next;p=m.p;acc=0;draw();break;}
 case 'export':{const out=new OffscreenCanvas(p.resolution,p.resolution);e.draw(out.getContext('2d',{alpha:false}),p.resolution,p);result=await out.convertToBlob({type:'image/png'});break;}
 }if(m.id)postMessage({id:m.id,result});}catch(err){postMessage({id:m.id,error:err.message});}};`;
 const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));const worker=new Worker(url);URL.revokeObjectURL(url);let id=0;const pending=new Map();
 worker.onmessage=({data:m})=>{if(m.stats)onStats(m.stats);if(m.id){const item=pending.get(m.id);if(item){pending.delete(m.id);m.error?item.reject(Error(m.error)):item.resolve(m.result);}}else if(m.error)onError(m.error);};
 worker.onerror=err=>{onError('Renderer error: '+err.message);for(const item of pending.values())item.reject(Error('Renderer unavailable'));pending.clear();};
 const offscreen=canvas.transferControlToOffscreen();worker.postMessage({type:'init',canvas:offscreen,p:parameters},[offscreen]);
 return{send(type,extra={}){worker.postMessage({type,...extra});},request(type,extra={}){return new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});worker.postMessage({type,id:key,...extra});});}};
}
