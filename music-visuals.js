// Music-driven 3D particles, spectral rings, tunnel motion and wireframe energy.
// All objects live inside Three.js, so canvas MediaRecorder captures them.
export function createMusicVisuals(THREE,scene,bloomLayer){
 const count=700,positions=new Float32Array(count*3),colors=new Float32Array(count*3),velocities=new Float32Array(count*3),ages=new Float32Array(count);
 for(let i=0;i<count;i++)positions[i*3+2]=-1000;
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const particles=new THREE.Points(geo,new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));particles.layers.enable(bloomLayer);scene.add(particles);
 const rings=[];for(let i=0;i<12;i++){const mesh=new THREE.Mesh(new THREE.TorusGeometry(1.45+i*.065,.008,4,96),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(i/12,.95,.58),transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));mesh.layers.enable(bloomLayer);scene.add(mesh);rings.push(mesh)}
 let cursor=0,phase=0;
 function emit(amount,center){for(let j=0;j<amount;j++){const i=cursor++%count,k=i*3,a=Math.random()*Math.PI*2,z=Math.random()*2-1,t=Math.sqrt(1-z*z),speed=1.1+Math.random()*3;positions[k]=center.x;positions[k+1]=center.y;positions[k+2]=center.z;velocities[k]=Math.cos(a)*t*speed;velocities[k+1]=Math.sin(a)*t*speed;velocities[k+2]=z*speed;ages[i]=.4+Math.random()*.85;const c=new THREE.Color().setHSL(Math.random(),.95,.6);colors[k]=c.r;colors[k+1]=c.g;colors[k+2]=c.b}}
 function update(dt,levels,settings,model,baseRings,wire,tunnel){
  const {bass,mid,treble,beat}=levels,active=settings.enabled,amount=settings.amount/100;phase+=dt*(1+mid*4);
  const center=model?.visible?model.position:new THREE.Vector3(0,0,0);
  if(active&&settings.particles&&beat)emit(Math.min(140,Math.round(20+110*amount)),center);
  for(let i=0;i<count;i++){if(ages[i]<=0)continue;ages[i]-=dt;const k=i*3;positions[k]+=velocities[k]*dt;positions[k+1]+=velocities[k+1]*dt;positions[k+2]+=velocities[k+2]*dt;if(ages[i]<=0)positions[k+2]=-1000}
  geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;particles.visible=active&&settings.particles;
  rings.forEach((r,i)=>{r.visible=active&&settings.rings&&!!model?.visible;if(!r.visible)return;r.position.copy(center);r.rotation.set(phase*.08+i*.15,phase*.12+i*.25,0);const scale=1+(bass*.24+mid*.12)*amount+Math.sin(phase*1.4+i*.5)*.04;r.scale.setScalar(scale);r.material.opacity=Math.min(.8,.16+mid*.45+treble*.25)*amount});
  if(active&&settings.tunnel){wire.material.color.setHSL((phase*.025+mid*.2)%1,.9,.55);wire.material.opacity=Math.min(1,wire.material.opacity*(1+mid*.65*amount));baseRings.forEach((r,i)=>{r.material.color.setHSL((phase*.025+i*.027)%1,.9,.57);r.scale.setScalar(1+bass*.13*amount)})}else{wire.material.color.set(0x32cfff);baseRings.forEach(r=>{r.material.color.set(0x8aeaff);r.scale.setScalar(1)})}
  if(model?.material?.userData?.musicWaveUniforms){const u=model.material.userData.musicWaveUniforms;u.value=active&&settings.waves?(bass*.6+mid*.6+treble*.3)*amount:0}
 }
 return {update,dispose(){scene.remove(particles);geo.dispose();particles.material.dispose();rings.forEach(r=>{scene.remove(r);r.geometry.dispose();r.material.dispose()})}};
}
