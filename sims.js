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

/* ---- Segunda pasada: cinco figuras más ---- */
const Pbox=(a,x,y,w,h,col,r)=>{const g=a.g;r=r||8;g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();g.fillStyle=col;g.fill();};
const Pfill=(a,pts,col,alpha)=>{const g=a.g;g.save();g.globalAlpha=alpha===undefined?0.22:alpha;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=col;g.fill();g.restore();};
const Pcurve=(a,pts,col,wd)=>{const g=a.g;g.strokeStyle=col;g.lineWidth=wd||2.4;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();};

/* T1 · convergencia de integrales impropias */
SIMS.impropia=el=>build(el,{w:660,h:400,
 selects:[{k:'t',v:'inf',l:'tipo de impropia',opts:[['inf','1.ª especie · ∫ de 1 a t de x^(−p)'],['cero','2.ª especie · ∫ de ε a 1 de x^(−p)']]}],
 sliders:[{k:'p',v:1.5,min:0.1,max:3,step:0.05,l:'exponente p',u:''},{k:'k',v:1,min:0,max:3,step:0.02,l:'alcance del límite (10^k)',u:''}],
 draw(a){a.clear();
  const p=a.st.p,k=a.st.k,inf=a.st.t==='inf';
  const lim=Math.pow(10,k);                       // t (inf) o 1/ε (cero)
  const F=L=>{ // valor de la integral parcial
    if(inf){ if(Math.abs(p-1)<1e-9)return Math.log(L); return (Math.pow(L,1-p)-1)/(1-p);}
    const e=1/L; if(Math.abs(p-1)<1e-9)return -Math.log(e); return (1-Math.pow(e,1-p))/(1-p);};
  const conv = inf ? p>1 : p<1;
  const valor = conv ? (inf? 1/(p-1) : 1/(1-p)) : Infinity;
  const act = F(lim);
  /* --- panel izquierdo: la curva y el área --- */
  const x0=48,y0=300,wv=250,hv=215;
  const XA = inf? 1 : 1/lim, XB = inf? lim : 1;
  const xmin = inf? 0.6 : 0, xmax = inf? Math.min(lim*1.08,12) : 1.15;
  const f=x=>Math.pow(x,-p);
  let ymax=0; for(let i=0;i<=200;i++){const x=xmin+(xmax-xmin)*i/200; if(x>0.02)ymax=Math.max(ymax,f(x));}
  ymax=Math.min(ymax,inf?Math.max(f(0.6),1.2):6);
  const px=x=>x0+(x-xmin)/(xmax-xmin)*wv, py=y=>y0-Math.min(y,ymax)/ymax*hv;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5); a.line(x0,y0,x0,y0-hv-6,C.muted,1.5);
  // area sombreada
  const pts=[[px(Math.max(XA,xmin)),y0]];
  for(let i=0;i<=240;i++){const x=Math.max(XA,xmin)+(Math.min(XB,xmax)-Math.max(XA,xmin))*i/240; pts.push([px(x),py(f(x))]);}
  pts.push([px(Math.min(XB,xmax)),y0]);
  Pfill(a,pts,C.a,0.26);
  const cur=[]; for(let i=0;i<=320;i++){const x=xmin+(xmax-xmin)*i/320; if(x<=0.02)continue; cur.push([px(x),py(f(x))]);}
  Pcurve(a,cur,C.text,2.6);
  a.txt('y = x^(−'+N2(p)+')',x0+8,y0-hv+4,C.text,12.5);
  a.txt('x',x0+wv+4,y0+4,C.muted,12);
  if(inf){a.line(px(1),y0,px(1),py(f(1)),C.a,1.2,[3,3]);a.txt('1',px(1),y0+16,C.muted,11,'center');
    if(lim<=xmax){a.line(px(lim),y0,px(lim),py(f(lim)),C.b,1.6,[3,3]);a.txt('t = '+N2(lim),Math.min(px(lim),x0+wv-26),y0+16,C.b,11,'center');}
    else a.txt('t = '+N2(lim)+' →',x0+wv-4,y0+16,C.b,11,'right');}
  else {a.line(px(1),y0,px(1),py(f(1)),C.a,1.2,[3,3]);a.txt('1',px(1),y0+16,C.muted,11,'center');
    a.line(px(1/lim),y0,px(1/lim),y0-hv,C.b,1.6,[3,3]);a.txt('ε = '+N4(1/lim),px(1/lim)+4,y0-hv+14,C.b,11);}
  /* --- panel derecho: el valor acumulado --- */
  const bx=360,by=300,bw=258,bh=215;
  a.line(bx,by,bx+bw,by,C.muted,1.5); a.line(bx,by,bx,by-bh-6,C.muted,1.5);
  let vmax=0; const vals=[];
  for(let i=0;i<=200;i++){const kk=3*i/200,L=Math.pow(10,kk),v=F(L);vals.push([kk,v]);vmax=Math.max(vmax,v);}
  const cap = conv? Math.max(valor*1.6,0.6) : Math.min(vmax,14);
  const qx=kk=>bx+kk/3*bw, qy=v=>by-Math.min(Math.max(v,0),cap)/cap*bh;
  if(conv){a.line(bx,qy(valor),bx+bw,qy(valor),C.c,1.8,[6,4]);
    a.txt('valor límite = '+N4(valor),bx+bw-2,qy(valor)-8,C.c,12,'right');}
  Pcurve(a,vals.map(v=>[qx(v[0]),qy(v[1])]),C.a,2.6);
  a.circ(qx(k),qy(act),4.5,C.b,true);
  a.line(qx(k),by,qx(k),qy(act),C.b,1,[3,3]);
  [0,1,2,3].forEach(i=>a.txt('10^'+i,qx(i),by+16,C.muted,11,'center'));
  a.txt(inf?'t  (escala logarítmica)':'1/ε  (escala logarítmica)',bx+bw/2,by+34,C.muted,12,'center');
  a.txt('valor de la integral parcial',bx,by-bh-14,C.muted,12);
  a.html(`Integral <b>${inf?'de 1.ª especie':'de 2.ª especie'}</b> con p = <b>${N2(p)}</b>.
  Valor parcial con ${inf?'t = '+N2(lim):'ε = '+N4(1/lim)}: <b>${act>1e6?'muy grande':N4(act)}</b>.<br>
  Criterio: ${inf?'∫ de 1 a ∞ de x^(−p) converge si <b>p &gt; 1</b>':'∫ de 0 a 1 de x^(−p) converge si <b>p &lt; 1</b>'} ⇒ aquí <b>${conv?'converge, y vale '+N4(valor):'DIVERGE'}</b>.<br>
  <span class="hint">Sube el alcance del límite y mira la curva de la derecha: si converge se aplana contra la asíntota; si diverge sigue subiendo sin techo (con p = 1 crece como un logaritmo, despacio pero sin parar: ése es el caso frontera). Prueba p = 0,9 / 1 / 1,1 en los dos tipos y verás que el papel de p se invierte.</span>`);}});

