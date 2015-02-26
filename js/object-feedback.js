var mainScene, camera, renderer, controls;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var mouseX, mouseY;
var mapMouseX, mapMouseY;
var FBObject1, FBObject2, mirror;
var globalUniforms;
initScene();
function initScene(){
	container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(50, w / h, 1, 100000);
    camera.position.set(0,0, 750);//test
    cameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
	cameraRTT.position.z = 100;
	controls = new THREE.OrbitControls(camera);

	renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);


    mainScene = new THREE.Scene();

    globalUniforms = {
		time: { type: "f", value: 0.0 } ,
		resolution: {type: "v2", value: new THREE.Vector2(w,h)},
		step_w: {type: "f", value: 1/w},
		step_h: {type: "f", value: 1/h},
		mouseX: {type: "f", value: 1.0},
		mouseY: {type: "f", value: 1.0},
		tv_resolution: {type: "f", value: 640.0},
		tv_resolution_y: {type: "f", value: 1600.0}
	}

	FBObject1 = new FBObject({
		w: w,
    	h: h, 
    	x: -w/2,
    	useVideo: true,
    	vertexShader: "vs",
    	fragmentShader1: "fs",
    	fragmentShader2: "fs",
    	mainScene: mainScene
	});
	FBObject1.uniforms = globalUniforms;
	FBObject1.init(w,h);
	FBObject2 = new FBObject({
		w: w,
    	h: h, 
    	x: -272.5 + 250,
    	y: 115,
    	// z: -30.38279593845726,
    	z: 60,
    	scale: 0.195,
    	rotX: -Math.PI/8.9,
    	rotY: 0,
    	rotZ: 0,
    	texture: "textures/me.jpg",
    	vertexShader: "vs",
    	fragmentShader1: "fs",
    	fragmentShader2: "flow",
    	mainScene: mainScene,
    	extraTex: FBObject1.renderTargets[1]
	});
	FBObject2.uniforms = globalUniforms;
	FBObject2.init(w,h);
	// FBObject1.addObject(FBObject1.x)
	FBObject2.addObject(FBObject2.x, FBObject2.y, FBObject2.z, FBObject2.rotX, FBObject2.rotY, FBObject2.rotZ )

	// control = new THREE.TransformControls( camera, renderer.domElement );
	// control.attach( FBObject2.mesh );
	// mainScene.add( control );

	mirror = new FBObject({
			w: w,
	    	h: h, 
	    	x: 0,
	    	y: 0,
	    	z: 0,
	    	vertexShader: "vs",
	    	fragmentShader1: "fs",
	    	fragmentShader2: "flow",
	    	mainScene: mainScene
		});
	mirror.uniforms = globalUniforms;
	mirror.init(w,h);
	var path = "textures/cube/skybox/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
	];
	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	reflectionCube.format = THREE.RGBFormat;

	var refractionCube = new THREE.CubeTexture( reflectionCube.image, THREE.CubeRefractionMapping );
	refractionCube.format = THREE.RGBFormat;

	var mirrorMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xaaaaaa, envMap: reflectionCube } )
	// var mirrorMaterial = new THREE.MeshBasicMaterial({color:0xff0000});
	mirror.loadModel("js/models/mirror.js", 250, 14.75, -10, 5, 0, 0, 0, mirrorMaterial);
	// window.addEventListener( 'keydown', function ( event ) {
	// 	            //console.log(event.which);
	// 	            switch ( event.keyCode ) {
	// 	              case 81: // Q
	// 	                control.setSpace( control.space == "local" ? "world" : "local" );
	// 	                break;
	// 	              case 87: // W
	// 	                control.setMode( "translate" );
	// 	                break;
	// 	              case 69: // E
	// 	                control.setMode( "rotate" );
	// 	                break;
	// 	              case 82: // R
	// 	                control.setMode( "scale" );
	// 	                break;
	// 				case 187:
	// 				case 107: // +,=,num+
	// 					control.setSize( control.size + 0.1 );
	// 					break;
	// 				case 189:
	// 				case 10: // -,_,num-
	// 					control.setSize( Math.max(control.size - 0.1, 0.1 ) );
	// 					console.log(control);
	// 					break;
	// 	            }
	// 	        });
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);

	// var geometry = new THREE.BoxGeometry(1000,1000,1000);
	// var material = new THREE.MeshBasicMaterial({color:0xff0000});
	// var mesh = new THREE.Mesh(geometry, material);
	// mesh.position.set(0,0,0);
	// mainScene.add(mesh);

    addLights();
    // onWindowResize();
	animate();




}
function addLights(){
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	mainScene.add(hemiLight)
	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set( 0, 20, 0 );

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
	globalUniforms.mouseX.value = mapMouseX;
	globalUniforms.mouseY.value = mapMouseY;
	globalUniforms.tv_resolution.value = resX;
	globalUniforms.tv_resolution_y.value = resY;



}
function onWindowResize( event ) {
	globalUniforms.resolution.value.x = window.innerWidth;
	globalUniforms.resolution.value.y = window.innerHeight;
	w = window.innerWidth;
	h = window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseDown(event){

	FBObject1.getFrame(cameraRTT);
	FBObject2.getFrame(cameraRTT);
	mirror.getFrame(cameraRTT);
}
var inc = 0;
var addFrames = true;
var translate = false;
var time = 0;
function render(){

	FBObject1.material1.uniforms.texture.value.needsUpdate = true;

	controls.update();

	time +=0.01;
    camera.lookAt(mainScene.position);

	globalUniforms.time.value = time;

    FBObject1.passTex();
    FBObject2.passTex();
    mirror.passTex();



    inc++
	if(inc >= 10){
		addFrames = false;
	}
	if(addFrames){
		FBObject1.getFrame(cameraRTT);
		FBObject2.getFrame(cameraRTT);
		mirror.getFrame(cameraRTT);
		translate = true;
	}
	if(translate = true){
		// FBObject1.scale(1.01);
		// FBObject2.scale(0.999);

	}
		    // console.log(FBObject1.material1.uniforms.texture.value)


	FBObject1.render(cameraRTT);
	FBObject2.render(cameraRTT);
	mirror.render(cameraRTT);
	renderer.render(mainScene, camera);

	FBObject1.cycle();
	FBObject2.cycle();
	mirror.cycle();


}
function animate(){
	window.requestAnimationFrame(animate);
	render();

}