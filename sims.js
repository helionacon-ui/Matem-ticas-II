/* Figuras interactivas de Matemáticas II. Vanilla JS + canvas. */
(function(){
const C = {};
function paleta(el){const cs=getComputedStyle(el);const v=n=>cs.getPropertyValue(n).trim();
  C.bg=v('--surface')||'#fff';C.grid=v('--line')||'#d5dcd9';C.text=v('--fg')||'#16211d';C.muted=v('--muted')||'#56635e';
  C.a=v('--tc')||v('--accent')||'#b4232f';C.b=v('--warn')||'#b8730c';C.c=v('--c6')||'#2c8a52';C.d=v('--c5')||'#c43d63';C.e=v('--c4')||'#b8730c';C.f=v('--c2')||'#3a63c4';}
const F=n=>Number.isInteger(n)?String(n):(Math.abs(n)<1e-9?'0':n.toFixed(2).replace('.',','));

function build(el, spec){
  el.classList.add('sim-box');paleta(el);
  const ctrls=document.createElement('div'); ctrls.className='ctrl sim-ctrls';
  const cv=document.createElement('canvas'); cv.width=spec.w||640; cv.height=spec.h||360; cv.className='sim-cv';
  const out=document.createElement('div'); out.className='readout sim-out';
  el.append(ctrls,cv,out);
  const st={};
  (spec.sliders||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=`${s.l}: ${F(s.v)} ${s.u||''}`;
    const inp=document.createElement('input');inp.type='range';inp.min=s.min;inp.max=s.max;inp.step=s.step||0.01;inp.value=s.v;
    inp.oninput=()=>{st[s.k]=parseFloat(inp.value);sp.textContent=`${s.l}: ${F(st[s.k])} ${s.u||''}`;draw();};lab.append(sp,inp);ctrls.append(lab);});
  (spec.selects||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=s.l;
    const sel=document.createElement('select');s.opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[0]===s.v)op.selected=true;sel.append(op);});
    sel.onchange=()=>{st[s.k]=sel.value;draw();};lab.append(sp,sel);ctrls.append(lab);});
  const g=cv.getContext('2d');
  const api={st,cv,g,out,W:cv.width,H:cv.height,
    clear(){paleta(el);g.fillStyle=C.bg;g.fillRect(0,0,cv.width,cv.height);},
    txt(s,x,y,col,sz,al){g.fillStyle=col||C.text;g.font=(sz||13)+'px system-ui';g.textAlign=al||'left';g.fillText(s,x,y);},
    arrow(x1,y1,x2,y2,col,wd){g.strokeStyle=g.fillStyle=col;g.lineWidth=wd||2.5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),L=10;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4));g.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4));g.closePath();g.fill();},
    line(x1,y1,x2,y2,col,wd,dash){g.strokeStyle=col;g.lineWidth=wd||1.5;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);},
    circ(x,y,r,col,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=col;g.fill();}else{g.strokeStyle=col;g.lineWidth=2;g.stroke();}},
    html(h){out.innerHTML=h;},
    // sistema de ejes cartesiano
    axes(cx,cy,u,xmin,xmax,ymin,ymax){for(let i=Math.ceil(xmin);i<=xmax;i++)api.line(cx+i*u,cy-ymax*u,cx+i*u,cy-ymin*u,C.grid,1);for(let j=Math.ceil(ymin);j<=ymax;j++)api.line(cx+xmin*u,cy-j*u,cx+xmax*u,cy-j*u,C.grid,1);api.line(cx+xmin*u,cy,cx+xmax*u,cy,C.muted,1.5);api.line(cx,cy-ymax*u,cx,cy-ymin*u,C.muted,1.5);}
  };
  function draw(){spec.draw(api);}
  draw(); return api;
}
const SIMS={};

/* ---- Matemáticas II: figuras interactivas ---- */
const N2=x=>(Math.abs(x)<1e-10?0:x).toFixed(2).replace('.',',');
const N3=x=>(Math.abs(x)<1e-10?0:x).toFixed(3).replace('.',',');
const N4=x=>(Math.abs(x)<1e-10?0:x).toFixed(4).replace('.',',');
const Eje=(a,x0,y0,w,h,xlab,ylab)=>{a.line(x0,y0,x0+w,y0,C.muted,1.5);a.line(x0,y0,x0,y0-h,C.muted,1.5);
  if(xlab)a.txt(xlab,x0+w/2,y0+30,C.muted,12,'center');if(ylab)a.txt(ylab,x0-6,y0-h-10,C.muted,12);};
const simpson=(f,a,b,n)=>{n=2*Math.ceil(n/2);const h=(b-a)/n;let s=f(a)+f(b);
  for(let i=1;i<n;i++)s+=f(a+i*h)*(i%2?4:2);return s*h/3;};