/* T2 · topología: punto, bola de prueba y clasificación */
SIMS.topologia=el=>build(el,{w:660,h:420,
 selects:[{k:'A',v:'corona',l:'conjunto A',opts:[
   ['abierto','x² + y² < 4  (disco abierto)'],
   ['cerrado','x² + y² ≤ 4  (disco cerrado)'],
   ['corona','1 < x² + y² ≤ 4, y ≥ 0'],
   ['semi','y > 0  (semiplano abierto)'],
   ['cuadrado','máx(|x|,|y|) ≤ 2 sin el vértice (2,2)']]}],
 sliders:[{k:'x',v:1.5,min:-3,max:3,step:0.05,l:'punto · x',u:''},{k:'y',v:0.9,min:-3,max:3,step:0.05,l:'punto · y',u:''},
  {k:'r',v:0.5,min:0.05,max:1.5,step:0.01,l:'radio de la bola de prueba',u:''}],
 draw(a){a.clear();
  const S=a.st.A, X=a.st.x, Y=a.st.y, R=a.st.r;
  const inA=(x,y)=>{const q=x*x+y*y;
    if(S==='abierto')return q<4-1e-12;
    if(S==='cerrado')return q<=4+1e-12;
    if(S==='corona')return q>1+1e-12&&q<=4+1e-12&&y>=-1e-12;
    if(S==='semi')return y>1e-12;
    return Math.max(Math.abs(x),Math.abs(y))<=2+1e-12 && !(Math.abs(x-2)<1e-9&&Math.abs(y-2)<1e-9);};
  const DES={abierto:['abierto','sí','no','sí','no'],cerrado:['cerrado','no','sí','sí','sí'],
   corona:['ni abierto ni cerrado','no','no','sí','no'],semi:['abierto','sí','no','no','no'],
   cuadrado:['ni abierto ni cerrado','no','no','sí','no']}[S];
  const cx=215,cy=215,u=52;
  // malla y ejes
  for(let i=-3;i<=3;i++){a.line(cx+i*u,cy-3.1*u,cx+i*u,cy+3.1*u,C.grid,1);a.line(cx-3.1*u,cy-i*u,cx+3.1*u,cy-i*u,C.grid,1);}
  a.line(cx-3.3*u,cy,cx+3.3*u,cy,C.muted,1.5);a.line(cx,cy-3.3*u,cx,cy+3.3*u,C.muted,1.5);
  // conjunto por muestreo
  const g=a.g,st=4;
  g.save();g.globalAlpha=0.3;g.fillStyle=C.a;
  for(let sx=-3.1;sx<=3.1;sx+=st/u)for(let sy=-3.1;sy<=3.1;sy+=st/u)if(inA(sx,sy))g.fillRect(cx+sx*u-st/2,cy-sy*u-st/2,st,st);
  g.restore();
  // frontera dibujada
  const arc=(rad,th1,th2,col,dash)=>{const pts=[];for(let i=0;i<=120;i++){const t=th1+(th2-th1)*i/120;pts.push([cx+rad*u*Math.cos(t),cy-rad*u*Math.sin(t)]);}
    g.strokeStyle=col;g.lineWidth=2;g.setLineDash(dash||[]);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.setLineDash([]);};
  if(S==='abierto')arc(2,0,2*Math.PI,C.b,[5,4]);
  if(S==='cerrado')arc(2,0,2*Math.PI,C.b);
  if(S==='corona'){arc(2,0,Math.PI,C.b);arc(1,0,Math.PI,C.b,[5,4]);
    a.line(cx+u,cy,cx+2*u,cy,C.b,2);a.line(cx-2*u,cy,cx-u,cy,C.b,2);}
  if(S==='semi')a.line(cx-3.3*u,cy,cx+3.3*u,cy,C.b,2,[5,4]);
  if(S==='cuadrado'){const q=2*u;g.strokeStyle=C.b;g.lineWidth=2;g.strokeRect(cx-q,cy-q,2*q,2*q);
    a.circ(cx+q,cy-q,3.5,C.bg,true);a.circ(cx+q,cy-q,3.5,C.b,false);}
  // bola de prueba y punto
  a.circ(cx+X*u,cy-Y*u,R*u,C.f,false);
  g.save();g.globalAlpha=0.18;g.fillStyle=C.f;g.beginPath();g.arc(cx+X*u,cy-Y*u,R*u,0,6.2832);g.fill();g.restore();
  a.circ(cx+X*u,cy-Y*u,4.5,C.text,true);
  a.txt('x',cx+3.3*u+4,cy+4,C.muted,12);a.txt('y',cx+5,cy-3.3*u-4,C.muted,12);
  // ¿la bola cabe? muestreo del disco de prueba
  let anyIn=false,anyOut=false;
  for(let i=0;i<=24;i++)for(let j=1;j<=8;j++){const th=2*Math.PI*i/24,rr=R*j/8;
    if(inA(X+rr*Math.cos(th),Y+rr*Math.sin(th)))anyIn=true;else anyOut=true;}
  // clasificación exacta con una bola infinitesimal
  let eIn=false,eOut=false;const eps=0.004;
  for(let i=0;i<=72;i++)for(let j=1;j<=3;j++){const th=2*Math.PI*i/72,rr=eps*j/3;
    if(inA(X+rr*Math.cos(th),Y+rr*Math.sin(th)))eIn=true;else eOut=true;}
  if(inA(X,Y))eIn=true;
  const clase = !eOut? 'interior' : (!eIn? 'exterior' : 'de la frontera');
  const col = clase==='interior'?C.c:(clase==='exterior'?C.muted:C.b);
  // panel
  const bx=430,by=70;
  Pbox(a,bx-14,by-34,228,268,C.grid,10);
  a.txt('Punto ('+N2(X)+', '+N2(Y)+')',bx,by-12,C.text,13);
  a.txt('¿pertenece a A?',bx,by+16,C.muted,12.5);a.txt(inA(X,Y)?'sí':'no',bx+200,by+16,C.text,12.5,'right');
  a.txt('es un punto…',bx,by+42,C.muted,12.5);a.txt(clase,bx+200,by+42,col,12.5,'right');
  a.txt('la bola de radio '+N2(R)+'…',bx,by+72,C.muted,12.5);
  a.txt(!anyOut?'cabe entera dentro de A':(!anyIn?'queda entera fuera de A':'corta A y su complementario'),bx+200,by+92,C.text,11.5,'right');
  a.txt('A es…',bx,by+124,C.muted,12.5);a.txt(DES[0],bx+200,by+124,C.a,12.5,'right');
  a.txt('acotado',bx,by+150,C.muted,12.5);a.txt(DES[3],bx+200,by+150,C.text,12.5,'right');
  a.txt('compacto',bx,by+176,C.muted,12.5);a.txt(DES[4],bx+200,by+176,C.text,12.5,'right');
  a.txt('trazo continuo: frontera incluida',bx,by+208,C.muted,11);
  a.txt('trazo discontinuo: excluida',bx,by+224,C.muted,11);
  a.html(`Conjunto <b>A</b>: ${{abierto:'x² + y² &lt; 4',cerrado:'x² + y² ≤ 4',corona:'1 &lt; x² + y² ≤ 4 con y ≥ 0',semi:'y &gt; 0',cuadrado:'máx(|x|,|y|) ≤ 2 quitando el vértice (2, 2)'}[S]}.
  El punto marcado es <b>${clase}</b>, y la bola de radio ${N2(R)} ${!anyOut?'<b>cabe entera dentro</b> de A':(!anyIn?'<b>queda entera fuera</b> de A':'<b>corta a A y a su complementario</b>')}.<br>
  A es <b>${DES[0]}</b>; acotado: <b>${DES[3]}</b>; compacto (= cerrado y acotado): <b>${DES[4]}</b>.<br>
  <span class="hint">Definiciones en acción: un punto es <b>interior</b> si alguna bola cabe dentro de A, <b>exterior</b> si alguna bola cabe fuera, y <b>de la frontera</b> si ninguna bola, por pequeña que sea, se decide. Pon el punto justo encima del borde y baja el radio: la bola siempre corta las dos partes. Y fíjate en el cuadrado al que le falta un vértice: un conjunto puede no ser ni abierto ni cerrado por culpa de un único punto.</span>`);}});

