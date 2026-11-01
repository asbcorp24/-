// Animated, spatially coherent color patches on STL wireframes.
// Keeps original wireframe geometry and material opacity.
export function enableWirePatches(THREE,material){
 const uniforms={enabled:{value:0},strength:{value:.7},scale:{value:3},time:{value:0}};
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vPatchPosition;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPatchPosition=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vPatchPosition;
uniform float enabled;
uniform float strength;
uniform float scale;
uniform float time;
float patchHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float patchNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(patchHash(i),patchHash(i+vec3(1,0,0)),f.x),mix(patchHash(i+vec3(0,1,0)),patchHash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(patchHash(i+vec3(0,0,1)),patchHash(i+vec3(1,0,1)),f.x),mix(patchHash(i+vec3(0,1,1)),patchHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
if(enabled>0.5){
 vec3 p=vPatchPosition*scale+vec3(time*.13,time*.07,-time*.09);
 float n=patchNoise(p)+.3*patchNoise(p*2.3);
 float spot=smoothstep(.35,.68,n);
 vec3 blue=vec3(.09,.77,1.0),pink=vec3(1.0,.13,.7),gold=vec3(1.0,.67,.13),green=vec3(.12,1.0,.63);
 vec3 tint=mix(blue,pink,smoothstep(.35,.7,patchNoise(p+vec3(9.0))));
 tint=mix(tint,gold,smoothstep(.54,.76,patchNoise(p+vec3(21.0))));
 tint=mix(tint,green,smoothstep(.6,.8,patchNoise(p+vec3(41.0))));
 diffuseColor.rgb=mix(diffuseColor.rgb,tint,spot*strength);
}`);
 };
 material.customProgramCacheKey=()=> 'wire-patches-v1';
 return uniforms;
}
