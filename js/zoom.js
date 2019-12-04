import * as THREE from './ext/three.module.js';
// d3 imported in index.html

// Zoom/pan code from https://beta.observablehq.com/@grantcuster/using-three-js-for-2d-data-visualization

export class View {
	width = window.innerWidth;
	height = window.innerHeight;
	constructor(width,height,fov=50,scale=2,near=0.1,far=1000) {
		this.width = width || this.width;
		this.height = height || this.height;
		this.cam = new THREE.PerspectiveCamera(fov,scale,near,far);
		this.cam.position.z = 5;	

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );

		console.log(d3);
		this.view = d3.select(this.renderer.domElement);

		let zoom = d3.zoom()
		  .scaleExtent([this.getScaleFromZ(far), this.getScaleFromZ(near)])
		  .on('zoom', ()=>this.zoomHandler());
		this.view.call(zoom);
	    let initial_scale = this.getScaleFromZ(far);
	    let initial_transform = d3.zoomIdentity.translate(this.width/2, this.height/2).scale(initial_scale);    
	    zoom.transform(this.view, initial_transform);
	    this.cam.position.set(0, 0, far);
	}
	
	render(scene) {
		this.renderer.render(scene, this.cam);
	}
	resize(width, height) {
		this.width = width || window.innerWidth;
		this.height = height || window.innerHeight;	
		this.renderer.setSize(this.width,this.height);
		this.cam.aspect = this.width / this.height;
		this.cam.updateProjectionMatrix();
	}
	zoomHandler() {
		let d3_transform = d3.event.transform;
		let scale = d3_transform.k;
		let x = -(d3_transform.x - this.width/2) / scale;
		let y = (d3_transform.y - this.height/2) / scale;
		let z = this.getZFromScale(scale);
		this.cam.position.set(x, y, z);
	}
	getScaleFromZ (camera_z_position) {
	  let half_fov = this.cam.fov/2;
	  let half_fov_radians = toRadians(half_fov);
	  let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
	  let fov_height = half_fov_height * 2;
	  let scale = this.height / fov_height; // Divide visualization height by height derived from field of view
	  return scale;
	}

	getZFromScale(scale) {
	  let half_fov = this.cam.fov/2;
	  let half_fov_radians = toRadians(half_fov);
	  let scale_height = this.height / scale;
	  let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians));
	  return camera_z_position;
	}
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}
