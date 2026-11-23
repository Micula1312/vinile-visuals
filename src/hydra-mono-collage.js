// DISCO 16 — MONOCHROME COLLAPSE
// Original Hydra reinterpretation of the supplied black/white geometric collage.
// Animated blocks, masked circles, nested recursive frames and analogue interference.
// All motion uses the looping 30s phase provided by VINILE's Hydra editor.
export const monoHydraStudy={
 id:'night-016',
 name:'DISCO / 16 — MONOCHROME COLLAPSE',
 params:[['motion',0.35,0,2],['grain',0.5,0,1],['glitch',0.35,0,1],['depth',0.65,0,1]],
 code:`// DISCO 16 / MONOCHROME COLLAPSE — HYDRA LIVE
// Black & white architecture, masked discs and recursive screen feedback.
// Controls: MOTION / GRAIN / GLITCH / DEPTH.
const motion=param('motion',0.35,0,2);
const grain=param('grain',0.5,0,1);
const glitch=param('glitch',0.35,0,1);
const depth=param('depth',0.65,0,1);
const t=()=>time()*Math.PI*2/30;
const drift=(offset,amp)=>Math.sin(t()+offset)*motion()*amp;
const block=(w,h,x,y,white=1)=>shape(4,1,0)
  .scale(1,w,h).scrollX(()=>x+drift(x*8,0.016))
  .scrollY(()=>y+drift(y*8,0.012))
  .color(white,white,white);
const disc=(size,x,y,shade)=>shape(99,1,.001)
  .scale(1,size,size*2.0).scrollX(()=>x+drift(2,0.013))
  .scrollY(()=>y+drift(3,0.01)).color(shade,shade,shade);
// Build separate passes to keep a readable graphic structure.
solid(0,0,0)
 .add(block(.57,.42,-.14,.31,.52))
 .add(block(.42,.27,-.28,.05,.85))
 .add(block(.3,.34,.23,.32,.67))
 .add(block(.36,.21,.02,-.18,.13))
 .add(block(.26,.31,.32,-.27,.84))
 .add(disc(.32,.19,.08,.12).mask(block(.34,.37,.20,.10)))
 .add(disc(.43,.34,-.25,.58).mask(block(.35,.4,.34,-.25)))
 .add(block(.28,.09,-.17,.28,.08))
 .out(o0);
// Receding rectangular frames: the recursive staircase.
solid(0,0,0)
 .add(block(.46,.49,-.20,-.23,.82))
 .add(block(.41,.44,-.19,-.22,.07))
 .add(block(.34,.38,-.18,-.20,.69))
 .add(block(.29,.32,-.16,-.19,.07))
 .add(block(.24,.27,-.15,-.17,.8))
 .add(block(.20,.22,-.13,-.15,.05))
 .add(block(.16,.17,-.12,-.13,.68))
 .add(block(.12,.13,-.11,-.11,.05))
 .out(o1);
// Slow shifting architecture, feedback recursion, monochrome texture.
src(o0)
 .add(src(o1),()=>Math.max(.15,depth()))
 .add(src(o1).scale(()=>1+depth()*.05)
   .scrollX(()=>drift(1.2,.025))
   .scrollY(()=>drift(2.1,.018)),()=>depth()*.22)
 .add(noise(85,0).color(1,1,1).contrast(1.8),()=>grain()*.12)
 .modulate(osc(110,0,0).rotate(Math.PI/2),()=>glitch()*.018)
 .modulate(src(o1),()=>glitch()*.035)
 .contrast(1.15)
 .saturate(0)
 .out(o2);
render(o2);`
};
