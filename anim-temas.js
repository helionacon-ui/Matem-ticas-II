/* Matemáticas II: una animación por tema */
(function(){var M=window.MANIM;if(!M)return;var U=M.util,C=M.C,nf=U.nf,lerp=U.lerp,ease=U.ease,seg=U.seg,clamp=U.clamp,RG=U.RG,W=640;

/* T1 sumas superiores e inferiores */
M.reg('mat2-t1',M.base({title:'Sumas superior e inferior de Darboux',H:560,dur:18,caps:[[6,'Para <i>f(x) = sen x</i> en [0, π] se toma en cada subintervalo el máximo (suma superior, azul) y el mínimo (suma inferior, morada).'],[12,'Al refinar la partición la suma superior baja y la inferior sube: el hueco entre ambas (la diferencia) se va cerrando.'],[99,'f es integrable si las dos sumas tienden al mismo número. Aquí <i>∫₀^π sen x dx = 2</i>.']]},
 function(D,t){var n=Math.max(2,Math.round(lerp(2,48,Math.pow(ease(seg(t,1,15)),2)))),A=U.axes(D,{xr:[-0.1,3.4],yr:[-0.1,1.15],xt:[1,2,3],yt:[0.5,1],xd:0,yd:1,xl:'x',yl:'y'},{x:80,y:96,w:480,h:300,grid:true});
  var dx=Math.PI/n,Su=0,Sl=0;for(var i=0;i<n;i++){var a=i*dx,b=a+dx,fa=Math.sin(a),fb=Math.sin(b),mx=(a<=Math.PI/2&&b>=Math.PI/2)?1:Math.max(fa,fb),mn=Math.min(fa,fb);Su+=mx*dx;Sl+=mn*dx;
   D.rect(A.X(a),A.Y(mx),A.X(b)-A.X(a),A.Y(0)-A.Y(mx),n<30?C.f:null,RG(C.f,.18),1);D.rect(A.X(a),A.Y(mn),A.X(b)-A.X(a),A.Y(0)-A.Y(mn),n<30?C.m:null,RG(C.m,.35),1);}
  U.plotf(D,A,function(x){return x>=0&&x<=Math.PI?Math.sin(x):NaN;},C.hl,2.8);
  D.text('n = '+n+'    S = '+nf(Su,3)+'    s = '+nf(Sl,3),W/2,470,{it:true,s:22,a:'center',c:C.m});D.text('S − s = '+nf(Su-Sl,3)+'   →   0',W/2,506,{it:true,s:20,a:'center'});}));

/* T2 límite por una parábola */
M.reg('mat2-t2',M.base({title:'Límites dobles: las rectas no bastan',H:560,dur:20,caps:[[7,'<i>f(x, y) = x²y/(x⁴ + y²)</i>. Por cualquier recta <i>y = mx</i> que pase por el origen, el límite vale 0.'],[14,'Pero por la parábola <i>y = x²</i> la función vale siempre <i>x⁴/(2x⁴) = 1/2</i>.'],[99,'Dos caminos con límites distintos: el límite en (0, 0) no existe. Comprobar solo rectas no demuestra que el límite exista.']]},
 function(D,t){var A=U.axes(D,{xr:[-1.2,1.2],yr:[-0.6,1.3],xt:[-1,1],yt:[1],xd:0,yd:0,xl:'x',yl:'y'},{x:120,y:96,w:400,h:320,grid:true}),par=t>=10,u=ease(seg(t%10,1,8.5)),x=1.1*(1-u)+0.0001;
  var f=function(x,y){return x*x*y/(x*x*x*x+y*y);};
  if(!par){[0.5,1,-1].forEach(function(m,i){D.line(A.X(-1.2),A.Y(-1.2*m),A.X(1.2),A.Y(1.2*m),C.mut,1,[4,4]);});var m=1;D.line(A.X(0),A.Y(0),A.X(1.2),A.Y(1.2*m),C.f,2.6);var y=m*x;D.dot(A.X(x),A.Y(y),7,C.f);
   D.text('por y = x:  f = '+nf(f(x,y),3)+'  → 0',W/2,480,{it:true,s:22,a:'center',c:C.f});}
  else{U.plotf(D,A,function(s){return s*s;},C.g,2.6);var y2=x*x;D.dot(A.X(x),A.Y(y2),7,C.g);D.text('por y = x²:  f = '+nf(f(x,y2),3)+'  → 1/2',W/2,480,{it:true,s:22,a:'center',c:C.g});}
  D.dot(A.X(0),A.Y(0),5,C.hl);D.text('f(x, y) = x²y / (x⁴ + y²)',W/2,516,{it:true,s:18,a:'center'});}));

/* T3 derivada direccional */
M.reg('mat2-t3',M.base({title:'Derivada direccional y gradiente',H:560,dur:18,caps:[[6,'En el punto P = (1, 1) de <i>f = x² + 2y²</i> giramos una dirección unitaria <i>u</i>. La derivada direccional es <i>D<sub>u</sub>f = ∇f · u</i>.'],[12,'Es máxima cuando <i>u</i> apunta como el gradiente <i>∇f = (2, 4)</i>, y vale entonces <i>|∇f| = √20 ≈ 4,47</i>.'],[99,'Es cero cuando <i>u</i> es tangente a la curva de nivel: el gradiente es perpendicular a las curvas de nivel.']]},
 function(D,t){var A=U.axes(D,{xr:[-2.6,2.6],yr:[-1.9,1.9],xt:[-2,-1,1,2],yt:[-1,1],xd:0,yd:0,xl:'x',yl:'y'},{x:110,y:96,w:420,h:310,grid:true});
  for(var c=1;c<=7;c+=1.5){var p=[];for(var a=0;a<=6.3;a+=0.05)p.push([A.X(Math.sqrt(c)*Math.cos(a)),A.Y(Math.sqrt(c/2)*Math.sin(a))]);D.path(p,c===3?C.hl:C.mut,c===3?2:1.2,null,c===3?1:0.5);}
  var P=[1,1],g=[2,4],gn=Math.hypot(2,4),th=0.3+t*0.36,u=[Math.cos(th),Math.sin(th)],du=g[0]*u[0]+g[1]*u[1];
  D.arrow(A.X(P[0]),A.Y(P[1]),A.X(P[0]+g[0]/gn*0.9),A.Y(P[1]+g[1]/gn*0.9),C.g,2.4);D.text('∇f',A.X(P[0]+g[0]/gn*0.9)+4,A.Y(P[1]+g[1]/gn*0.9)-4,{s:16,c:C.g});
  D.arrow(A.X(P[0]),A.Y(P[1]),A.X(P[0]+u[0]*0.9),A.Y(P[1]+u[1]*0.9),C.m,3);D.text('u',A.X(P[0]+u[0]*0.9)+6,A.Y(P[1]+u[1]*0.9),{s:17,c:C.m});D.dot(A.X(1),A.Y(1),6,C.w);
  D.text('D_{u}f = ∇f·u = '+nf(du,2)+'      máximo |∇f| = '+nf(gn,2),W/2,480,{it:true,s:21,a:'center',c:C.m});
  D.rect(150,500,340,14,C.mut,null,1);D.rect(320,500,du/gn*170,14,null,du>=0?C.ok:C.bad);}));

/* T4 área en polares: cardioide */
M.reg('mat2-t4',M.base({title:'Integral en coordenadas polares: la cardioide',H:560,dur:18,caps:[[6,'Recinto limitado por la cardioide <i>r = 1 + cos θ</i>. En polares el elemento de área es <i>dA = r dr dθ</i>.'],[12,'Barriendo θ de 0 a 2π, cada sector aporta <i>½·r(θ)²·dθ</i>. El área acumulada crece con el ángulo.'],[99,'<i>A = ∫₀^{2π} ½(1 + cos θ)² dθ = 3π/2 ≈ 4,712</i>. Al cambiar a polares no hay que olvidar el factor <i>r</i> (el jacobiano).']]},
 function(D,t){var A=U.axes(D,{xr:[-1,2.4],yr:[-1.5,1.5],xt:[1,2],yt:[-1,1],xd:0,yd:0,xl:'x',yl:'y'},{x:120,y:96,w:400,h:340,grid:true}),th=lerp(0,2*Math.PI,ease(seg(t,1,15))),r=function(a){return 1+Math.cos(a);};
  var full=[];for(var a=0;a<=6.3;a+=0.02)full.push([A.X(r(a)*Math.cos(a)),A.Y(r(a)*Math.sin(a))]);D.path(full,C.mut,1.4);
  var sec=[[A.X(0),A.Y(0)]];for(var b=0;b<=th;b+=0.02)sec.push([A.X(r(b)*Math.cos(b)),A.Y(r(b)*Math.sin(b))]);D.path(sec,C.m,2.6,RG(C.m,.25));
  D.line(A.X(0),A.Y(0),A.X(r(th)*Math.cos(th)),A.Y(r(th)*Math.sin(th)),C.hl,2.4);
  var ar=0.5*(1.5*th+2*Math.sin(th)+0.25*Math.sin(2*th));D.text('θ = '+nf(th,2)+'     área = '+nf(ar,3)+'   (total 3π/2 = 4,712)',W/2,490,{it:true,s:21,a:'center',c:C.m});}));

/* T5 método de Euler */
M.reg('mat2-t5',M.base({title:'EDO: el método de Euler',H:560,dur:20,caps:[[6,'Problema: <i>y′ = y</i>, <i>y(0) = 1</i>, cuya solución exacta es <i>eˣ</i>. Euler avanza con la pendiente del punto actual: <i>yₙ₊₁ = yₙ + h·f(xₙ, yₙ)</i>.'],[13,'Con paso h grande el error se acumula: la poligonal queda por debajo de la curva. Al reducir h se acerca a la solución.'],[99,'El error en x = 2 es aproximadamente proporcional a h: Euler es un método de <b>orden 1</b>. Runge-Kutta mejora mucho la precisión con el mismo h.']]},
 function(D,t){var hs=[1,0.5,0.25,0.1],k=Math.min(3,Math.floor(t/5)),h=hs[k],A=U.axes(D,{xr:[0,2.1],yr:[0,8],xt:[0.5,1,1.5,2],yt:[2,4,6,8],xd:1,yd:0,xl:'x',yl:'y'},{x:80,y:96,w:480,h:310,grid:true});
  U.plotf(D,A,function(x){return x>=0&&x<=2?Math.exp(x):NaN;},C.hl,2.6);var x=0,y=1,pts=[[A.X(0),A.Y(1)]],u=seg(t%5,0.5,4),N=Math.round(2/h),nn=Math.ceil(u*N);
  for(var i=0;i<nn;i++){var y2=y+h*y;x+=h;y=y2;pts.push([A.X(x),A.Y(y)]);}D.path(pts,C.m,2.6);pts.forEach(function(p){D.dot(p[0],p[1],4,C.m);});
  var yf=Math.pow(1+h,N);D.text('h = '+nf(h,2)+'    y(2) ≈ '+nf(yf,3)+'    exacto e² = 7,389    error = '+nf(Math.exp(2)-yf,3),W/2,480,{it:true,s:19,a:'center',c:C.m});}));
})();
