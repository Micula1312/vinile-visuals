import * as THREE from 'three';
// NIGHT SHIFT: ten full-frame shader worlds, rendered by Three.js.
// All motion derives from the normalized phase; no accumulated state.
const vertex=`
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,1.0);}
`;
const fragment=`
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime,uScale,uDensity,uDepth,uRotX,uRotY,uPerspective;
uniform float uVariant;
uniform vec3 uBg,uFg,uAccent;
#define PI 3.141592653589793
#define TAU 6.283185307179586
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+11.7;a*=.5;}return v;}
float line(float x,float w){return 1.-smoothstep(w,w*2.4,abs(x));}
float ring(vec2 p,float r,float w){return line(length(p)-r,w);}
float glow(float d,float w){return w/(abs(d)+w);}
vec2 rot(vec2 p,float a){return mat2(cos(a),-sin(a),sin(a),cos(a))*p;}
vec3 ink(float v){return mix(uFg,uAccent,clamp(v,0.,1.));}
void main(){
 vec2 uv=vUv*2.-1.;
 float aspect=uResolution.x/uResolution.y;
 vec2 p=vec2(uv.x*aspect,uv.y);
 float t=uTime*TAU;
 float d=max(.5,uDensity);
 float z=max(.3,uScale);
 float depth=uDepth*.13;
 float rx=uRotX,ry=uRotY;
 float persp=uPerspective/48.;
 float scene=uVariant;
 vec3 col=uBg;
 float lum=0.,detail=0.,halo=0.;
 // 01 / CHROME CATHEDRAL: infinite ribbed nave and luminous vanishing point.
 if(scene<.5){
  vec2 q=p/(1.8+depth);
  float f=1./max(.14,abs(q.y)+.11);
  vec2 hall=vec2(q.x*f,q.y*f);
  float ribs=pow(.5+.5*cos(hall.x*2.4*d+sin(t)*.3),18.);
  float columns=pow(.5+.5*cos(hall.y*3.2+cos(t)*.3),22.);
  float vault=exp(-abs(abs(hall.x)-1.7)*2.2);
  float horizon=exp(-length(q)*1.8);
  lum=(ribs*.55+columns*.5)*vault+.45*horizon;
  detail=pow(.5+.5*cos(hall.x*1.2+hall.y*2.7),10.)*vault;
  halo=exp(-length(q)*.8)*.3;
 }
 // 02 / DATA TUNNEL: perspective laser lattice, concentric portals.
 else if(scene<1.5){
  vec2 q=rot(p,ry*.2);
  float r=length(q)/(1.5+depth);
  float a=atan(q.y,q.x);
  float tunnel=1./max(.09,r);
  float spokes=pow(.5+.5*cos(a*(10.+d*3.)+sin(t)*.25),25.);
  float portals=pow(.5+.5*cos(log(tunnel)*13.+sin(t)*1.5),22.);
  lum=spokes*.4+portals*.65;
  detail=pow(.5+.5*cos(log(tunnel)*6.-a*8.),15.);
  halo=exp(-r*.8)*.6;
 }
 // 03 / NEURAL REEF: branching filaments and living cellular membranes.
 else if(scene<2.5){
  vec2 q=p/(1.4+depth);
  q=rot(q,ry*.12);
  float n=fbm(q*1.8*d+vec2(cos(t),sin(t))*.35);
  float veins=sin(q.x*9.+n*10.)*cos(q.y*7.-n*8.);
  lum=pow(abs(veins),18.)*.85;
  detail=pow(.5+.5*sin(n*21.+q.y*3.),18.)*.7;
  halo=pow(n,2.)*.45;
 }
 // 04 / SYNTHETIC OCEAN: wireframe waves receding to a glowing horizon.
 else if(scene<3.5){
  vec2 q=p/(1.8+depth);
  float horizon=q.y+.12;
  float inv=1./max(.065,abs(horizon));
  float xx=q.x*inv;
  float wave=sin(xx*.7+sin(t)*.4)*.24+sin(xx*1.8+cos(t)*.3)*.08;
  float gridX=pow(.5+.5*cos(xx*1.4*d),24.);
  float gridZ=pow(.5+.5*cos(inv*2.4+wave),24.);
  float mask=smoothstep(.05,-.12,horizon);
  lum=(gridX*.48+gridZ*.75)*mask;
  detail=exp(-abs(horizon)*18.)*.95;
  halo=exp(-abs(horizon)*5.)*.3;
 }
 // 05 / MEGACITY: layered neon towers and atmospheric scanlines.
 else if(scene<4.5){
  vec2 q=p/(1.4+depth);
  float city=0.;
  for(int i=0;i<5;i++){
   float fi=float(i);
   vec2 v=q*mix(1.1,3.8,fi/5.);
   float id=floor(v.x+fi*13.);
   float height=.25+hash(vec2(id,fi))*1.4;
   float tower=step(-.85,v.y)*step(v.y,height-.65);
   float edge=line(fract(v.x)-.5,.025);
   float windows=pow(.5+.5*cos(v.y*18.+fi*2.),24.)*pow(.5+.5*cos(v.x*12.),14.);
   city+=tower*(edge*.38+windows*.35)*(1.-fi*.11);
  }
  lum=city;
  detail=pow(.5+.5*cos(q.y*38.+sin(t)*.2),35.)*.12;
  halo=exp(-abs(q.y+.3)*1.5)*.2;
 }
 // 06 / DIGITAL STORM: dense particle currents forming an expanding vortex.
 else if(scene<5.5){
  vec2 q=p/(1.5+depth);
  float a=atan(q.y,q.x),r=length(q);
  float spiral=a*8.+log(r+.06)*22.+sin(t)*.5;
  float strands=pow(.5+.5*cos(spiral),30.);
  float dust=pow(noise(q*22.*d+vec2(cos(t),sin(t))*.1),9.);
  lum=strands*(.3+.7*dust)*1.5;
  detail=pow(.5+.5*cos(a*42.+r*50.),35.)*.35;
  halo=exp(-r*.75)*.55;
 }
 // 07 / LIQUID CIRCUIT: chrome-like fluid strata and flowing light.
 else if(scene<6.5){
  vec2 q=p/(1.5+depth);
  float n=fbm(q*2.5+vec2(cos(t),sin(t))*.24);
  float bend=q.y+sin(q.x*1.7+n*3.+sin(t)*.2)*.45;
  lum=pow(.5+.5*cos(bend*14.*d+n*8.),28.);
  detail=pow(.5+.5*cos(bend*5.+q.x*1.2),12.)*.5;
  halo=fbm(q*1.3)*.45;
 }
 // 08 / IMPOSSIBLE GRID: folding non-Euclidean optical architecture.
 else if(scene<7.5){
  vec2 q=rot(p/(1.4+depth),ry*.15);
  float fold=sin(q.y*2.+sin(t)*.2)*.5;
  q.x+=fold;
  float n=fbm(q*1.2);
  q=rot(q,rx*.15+n*.5);
  float perspective=1./max(.2,abs(q.y+.6));
  vec2 g=vec2(q.x*perspective,q.y*perspective);
  lum=pow(.5+.5*cos(g.x*5.*d),35.)*.65+pow(.5+.5*cos(g.y*5.*d),35.)*.65;
  detail=pow(.5+.5*cos((g.x+g.y)*2.),25.)*.4;
  halo=exp(-length(q)*.8)*.25;
 }
 // 09 / PHOTON GARDEN: bioluminescent filaments in a volumetric field.
 else if(scene<8.5){
  vec2 q=p/(1.4+depth);
  for(int i=0;i<9;i++){
   float fi=float(i);
   float x=sin(q.y*(1.4+fi*.23)+fi*1.71+sin(t)*.3)*(.3+fi*.14)+sin(fi*8.2)*1.2;
   float dist=abs(q.x-x);
   lum+=glow(dist,.008)*(.08+fi*.012);
   detail+=glow(dist,.045)*.015;
  }
  halo=fbm(q*1.4+vec2(sin(t)*.15,cos(t)*.15))*.22;
 }
 // 10 / SINGULARITY: gravitational lens, accretion disc, optical interference.
 else {
  vec2 q=rot(p/(1.7+depth),ry*.12);
  float r=length(q),a=atan(q.y,q.x);
  float warped=r+.12/(r+.15);
  float disk=exp(-abs(q.y+sin(a*3.+sin(t)*.2)*.13)*11.)*smoothstep(.35,.9,r);
  lum=disk*(.5+.5*cos(a*18.+warped*8.))*.9;
  detail=ring(q,.54,.018)+ring(q,.67,.012)+ring(q,.8,.008);
  halo=glow(r-.48,.08)*.45;
 }
 float scan=pow(.5+.5*cos((uv.y+sin(t)*.004)*950.),25.)*.055;
 float intensity=clamp(lum+detail*.65,0.,1.5);
 col+=ink(.2+.65*detail)*(intensity*.82);
 col+=uAccent*halo*.3;
 col+=uFg*scan;
 // Avoid an opaque blank frame: all ten worlds retain their own geometry.
 col=clamp(col,0.,1.);
 gl_FragColor=vec4(col,1.);
}
`;
let renderer,scene,camera,quad,uniforms,failed=false;
function setup(){
 const canvas=document.createElement('canvas');
 renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(1);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 uniforms={
 uResolution:{value:new THREE.Vector2(1,1)},uTime:{value:0},uScale:{value:1},
 uDensity:{value:1},uDepth:{value:0},uRotX:{value:0},uRotY:{value:0},
 uPerspective:{value:48},uVariant:{value:0},uBg:{value:new THREE.Color()},
 uFg:{value:new THREE.Color()},uAccent:{value:new THREE.Color()}
 };
 scene=new THREE.Scene();
 camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,depthTest:false,depthWrite:false}));
 scene.add(quad);
}
export function renderNight(c,w,h,phase,s,p,P){
 try{
  if(!renderer)setup();
  const rw=Math.min(1600,Math.max(2,Math.round(w)));
  const rh=Math.max(2,Math.round(h*rw/w));
  renderer.setSize(rw,rh,false);
  uniforms.uResolution.value.set(rw,rh);
  uniforms.uTime.value=(phase*(p.speed||1))%1;
  uniforms.uScale.value=p.scale||1;
  uniforms.uDensity.value=p.geometryDensity||1;
  uniforms.uDepth.value=p.cameraDepth||0;
  uniforms.uRotX.value=p.rotationX||0;
  uniforms.uRotY.value=p.rotationY||0;
  uniforms.uPerspective.value=p.perspective||48;
  uniforms.uVariant.value=s.variant;
  uniforms.uBg.value.set(s.colors[0]);
  uniforms.uFg.value.set(s.colors[1]);
  uniforms.uAccent.value.set(P.highlight);
  renderer.render(scene,camera);
  c.drawImage(renderer.domElement,0,0,w,h);
 }catch(err){
  if(!failed){console.error('Night Shift shader error:',err);failed=true}
  c.fillStyle=s.colors[0];c.fillRect(0,0,w,h);
  c.strokeStyle=P.highlight;c.lineWidth=Math.max(2,h*.01);
  for(let i=0;i<20;i++){c.beginPath();c.ellipse(w/2,h/2,h*(.1+i*.04),h*(.07+i*.02),0,0,Math.PI*2);c.stroke()}
 }
}