/* T3 · el error de la aproximación lineal: por qué parciales ≠ diferenciable */
SIMS.diferenciable=el=>build(el,{w:660,h:420,
 selects:[{k:'f',v:'A',l:'función (con f(0,0) = 0)',opts:[
   ['A','f = xy / √(x²+y²)'],
   ['B','f = (x³+y³) / (x²+y²)'],
   ['C','f = x²y / (x²+y²)'],
   ['D','f = x² + y² − xy'],
   ['E','f = x²y² / (x²+y²)^(3/2)']]}],
 sliders:[{k:'r',v:0.6,min:0.02,max:1,step:0.01,l:'distancia al origen r',u:''},
  {k:'th',v:45,min:0,max:360,step:1,l:'dirección θ',u:'°'}],
 draw(a){a.clear();
  const S=a.st.f, R=a.st.r, TH=a.st.th*Math.PI/180;
  const DEF={A:{f:(x,y)=>x*y/Math.hypot(x,y),gr:[0,0],nom:'xy / √(x²+y²)',dif:false,cont:true},
   B:{f:(x,y)=>(x*x*x+y*y*y)/(x*x+y*y),gr:[1,1],nom:'(x³+y³) / (x²+y²)',dif:false,cont:true},
   C:{f:(x,y)=>x*x*y/(x*x+y*y),gr:[0,0],nom:'x²y / (x²+y²)',dif:false,cont:true},
   D:{f:(x,y)=>x*x+y*y-x*y,gr:[0,0],nom:'x² + y² − xy',dif:true,cont:true},
   E:{f:(x,y)=>x*x*y*y/Math.pow(x*x+y*y,1.5),gr:[0,0],nom:'x²y² / (x²+y²)^(3/2)',dif:true,cont:true}}[S];
  const f=DEF.f, gx=DEF.gr[0], gy=DEF.gr[1];
  const E=(r,th)=>{const x=r*Math.cos(th),y=r*Math.sin(th);
    if(r<1e-12)return 0; return Math.abs(f(x,y)-(gx*x+gy*y))/r;};
  const radios=[R,R/2,R/4,R/8];
  const cols=[C.a,C.b,C.f,C.c];
  /* panel izquierdo: E(θ) para varios radios */
  const x0=52,y0=300,wv=270,hv=210;
  let emax=0.05; radios.forEach(r=>{for(let i=0;i<=180;i++)emax=Math.max(emax,E(r,2*Math.PI*i/180));});
  emax*=1.15;
  a.line(x0,y0,x0+wv,y0,C.muted,1.5);a.line(x0,y0,x0,y0-hv-8,C.muted,1.5);
  const px=t=>x0+t/360*wv, py=v=>y0-Math.min(v,emax)/emax*hv;
  [0,90,180,270,360].forEach(t=>{a.line(px(t),y0,px(t),y0-hv,C.grid,1);a.txt(t+'°',px(t),y0+16,C.muted,11,'center');});
  radios.forEach((r,ri)=>{const pts=[];for(let i=0;i<=360;i++)pts.push([px(i),py(E(r,i*Math.PI/180))]);
    Pcurve(a,pts,cols[ri],ri?1.6:2.6);});
  a.txt('error relativo  |f − plano| / ‖h‖',x0,y0-hv-16,C.muted,12);
  a.txt('θ',x0+wv+6,y0+4,C.muted,12);
  a.circ(px(a.st.th),py(E(R,TH)),4.5,C.text,true);
  radios.forEach((r,ri)=>{a.line(x0+6+ri*66,y0+34,x0+26+ri*66,y0+34,cols[ri],ri?1.6:2.6);
    a.txt(ri?'r/'+Math.pow(2,ri):'r',x0+30+ri*66,y0+38,C.muted,11);});
  a.txt(N3(emax),x0-6,y0-hv+4,C.muted,11,'right');a.txt('0',x0-6,y0+4,C.muted,11,'right');
  /* panel derecho: la dirección elegida, E frente a r */
  const bx=382,by=300,bw=236,bh=210;
  a.line(bx,by,bx+bw,by,C.muted,1.5);a.line(bx,by,bx,by-bh-8,C.muted,1.5);
  const qx=r=>bx+r/1*bw, qy=v=>by-Math.min(v,emax)/emax*bh;
  const pr=[];for(let i=1;i<=240;i++){const r=i/240;pr.push([qx(r),qy(E(r,TH))]);}
  Pcurve(a,pr,C.a,2.6);
  a.circ(qx(R),qy(E(R,TH)),4.5,C.b,true);
  a.line(qx(R),by,qx(R),qy(E(R,TH)),C.b,1,[3,3]);
  [0,0.5,1].forEach(v=>a.txt(N2(v),qx(v),by+16,C.muted,11,'center'));
  a.txt('r  (en la dirección θ = '+a.st.th+'°)',bx+bw/2,by+34,C.muted,12,'center');
  a.txt('mismo error, frente a r',bx,by-bh-16,C.muted,12);
  a.txt(N3(emax),bx-6,by-bh+4,C.muted,11,'right');a.txt('0',bx-6,by+4,C.muted,11,'right');
  const m1=Math.max(...Array.from({length:181},(_,i)=>E(R,2*Math.PI*i/180)));
  const m2=Math.max(...Array.from({length:181},(_,i)=>E(R/8,2*Math.PI*i/180)));
  a.html(`f(x,y) = <b>${DEF.nom}</b> con f(0,0) = 0; gradiente en el origen ∇f(0,0) = (${gx}, ${gy}).<br>
  Error relativo máximo sobre todas las direcciones: con r = ${N2(R)} vale <b>${N4(m1)}</b>; con r = ${N4(R/8)} vale <b>${N4(m2)}</b>.<br>
  ⇒ ${DEF.dif?'el error <b>se encoge con r</b>: la función <b>SÍ es diferenciable</b> en el origen':'el error <b>no baja</b> al acercarse: la función <b>NO es diferenciable</b> en el origen, aunque tenga las dos parciales'}.<br>
  <span class="hint">La definición exige que |f(h) − f(0) − ∇f·h| / ‖h‖ → 0 <b>en todas las direcciones a la vez</b>. En las tres primeras funciones el error es el mismo para cualquier r (las cuatro curvas de la izquierda se superponen): son homogéneas de grado 1 y el plano tangente nunca las aproxima mejor. En las dos últimas las curvas se van aplastando contra el eje. Mueve θ hasta el máximo de la curva: ésa es la dirección por la que falla la diferenciabilidad.</span>`);}});

