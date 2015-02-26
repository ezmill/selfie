var scene, camera, renderer, controls;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var sceneRTT, cameraRTT;
var sceneFB;
var rtTexture, rtFB, rtFinal;
var basket;
var mouseX, mouseY;
var mapMouseX, mapMouseY;
var basket;
var mesh;
var room;
initScene();
function initScene(){
	container = document.createElement('div');
    document.body.appendChild(container);


    camera = new THREE.PerspectiveCamera(50, w / h, 1, 100000);
    camera.position.z = 100;
    cameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
	cameraRTT.position.z = 100;
    scene = new THREE.Scene();
	sceneRTT = new THREE.Scene();
	sceneFB = new THREE.Scene();
	controls = new THREE.OrbitControls(camera);


	renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    rtTexture = new THREE.WebGLRenderTarget(w, h);
    rtTexture.minFilter = THREE.LinearFilter;
    rtTexture.magFilter = THREE.NearestFilter;
    rtTexture.format = THREE.RGBFormat;

    rtFB = new THREE.WebGLRenderTarget(w, h);
    rtFB.minFilter = THREE.LinearFilter;
    rtFB.magFilter = THREE.NearestFilter;
    rtFB.format = THREE.RGBFormat;
    rtFB.wrapS = THREE.RepeatWrapping;
    rtFB.wrapT = THREE.RepeatWrapping;

    rtFinal = new THREE.WebGLRenderTarget(w, h);
    rtFinal.minFilter = THREE.LinearFilter;
    rtFinal.magFilter = THREE.NearestFilter;
    rtFinal.format = THREE.RGBFormat;

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);
	planeGeometry = new THREE.PlaneBufferGeometry( w,h );

    createBackgroundScene();
    createFeedbackScene();
    loadRoom();

    loadBasket();
    addLights();
    onWindowResize();
	animate();

}
function createBackgroundScene(){
	tex = THREE.ImageUtils.loadTexture("textures/1.jpg");
	var materialParameters = {
		uniforms: { 
			time: { type: "f", value: 0.0 } ,
			texture: { type: "t", value: tex },
			resolution: {type: "v2", value: new THREE.Vector2(w,h)},
			step_w: {type: "f", value: 1/w},
			step_h: {type: "f", value: 1/h},
			mouseX: {type: "f", value: 1.0},
			mouseY: {type: "f", value: 1.0}
		},
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs' ).textContent
	}
	material = new THREE.ShaderMaterial( materialParameters );
	quad = new THREE.Mesh( planeGeometry, material );
	sceneRTT.add( quad );
}
function createFeedbackScene(){
	var tex = THREE.ImageUtils.loadTexture("textures/1.jpg");
	var materialFBParameters = {
		uniforms: { 
			time: { type: "f", value: 0.0 } ,
			texture: { type: "t", value: rtTexture },
			resolution: {type: "v2", value: new THREE.Vector2()},
			step_w: {type: "f", value: 1/w},
			step_h: {type: "f", value: 1/h},
			mouseX: {type: "f", value: 1.0},
			mouseY: {type: "f", value: 1.0},
			tv_resolution: {type: "f", value: 640.0},
			tv_resolution_y: {type: "f", value: 1600.0}
 
		},
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs-2' ).textContent
	}
	materialFB = new THREE.ShaderMaterial( materialFBParameters );
	quad = new THREE.Mesh( planeGeometry, materialFB );
	sceneFB.add( quad );
}

