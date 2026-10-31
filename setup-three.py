#!/usr/bin/env python3
"""Install pinned Three.js modules locally once; subsequent runs are offline."""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError
from zipfile import ZipFile
from io import BytesIO
import sys

ROOT=Path(__file__).resolve().parent
DEST=ROOT/'vendor'/'three'
VERSION='0.165.0'
FILES=[
 'build/three.module.js',
 'examples/jsm/loaders/STLLoader.js',
 'examples/jsm/postprocessing/EffectComposer.js',
 'examples/jsm/postprocessing/RenderPass.js',
 'examples/jsm/postprocessing/UnrealBloomPass.js',
 'examples/jsm/postprocessing/OutputPass.js',
 'examples/jsm/postprocessing/ShaderPass.js',
 'examples/jsm/math/MeshSurfaceSampler.js',
 'examples/jsm/shaders/CopyShader.js',
 'examples/jsm/shaders/LuminosityHighPassShader.js',
 'examples/jsm/shaders/OutputShader.js',
 'examples/jsm/postprocessing/Pass.js',
 'examples/jsm/shaders/FXAAShader.js',
]
# Download whole official version so all transitive imports remain available.
if (DEST/'build/three.module.js').is_file() and (DEST/'examples/jsm/postprocessing/EffectComposer.js').is_file():
 print('Three.js already installed locally.');sys.exit(0)
urls=[
 f'https://github.com/mrdoob/three.js/archive/refs/tags/r165.zip',
 f'https://codeload.github.com/mrdoob/three.js/zip/refs/tags/r165',
]
data=None
for url in urls:
 try:
  print('Downloading official Three.js r165 from',url,flush=True)
  with urlopen(Request(url,headers={'User-Agent':'STL-Cosmic-Morph/1.0'}),timeout=60) as response:
   data=response.read()
  break
 except Exception as exc: print('Download failed:',exc,flush=True)
if data is None:
 print('Unable to download Three.js. Check access to github.com, or copy the official r165 build/ and examples/jsm/ directories to vendor/three/.')
 sys.exit(1)
with ZipFile(BytesIO(data)) as archive:
 names=archive.namelist()
 for member in names:
  rel=member.split('/',1)[-1]
  if not (rel.startswith('build/') or rel.startswith('examples/jsm/') or rel.startswith('examples/fonts/')) or member.endswith('/'):continue
  target=DEST/rel;target.parent.mkdir(parents=True,exist_ok=True)
  target.write_bytes(archive.read(member))
print('Installed Three.js locally:',DEST)
