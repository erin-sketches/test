import * as THREE from './ext/three.module.js';
import * as dat from './ext/dat.gui.module.js';
import {OrbitControls} from './ext/OrbitControls.js';
import * as ss from './SolarSystem.js';

var scene = new THREE.Scene();
let w_width = window.innerWidth;
let w_height = window.innerHeight;
var camera = new THREE.OrthographicCamera(w_width/-2,w_width/2,w_height/2,w_height/-2, 0, 100000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
var canvas = document.querySelector('canvas');

var controls = new OrbitControls(
	camera, renderer.domElement
);
camera.position.set(0,0,-5);
controls.update();

var diam_scale = 5000;
var dist_scale = 10000000;
var planets = {};
var orbits = {};
var labels = {};
var time = new Date(2000,1);
var time_ms = time.valueOf();
var dt = 86400*1000;

for(let p of ss.planets) {
    //let r = ss.radii[p]/diam_scale;
    let r = 10;
    let pGeo = new THREE.SphereGeometry(r,20,20);
    let pMat = new THREE.MeshBasicMaterial({color: ss.color[p]});
    let pMesh = new THREE.Mesh(pGeo,pMat);
    scene.add(pMesh);
    planets[p] = pMesh;
    let oMat = new THREE.LineBasicMaterial( { color: ss.color[p] } );
    if(p != 'Sun') {
        let oGeo = new THREE.Geometry();
        let oLine = new THREE.Line(oGeo,oMat);
        scene.add(oLine);
        orbits[p] = oGeo;
    }
    let label = document.createElement('div');
    label.className = 'label-text';
    label.textContent = p;
    document.getElementById('labels').appendChild(label);
    labels[p] = label;
}
function updPlanets(t){
    for(let p of ss.planets) {
        let [x,y,z] = [0,0,0];
        if(p != 'Sun') {
            let pMesh = planets[p];
            [x,y,z] = ss.calcCoords(p,t);
            //pMesh.position.set(x/dist_scale,y/dist_scale,z/dist_scale);
            pMesh.position.set(x,y,z);
            orbits[p].vertices.push(new THREE.Vector3(x,y,z));
        }
        let pos = new THREE.Vector3(x,y,z);
        pos.project(camera);
        let cx = (pos.x *  .5 + .5) * canvas.clientWidth;
        let cy = (pos.y *-.5 + .5) * canvas.clientHeight;
        labels[p].style.transform = `translate(-50%, -50%) translate(${cx}px,${cy}px)`;
        if(cx > canvas.clientWidth || cy > canvas.clientHeight) {
            labels[p].hidden = true;
        } else {
            labels[p].hidden = false;
        }
    }
}
updPlanets(time_ms);
planets.Sun.position.set(0,0,0);
var sun = new THREE.PointLight( 0xffffff, 10);
sun.add(planets.Sun);

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var render = function () {
	renderer.render( scene, camera );
};
var animate = function () {
	requestAnimationFrame( animate );
    controls.update();
    time_ms += dt;
    updPlanets(time_ms);
    let d = new Date(time_ms);
    document.getElementById('t').textContent = d.toISOString();
	render();
};
animate();
window.addEventListener('DOMContentLoaded',() => {
})
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
});