/* T4 · coordenadas esféricas: el elemento de volumen */
SIMS.esfericas=el=>build(el,{w:660,h:420,
 sliders:[{k:'R',v:2,min:0.5,max:3,step:0.05,l:'radio exterior ρ₂',u:''},
  {k:'f1',v:0,min:0,max:180,step:1,l:'ángulo φ₁ (desde el eje z)',u:'°'},
  {k:'f2',v:180,min:0,max:180,step:1,l:'ángulo φ₂',u:'°'},
  {k:'dt',v:360,min:10,max:360,step:5,l:'amplitud en θ',u:'°'}],
 draw(a){a.clear();
  const R=a.st.R;
  let f1=Math.min(a.st.f1,a.st.f2)*Math.PI/180, f2=Math.max(a.st.f1,a.st.f2)*Math.PI/180;
  if(f2-f1<0.02)f2=f1+0.02;
  const dt=a.st.dt*Math.PI/180;
  const V=dt*(Math.cos(f1)-Math.cos(f2))*Math.pow(R,3)/3;
  const Vesf=4*Math.PI*Math.pow(R,3)/3;
  /* corte meridiano */
  const cx=208,cy=198,u=52, g=a.g;
  a.line(cx-3.2*u,cy,cx+3.2*u,cy,C.grid,1.2);
  a.line(cx,cy-3.4*u,cx,cy+3.4*u,C.muted,1.5);
  a.txt('z',cx+6,cy-3.4*u-4,C.muted,12);a.txt('r',cx+3.1*u,cy-8,C.muted,12);
  // región del corte (lado derecho): entre los dos conos y dentro del radio
  const pts=[];
  for(let i=0;i<=80;i++){const f=f1+(f2-f1)*i/80;pts.push([cx+R*u*Math.sin(f),cy-R*u*Math.cos(f)]);}
  pts.push([cx,cy]);
  Pfill(a,pts,C.a,0.26);
  const pts2=pts.map(p=>[2*cx-p[0],p[1]]);
  Pfill(a,pts2,C.a,0.12);
  // arcos y conos
  const arco=(rad,col,wd)=>{const q=[];for(let i=0;i<=120;i++){const f=Math.PI*i/120;q.push([cx+rad*u*Math.sin(f),cy-rad*u*Math.cos(f)]);}
    Pcurve(a,q,col,wd);const q2=q.map(p=>[2*cx-p[0],p[1]]);Pcurve(a,q2,col,1);};
  arco(R,C.muted,1.2);
  const q=[];for(let i=0;i<=120;i++){const f=f1+(f2-f1)*i/120;q.push([cx+R*u*Math.sin(f),cy-R*u*Math.cos(f)]);}
  Pcurve(a,q,C.a,2.8);
  a.line(cx,cy,cx+R*u*Math.sin(f1),cy-R*u*Math.cos(f1),C.b,2);
  a.line(cx,cy,cx+R*u*Math.sin(f2),cy-R*u*Math.cos(f2),C.b,2);
  const et=(f,txt)=>{const dx=Math.sin(f),dy=-Math.cos(f);
    const px0=cx+0.62*R*u*dx+18*Math.cos(f), py0=cy+0.62*R*u*dy+18*Math.sin(f);
    a.txt(txt,px0,py0+4,C.b,11.5,dx<0.15&&Math.cos(f)<0?'right':'left');};
  et(f1,'φ₁ = '+Math.round(f1*180/Math.PI)+'°');
  et(f2,'φ₂ = '+Math.round(f2*180/Math.PI)+'°');
  a.txt('ρ₂ = '+N2(R),cx+R*u*Math.sin((f1+f2)/2)*0.52,cy-R*u*Math.cos((f1+f2)/2)*0.52-10,C.a,11.5);
  a.txt('corte por un plano que contiene el eje z',cx,cy+3.4*u+24,C.muted,11.5,'center');
  /* celda: dρ · ρdφ · ρ senφ dθ */
  const bx=392,by=96,bw=226;
  Pbox(a,bx-14,by-60,bw+16,276,C.grid,10);
  a.txt('El elemento de volumen',bx,by-38,C.text,13);
  const sx=bx+18,sy=by+6,s=52;
  Pfill(a,[[sx,sy],[sx+s,sy-16],[sx+s+34,sy+4],[sx+34,sy+20]],C.a,0.35);
  Pcurve(a,[[sx,sy],[sx+s,sy-16],[sx+s+34,sy+4],[sx+34,sy+20],[sx,sy]],C.a,1.6);
  a.line(sx,sy,sx,sy+40,C.a,1.6);a.line(sx+s,sy-16,sx+s,sy+24,C.a,1.6);
  a.line(sx+s+34,sy+4,sx+s+34,sy+44,C.a,1.6);a.line(sx+34,sy+20,sx+34,sy+60,C.a,1.6);
  Pcurve(a,[[sx,sy+40],[sx+s,sy+24],[sx+s+34,sy+44],[sx+34,sy+60],[sx,sy+40]],C.a,1.6);
  a.txt('dρ',sx-16,sy+58,C.a,11.5);
  a.txt('ρ dφ',sx+s+10,sy-20,C.a,11.5);
  a.txt('ρ senφ dθ',sx+2,sy+78,C.a,11.5);
  const L=[['dV = ρ² senφ dρ dφ dθ',C.text],
   ['θ de 0 a '+Math.round(dt*180/Math.PI)+'°',C.muted],
   ['φ de '+Math.round(f1*180/Math.PI)+'° a '+Math.round(f2*180/Math.PI)+'°',C.muted],
   ['ρ de 0 a '+N2(R),C.muted],
   ['V = Δθ · (cosφ₁ − cosφ₂) · ρ₂³/3',C.text],
   ['V = '+N4(V),C.a]];
  L.forEach((d,i)=>a.txt(d[0],bx,by+108+i*24,d[1],i===5?13.5:12.5));
  a.html(`Volumen del sector: <b>${N4(V)}</b> unidades cúbicas; la esfera completa de radio ${N2(R)} mide ${N4(Vesf)}, así que el sector es el <b>${N2(100*V/Vesf)} %</b> de ella.<br>
  Casos para comprobar la fórmula: con φ de 0° a 180° y θ completo sale la <b>esfera</b> (4πρ³/3); con φ de 0° a 90°, la <b>media esfera</b>; con θ = 90°, un <b>cuarto</b> de lo anterior; y con φ de 0° a 45°, un <b>cono relleno de tapa esférica</b>.<br>
  <span class="hint">El jacobiano no es un adorno: la celda de la derecha tiene lados dρ, ρ dφ y ρ senφ dθ, y su volumen es el producto, ρ² senφ dρ dφ dθ. El factor ρ² dice que las celdas lejanas son mayores, y el senφ que los «paralelos» se encogen al acercarse a los polos (en φ = 0 y φ = 180° la celda degenera). Olvidar uno de los dos es el error más caro del tema.</span>`);}});

