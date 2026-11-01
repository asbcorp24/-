// Cinematic volumetric-looking title cards for Three.js r165.
export function createCinematicCredits(THREE,camera){
 const group=new THREE.Group();camera.add(group);group.visible=false;
 const layers=[];let cache='';
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(6.3,2.15),new THREE.MeshBasicMaterial({color:0x030814,transparent:true,opacity:.85,depthTest:false,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}));
 backdrop.position.z=-.57;backdrop.renderOrder=999;group.add(backdrop);
 const frame=new THREE.Mesh(new THREE.PlaneGeometry(6.38,2.23),new THREE.MeshBasicMaterial({color:0x22658d,transparent:true,opacity:.38,depthTest:false,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}));
 frame.position.z=-.59;frame.renderOrder=998;group.add(frame);
 for(let i=0;i<8;i++){
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=512;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:i===7?THREE.AdditiveBlending:THREE.NormalBlending});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(5.5,1.375),material);
  mesh.position.z=-i*.055;mesh.renderOrder=1000+i;group.add(mesh);
  layers.push({canvas,texture,material,mesh});
 }
 function hide(){group.visible=false}
 function render({title='',subtitle='',mode='fly',power=65,time=0,duration=5}){
  group.visible=true;
  const key=title+'|'+subtitle;
  if(key!==cache){
   cache=key;
   for(let i=0;i<layers.length;i++){
    const layer=layers[i],ctx=layer.canvas.getContext('2d');
    ctx.clearRect(0,0,2048,512);ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor=i===7?'#40dfff':'#1769ca';ctx.shadowBlur=i===7?45:7;
    ctx.fillStyle=i===0?'#ffffff':i===7?'#45cfff':'#2771b6';
    ctx.font='bold 108px Arial,sans-serif';ctx.fillText(title,1024,195,1900);
    ctx.font='56px Arial,sans-serif';ctx.fillText(subtitle,1024,350,1900);
    layer.texture.needsUpdate=true;
   }
  }
  const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  const strength=clamp(Number(power)/100),enter=smooth(time/1.3),exit=smooth((duration-time)/1.1),motion=1-enter;
  group.position.set(0,mode==='rise'?-strength*1.6*motion:Math.sin(time*.5)*.06*strength,-5-(mode==='fly'?strength*6*motion:strength*.7*motion));
  group.rotation.set(mode==='rise'?strength*.2*motion:0,mode==='orbit'?strength*.85*motion:Math.sin(time*.3)*.03*strength,0);
  group.scale.setScalar(1+Math.sin(time*.8)*.045*strength);
  backdrop.material.opacity=.85*enter*exit;frame.material.opacity=.38*enter*exit;
  layers.forEach((layer,i)=>{layer.material.opacity=enter*exit*(i===0?1:i===7?.4:.2);layer.mesh.position.x=Math.sin(time*.7+i*.2)*strength*.015});
 }
 return {render,hide,group};
}
