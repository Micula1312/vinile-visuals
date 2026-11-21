// Adjustable brutalist print treatment for Canvas2D. Apply after drawing a scene.
export function posterize(ctx,width,height,{levels=4,grain=0,halftone=0,threshold=0}={}){
 const l=Math.max(2,Math.min(8,Math.round(levels)));
 const img=ctx.getImageData(0,0,width,height),d=img.data;
 const bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const k=(y*width+x)*4,offset=(bayer[(y&3)*4+(x&3)]/15-.5)*grain*90;
  for(let c=0;c<3;c++){let v=Math.max(0,Math.min(255,d[k+c]+offset));if(threshold>0)v=v<255*threshold?0:v;else v=Math.round(v/255*(l-1))*255/(l-1);d[k+c]=v}
 }
 ctx.putImageData(img,0,0);
 if(halftone>0){
  const step=Math.max(4,Math.round(18-halftone*13));
  ctx.save();ctx.fillStyle='#0A0809';ctx.globalAlpha=Math.min(.6,halftone*.45);
  for(let y=0;y<height;y+=step)for(let x=(Math.floor(y/step)%2)*step/2;x<width;x+=step){ctx.beginPath();ctx.arc(x,y,step*.12,0,Math.PI*2);ctx.fill()}
  ctx.restore();
 }
}