function loadBasket(){
	var loader = new THREE.BinaryLoader(true);

	// basketMaterial = new THREE.ShaderMaterial({
	// 	vertexShader: document.getElementById( 'vs' ).textContent,
	// 	fragmentShader: document.getElementById( 'fs-2' ).textContent,
	// 	uniforms:{
	// 		texture: { type: "t", value: rtFB }
	// 	}
	// })
	basketMaterial = new THREE.MeshPhongMaterial({
		specular: 0x555555, 
		shininess: 0,
		map: rtFB
	})
    loader.load("js/models/fruit-basket.js", function(geometry) {
        createBasket(geometry, basketMaterial);
    });
	// boxGeometry = new THREE.BoxGeometry(500,500,500);
	// sphereGeometry = new THREE.SphereGeometry(500,100,100);
	// mesh = new THREE.Mesh(sphereGeometry, basketMaterial);
	// mesh.position.set(0,0,-1000);

	// scene.add(mesh);
}
function createBasket(geometry, material){
	basket = new THREE.Mesh(geometry, material);
	var scale = 10.0;
	basket.position.set(10,-25,-10);
	// basket.rotation.set(0,0,44.7);
	basket.scale.set(scale,scale,scale);
	scene.add(basket);
}
function loadRoom(){
	var loader = new THREE.BinaryLoader(true);
	roomMaterial = new THREE.MeshPhongMaterial({
		specular: 0x000000, 
		shininess: 30,
		map:rtFB
	})
    loader.load("js/models/room.js", function(geometry) {
        createRoom(geometry, roomMaterial);
    });
}
function createRoom(geometry, material){
	room = new THREE.Mesh(geometry, material);
	var scale = 40.0;
	room.position.set(0,-25,10);
	// room.rotation.set(0,0,44.7);
	room.scale.set(scale,scale,scale);
	scene.add(room);
}
function addLights(){
// 	var dirLight = new THREE.DirectionalLight(0xffffff, 1);
// dirLight.position.set(100, 100, 50);
// scene.add(dirLight);
// spotLight = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
// scene.add(spotLight)
var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
scene.add(hemiLight)

}
function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
}

function onDocumentMouseMove(event){
	mouseX = (event.clientX );
    mouseY = (event.clientY );
    mapMouseX = map(mouseX, window.innerWidth, -1.0,1.0);
    mapMouseY = map(mouseY, window.innerHeight, -1.0,1.0);
    resX = map(mouseX, window.innerWidth, 4000.0,2000.0);
    resY = map(mouseX, window.innerWidth, 10000.0,1600.0);
	material.uniforms.mouseX.value = mapMouseX;
	material.uniforms.mouseY.value = mapMouseY;
	materialFB.uniforms.mouseX.value = mapMouseX;
	materialFB.uniforms.mouseY.value = mapMouseY;
	materialFB.uniforms.tv_resolution.value = resX;
	materialFB.uniforms.tv_resolution_y.value = resY;


}
function onWindowResize( event ) {
	material.uniforms.resolution.value.x = window.innerWidth;
	material.uniforms.resolution.value.y = window.innerHeight;
	materialFB.uniforms.resolution.value.x = window.innerWidth;
	materialFB.uniforms.resolution.value.y = window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseDown(event){
	renderer.render(sceneRTT, cameraRTT, rtTexture, true);
}
var inc = 0;
var addFrames = true;
var translate = false;
var time = 0;
function render(){
	controls.update();

	time +=0.01;
    camera.lookAt(scene.position);
    material.uniforms.texture.value = tex;
    material.uniforms.time.value = time;
    materialFB.uniforms.texture.value = rtTexture;
    materialFB.uniforms.time.value = time;
    // basketMaterial.map = rtFinal;

    // mesh.rotation.x = Date.now()*0.0002;
    // mesh.rotation.y += mapMouseX*0.01;
    // mesh.rotation.z += mapMouseY*0.01;
    // if(basket){
	   //  basket.rotation.y += mapMouseX*0.01;
	   //  basket.rotation.z += mapMouseY*0.01;
    // }
    // if(room){
    // 	   room.rotation.y += mapMouseX*0.01;
	   //  room.rotation.z += mapMouseY*0.01;
    // }

    inc++
	if(inc >= 10){
		addFrames = false;
	}
	if(addFrames){
		renderer.render(sceneRTT, cameraRTT, rtTexture, true);
		translate = true;
	}
	if(translate = true){
		quad.scale.x = 1.1;
		quad.scale.y = 1.1;
		quad.scale.z = 1.1;
	}
	renderer.render(sceneFB, cameraRTT, rtFB, true);
    renderer.render(sceneFB, cameraRTT, rtFinal, true);
    renderer.render(scene, camera);

    var a = rtFB;
    rtFB = rtTexture;
    rtTexture = a;

    // var b = tex;
    // tex = rtFinal;
    // rtFB = b;
    // rtFinal = a;

}
function animate(){
	window.requestAnimationFrame(animate);
	render();

}