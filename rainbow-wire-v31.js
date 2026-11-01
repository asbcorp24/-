// Smooth animated rainbow color across STL wireframe edges.
// Color follows local object coordinates, so rotation does not detach the effect.
export function enableRainbowWire(THREE,material){
 const uniforms={enabled:{value:0},strength:{value:.8},scale:{value:3},time:{value:0},glow:{value:1},energy:{value:0}};
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vRainbowPos;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRainbowPos=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vRainbowPos;
uniform float enabled;
uniform float strength;
uniform float scale;
uniform float time;
uniform float glow;\nuniform float energy;
vec3 rainbow(float x){return .5+.5*cos(6.2831853*(x+vec3(0.,.333333,.666667)));}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
if(enabled>0.5){
 vec3 p=vRainbowPos;
 float wave=sin(p.x*scale*1.3+time*.52)+sin(p.y*scale*.93-time*.35)+sin(p.z*scale*1.17+time*.23);
 float hue=dot(p,vec3(.31,.48,.21))*scale*.14+wave*.085+time*.045;
 vec3 rainbowColor=rainbow(hue);
 float bright=.82+.18*sin(wave*1.4+time*.7);
 float pulse=pow(max(0.,sin(dot(p,vec3(1.3,2.1,.9))*6.-time*9.)),12.);\n diffuseColor.rgb=mix(diffuseColor.rgb,rainbowColor*bright*(1.+.24*glow)+rainbowColor*pulse*energy*1.8,clamp(strength,0.,1.));
}`);
 };
 material.customProgramCacheKey=()=> 'rainbow-wire-v31';
 return uniforms;
}