/* T1 · Sumas de Riemann e integral definida */
SIMS.riemann=el=>build(el,{w:660,h:400,
 selects:[{k:'f',v:'x2',l:'función',opts:[['x2','f(x) = x²'],['sen','f(x) = sen x + 1'],['exp','f(x) = e^(−x²)'],['rac','f(x) = 1/(x²−4x+8)'],['raiz','f(x) = √x']]},
  {k:'m',v:'inf',l:'aproximación',opts:[['inf','sumas inferiores'],['sup','sumas superiores'],['med','punto medio'],['trap','trapecios']]}],
 sliders:[{k:'n',v:8,min:1,max:80,step:1,l:'número de subintervalos n',u:''},{k:'a',v:0,min:-2,max:2,step:0.1,l:'extremo a',u:''},{k:'b',v:2,min:0.5,max:5,step:0.1,l:'extremo b',u:''}],
 draw(a){a.clear();
  const F={x2:[x=>x*x,'x²'],sen:[x=>Math.sin(x)+1,'sen x + 1'],exp:[x=>Math.exp(-x*x),'e^(−x²)'],
   rac:[x=>1/(x*x-4*x+8),'1/(x²−4x+8)'],raiz:[x=>Math.sqrt(Math.max(0,x)),'√x']};
  const f=F[a.st.f][0],nom=F[a.st.f][1];
  const A=Math.min(a.st.a,a.st.b-0.2),B=Math.max(a.st.b,a.st.a+0.2),n=Math.round(a.st.n);
  const h=(B-A)/n;
  const exacta=simpson(f,A,B,2000);
  let S=0;const rect=[];
  for(let i=0;i<n;i++){const x1=A+i*h,x2=x1+h;
    let y;
    if(a.st.m==='med')y=f((x1+x2)/2);
    else if(a.st.m==='trap')y=(f(x1)+f(x2))/2;
    else {let mn=Infinity,mx=-Infinity;for(let k=0;k<=20;k++){const v=f(x1+h*k/20);mn=Math.min(mn,v);mx=Math.max(mx,v);}
      y=a.st.m==='inf'?mn:mx;}
    S+=y*h;rect.push([x1,x2,y]);}
  const x0=70,y0=330,wv=540,hv=250;
  let lo=0,hi=0;for(let i=0;i<=100;i++){const v=f(A+(B-A)*i/100);lo=Math.min(lo,v);hi=Math.max(hi,v);}
  hi=Math.max(hi*1.15,0.3);lo=Math.min(lo*1.15,0);
  const px=x=>x0+(x-A)/(B-A)*wv, py=y=>y0-(y-lo)/(hi-lo)*hv;
  Eje(a,x0,py(0),wv,0,'x','');
  a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  rect.forEach(r=>{a.g.fillStyle=C.a;a.g.globalAlpha=0.28;a.g.fillRect(px(r[0]),py(Math.max(r[2],0)),px(r[1])-px(r[0]),Math.abs(py(r[2])-py(0)));a.g.globalAlpha=1;
    a.g.strokeStyle=C.a;a.g.lineWidth=1;a.g.strokeRect(px(r[0]),py(Math.max(r[2],0)),px(r[1])-px(r[0]),Math.abs(py(r[2])-py(0)));});
  a.g.strokeStyle=C.text;a.g.lineWidth=2.8;a.g.beginPath();
  for(let i=0;i<=400;i++){const x=A+(B-A)*i/400;i===0?a.g.moveTo(px(x),py(f(x))):a.g.lineTo(px(x),py(f(x)));}a.g.stroke();
  [A,(A+B)/2,B].forEach(v=>a.txt(N2(v),px(v),py(0)+16,C.muted,11,'center'));
  a.txt('f(x) = '+nom,x0+6,y0-hv+14,C.text,14);
  const err=Math.abs(S-exacta);
  a.html(`<b>∫</b> de ${N2(A)} a ${N2(B)} de <b>${nom}</b> dx<br>
  Aproximación con <b>n = ${n}</b> (${{inf:'sumas inferiores',sup:'sumas superiores',med:'punto medio',trap:'trapecios'}[a.st.m]}): <b>${N4(S)}</b>.<br>
  Valor exacto (Barrow): <b>${N4(exacta)}</b> ⇒ error ${N4(err)} (${(err/Math.abs(exacta)*100).toFixed(2).replace('.',',')} %).<br>
  <span class="hint">Sube n y mira cómo las sumas inferiores y superiores se estrechan alrededor del valor exacto: eso ES la integral de Riemann. Con el mismo n, el punto medio y los trapecios aproximan mucho mejor.</span>`);}});