/* T5 · oscilador: regímenes de amortiguamiento y resonancia */
SIMS.amortiguado=el=>build(el,{w:660,h:420,
 selects:[{k:'F',v:'libre',l:'excitación',opts:[['libre','libre (F = 0), soltado desde y₀ = 1'],['res','forzado a la frecuencia propia: F = sen(ω₀t)'],['lento','forzado despacio: F = sen(ω₀t/3)']]}],
 sliders:[{k:'m',v:1,min:0.2,max:3,step:0.05,l:'masa m  (o inductancia L)',u:''},
  {k:'c',v:0.4,min:0,max:6,step:0.05,l:'amortiguamiento c  (o resistencia R)',u:''},
  {k:'k',v:4,min:0.5,max:12,step:0.1,l:'rigidez k  (o 1/C)',u:''},
  {k:'T',v:20,min:5,max:60,step:1,l:'tiempo representado',u:'s'}],
 draw(a){a.clear();
  const m=a.st.m,c=a.st.c,k=a.st.k,T=a.st.T,mod=a.st.F;
  const disc=c*c-4*m*k, w0=Math.sqrt(k/m), ccr=2*Math.sqrt(m*k);
  const reg = c<1e-9?'armónico (sin amortiguamiento)':(Math.abs(disc)<1e-9?'crítico':(disc>0?'sobreamortiguado':'subamortiguado'));
  const wf = mod==='res'? w0 : (mod==='lento'? w0/3 : 0);
  const Fv = t => mod==='libre'?0:Math.sin(wf*t);
  // RK4
  const n=1600, h=T/n, ys=[], y0=mod==='libre'?1:0, v0=0;
  let y=y0,v=v0;
  const d=(t,y,v)=>[v,(Fv(t)-c*v-k*y)/m];
  ys.push([0,y]);
  for(let i=0;i<n;i++){const t=i*h;
    const k1=d(t,y,v),k2=d(t+h/2,y+h/2*k1[0],v+h/2*k1[1]),
     k3=d(t+h/2,y+h/2*k2[0],v+h/2*k2[1]),k4=d(t+h,y+h*k3[0],v+h*k3[1]);
    y+=h/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]); v+=h/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1]);
    ys.push([(i+1)*h,y]);}
  let ym=0.2; ys.forEach(p=>ym=Math.max(ym,Math.abs(p[1]))); ym*=1.15;
  /* gráfica y(t) */
  const x0=50,cy=190,wv=420,hv=140;
  a.line(x0,cy,x0+wv,cy,C.muted,1.5);a.line(x0,cy-hv-10,x0,cy+hv+10,C.muted,1.5);
  for(let i=1;i<=4;i++){a.line(x0+wv*i/4,cy-hv,x0+wv*i/4,cy+hv,C.grid,1);
    a.txt(N2(T*i/4)+' s',x0+wv*i/4,cy+hv+26,C.muted,11,'center');}
  const px=t=>x0+t/T*wv, py=v=>cy-v/ym*hv;
  // envolvente
  if(mod==='libre'&&disc<0){const al=c/(2*m);const e1=[],e2=[];
    for(let i=0;i<=200;i++){const t=T*i/200;e1.push([px(t),py(Math.exp(-al*t))]);e2.push([px(t),py(-Math.exp(-al*t))]);}
    Pcurve(a,e1,C.b,1.2);Pcurve(a,e2,C.b,1.2);
    a.txt('envolvente e^(−ct/2m)',px(T*0.5),py(Math.exp(-al*T*0.5))-8,C.b,11);}
  Pcurve(a,ys.map(p=>[px(p[0]),py(p[1])]),C.a,2.4);
  a.txt('y(t)',x0+4,cy-hv-16,C.muted,12);
  a.txt(N2(ym),x0-6,cy-hv+4,C.muted,11,'right');a.txt(N2(-ym),x0-6,cy+hv+4,C.muted,11,'right');
  /* plano de las raíces */
  const rx=560,ry=130,ru=26;
  a.txt('raíces λ',rx,ry-ru*3.1,C.muted,12,'center');
  for(let i=-2;i<=2;i++){a.line(rx+i*ru,ry-2.2*ru,rx+i*ru,ry+2.2*ru,C.grid,1);a.line(rx-2.2*ru,ry-i*ru,rx+2.2*ru,ry-i*ru,C.grid,1);}
  a.line(rx-2.3*ru,ry,rx+2.3*ru,ry,C.muted,1.4);a.line(rx,ry-2.3*ru,rx,ry+2.3*ru,C.muted,1.4);
  let lam;
  if(disc>=0){const s=Math.sqrt(disc);lam=[[(-c+s)/(2*m),0],[(-c-s)/(2*m),0]];}
  else {const s=Math.sqrt(-disc);lam=[[-c/(2*m),s/(2*m)],[-c/(2*m),-s/(2*m)]];}
  const sc=Math.max(1,...lam.map(L=>Math.max(Math.abs(L[0]),Math.abs(L[1]))))/2;
  lam.forEach(L=>a.circ(rx+L[0]/sc*ru,ry-L[1]/sc*ru,5,C.a,true));
  a.txt('Re',rx+2.3*ru+4,ry+4,C.muted,11);a.txt('Im',rx-6,ry-2.1*ru,C.muted,11,'right');
  a.txt('cada división: '+N2(sc),rx,ry+2.2*ru+20,C.muted,10.5,'center');
  /* etiquetas de régimen */
  const bx=50,byy=cy+hv+52;
  a.txt('discriminante c² − 4mk = '+N3(disc),bx,byy,C.muted,12.5);
  a.txt('régimen: '+reg,bx+300,byy,reg==='subamortiguado'?C.a:(reg==='crítico'?C.c:C.b),reg.length>20?11.5:13);
  a.txt('ω₀ = √(k/m) = '+N3(w0)+' rad/s',bx,byy+24,C.muted,12.5);
  a.txt('c crítico = 2√(mk) = '+N3(ccr),bx+300,byy+24,C.muted,12.5);
  const lamTxt = disc>=0? 'λ = '+N3(lam[0][0])+' y '+N3(lam[1][0])
   : 'λ = '+N3(lam[0][0])+' ± '+N3(Math.abs(lam[0][1]))+' i';
  a.html(`m = ${N2(m)}, c = ${N2(c)}, k = ${N2(k)} ⇒ ${lamTxt}; discriminante <b>${N3(disc)}</b> ⇒ régimen <b>${reg}</b>.
  Frecuencia propia ω₀ = <b>${N3(w0)}</b> rad/s y amortiguamiento crítico c = <b>${N3(ccr)}</b>.<br>
  ${mod==='libre'?'Respuesta libre desde y₀ = 1 con velocidad inicial nula.':'Forzado con F = sen('+(mod==='res'?'ω₀':'ω₀/3')+'t) partiendo del reposo.'}
  ${mod==='res'&&c<0.05?'<b>Resonancia pura</b>: sin amortiguamiento la amplitud crece linealmente con el tiempo, y por eso el ensayo de la particular hay que multiplicarlo por x.':''}
  ${mod==='res'&&c>=0.05?'Con c &gt; 0 la amplitud deja de crecer y se estabiliza: el amortiguamiento es lo que acota la resonancia.':''}<br>
  <span class="hint">Baja c hasta 0 con la excitación «forzado a la frecuencia propia» y verás la resonancia; súbela hasta el valor crítico ${N3(ccr)} y el sistema deja de oscilar. Las raíces del panel derecho lo cuentan todo: reales y negativas ⇒ decaimiento sin oscilar; complejas ⇒ oscilación con envolvente e^(−ct/2m); parte real nula ⇒ oscilación que no se apaga. Es la misma ecuación de un circuito RLC con L ↔ m, R ↔ c y 1/C ↔ k.</span>`);}});

document.querySelectorAll("[data-sim]").forEach(el=>{const f=SIMS[el.dataset.sim];if(f)f(el);});
})();
