// Three VINILE red Hydra studies, versioned in GitHub rather than browser-only storage.
// They remain editable in HYDRA LIVE EDITOR.
export const redHydraStudies=[
 {id:'night-011',name:'RED / KALEID FEEDBACK',code:`osc(40, 0.015, 100)
  .modulateScale(osc(40, 0.005, 1).kaleid(8))
  .repeat(2, 4)
  .modulate(o0, 0.05)
  .modulateKaleid(shape(4, 0.1, 1))
  .color(0.9, 0, 0.14)
  .out(o0);`},
 {id:'night-012',name:'RED / OSCILLATOR GRID',code:`osc(100, 0.01, 1.4)
  .rotate(0, 0.1)
  .mult(
    osc(10, 0.1)
      .modulate(osc(10).rotate(0, -0.1), 1)
  )
  .color(1.8, 0, 0.08)
  .out(o0);`},
 {id:'night-013',name:'RED / NOISE PORTAL',code:`noise(6, .05)
  .color(1.5, 0, 0.08)
  .mult(
    osc(9, 0, () => Math.sin(time()/1.5)+2)
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
  .out(o0);`}
];