/* T2 · Límites en varias variables por caminos */
SIMS.limite2d=el=>build(el,{w:660,h:420,
 selects:[{k:'f',v:'xy3',l:'función',opts:[['xy3','f = xy³/(x²+y⁶)  (examen 2021)'],['xy','f = xy/(x²+y²)'],['x2y','f = x²y/(x⁴+y²)'],['bueno','f = x²y/(x²+y²)  (sí existe)']]},
  {k:'c',v:'curva',l:'camino',opts:[['iter','límites iterados'],['recta','rectas y = λx'],['curva','curvas adaptadas'],['polar','coordenadas polares']]}],
 sliders:[{k:'lam',v:1,min:-3,max:3,step:0.05,l:'parámetro λ (o ángulo θ/π)',u:''}],
 draw(a){a.clear();
  const F={xy3:[(x,y)=>x*y*y*y/(x*x+Math.pow(y,6)),'xy³/(x²+y⁶)',(l)=>l/(l*l+1),'x = λy³',true],
   xy:[(x,y)=>x*y/(x*x+y*y),'xy/(x²+y²)',(l)=>l/(1+l*l),'y = λx',true],
   x2y:[(x,y)=>x*x*y/(Math.pow(x,4)+y*y),'x²y/(x⁴+y²)',(l)=>l/(1+l*l),'y = λx²',true],
   bueno:[(x,y)=>x*x*y/(x*x+y*y),'x²y/(x²+y²)',(l)=>0,'—',false]};
  const [f,nom,valCurva,curvaTxt,noExiste]=F[a.st.f];
  const lam=a.st.lam;
  // mapa de niveles
  const cx=190,cy=210,R=150;
  const img=a.g.createImageData(2*R,2*R);
  const cols=[[C.a,1],[C.f,1]];
  for(let j=0;j<2*R;j++)for(let i=0;i<2*R;i++){
    const X=(i-R)/R*0.6, Y=(R-j)/R*0.6;
    const idx=(j*2*R+i)*4;
    if(X*X+Y*Y>0.36){img.data[idx+3]=0;continue;}
    let v=f(X,Y);if(!isFinite(v))v=0;
    const t=Math.max(-1,Math.min(1,v*2));
    // rojo-blanco-azul
    const r=t>0?255:Math.round(255+t*120), g=Math.round(255-Math.abs(t)*120), b=t<0?255:Math.round(255-t*120);
    img.data[idx]=r;img.data[idx+1]=g;img.data[idx+2]=b;img.data[idx+3]=200;}
  a.g.putImageData(img,cx-R,cy-R);
  a.g.strokeStyle=C.muted;a.g.lineWidth=1.2;a.circ(cx,cy,R,C.muted,false);
  a.line(cx-R,cy,cx+R,cy,C.muted,1);a.line(cx,cy-R,cx,cy+R,C.muted,1);
  a.txt('x',cx+R+8,cy+4,C.muted,11);a.txt('y',cx-4,cy-R-6,C.muted,11);
  // camino dibujado (recortado al disco)
  a.g.save();a.g.beginPath();a.g.arc(cx,cy,R,0,Math.PI*2);a.g.clip();
  a.g.strokeStyle=C.text;a.g.lineWidth=2.5;a.g.beginPath();
  const esc=R/0.6;
  if(a.st.c==='recta'){a.g.moveTo(cx-R,cy+lam*R);a.g.lineTo(cx+R,cy-lam*R);}
  else if(a.st.c==='curva'){
    if(a.st.f==='xy3'){for(let t=-0.85;t<=0.85;t+=0.01){const y=t,x=lam*y*y*y;if(Math.abs(x)<0.6)a.g.lineTo(cx+x*esc,cy-y*esc);}}
    else if(a.st.f==='x2y'||a.st.f==='bueno'){for(let t=-0.78;t<=0.78;t+=0.01){const x=t,y=lam*x*x;if(Math.abs(y)<0.6)a.g.lineTo(cx+x*esc,cy-y*esc);}}
    else {a.g.moveTo(cx-R,cy+lam*R);a.g.lineTo(cx+R,cy-lam*R);}}
  else if(a.st.c==='polar'){const th=lam*Math.PI;a.g.moveTo(cx,cy);a.g.lineTo(cx+R*Math.cos(th),cy-R*Math.sin(th));}
  else {a.g.moveTo(cx-R,cy);a.g.lineTo(cx+R,cy);a.g.moveTo(cx,cy-R);a.g.lineTo(cx,cy+R);}
  a.g.stroke();a.g.restore();
  a.circ(cx,cy,5,C.b,true);
  a.txt('camino',cx-R+6,cy-R+16,C.text,11);
  // valores a lo largo del camino
  const gx=400,gy=330,gw=220,gh=230;
  Eje(a,gx,gy-gh/2,gw,0,'distancia al origen →','');
  a.line(gx,gy,gx,gy-gh,C.muted,1.5);
  a.txt('valor de f a lo largo del camino',gx,gy-gh-10,C.muted,11);
  a.txt('f',gx-8,gy-gh/2-6,C.muted,11,'right');
  const vals=[];
  for(let i=1;i<=100;i++){const s=0.55*i/100;
    let x,y;
    if(a.st.c==='recta'){x=s;y=lam*s;}
    else if(a.st.c==='curva'){if(a.st.f==='xy3'){y=s;x=lam*y*y*y;}else{x=s;y=lam*x*x;}}
    else if(a.st.c==='polar'){const th=lam*Math.PI;x=s*Math.cos(th);y=s*Math.sin(th);}
    else {x=s;y=0;}
    vals.push([s,f(x,y)]);}
  const lo=Math.min(-0.6,...vals.map(v=>v[1])), hi=Math.max(0.6,...vals.map(v=>v[1]));
  const pyv=v=>gy-gh/2-(v)/Math.max(Math.abs(lo),Math.abs(hi))*gh/2;
  a.line(gx,pyv(0),gx+gw,pyv(0),C.muted,1,[3,3]);
  a.g.strokeStyle=C.a;a.g.lineWidth=2.5;a.g.beginPath();
  vals.forEach((v,i)=>{const X=gx+gw-(v[0]/0.55)*gw,Y=pyv(v[1]);i===0?a.g.moveTo(X,Y):a.g.lineTo(X,Y);});a.g.stroke();
  const lim=vals[vals.length-1][1];
  a.circ(gx,pyv(lim),6,C.a,true);
  a.txt(N3(lim),gx+8,pyv(lim)-8,C.a,13);
  a.txt('(0,0)',gx,gy+16,C.muted,10,'center');
  let msg='';
  if(a.st.c==='iter')msg=`<b>Límites iterados</b> de ${nom}: ambos valen <b>0</b> (primero una variable y después la otra). Recuerda: que coincidan es condición NECESARIA, no suficiente.`;
  else if(a.st.c==='recta')msg=`Por la recta <b>y = ${N2(lam)}x</b> el límite vale <b>${N3(lim)}</b>. ${a.st.f==='xy'?'<b>Depende de λ</b> ⇒ el límite NO existe.':'Todas las rectas dan 0, pero eso todavía no demuestra nada.'}`;
  else if(a.st.c==='curva')msg=`Por la curva <b>${curvaTxt}</b> con λ = ${N2(lam)}: límite = <b>${N3(valCurva(lam))}</b>. ${noExiste?'<b>Depende de λ</b> ⇒ el límite NO existe y la función no es continua en (0,0).':'Sale siempre 0.'}`;
  else msg=`En <b>polares</b> con θ = ${N2(lam)}π: el valor tiende a <b>${N3(lim)}</b>. ${a.st.f==='bueno'?'Y además |f| ≤ r, que tiende a 0 <b>sin depender de θ</b> ⇒ el límite SÍ existe y vale 0.':'Cuidado: aquí la acotación depende de θ, así que polares no demuestra la existencia.'}`;
  a.html(`${msg}<br>
  <span class="hint">${a.st.f==='bueno'?'Esta es la única de las cuatro en la que el límite existe: |x²y/(x²+y²)| ≤ |y| → 0.':'Estrategia de examen: iterados → rectas → curvas adaptadas a los grados. En cuanto un camino dé un valor distinto, has terminado.'}</span>`);}});

