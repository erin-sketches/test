import * as THREE from './ext/three.module.js';
import * as dat from './ext/dat.gui.module.js';
import {OrbitControls} from './ext/OrbitControls.js';
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new OrbitControls(
	camera, renderer.domElement
);
var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

var bufferGeometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
var vertices = new Float32Array( [
	-1.0, -1.0,  1.0,
	 1.0, -1.0,  1.0,
	 1.0,  1.0,  1.0,

	 1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0, -1.0,  1.0
] );

// itemSize = 3 because there are 3 values (components) per vertex
bufferGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
var bufMaterial = new THREE.MeshLambertMaterial( { color: 0x880022 } );
var bufMesh = new THREE.Mesh( bufferGeometry, bufMaterial );
//scene.add(bufMesh);

camera.position.z = 10;
controls.update();
var amblight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( amblight );
var lights = [];
for(let i = 0; i < 3; i++) {
	let light = new THREE.PointLight( 0xffffff, 10, 50);
	switch(i) {
		case 0:
			light.color.setRGB(1,0,0);
			break;
		case 1:
			light.color.setRGB(0,1,0);
			break;
		case 2:
			light.color.setRGB(0,0,1);
			break;
	}
	scene.add(light);
	lights.push(light);
	let material = new THREE.MeshBasicMaterial( { color: light.color });
	let geometry = new THREE.BoxGeometry(0.1,0.1,0.1);
	let emitter = new THREE.Mesh( geometry, material );
	light.add( emitter );
}
var render = function () {
	renderer.render( scene, camera );
};
var animate = function () {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	controls.update();
	render();
	var time = Date.now() * 0.0005;
	for(let i = 0; i < lights.length; i++) {
		var x = Math.sin(time + i * 2) * 3;
		var y = Math.cos(time + i * 2) * 3;
		lights[i].position.set(x,y,0);
	}
};

animate();
class ColorGUIHelper {
	  constructor(object, prop) {
		      this.object = object;
		      this.prop = prop;
		    }
	  get value() {
		      return `#${this.object[this.prop].getHexString()}`;
		    }
	  set value(hexString) {
		      this.object[this.prop].set(hexString);
		    }
}
window.addEventListener('DOMContentLoaded',() => {
	const datGui  = new dat.GUI({ autoPlace: true });
	  
	datGui.domElement.id = 'gui';
	
	let folder = datGui.addFolder(`Cube`);
	
	folder.addColor(new ColorGUIHelper(material,'color'),'value')
	  .name('color')
	  .onChange(render);
	let fov = folder.add(camera, 'fov', 10, 100);
	fov.onChange(function(value) {
		camera.updateProjectionMatrix();
	})
})
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
});
