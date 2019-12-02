import * as THREE from './ext/three.module.js';
import * as dat from './ext/dat.gui.module.js';
import * as d3 from './ext/d3.v5.min.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x220022 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var render = function () {
	renderer.render( scene, camera );
};
var animate = function () {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	render();
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