/* T3 · Gradiente, curvas de nivel y derivada direccional */
SIMS.gradiente=el=>build(el,{w:660,h:420,
 selects:[{k:'f',v:'sil',l:'función',opts:[['par','f = x² + y²  (paraboloide)'],['sil','f = x³ + y³ − 3xy'],['gau','f = e^(−x²−y²)'],['hip','f = x² − y²  (silla)']]}],
 sliders:[{k:'px',v:0.8,min:-2,max:2,step:0.05,l:'x del punto',u:''},{k:'py',v:0.6,min:-2,max:2,step:0.05,l:'y del punto',u:''},{k:'th',v:0.25,min:0,max:2,step:0.02,l:'dirección (θ/π)',u:''}],
 draw(a){a.clear();
  const F={par:[(x,y)=>x*x+y*y,(x,y)=>[2*x,2*y],'x² + y²'],
   sil:[(x,y)=>x**3+y**3-3*x*y,(x,y)=>[3*x*x-3*y,3*y*y-3*x],'x³ + y³ − 3xy'],
   gau:[(x,y)=>Math.exp(-x*x-y*y),(x,y)=>[-2*x*Math.exp(-x*x-y*y),-2*y*Math.exp(-x*x-y*y)],'e^(−x²−y²)'],
   hip:[(x,y)=>x*x-y*y,(x,y)=>[2*x,-2*y],'x² − y²']};
  const [f,grad,nom]=F[a.st.f];
  const X0=a.st.px,Y0=a.st.py,th=a.st.th*Math.PI;
  const cx=210,cy=210,R=180,SC=R/2.2;
  const px=x=>cx+x*SC, py=y=>cy-y*SC;
  // curvas de nivel por marching squares simple
  const vals=[];for(let i=-6;i<=6;i++)vals.push(i*(a.st.f==='gau'?0.12:1.2));
  const NN=90;
  const grid=[];for(let j=0;j<=NN;j++){grid.push([]);for(let i=0;i<=NN;i++){const x=-2.2+4.4*i/NN,y=-2.2+4.4*j/NN;grid[j].push(f(x,y));}}
  vals.forEach((lv,k)=>{
    a.g.strokeStyle=Math.abs(lv)<1e-9?C.muted:(lv>0?C.a:C.f);a.g.lineWidth=Math.abs(lv)<1e-9?1.8:1.2;a.g.globalAlpha=0.75;
    a.g.beginPath();
    for(let j=0;j<NN;j++)for(let i=0;i<NN;i++){
      const x1=-2.2+4.4*i/NN,y1=-2.2+4.4*j/NN,d=4.4/NN;
      const v00=grid[j][i],v10=grid[j][i+1],v01=grid[j+1][i];
      if((v00-lv)*(v10-lv)<0){const t=(lv-v00)/(v10-v00);a.g.moveTo(px(x1+t*d),py(y1));a.g.lineTo(px(x1+t*d)+0.6,py(y1)+0.6);}
      if((v00-lv)*(v01-lv)<0){const t=(lv-v00)/(v01-v00);a.g.moveTo(px(x1),py(y1+t*d));a.g.lineTo(px(x1)+0.6,py(y1+t*d)+0.6);}}
    a.g.stroke();a.g.globalAlpha=1;});
  a.line(px(-2.2),cy,px(2.2),cy,C.muted,1.2);a.line(cx,py(-2.2),cx,py(2.2),C.muted,1.2);
  a.g.strokeStyle=C.muted;a.g.strokeRect(px(-2.2),py(2.2),4.4*SC,4.4*SC);
  // gradiente y direccion
  const [gxv,gyv]=grad(X0,Y0);
  const ng=Math.hypot(gxv,gyv);
  const esc=40/Math.max(ng,0.3);
  a.circ(px(X0),py(Y0),6,C.text,true);
  if(ng>1e-6)a.arrow(px(X0),py(Y0),px(X0)+gxv*esc,py(Y0)-gyv*esc,C.b,3);
  a.txt('∇f',px(X0)+gxv*esc+6,py(Y0)-gyv*esc,C.b,12);
  const u=[Math.cos(th),Math.sin(th)];
  a.arrow(px(X0),py(Y0),px(X0)+u[0]*46,py(Y0)-u[1]*46,C.c,2.5);
  a.txt('v',px(X0)+u[0]*52,py(Y0)-u[1]*52,C.c,12);
  const Dv=gxv*u[0]+gyv*u[1];
  // barra de derivada direccional
  const bx=420,by=120,bw=200;
  a.txt('Derivada direccional D_v f',bx,by-16,C.text,12);
  a.line(bx,by+30,bx+bw,by+30,C.muted,1.5);
  a.line(bx+bw/2,by+22,bx+bw/2,by+38,C.muted,1.2);
  const fr=Math.max(-1,Math.min(1,Dv/Math.max(ng,1e-6)));
  a.g.fillStyle=Dv>=0?C.c:C.b;a.g.fillRect(bx+bw/2,by+22,fr*bw/2,16);
  a.txt('−‖∇f‖',bx,by+56,C.muted,10);a.txt('0',bx+bw/2,by+56,C.muted,10,'center');a.txt('+‖∇f‖',bx+bw,by+56,C.muted,10,'right');
  a.txt('D_v f = '+N3(Dv),bx,by+84,Dv>=0?C.c:C.b,14);
  a.txt('‖∇f‖ = '+N3(ng),bx,by+108,C.b,13);
  a.txt('ángulo ∇f–v = '+N2(Math.acos(Math.max(-1,Math.min(1,Dv/Math.max(ng*1,1e-9))))*180/Math.PI)+'°',bx,by+132,C.muted,12);
  // clasificacion si es punto critico
  const h=1e-4;
  const fxx=(f(X0+h,Y0)-2*f(X0,Y0)+f(X0-h,Y0))/(h*h);
  const fyy=(f(X0,Y0+h)-2*f(X0,Y0)+f(X0,Y0-h))/(h*h);
  const fxy=(f(X0+h,Y0+h)-f(X0+h,Y0-h)-f(X0-h,Y0+h)+f(X0-h,Y0-h))/(4*h*h);
  const D=fxx*fyy-fxy*fxy;
  const critico=ng<0.08;
  a.html(`f(x,y) = <b>${nom}</b> en el punto (${N2(X0)}, ${N2(Y0)}): f = <b>${N3(f(X0,Y0))}</b>.<br>
  ∇f = (${N3(gxv)}, ${N3(gyv)}) ⇒ ‖∇f‖ = <b>${N3(ng)}</b> (máximo crecimiento en esa dirección; el gradiente es <b>perpendicular a la curva de nivel</b>).<br>
  Dirección v = (cos ${N2(a.st.th)}π, sen ${N2(a.st.th)}π) ⇒ <b>D<sub>v</sub>f = ∇f · v = ${N3(Dv)}</b>. Plano tangente: z = ${N3(f(X0,Y0))} + ${N3(gxv)}(x − ${N2(X0)}) + ${N3(gyv)}(y − ${N2(Y0)}).<br>
  ${critico?`<b>Es (casi) un punto crítico</b>: hessiano f<sub>xx</sub> = ${N2(fxx)}, f<sub>yy</sub> = ${N2(fyy)}, f<sub>xy</sub> = ${N2(fxy)} ⇒ Δ = ${N2(D)} ⇒ <b>${D<0?'punto de silla':(fxx>0?'mínimo relativo':'máximo relativo')}</b>.`:'Mueve el punto hasta anular el gradiente para encontrar los puntos críticos y clasificarlos con el hessiano.'}<br>
  <span class="hint">Gira la dirección v: D_v f es máxima cuando v apunta como ∇f, nula cuando es tangente a la curva de nivel y mínima en sentido opuesto.</span>`);}});

