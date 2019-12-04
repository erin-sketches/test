import * as THREE from './ext/three.module.js';
import * as dat from './ext/dat.gui.module.js';
import * as zoom from './zoom.js';

// utilities
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

var view = new zoom.View(window.innerWidth,
					 window.innerHeight);
var scene = new THREE.Scene();
var geometry = new THREE.BoxGeometry( 50, 50, 50 );
var material = new THREE.MeshBasicMaterial( { color: 0x220022 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

var animate = function () {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	view.render(scene);
};

animate();
window.addEventListener('DOMContentLoaded',() => {
	const datGui  = new dat.GUI({ autoPlace: true });
	  
	datGui.domElement.id = 'gui';
	
	let folder = datGui.addFolder(`Cube`);
	
	folder.addColor(new ColorGUIHelper(material,'color'),'value')
	  .name('color')
	  .onChange(view.render(scene));
	let fov = folder.add(view.cam, 'fov', 10, 100);
	fov.onChange(function(value) {
		view.cam.updateProjectionMatrix();
	})
})
window.addEventListener('resize', () => {
	view.resize(window.innerWidth,window.innerHeight);
});
