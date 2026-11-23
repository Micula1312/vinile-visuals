// Three VINILE red Hydra studies, versioned in GitHub rather than browser-only storage.
// They remain editable in HYDRA LIVE EDITOR.
export const redHydraStudies=[
 {id:'night-011',name:'RED / KALEID FEEDBACK',params:[['frequency',40,1,100],['speed',0.015,0,0.2],['feedback',0.05,0,0.3],['red',0.9,0,2]],code:`osc(param('frequency',40,1,100), param('speed',0.015,0,0.2), 100)
  .modulateScale(osc(40, 0.005, 1).kaleid(8))
  .repeat(2, 4)
  .modulate(o0, param('feedback',0.05,0,0.3))
  .modulateKaleid(shape(4, 0.1, 1))
  .color(param('red',0.9,0,2), 0, 0.14)
  .out(o0);`},
 {id:'night-012',name:'RED / OSCILLATOR GRID',params:[['frequency',100,1,150],['speed',0.01,0,0.2],['red',1.8,0,3],['rotation',0.1,-1,1]],code:`osc(param('frequency',100,1,150), param('speed',0.01,0,0.2), 1.4)
  .rotate(0, param('rotation',0.1,-1,1))
  .mult(
    osc(10, 0.1)
      .modulate(osc(10).rotate(0, -0.1), 1)
  )
  .color(param('red',1.8,0,3), 0, 0.08)
  .out(o0);`},
 {id:'night-013',name:'RED / NOISE PORTAL',params:[['noise',6,1,20],['speed',1,0.1,3],['red',1.5,0,3],['zoom',1,0.2,3]],code:`noise(param('noise',6,1,20), .05)
  .color(param('red',1.5,0,3), 0, 0.08)
  .mult(
    osc(9, 0, () => Math.sin((time()*param('speed',1,0.1,3)())/1.5)+2)
      .color(1.8, 0, 0.1)
  )
  .mult(
    noise(9, .03)
      .brightness(1.2)
      .contrast(2)
      .color(1.5, 0, 0.05)
      .mult(
        osc(9, 0, () => Math.sin(time()/3)+13)
          .color(2, 0, 0.08)
      )
  )
  .diff(
    noise(15, .04)
      .brightness(.2)
      .contrast(1.3)
      .color(1.4, 0, 0.06)
      .mult(
        osc(9, 0, () => Math.sin(time()/5)+13)
          .color(1.8, 0, 0.08)
      )
      .rotate(() => time()/33)
  )
  .scale(() => Math.sin(time()/6.2)*.12+.15)
  .modulateScale(
    osc(3, 0, 0)
      .mult(osc(3, 0, 0).rotate(3.14/2))
      .rotate(() => time()/25)
      .scale(.39)
      .scale(1, .6, 1)
      .invert(),
    () => Math.sin(time()/5.3)*1.5+3
  )
  .rotate(() => time()/22)
  .mult(shape(100, .9, .01).scale(1, .6, 1))
  .out(o0);`},
 {id:'night-014',name:'RED / AUDIO SHAPES',params:[['speed',1,0.1,3],['red',1.5,0,3],['feedback',0.35,0,1],['reactivity',0.5,0,1],['geometry',4,3,12]],code:`// Adapted from the supplied audio-reactive Hydra patch.
// REACTIVITY simulates audio movement without requiring microphone access.
const pulse = () => (0.5 + 0.5*Math.sin(time()*param('speed',1,0.1,3)()*4))*param('reactivity',0.5,0,1)();
const s = () => shape(param('geometry',4,3,12))
  .scrollX([-0.5,-0.2,0.3,-0.1,-0.1].smooth(0.1).fast(0.3))
  .scrollY([0.25,-0.2,0.3,-0.1,0.2].smooth(0.9).fast(0.15));
solid()
  .add(gradient(3,0.05).rotate(0.05,-0.2).posterize(2).contrast(0.6),
    [1,0,1,0.5,0,0.6].smooth(0.9))
  .add(s())
  .mult(s().scale(0.8).scrollX(0.01).scrollY(-0.01)
    .rotate(0.2,0.06)
    .add(gradient(3).contrast(0.6),[1,0,1,0.5].smooth(0.9))
    .mult(src(o0).scale(0.98),()=>pulse()*9))
  .diff(s().modulate(shape(500)).scale([1.7,1.2].smooth(0.9).fast(0.05)))
  .add(gradient(2).invert(),()=>pulse())
  .mult(gradient(()=>pulse()*8))
  .blend(src(o0),()=>pulse()*param('feedback',0.35,0,1)())
  .add(voronoi(()=>1+pulse()*5,()=>pulse(),()=>pulse())
    .thresh(0.7).posterize(2,4).luma(0.9)
    .scrollY(1,()=>pulse()/30)
    .thresh(()=>pulse()).scale(()=>1+pulse()*2),()=>pulse()/2)
  .color(param('red',1.5,0,3),0,0.08)
  .out(o0);`}
];