/* T4 · Integral doble: recinto, orden y polares */
SIMS.doble=el=>build(el,{w:660,h:420,
 selects:[{k:'r',v:'tri',l:'recinto',opts:[['tri','triángulo 0 ≤ x ≤ 1, x ≤ y ≤ 1'],['par','entre y = x² y la recta y = x'],['cir','círculo x² + y² ≤ 1'],['cor','corona 1 ≤ x² + y² ≤ 4']]},
  {k:'o',v:'dy',l:'orden / coordenadas',opts:[['dy','primero dy, después dx (tipo I)'],['dx','primero dx, después dy (tipo II)'],['pol','coordenadas polares']]},
  {k:'f',v:'1',l:'integrando',opts:[['1','f = 1  (área)'],['xy','f = xy'],['r2','f = x² + y²'],['ey','f = e^(y²)']]}],
 draw(a){a.clear();
  const polar=a.st.r==='cir'||a.st.r==='cor';
  const FN={'1':[(x,y)=>1,'1'],'xy':[(x,y)=>x*y,'xy'],'r2':[(x,y)=>x*x+y*y,'(x²+y²)'],'ey':[(x,y)=>Math.exp(y*y),'e^(y²)']};
  const [f,fU]=FN[a.st.f];
  const cx=200,cy=230,SC=70;
  const px=x=>cx+x*SC, py=y=>cy-y*SC;
  // ejes
  a.line(px(-2.4),cy,px(2.4),cy,C.muted,1.4);a.line(cx,py(-2.4),cx,py(2.4),C.muted,1.4);
  for(let i=-2;i<=2;i++){if(i){a.line(px(i),cy-4,px(i),cy+4,C.muted,1);a.txt(String(i),px(i),cy+18,C.muted,10,'center');
    a.line(cx-4,py(i),cx+4,py(i),C.muted,1);a.txt(String(i),cx-10,py(i)+4,C.muted,10,'right');}}
  // recinto
  a.g.fillStyle=C.a;a.g.globalAlpha=0.25;a.g.beginPath();
  if(a.st.r==='tri'){a.g.moveTo(px(0),py(0));a.g.lineTo(px(1),py(1));a.g.lineTo(px(0),py(1));}
  else if(a.st.r==='par'){a.g.moveTo(px(0),py(0));for(let t=0;t<=1;t+=0.02)a.g.lineTo(px(t),py(t));for(let t=1;t>=0;t-=0.02)a.g.lineTo(px(t),py(t*t));}
  else if(a.st.r==='cir'){a.g.arc(cx,cy,SC,0,Math.PI*2);}
  else {a.g.arc(cx,cy,2*SC,0,Math.PI*2);a.g.arc(cx,cy,SC,0,Math.PI*2,true);}
  a.g.closePath();a.g.fill();a.g.globalAlpha=1;
  a.g.strokeStyle=C.a;a.g.lineWidth=2;a.g.stroke();
  // lineas de integracion
  a.g.strokeStyle=C.f;a.g.lineWidth=1.2;
  if(a.st.o==='dy'&&!polar){for(let i=1;i<=14;i++){const x=i/15;
    let y1,y2;
    if(a.st.r==='tri'){y1=x;y2=1;}else{y1=x*x;y2=x;}
    a.line(px(x),py(y1),px(x),py(y2),C.f,1.4);}}
  else if(a.st.o==='dx'&&!polar){for(let i=1;i<=14;i++){const y=i/15;
    let x1,x2;
    if(a.st.r==='tri'){x1=0;x2=y;}else{x1=y;x2=Math.sqrt(y);}
    a.line(px(x1),py(y),px(x2),py(y),C.f,1.4);}}
  else if(a.st.o==='pol'||polar){const r1=a.st.r==='cor'?1:(polar?0:0), r2=a.st.r==='cor'?2:1;
    for(let k=0;k<24;k++){const th=k*Math.PI/12;
      if(polar)a.line(px(r1*Math.cos(th)),py(r1*Math.sin(th)),px(r2*Math.cos(th)),py(r2*Math.sin(th)),C.f,1.2);}
    if(!polar)a.txt('(usa un recinto circular para ver las polares)',px(-2.2),py(-1.9),C.muted,11);}
  // calculo numerico
  let val=0,limU='',met='';
  const n=400;
  if(a.st.r==='tri'){for(let i=0;i<n;i++){const x=(i+0.5)/n;const y1=x,y2=1;
      for(let j=0;j<n/4;j++){const y=y1+(y2-y1)*(j+0.5)/(n/4);val+=f(x,y)*(1/n)*((y2-y1)/(n/4));}}
    limU=a.st.o==='dx'?'∫₀¹ ∫₀^y':'∫₀¹ ∫ₓ¹';met='El recinto es el triángulo por ENCIMA de la diagonal (de (0,0) a (0,1) y (1,1)).';}
  else if(a.st.r==='par'){for(let i=0;i<n;i++){const x=(i+0.5)/n;const y1=x*x,y2=x;
      for(let j=0;j<n/4;j++){const y=y1+(y2-y1)*(j+0.5)/(n/4);val+=f(x,y)*(1/n)*((y2-y1)/(n/4));}}
    limU=a.st.o==='dx'?'∫₀¹ ∫_y^√y':'∫₀¹ ∫_{x²}^{x}';met='Entre la parábola y la recta, que se cortan en (0,0) y (1,1).';}
  else {const r1=a.st.r==='cor'?1:0, r2=a.st.r==='cor'?2:1;
    for(let i=0;i<n;i++){const r=r1+(r2-r1)*(i+0.5)/n;
      for(let j=0;j<n;j++){const th=2*Math.PI*(j+0.5)/n;
        val+=f(r*Math.cos(th),r*Math.sin(th))*r*((r2-r1)/n)*(2*Math.PI/n);}}
    limU=`∫₀^2π ∫_${r1}^${r2}`;met='En polares, con el jacobiano r: dA = r·dr·dθ.';}
  const esPolar=polar;
  a.html(`<b>${limU}</b> ${fU}${esPolar?' · r dr dθ':(a.st.o==='dx'?' dx dy':' dy dx')} = <b>${N4(val)}</b>${a.st.f==='1'?' (el área del recinto)':''}<br>
  ${met} ${!esPolar?'Las líneas finas son el barrido de la integral interior: '+(a.st.o==='dy'?'para cada x fija, y recorre de la curva de abajo a la de arriba.':'para cada y fija, x recorre de izquierda a derecha.'):''}<br>
  ${a.st.f==='ey'&&!esPolar?'<b>Ojo</b>: e^(y²) no tiene primitiva elemental. En el orden dy·dx no se puede calcular a mano; <b>cambiando el orden</b> aparece el factor y que la hace inmediata y sale (e−1)/2 ≈ 0,8591.':''}
  ${esPolar&&a.st.f==='r2'?'En polares el integrando x²+y² es simplemente r², y con el jacobiano queda ∫r³dr: inmediato.':''}<br>
  <span class="hint">Cambia el orden y comprueba que el valor no varía: lo que cambia es la dificultad. Y en recintos circulares, las polares convierten los límites en constantes.</span>`);}});

