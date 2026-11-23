// Velvet Pool by Mahalia H-R (IG: mm_hr_).
// Original artwork: CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// Adaptation for VINILE: slow deterministic motion and adjustable audio simulation.
// This derivative retains attribution and the CC BY-NC-SA 4.0 license.
export const velvetLiveStudy={
 id:'night-004',
 name:'DISCO / 04 — VELVET POOL (Mahalia H-R)',
 params:[
  ['tempo',0.035,0,0.5],
  ['reactivity',0.45,0,1],
  ['rotation',0.012,0,0.15],
  ['distortion',0.4,0,2],
  ['scale',1,0.2,2]
 ],
 code:`// Velvet Pool — Mahalia H-R (IG: mm_hr_)
// CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// VINILE adaptation: time-controlled simulated FFT for silent live playback.
// The three Hydra output passes o0, o1, o2 and render(o2) are preserved.
const tempo=param('tempo',0.035,0,0.5);
const reactivity=param('reactivity',0.45,0,1);
const rotation=param('rotation',0.012,0,0.15);
const distortion=param('distortion',0.4,0,2);
const zoom=param('scale',1,0.2,2);
const clock=()=>time()*tempo();
const fft0=()=>Math.max(.02,(.35+.22*Math.sin(clock()*1.3))*reactivity());
const fft1=()=>Math.max(.02,(.35+.2*Math.sin(clock()*.71+1.1))*reactivity());
const fft2=()=>Math.max(.02,(.42+.23*Math.sin(clock()*.53+2))*reactivity());
noise(2,()=>tempo()*.004)
  .color(()=>fft2()*2,0,.6)
  .modulate(noise(()=>Math.max(.2,fft0()*10),()=>tempo()*.005),()=>distortion()*.3)
  .scale(()=>Math.max(.2,fft2()*5)*zoom())
  .layer(
    src(o0)
      .mask(osc(10,()=>tempo()*.008).modulateRotate(osc(2,()=>tempo()*.006),90,0))
      .scale(()=>Math.max(.25,fft0()*2)*zoom())
      .luma(0.2,0.3)
  )
  .blend(src(o0),.4)
  .out(o0);
osc(4,()=>tempo()*.008)
  .modulate(noise(()=>fft1()+5,()=>tempo()*.005),()=>distortion()*.5)
  .color(1,0,0)
  .out(o1);
src(o0)
  .modulate(src(o1),()=>distortion()*.25)
  .layer(src(o1).mask(src(o1)).saturate(7))
  .modulateRotate(src(o1),()=>distortion()*.25)
  .rotate(()=>clock()*rotation())
  .out(o2);
render(o2);`
};
