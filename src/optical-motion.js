// OPTICAL STUDIES: deterministic, Hydra-inspired WebGL oscillator/modulation sketches.
// No feedback or wall-clock time: phase 0 and phase 1 produce identical images.
const TAU=Math.PI*2;
let gpu=null;
const hex=s=>{const h=s.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)};
function init(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:false,preserveDrawingBuffer:true,antialias:false});
 if(!gl)return null;
 const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
 const fragment=`precision highp float;
 varying vec2 uv;
 uniform vec2 resolution;
 uniform float time,mode,zoom,distort,frequency,blur;
 uniform vec3 background,foreground,accent;
 const float PI=3.141592653589793;
 float ring(float x,float center,float width){return 1.-smoothstep(width,width+blur,abs(x-center));}
 void main(){
  vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.)/max(.15,zoom);
  float t=time*6.28318530718;
  float r=length(p),ang=atan(p.y,p.x);
  float warp=distort*.15*sin(p.y*frequency*6.+t)*cos(p.x*frequency*3.-t);
  float val=0.;
  if(mode<.5){val=ring(r+warp,.28+.045*sin(t),.075);}
  else if(mode<1.5){val=ring(r+warp,.20+.06*cos(t),.045)+ring(r+warp,.42,.035);}
  else if(mode<2.5){val=.5+.5*sin((p.x+warp)*frequency*22.+3.*sin(p.y*5.+t));}
  else if(mode<3.5){val=.5+.5*cos(ang*8.+t+4.*r+warp*12.);val*=smoothstep(.65,.12,r);}
  else if(mode<4.5){val=ring(length(vec2(p.x*1.5,p.y*.8))+warp,.3,.07);}
  else if(mode<5.5){val=.5+.5*sin((r+warp)*frequency*24.-2.*sin(ang*4.+t));}
  else if(mode<6.5){vec2 q=abs(fract((p+vec2(.8))*frequency*2.)-.5);val=ring(length(q)+warp,.23,.075);}
  else if(mode<7.5){val=.5+.5*sin(p.x*frequency*15.+sin(p.y*frequency*9.+t)*3.);}
  else if(mode<8.5){val=ring(abs(p.x+warp),.22+.06*sin(t+p.y*3.),.06);}
  else {val=.5+.5*sin((r+warp)*frequency*35.+sin(ang*6.-t)*2.);val*=smoothstep(.9,.1,r);}
  val=clamp(val,0.,1.);
  vec3 color=mix(background,foreground,smoothstep(.20,.86,val));
  float glow=exp(-pow((val-.7)*3.,2.))*.35;
  color=mix(color,accent,glow);
  gl_FragColor=vec4(color,1.);
 }`;
 const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 try{
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const uniforms={};for(const name of ['resolution','time','mode','zoom','distort','frequency','blur','background','foreground','accent'])uniforms[name]=gl.getUniformLocation(program,name);
  return {canvas,gl,uniforms};
 }catch(e){console.warn('Optical shader unavailable',e);return null}
}
export function renderOptical(c,w,h,phase,scene,params,P){
 if(!gpu)gpu=init();
 const bg=scene.colors[0],fg=scene.colors[1];
 if(!gpu){c.fillStyle=bg;c.fillRect(0,0,w,h);return}
 const {canvas,gl,uniforms:u}=gpu;
 // Cap preview work; export uses the same shader at the requested dimensions.
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
 const rgb=(loc,color)=>gl.uniform3fv(loc,hex(color));
 gl.uniform2f(u.resolution,w,h);
 gl.uniform1f(u.time,((phase*(params.speed||1))%1+1)%1);
 gl.uniform1f(u.mode,scene.variant);
 gl.uniform1f(u.zoom,params.scale||1);
 gl.uniform1f(u.distort,params.distort??.55);
 gl.uniform1f(u.frequency,params.frequency??1);
 gl.uniform1f(u.blur,params.blur??.08);
 rgb(u.background,bg);rgb(u.foreground,fg);rgb(u.accent,P.highlight);
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 c.drawImage(canvas,0,0,w,h);
}