/* T5 · Ecuaciones diferenciales: campo de direcciones y soluciones */
SIMS.edo=el=>build(el,{w:660,h:420,
 selects:[{k:'e',v:'lin',l:'ecuación',opts:[['sep',"y' = x·y  (separable)"],['lin',"y' − 2y/x = x²  (lineal)"],['log',"y' = y(1 − y)  (logística)"],['hom',"y' = (x + y)/x  (homogénea)"],['osc',"y'' + 2y' + 5y = 0  (2.º orden)"]]}],
 sliders:[{k:'y0',v:0.5,min:-2.5,max:2.5,step:0.05,l:'condición inicial y(1) (o y(0))',u:''}],
 draw(a){a.clear();const e=a.st.e;
  const x0=70,y0=350,wv=540,hv=300;
  const XA=e==='osc'?0:0.05, XB=e==='osc'?6:3;
  const YA=-2.8,YB=2.8;
  const px=x=>x0+(x-XA)/(XB-XA)*wv, py=y=>y0-(y-YA)/(YB-YA)*hv;
  Eje(a,x0,py(0),wv,0,'x','');
  a.line(x0,y0,x0,y0-hv,C.muted,1.5);
  for(let i=0;i<=6;i++){const x=XA+(XB-XA)*i/6;a.txt(N2(x),px(x),py(0)+16,C.muted,10,'center');}
  for(let v=-2;v<=2;v++)if(v){a.txt(String(v),x0-8,py(v)+4,C.muted,10,'right');a.line(x0,py(v),x0+wv,py(v),C.grid,1);}
  const F={sep:(x,y)=>x*y, lin:(x,y)=>2*y/x+x*x, log:(x,y)=>y*(1-y), hom:(x,y)=>(x+y)/x}[e];
  let sol=null,txt='',gen='';
  if(e!=='osc'){
    // campo de direcciones
    for(let i=1;i<=22;i++)for(let j=1;j<=14;j++){
      const x=XA+(XB-XA)*i/23, y=YA+(YB-YA)*j/15;
      let m=F(x,y);if(!isFinite(m))continue;
      const ang=Math.atan(m*((XB-XA)/wv)/((YB-YA)/hv));
      const L=11;
      a.line(px(x)-L*Math.cos(ang),py(y)+L*Math.sin(ang),px(x)+L*Math.cos(ang),py(y)-L*Math.sin(ang),C.muted,1.3);}
    // soluciones (RK4) para varias condiciones iniciales
    a.g.save();a.g.beginPath();a.g.rect(x0,y0-hv,wv,hv);a.g.clip();
    const curvas=[];
    for(let k=-5;k<=5;k++)curvas.push(a.st.y0+k*0.6);
    curvas.push(a.st.y0);
    curvas.forEach((Y0,idx)=>{
      const dest=idx===curvas.length-1;
      a.g.strokeStyle=dest?C.a:C.f;a.g.lineWidth=dest?3:1.2;a.g.globalAlpha=dest?1:0.45;
      a.g.beginPath();
      const x1=(e==='lin'||e==='hom')?1:XA;
      [1,-1].forEach(dir=>{
        let y=Y0,x=x1;let first=true;
        a.g.moveTo(px(x),py(y));
        for(let s=0;s<700;s++){
          const h=dir*(XB-XA)/700;
          if(x+h<XA||x+h>XB)break;
          const k1=F(x,y),k2=F(x+h/2,y+h*k1/2),k3=F(x+h/2,y+h*k2/2),k4=F(x+h,y+h*k3);
          if(![k1,k2,k3,k4].every(isFinite))break;
          y+=h*(k1+2*k2+2*k3+k4)/6;x+=h;
          if(Math.abs(y)>6)break;
          a.g.lineTo(px(x),py(y));}
        a.g.moveTo(px(x1),py(Y0));});
      a.g.stroke();a.g.globalAlpha=1;});
    a.g.restore();
    a.circ(px((e==='lin'||e==='hom')?1:XA),py(a.st.y0),6,C.a,true);
    if(e==='sep'){gen='y = C·e^(x²/2)';txt=`<b>Variables separables</b>: dy/y = x dx ⇒ ln|y| = x²/2 + C ⇒ <b>y = C·e^(x²/2)</b>. Con y(0) = ${N2(a.st.y0)}, C = ${N2(a.st.y0)}.`;}
    else if(e==='lin'){gen='y = x³ + Cx²';txt=`<b>Lineal</b>: μ = e^(∫−2/x dx) = x⁻² ⇒ (x⁻²y)′ = 1 ⇒ <b>y = x³ + Cx²</b>. Con y(1) = ${N2(a.st.y0)}, C = ${N2(a.st.y0-1)} ⇒ y = x³ ${a.st.y0-1>=0?'+':'−'} ${N2(Math.abs(a.st.y0-1))}x².`;}
    else if(e==='log'){gen='y = 1/(1 + C·e^(−x))';txt=`<b>Logística</b> (separable): <b>y = 1/(1 + Ce^(−x))</b>. Las soluciones tienden a y = 1 (equilibrio estable) y se alejan de y = 0 (inestable): se ve en el campo de direcciones.`;}
    else {gen='y = x·(ln|x| + C)';txt=`<b>Homogénea</b>: con u = y/x queda u + xu′ = 1 + u ⇒ u′ = 1/x ⇒ u = ln|x| + C ⇒ <b>y = x(ln|x| + C)</b>.`;}}
  else {
    // oscilador amortiguado: y'' + 2y' + 5y = 0 -> raices -1 ± 2i
    a.g.save();a.g.beginPath();a.g.rect(x0,y0-hv,wv,hv);a.g.clip();
    a.g.strokeStyle=C.a;a.g.lineWidth=3;a.g.beginPath();
    const A0=a.st.y0;
    for(let i=0;i<=600;i++){const x=XA+(XB-XA)*i/600;
      const y=Math.exp(-x)*(A0*Math.cos(2*x)+(A0/2)*Math.sin(2*x));
      i===0?a.g.moveTo(px(x),py(y)):a.g.lineTo(px(x),py(y));}a.g.stroke();
    a.g.strokeStyle=C.f;a.g.lineWidth=1.4;a.g.setLineDash([5,4]);
    [1,-1].forEach(sg=>{a.g.beginPath();
      for(let i=0;i<=200;i++){const x=XA+(XB-XA)*i/200;const y=sg*Math.abs(A0)*1.12*Math.exp(-x);
        i===0?a.g.moveTo(px(x),py(y)):a.g.lineTo(px(x),py(y));}a.g.stroke();});
    a.g.setLineDash([]);a.g.restore();
    a.txt('envolvente e^(−x)',px(2.2),py(Math.abs(A0)*1.12*Math.exp(-2.2))-8,C.f,11);
    txt=`<b>Lineal de 2.º orden</b>: λ² + 2λ + 5 = 0 ⇒ λ = −1 ± 2i ⇒ <b>y = e^(−x)(C₁cos 2x + C₂sen 2x)</b>. Parte real negativa ⇒ oscilación <b>amortiguada</b>; la envolvente e^(−x) marca cómo decae.`;
    gen='y = e^(−x)·(C₁·cos 2x + C₂·sen 2x)';}
  a.html(`${txt}<br>
  Solución general: <b>${gen}</b>.<br>
  <span class="hint">${e==='osc'?'Cambia los coeficientes mentalmente: si el discriminante es positivo no hay oscilación (sobreamortiguado), si es cero está en amortiguamiento crítico y si es negativo oscila, como aquí.':'Las líneas finas son el campo de direcciones: cada segmento tiene la pendiente y′ que marca la ecuación. Las curvas son soluciones; la gruesa es la que pasa por tu condición inicial.'}</span>`);}});

