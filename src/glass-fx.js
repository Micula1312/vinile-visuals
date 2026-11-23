// GLASS / OPTICAL FX — GPU post-process over the existing 2D renderer.
// The source remains untouched; the result is composited back into its Canvas2D context.
const canvas=document.createElement('canvas');
let gl,program,texture,buffer,uniforms,unavailable=false;
const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;
uniform sampler2D source;
uniform vec2 resolution;
uniform float time,refraction,bloom,softness,chromatic;
vec3 getColor(vec2 p){return texture2D(source,clamp(p,vec2(0.),vec2(1.))).rgb;}
float energy(vec3 c){return max(max(c.r,c.g),c.b);}
void main(){
 vec2 p=uv;
 float loop=6.28318530718*time;
 // Smooth, periodic lens field. No random jitter or non-looping drift.
 float ripple=sin(p.x*13.+sin(p.y*8.+loop)*1.7+loop)*cos(p.y*10.-loop);
 vec2 warp=vec2(sin(p.y*11.+loop),cos(p.x*9.-loop))*.012*refraction;
 warp+=vec2(ripple,-ripple)*.008*refraction;
 vec2 q=clamp(p+warp,vec2(0.),vec2(1.));
 vec2 split=vec2(chromatic*.007,chromatic*.002);
 vec3 col=vec3(getColor(q+split).r,getColor(q).g,getColor(q-split).b);
 // Optical defocus only on lit pixels. Black stays solid.
 vec2 px=1./resolution;
 vec3 blur=vec3(0.);
 for(int i=0;i<8;i++){
  float angle=float(i)*.7853981634;
  vec2 dir=vec2(cos(angle),sin(angle));
  blur+=getColor(q+dir*px*(2.+softness*16.));
 }
 blur/=8.;
 float mask=smoothstep(.055,.27,energy(col));
 col=mix(col,blur,softness*.75*mask);
 vec3 halo=vec3(0.);
 for(int j=0;j<12;j++){
  float a=float(j)*.5235987756;
  vec2 dir=vec2(cos(a),sin(a));
  vec3 sampleColor=getColor(q+dir*px*(4.+bloom*28.));
  halo+=sampleColor*smoothstep(.22,.65,energy(sampleColor));
 }
 halo/=12.;
 col+=halo*bloom*.48;
 // Preserve the full black field: glow cannot wash the background.
 float coverage=smoothstep(.018,.13,energy(col));
 col*=coverage;
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
function init(){
 try{
  gl=canvas.getContext('webgl',{alpha:false,preserveDrawingBuffer:true,antialias:false});
  if(!gl)throw Error('WebGL unavailable');
  const compile=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh};
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  uniforms=Object.fromEntries(['source','resolution','time','refraction','bloom','softness','chromatic'].map(k=>[k,gl.getUniformLocation(program,k)]));
  return true;
 }catch(error){console.warn('VINILE GLASS FX: WebGL unavailable, keeping original image',error);unavailable=true;return false}
}
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
export function applyGlassFX(ctx,w,h,phase,p){
 const refraction=clamp(p.glassRefraction),bloom=clamp(p.glassBloom),softness=clamp(p.glassSoftness),chromatic=clamp(p.glassChromatic);
 if(!(refraction||bloom||softness||chromatic)||unavailable)return;
 if(!gl&&!init())return;
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
 gl.useProgram(program);gl.bindTexture(gl.TEXTURE_2D,texture);
 // Upload the already-rendered 2D canvas. UNPACK_FLIP_Y_WEBGL aligns texture with screen UV.
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ctx.canvas);
 gl.uniform1i(uniforms.source,0);gl.uniform2f(uniforms.resolution,w,h);gl.uniform1f(uniforms.time,phase);
 gl.uniform1f(uniforms.refraction,refraction);gl.uniform1f(uniforms.bloom,bloom);gl.uniform1f(uniforms.softness,softness);gl.uniform1f(uniforms.chromatic,chromatic);
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 ctx.save();ctx.globalCompositeOperation='copy';ctx.drawImage(canvas,0,0,w,h);ctx.restore();
}
