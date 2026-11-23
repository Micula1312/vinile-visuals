// LIVE / CENA — ten original slow, fire-toned Hydra compositions.
// Visual studies interpreted from supplied references; not pixel-identical copies.
const head=(body)=>`// LIVE CENA — editable controls
const tempo=param('tempo',0.12,0,1);
const fire=param('fire',1.6,0,3);
const motion=()=>time()*tempo();
${body}
`;
export const cenaStudies=[
 ['SOLAR CORE',`// Correct for the 2304x512 panoramic canvas: preserve circular proportions.
const aspect=1; // Rendered in a square Hydra source to keep the solar disc round.
const sun=()=>shape(99,.35,.20).scale(1,1/aspect,1)
  .modulate(noise(2.5,()=>tempo()*.016).scale(1,1/aspect,1),.055);
const surface=()=>noise(5,()=>tempo()*.018)
  .modulate(noise(2,()=>tempo()*.009),.12)
  .color(fire,.18,.035);
solid(0,0,0)
  .add(sun().color(fire,.18,.025).brightness(.18),.85)
  .add(surface().mask(sun()),.68)
  .add(shape(99,.39,.35).scale(1,1/aspect,1).color(fire,.13,.015),.18)
  .out(o0);`],
 ['RED ECLIPSE',`solid(.01,0,0).add(shape(99,.35,.12).color(fire,.015,.035)).mult(gradient(1).rotate(()=>motion()*.07).brightness(.25)).out(o0);`],
 ['EMBER TUNNEL',`osc(16,()=>tempo()*.006,1).kaleid(16).modulateRotate(noise(1.2,()=>tempo()*.025),.22).color(fire,.04,.025).contrast(1.12).out(o0);`],
 ['MOLTEN CURTAIN',`noise(1.8,()=>tempo()*.035).modulate(osc(3,()=>tempo()*.003),.23).color(fire,.22,.025).contrast(1.08).out(o0);`],
 ['FIRE BLOOM',`noise(2.8,()=>tempo()*.018).modulateScale(noise(1.5,()=>tempo()*.012),.5).color(fire,.12,.025).brightness(-.2).contrast(1.15).out(o0);`],
 ['SOLAR HALO',`osc(34,()=>tempo()*.004,0).kaleid(90).mask(shape(99,.33,.22)).color(fire,.31,.055).add(shape(99,.21,.22).color(0,0,0),.8).out(o0);`],
 ['RED PLASMA',`osc(100,()=>tempo()*.002,1.4).rotate(0,()=>tempo()*.015).mult(osc(10,()=>tempo()*.008).modulate(osc(10).rotate(0,()=>-tempo()*.01),.4)).color(fire,0,.08).out(o0);`],
 ['LAVA VEINS',`voronoi(5,()=>tempo()*.015,.15).modulate(noise(2,()=>tempo()*.02),.2).color(fire,.08,.015).contrast(1.1).out(o0);`],
 ['BURNING HORIZON',`gradient(1).rotate(0,()=>tempo()*.005).add(osc(7,()=>tempo()*.005,.5).modulate(noise(1,()=>tempo()*.015),.4),.5).color(fire,.15,.015).contrast(1.6).out(o0);`],
 ['AFTERGLOW',`osc(12,()=>tempo()*.003,.7).modulateScale(noise(1,()=>tempo()*.008),.22).color(fire,.05,.02).blend(src(o0).scale(.998),.25).out(o0);`]
].map(([name,body],i)=>({id:'body-'+String(i+1).padStart(3,'0'),name:'LIVE / CENA — '+name,code:head(body),params:[['tempo',0.12,0,1],['fire',1.6,0,3],['softness',0.65,0,1]]}));