/* Extra · Volúmenes de revolución */
SIMS.revolucion=el=>build(el,{w:660,h:400,
 selects:[{k:'f',v:'rac',l:'curva',opts:[['rac','y = 1/(x²−4x+8)  (examen 2021)'],['raiz','y = √x'],['sen','y = sen x'],['lin','y = x']]},
  {k:'m',v:'ox',l:'método',opts:[['ox','giro alrededor de OX (discos)'],['oy','giro alrededor de OY (capas)']]}],
 sliders:[{k:'a',v:0,min:0,max:3,step:0.1,l:'desde x = a',u:''},{k:'b',v:2,min:0.5,max:6,step:0.1,l:'hasta x = b',u:''}],
 draw(a){a.clear();
  const F={rac:[x=>1/(x*x-4*x+8),'1/(x²−4x+8)'],raiz:[x=>Math.sqrt(Math.max(0,x)),'√x'],
   sen:[x=>Math.max(0,Math.sin(x)),'sen x'],lin:[x=>x,'x']};
  const [f,tex]=F[a.st.f];
  const A=Math.min(a.st.a,a.st.b-0.3),B=Math.max(a.st.b,a.st.a+0.3);
  const Vox=Math.PI*simpson(x=>f(x)*f(x),A,B,2000);
  const Voy=2*Math.PI*simpson(x=>x*f(x),A,B,2000);
  const area=simpson(f,A,B,2000);
  const L=simpson(x=>{const h=1e-5;const d=(f(x+h)-f(x-h))/(2*h);return Math.sqrt(1+d*d);},A,B,2000);
  const x0=80,cy=210,wv=500;
  let mx=0;for(let i=0;i<=100;i++)mx=Math.max(mx,f(A+(B-A)*i/100));
  const SCy=Math.min(120,110/Math.max(mx,0.05));
  const px=x=>x0+(x-A)/(B-A)*wv, py=y=>cy-y*SCy;
  a.line(x0-20,cy,x0+wv+20,cy,C.muted,1.6);
  a.txt('eje OX',x0+wv+24,cy+4,C.muted,11);
  if(a.st.m==='oy'){a.line(px(0)>x0-20?px(0):x0,py(-mx*1.3),px(0)>x0-20?px(0):x0,py(mx*1.3),C.c,1.6,[5,4]);a.txt('eje OY',(px(0)>x0-20?px(0):x0)+6,py(mx*1.25),C.c,11);}
  // solido de revolucion: curva y su reflejo + elipses
  a.g.fillStyle=C.a;a.g.globalAlpha=0.16;a.g.beginPath();
  for(let i=0;i<=200;i++){const x=A+(B-A)*i/200;a.g.lineTo(px(x),py(f(x)));}
  for(let i=200;i>=0;i--){const x=A+(B-A)*i/200;a.g.lineTo(px(x),py(-f(x)));}
  a.g.closePath();a.g.fill();a.g.globalAlpha=1;
  for(let k=0;k<=10;k++){const x=A+(B-A)*k/10;const r=f(x)*SCy;
    a.g.strokeStyle=C.f;a.g.lineWidth=1.1;a.g.globalAlpha=0.65;
    a.g.beginPath();a.g.ellipse(px(x),cy,Math.max(2,(B-A)/22*wv/(B-A)*0.5+3),Math.abs(r),0,0,Math.PI*2);a.g.stroke();a.g.globalAlpha=1;}
  a.g.strokeStyle=C.a;a.g.lineWidth=2.8;a.g.beginPath();
  for(let i=0;i<=300;i++){const x=A+(B-A)*i/300;i===0?a.g.moveTo(px(x),py(f(x))):a.g.lineTo(px(x),py(f(x)));}a.g.stroke();
  a.g.strokeStyle=C.a;a.g.lineWidth=1.2;a.g.globalAlpha=0.5;a.g.beginPath();
  for(let i=0;i<=300;i++){const x=A+(B-A)*i/300;i===0?a.g.moveTo(px(x),py(-f(x))):a.g.lineTo(px(x),py(-f(x)));}a.g.stroke();a.g.globalAlpha=1;
  [A,B].forEach(v=>{a.line(px(v),cy-6,px(v),cy+6,C.text,2);a.txt('x = '+N2(v),px(v),cy+24,C.text,11,'center');});
  const V=a.st.m==='ox'?Vox:Voy;
  a.html(`Curva <b>y = ${tex}</b> entre x = ${N2(A)} y x = ${N2(B)}.<br>
  <b>${a.st.m==='ox'?'Giro alrededor de OX (discos)':'Giro alrededor de OY (capas cilíndricas)'}</b>: ${a.st.m==='ox'?'V = π·∫ f(x)² dx':'V = 2π·∫ x·f(x) dx'} = <b>${N4(V)}</b> u³.<br>
  Para comparar: el otro giro daría ${N4(a.st.m==='ox'?Voy:Vox)} u³ · área bajo la curva = ${N4(area)} u² · longitud del arco = ${N4(L)} u.<br>
  ${a.st.f==='rac'&&Math.abs(A)<0.05&&Math.abs(B-2)<0.05?'<b>Este es justo el apartado del examen de abril de 2021</b>: el resultado exacto es π/16·(π/4 + 1/2) = 0,2524 y se obtiene con el método de Hermite.':''}<br>
  <span class="hint">Discos: cada rebanada perpendicular al eje es un círculo de radio f(x), área πf(x)². Capas: cada cilindro de radio x tiene superficie 2πx·f(x).</span>`);}});

