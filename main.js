import './style.css'
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';



const canvasContainer = document.getElementById("canvasContainer");
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 6);
camera.lookAt(scene.position);

var renderer = new THREE.WebGLRenderer({
  antialias: true
});

document.body.appendChild( renderer.domElement );

renderer.setSize(window.innerWidth, window.innerHeight);

var geom = new THREE.SphereBufferGeometry(4, 280, 190);
var colors = [];
var color = new THREE.Color();
var q = ["brown", "brown", "black", "black", "black", "lightblue", "lightblue"];
for (let i = 0; i < geom.attributes.position.count; i++) {
  color.set(q[THREE.Math.randInt(0, q.length - 1)]);
  color.toArray(colors, i * 3);
}
geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

var loader = new THREE.TextureLoader();
loader.setCrossOrigin('');
var texture = loader.load('./earth_texture.jpeg');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);
var disk = loader.load('./disk.png');

var points = new THREE.Points(geom, new THREE.ShaderMaterial({
  vertexColors: THREE.VertexColors,
  uniforms: {
    visibility: {
      value: texture
    },
    shift: {
      value: 0
    },
    shape: {
      value: disk
    },
    size: {
      value: 0.1
    },
    scale: {
      value: window.innerHeight / 2
    }
  },
  vertexShader: `
  				
      uniform float scale;
      uniform float size;
      
      varying vec2 vUv;
      varying vec3 vColor;
      
      void main() {
      
        vUv = uv;
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( scale / length( mvPosition.xyz )) * (0.3 + sin(uv.y * 3.1415926) * 0.6 );
        gl_Position = projectionMatrix * mvPosition;

      }
  `,
  fragmentShader: `
      uniform sampler2D visibility;
      uniform float shift;
      uniform sampler2D shape;
      
      varying vec2 vUv;
      varying vec3 vColor;
      

      void main() {
      	
        vec2 uv = vUv;
        uv.x += shift;
        vec4 v = texture2D(visibility, uv);
        if (length(v.rgb) > 1.0) discard;

        gl_FragColor = vec4( vColor, 1.0 );
        vec4 shapeData = texture2D( shape, gl_PointCoord );
        if (shapeData.a < 0.0625) discard;
        gl_FragColor = gl_FragColor * shapeData;
		
      }
  `,
  transparent: false
}));
scene.add(points);

var blackGlobe = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
  color: 0x04264a,
}));
blackGlobe.scale.setScalar(1);
points.add(blackGlobe);

points.position.set(0, -3.5, 0);


// Create Atmosphere
const geometryAtmosphere = new THREE.SphereGeometry(4, 280, 190);
const materialAtosphere = new THREE.ShaderMaterial( {
	vertexShader: 
	`
	varying vec3 vectorNormal;

	void main() {
		vectorNormal = normalize(normalMatrix * normal);
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
	} 

	`,
	fragmentShader: `
	varying vec3 vectorNormal;

	void main() {
		float intensity = pow(0.6 - dot(vectorNormal, vec3(0, 0, 1.0)), 2.0);
		gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
	}
	`,
	blending: THREE.AdditiveBlending,
	side: THREE.BackSide
} );

const atmosphere = new THREE.Mesh(geometryAtmosphere, materialAtosphere);
atmosphere.scale.set(1.15, 1.05, 1.15);
scene.add(atmosphere);


atmosphere.position.set(0, -3.5, 0);


// Create Stars
const pointsCount = 5000;
const vertices = new Float32Array(pointsCount * 3);

for (let i = 0; i < pointsCount * 3; i++) {
	vertices[i] = (Math.random()-0.5)*100;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const starMaterial = new THREE.PointsMaterial( {
	size: 0.005
} );
const star = new THREE.Points(starGeometry, starMaterial);
scene.add(star);


let clock = new THREE.Clock();
let time = 0;

render();

function render() {
  window.requestAnimationFrame(render);
  time += clock.getDelta();
  //points.material.uniforms.shift.value = -time * 0.15;
  
  renderer.render(scene, camera);
}