/* Extra · Extremos relativos y hessiano */
SIMS.extremos=el=>build(el,{w:660,h:420,
 selects:[{k:'f',v:'sil',l:'función',opts:[['sil','f = x³ + y³ − 3xy'],['par','f = x² + 2y² − 4x + 4y'],['mon','f = x⁴ + y⁴ − 4xy'],['hip','f = x² − y²']]}],
 sliders:[{k:'px',v:1,min:-2.2,max:2.2,step:0.02,l:'x del punto de prueba',u:''},{k:'py',v:1,min:-2.2,max:2.2,step:0.02,l:'y del punto de prueba',u:''}],
 draw(a){a.clear();
  const F={sil:[(x,y)=>x**3+y**3-3*x*y,'x³ + y³ − 3xy',[[0,0],[1,1]]],
   par:[(x,y)=>x*x+2*y*y-4*x+4*y,'x² + 2y² − 4x + 4y',[[2,-1]]],
   mon:[(x,y)=>x**4+y**4-4*x*y,'x⁴ + y⁴ − 4xy',[[0,0],[1,1],[-1,-1]]],
   hip:[(x,y)=>x*x-y*y,'x² − y²',[[0,0]]]};
  const [f,nom,crit]=F[a.st.f];
  const cx=200,cy=210,R=180,SC=R/2.4;
  const px=x=>cx+x*SC, py=y=>cy-y*SC;
  const NN=80;
  const vals=[];for(let i=-8;i<=8;i++)vals.push(i*(a.st.f==='mon'?1.5:1.2));
  const grid=[];for(let j=0;j<=NN;j++){grid.push([]);for(let i=0;i<=NN;i++){grid[j].push(f(-2.4+4.8*i/NN,-2.4+4.8*j/NN));}}
  vals.forEach(lv=>{a.g.strokeStyle=lv>0?C.a:(lv<0?C.f:C.muted);a.g.lineWidth=1.1;a.g.globalAlpha=0.7;a.g.beginPath();
    for(let j=0;j<NN;j++)for(let i=0;i<NN;i++){const x1=-2.4+4.8*i/NN,y1=-2.4+4.8*j/NN,d=4.8/NN;
      const v00=grid[j][i],v10=grid[j][i+1],v01=grid[j+1][i];
      if((v00-lv)*(v10-lv)<0){const t=(lv-v00)/(v10-v00);a.g.moveTo(px(x1+t*d),py(y1));a.g.lineTo(px(x1+t*d)+0.7,py(y1)+0.7);}
      if((v00-lv)*(v01-lv)<0){const t=(lv-v00)/(v01-v00);a.g.moveTo(px(x1),py(y1+t*d));a.g.lineTo(px(x1)+0.7,py(y1+t*d)+0.7);}}
    a.g.stroke();a.g.globalAlpha=1;});
  a.line(px(-2.4),cy,px(2.4),cy,C.muted,1.2);a.line(cx,py(-2.4),cx,py(2.4),C.muted,1.2);
  a.g.strokeStyle=C.muted;a.g.strokeRect(px(-2.4),py(2.4),4.8*SC,4.8*SC);
  const h=1e-4;
  const hess=(X,Y)=>{const fxx=(f(X+h,Y)-2*f(X,Y)+f(X-h,Y))/(h*h), fyy=(f(X,Y+h)-2*f(X,Y)+f(X,Y-h))/(h*h),
    fxy=(f(X+h,Y+h)-f(X+h,Y-h)-f(X-h,Y+h)+f(X-h,Y-h))/(4*h*h);return [fxx,fyy,fxy,fxx*fyy-fxy*fxy];};
  crit.forEach(c=>{const [fxx,,,D]=hess(c[0],c[1]);
    const tipo=D<-1e-6?'silla':(fxx>0?'mínimo':'máximo');
    const col=tipo==='silla'?C.b:(tipo==='mínimo'?C.c:C.d);
    a.circ(px(c[0]),py(c[1]),8,col,true);
    a.txt(tipo,px(c[0])+12,py(c[1])-8,col,12);});
  const X0=a.st.px,Y0=a.st.py;
  const gx=(f(X0+h,Y0)-f(X0-h,Y0))/(2*h), gy=(f(X0,Y0+h)-f(X0,Y0-h))/(2*h);
  a.circ(px(X0),py(Y0),5,C.text,false);
  const ng=Math.hypot(gx,gy);
  if(ng>1e-6)a.arrow(px(X0),py(Y0),px(X0)+gx/ng*34,py(Y0)-gy/ng*34,C.text,2);
  const [fxx,fyy,fxy,D]=hess(X0,Y0);
  // tabla
  const bx=420,by=110;
  a.txt('En el punto de prueba:',bx,by-16,C.text,12);
  [['f',f(X0,Y0)],['∂f/∂x',gx],['∂f/∂y',gy],['f_xx',fxx],['f_yy',fyy],['f_xy',fxy],['Δ = f_xx·f_yy − f_xy²',D]].forEach((d,i)=>{
    a.txt(d[0],bx,by+i*26,C.muted,12);a.txt(N3(d[1]),bx+150,by+i*26,C.text,12,'right');});
  a.html(`f(x,y) = <b>${nom}</b>. Puntos críticos marcados: ${crit.map(c=>{const [fx,,,DD]=hess(c[0],c[1]);return `(${c[0]}, ${c[1]}) <b>${DD<-1e-6?'silla':(fx>0?'mínimo':'máximo')}</b>`;}).join(' · ')}.<br>
  Punto de prueba (${N2(X0)}, ${N2(Y0)}): ∇f = (${N3(gx)}, ${N3(gy)}) ⇒ ${ng<0.05?'<b>es un punto crítico</b>':'no es punto crítico (el gradiente no se anula)'}; Δ = ${N3(D)} ⇒ ${D<0?'<b>silla</b>':(fxx>0?'<b>mínimo</b>':'<b>máximo</b>')} si el gradiente fuera nulo.<br>
  <span class="hint">Criterio: Δ &gt; 0 y f<sub>xx</sub> &gt; 0 ⇒ mínimo; Δ &gt; 0 y f<sub>xx</sub> &lt; 0 ⇒ máximo; Δ &lt; 0 ⇒ silla; Δ = 0 ⇒ el criterio no decide. Alrededor de un mínimo las curvas de nivel son óvalos cerrados; en una silla se cruzan.</span>`);}});

document.querySelectorAll('[data-sim]').forEach(el=>{const f=SIMS[el.dataset.sim];if(f)f(el);});
})();
