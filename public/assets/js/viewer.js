/**
code.basis(nyc) Open Alpha 2018
Gabriel Williams
machinelevel.net
**/

// SCENE & GLOBALS
var scene = new THREE.Scene();
var mouse = new THREE.Vector2(), INTERSECTED;
scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
scene.fog = new THREE.Fog( scene.background, 1, 5000 );
raycaster = new THREE.Raycaster();
var camera, renderer, controls, stats;
var ssaaComposer, copyPass, ssaaRenderpass;
var blurToggle;
var hqToggle = { 'Anti_Aliasing': false,};
var envVoxels = [];
var guiCollection = [];
var postprocessing = {};

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

// MATERIALS

var envmaterial = new THREE.MeshPhongMaterial( {
        color: 0xd3d3d3,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    } );

var resmaterial = new THREE.MeshPhongMaterial( {
        color: 0xe36a97,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    } );

var resHLmaterial = new THREE.MeshPhongMaterial( {
        color: 0xc06c84,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        emissive: 0xff0000
    } );

var commaterial = new THREE.MeshPhongMaterial( {
        color: 0x355c7d,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    } );

var comHLmaterial = new THREE.MeshPhongMaterial( {
        color: 0x151515,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        emissive: 0x6c5b7b
    } );

var freshmaterial = new THREE.MeshPhongMaterial( {
        color: 0x84Bc9c,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    } );

var freshHLmaterial = new THREE.MeshPhongMaterial( {
        color: 0x2ca58d,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        emissive: 0x6c5b7b
    } );

// RENDERER
var renderer = new THREE.WebGLRenderer();
var wdth = window.innerWidth;
var hght = window.innerHeight;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;

document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

//track mouse movement
function onDocumentMouseMove( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// CAMERA
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
camera.position.x = 0;
camera.position.y = 150;
camera.position.z = 200;
var controls = new THREE.OrbitControls( camera, renderer.domElement );

//SSAA anti-aliasing
ssaaComposer = new THREE.EffectComposer( renderer );
ssaaRenderPass = new THREE.SSAARenderPass( scene, camera );
ssaaRenderPass.unbiased = true;
ssaaComposer.addPass( ssaaRenderPass );

copyPass = new THREE.ShaderPass( THREE.CopyShader );
copyPass.renderToScreen = true;
ssaaComposer.addPass( copyPass );
ssaaRenderPass.samplelevel = 0;

// LIGHTS
// hemisphere light
hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.1, 1, 1 );
hemiLight.position.set( 0, 250, -500 );
hemiLight.visible = true;
scene.add( hemiLight );
hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
//scene.add( hemiLightHelper );

// directional light
dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( 250, 500, 400 );
dirLight.target.position.set(500, 0, 0);
scene.add( dirLight );

dirLight.castShadow = true;
// area in which shadows are cast
var d = 1000;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = .00001;
//shadow resolution in pixels
dirLight.shadow.mapSize.width = 8192;
dirLight.shadow.mapSize.height = 8192;
dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
//scene.add( dirLightHelper );

// GROUND
var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
var groundMat = new THREE.MeshPhongMaterial( { color: 0xa9a9a9, specular: 0x050505 } );
var ground = new THREE.Mesh( groundGeo, groundMat );
ground.rotation.x = -Math.PI/2;
ground.position.y = -1;
ground.receiveShadow = true;
scene.add( ground );

// GRID
/*
var gridHelper = new THREE.GridHelper( 1000, 20 );
scene.add( gridHelper );
*/

// UI
var container = document.createElement( 'div' );
			document.body.appendChild( container );

var about_container = document.createElement( 'div' );
      about_container.style.position = 'absolute';
      about_container.style.top = '200px';
      about_container.style.right = '0px';
      about_container.style.width = '400px';
      about_container.style.height = '700px';
      about_container.style.display = 'none';
			document.body.appendChild( about_container );

var gui_container = document.createElement( 'div' );
			document.body.appendChild( gui_container );

			var logo = document.createElement( 'img');
			logo.style.position = 'absolute';
			logo.style.top = '150px';
			logo.style.left = '40px';
			logo.src = 'assets/images/nyc_logo.png';
			logo.href = 'http://codebasis.nyc/'

			var alpha = document.createElement( 'div' );
			alpha.style.position = 'absolute';
			alpha.style.font = "14px Arvo";
			alpha.style.top = '180px';
			alpha.style.left = '42px';
			alpha.innerHTML = 'Open Alpha 2018';

			var demo1 = document.createElement( 'div' );
			demo1.style.position = 'absolute';
			demo1.style.font = "17px Arvo";
			demo1.style.top = '150px';
			demo1.style.right = '330px';
			demo1.innerHTML = 'demo 1';
			demo1.style.cursor = 'pointer';
			demo1.addEventListener('click', function() {
				if (aboutPageToggle == true){
					aboutPageToggle = !aboutPageToggle;
					aboutPage(aboutPageToggle);
				}
				init("demo1", demoOne);
			}, false);

			var demo2 = document.createElement( 'div' );
			demo2.style.position = 'absolute';
			demo2.style.font = "17px Arvo";
			demo2.style.top = '150px';
			demo2.style.right = '230px';
			demo2.innerHTML = 'demo 2';
			demo2.style.cursor = 'pointer';
			demo2.addEventListener('click', function() {
				if (aboutPageToggle == true){
					aboutPageToggle = !aboutPageToggle;
					aboutPage(aboutPageToggle);
				}
				init("demo2", demoTwo);
			}, false);

			var demo3 = document.createElement( 'div' );
			demo3.style.position = 'absolute';
			demo3.style.font = "17px Arvo";
			demo3.style.top = '150px';
			demo3.style.right = '130px';
			demo3.innerHTML = 'demo 3';
			demo3.style.cursor = 'pointer';
			demo3.addEventListener('click', function() {
				if (aboutPageToggle == true){
					aboutPageToggle = !aboutPageToggle;
					aboutPage(aboutPageToggle);
				}
				init("demo3", demoThree);
			}, false);

			var about = document.createElement( 'div' );
			var aboutPageToggle = false
			about.style.position = 'absolute';
			about.style.font = "17px Arvo";
			about.style.top = '150px';
			about.style.right = '42px';
			about.innerHTML = 'about';
			about.style.cursor = 'pointer';
			about.addEventListener('click', function() {
				aboutPageToggle = !aboutPageToggle;
				aboutPage(aboutPageToggle);
			}, false);

// popup at mouseover
			var floorinfo = document.createElement( 'div' );
			floorinfo.style.position = 'absolute';
			floorinfo.style.font = "17px Cutive Mono";
			floorinfo.style.right = '42px';
			floorinfo.style.top = '200px';
			floorinfo.style.width = '100%';
			floorinfo.style.height = "65px"
			floorinfo.style.textAlign = 'right';
			floorinfo.style.display = 'block';
			//floorinfo.style.borderRight = "1px solid #000";
			//floorinfo.style.paddingRight = "5px";
			floorinfo.innerHTML = '';

// popup when aboutPage is clicked
			var siteinfo = document.createElement( 'div' );
			siteinfo.style.position = 'absolute';
			siteinfo.style.font = "19px Cutive Mono";
			siteinfo.style.left = '40px';
			//siteinfo.style.right = '600px';
			siteinfo.style.top = '225px';
			siteinfo.style.width = '40%';
			siteinfo.style.display = 'none';
			siteinfo.innerHTML = 'Welcome to the official Alpha release!' + '<br><br>'
								+ '<b>' + 'codebasis' + '</b>' + ' is the first web-based 3D zoning technology for New York City, enabling architects and developers '
								+ 'access to fast and accurate zoning assessments for any lot in all five boroughs.' + '<br><br>'
								+ 'There are over one million parcels in New York City; every one of them is subject to the limitations of the '
								+ 'New York City zoning code, a 4,109-page document governing uses, setbacks, floor-to-area ratio, '
								+ 'building heights, lot coverage, and myriad other conditions for new construction. '
								+ '<b>' + 'codebasis' + '</b>' + ' transcribes the zoning code into an algorithm that automates all the interlocking variables '
								+ 'prescribed by the code into an interactive 3D visualization of the site and its surroundings.' + '<br><br>'
								+ 'Due to its length and complexity, the code can cost developers a significant amount of time and money in the design and '
								+ 'approval stages of development. Any interpretive errors that occur in the beginning of the design process may not be rectified '
								+ 'until a nigh-finished design reaches the Department of Building. These errors can add many thousands of dollars to the '
								+ 'final cost of a construction project, in what is already the second-most expensive real estate market in America.' + '<br><br>'
								+ 'Enter your email address on the right to receive updates on the upcoming features, '
								+ 'or contact us at ' + '<a href="mailto:office@codebasis.nyc">' + 'office@codebasis.nyc' + '</a>' + ' for pricing and investment inquiries. '

			var portrait = document.createElement( 'img');
      portrait.style.marginLeft = '-70px';
			portrait.src = 'assets/images/circle_photo.png';

			var gabeinfo = document.createElement( 'div' );
			gabeinfo.style.font = "19px Cutive Mono";
      gabeinfo.style.marginLeft = "12px";
			gabeinfo.innerHTML = 'Gabriel Williams, Founder' + '<br>'
								+ 'code.basis(nyc) is a '+ '<a href="http://www.machinelevel.net/">' + '<br />machinelevel' + '</a>' + ' product' + '<br>'
								+ 'office@codebasis.nyc' + '<br>'
								+ 'new york city';

			var subscribe = document.createElement( 'div' );
			subscribe.style.font = "19px Cutive Mono";

			subscribe.innerHTML = '<link href="//cdn-images.mailchimp.com/embedcode/slim-10_7.css" rel="stylesheet" type="text/css">'
								+  '<style type="text/css">'
								+ '#mc_embed_signup{background: transparent; clear:left; font:14px Helvetica,Arial,sans-serif;  }'
								+ '	</style>'
								+ '<div id="mc_embed_signup">'
								+ '<form action="https://nyc.us17.list-manage.com/subscribe/post?u=b1ca358590d097a68970ca5bc&amp;id=2b9e0e04f1" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>'
								+ '<div id="mc_embed_signup_scroll">'
							 	+ '<label for="mce-EMAIL"></label>'
								+ '<input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required>'
								+ '<div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_b1ca358590d097a68970ca5bc_2b9e0e04f1" tabindex="-1" value=""></div>'
								+ '<div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>'
								+ '</div>'
								+ '</form>'
								+ '</div>';

			container.appendChild( logo );
			container.appendChild( alpha );
			container.appendChild( demo1 );
			container.appendChild( demo2 );
			container.appendChild( demo3 );
			container.appendChild( about );
			about_container.appendChild( portrait );
			about_container.appendChild( gabeinfo );
			about_container.appendChild( subscribe );
			container.appendChild( floorinfo );
			container.appendChild( siteinfo );

// loader functions
function demoOne(){
	blurToggle = true;
	show('loading', true); 
	clearAll();
	buildSite();
	loadEnv(demo1, 'assets/buildings/envOne.obj');
	getLimits();
	removeGUI();
	guiOne();
	changeParam();
	console.log('Demo 1');
}

function demoTwo(){
	blurToggle = true;
	show('loading', true); 
	clearAll();
	buildSite();
	loadEnv(demo2, 'assets/buildings/envTwo.obj');
	getHeightFactor(heightparams.heightFactor, 'R7');
	removeGUI();
	guiTwo();
	changeHF('front', 0);
	console.log('Demo 2');
}

function demoThree(){
	blurToggle = true;
	show('loading', true); 
	clearAll();
	buildSite();
	loadEnv(demo3, 'assets/buildings/envThree.obj');
	getTowerOnBase();
	removeGUI();
	guiThree();
	changeTower();
	console.log('Demo 3');
}

function clearAll(){
	deleteBuilding();
	deleteSite();
	deleteEnvironment();
}

function aboutPage(toggle){
	if(toggle){
		blurToggle = true;
		removeGUI();
		floorinfo.style.display = 'none';
		siteinfo.style.display = 'block';
    about_container.style.display = 'block'

	}else{
		blurToggle = false;
		if (project == '141 Chrystie Street'){
			guiOne();
		}
		if (project == '125 E 116th St'){
			guiTwo();
		}
		if (project == '961 2nd Avenue'){
			guiThree();
		}
		floorinfo.style.display = 'block';
		siteinfo.style.display = 'none';
		about_container.style.display = 'none';
	}
}

function initPostprocessing() {
				var renderPass = new THREE.RenderPass( scene, camera );

				var bokehPass = new THREE.BokehPass( scene, camera, {
					//focus: 		2250.0,
					//aperture:	6.1,
					maxblur:	.030,

					width: wdth,
					height: hght
				} );

				bokehPass.renderToScreen = true;

				var composer = new THREE.EffectComposer( renderer );

				composer.addPass( renderPass );
				composer.addPass( bokehPass );

				postprocessing.composer = composer;
				postprocessing.bokeh = bokehPass;

			}

// ENVIRONMENT LOADER
function loadEnv(demo, env){
	var loader = new THREE.OBJLoader();

		loader.load(env,

		// traverse through children and apply material
		function ( object ) {
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
		        	child.material = envmaterial;
		        	child.castShadow = true ;
					child.receiveShadow = true ;
		    	}
			} );
		envVoxels.push(object);
		scene.add( object );
		blurToggle = false;
		show('loading', false);
		}
	);
}

// BUILDING VARIABLES
// gui parameters

var bwuparams = {
			commercialFloors: 2,
			residentialFloors: 10,
			floorHeight: 10,
			frontSetback: 0,
			rearSetback: 30,
			leftSetback: 0,
			rightSetback: 0,
		};

var heightparams = {
			heightFactor: 16,
			commercialFloors: 3,
			residentialFloors: 13,
			floorHeight: 10,
			frontSetback: 0,
			rearSetback: 30,
			leftSetback: 40,
			rightSetback: 40,
		};

var towerparams = {
			commercialFloors: 2,
			commercialFloorHeight: 10,
			residentialFloors: 14,
			residentialFloorHeight: 10,
			baseFloors: 6,
			frontSetback: 20,
			rearSetback: 20,
			leftSetback: 20,
			rightSetback: 20,
		};

// zoning parameters
var zParams = {
	commFAR: 6.0,
	resFAR: 7.52,
	parking: 0.0,
	min_base: 60,
	max_base: 102,
	upper_sb: 10,
	max_height: 145, // should be 100 with Sliver Law 23-692
	lot_coverage: 0.7,
	siteArea: 2434.94,
}

var hParams = {
	commFAR: 2.0,
	parking: 0.30,
	minFAR: .87,
	maxFAR: 3.44,
	minOSR: 15.5,
	maxOSR: 25.5,
	max_base: 60,
	upper_sb: 15,
	exposurePlaneRatio: 5.6,
	siteArea: 10092,
}

var tParams = {
	commFAR: 2.0,
	resFAR: 10.0,
	min_base: 60,
	max_base: 85,
	base_coverage: 1.0,
	upper_sb: 10,
	exposurePlaneRatio: 5.6,
	tower_coverage_min: .30,
	tower_coverage_max: .40,
	parking: 0.0,
	siteArea: 8033.6,
}

var siteVoxels = [];
var floorVoxels = [];
var initial = {}

// building parameters
var project, borough, zoning, street, corner, siteWidth, siteDepth;
var commLimit, resLimit, frontMin, frontMax, rearMin, rearMax, leftMin, leftMax, rightMin, rightMax;
var floorHeight

var commercial, residential;
var baseWidth, baseDepth, baseArea;
var remWidth, remDepth;

var baseFloors, baseLimit;
var commFloorHeight = 10;
var resFloorHeight = 10;

var frontSetback, rearSetback, leftSetback, rightSetback, floorHeight;

var minOSR_array, maxFAR_array;
var height_factor, OSR, FAR, maxBaseFootprintSF;

var currentSF, remainingSF, maxCommSF, maxResSF;
var minBaseFLoors, maxBaseFloors, baseFloors, upperFloors;
var totalFloors;
var currentFloors = 0;
var currentHeight = 0;

var folderFloors, folderParams;

// GUI For General Controls
function guiOne(){
	var gui = new dat.GUI( { width: 300, autoPlace: false } );
	gui.domElement.id = 'gui';
	gui_container.appendChild(gui.domElement);
	gui_container.style.position = 'absolute';
	gui_container.style.left = '42px';
	gui_container.style.top = '200px';

	folderFloors = gui.addFolder( 'Floors' );
	folderFloors.add( bwuparams, 'commercialFloors', 0.0, 10, 1 ).onChange( changeParam );
	folderFloors.add( bwuparams, 'residentialFloors', 0.0, 14, 1 ).onChange( changeParam );
	folderFloors.open();

	folderParams = gui.addFolder( 'Parameters' );
	folderParams.add( bwuparams, 'floorHeight', 8, 25, 1 ).onChange( changeParam );
	folderParams.add( bwuparams, 'frontSetback', 0, 80, 1).onChange( changeParam );
	folderParams.add( bwuparams, 'rearSetback', 0, 80, 1).onChange( changeParam );
	folderParams.add( bwuparams, 'leftSetback', 0, 8, 1 ).onChange( changeParam );
	folderParams.add( bwuparams, 'rightSetback', 0, 8, 1 ).onChange( changeParam );

	folderRendering = gui.addFolder( 'Rendering');
	folderRendering.add(hqToggle, 'Anti_Aliasing');

	folderParams.open();
}

function guiTwo(){
	var gui = new dat.GUI( { width: 300, autoPlace: false } );
	gui.domElement.id = 'gui';
	gui_container.appendChild(gui.domElement);
	gui_container.style.position = 'absolute';
	gui_container.style.left = '42px';
	gui_container.style.top = '200px';

	folderFloors = gui.addFolder( 'Floors' );
	folderFloors.add( heightparams, 'heightFactor', 1, 21, 1 ).step( 1 ).onChange( function( value ) { changeHF('hf', value); } );
	folderFloors.add( heightparams, 'commercialFloors', 0, commLimit, 1 ).onChange( function( value ) { changeHF('comm', value); } );
	folderFloors.add( heightparams, 'residentialFloors', 0, heightparams.heightFactor, 1 ).onChange( function( value ) { changeHF('res', value); } );
	folderFloors.open();

	folderParams = gui.addFolder( 'Parameters' );
	folderParams.add( heightparams, 'floorHeight', 8, 25, 1 ).onChange( changeHF );
	folderParams.add( heightparams, 'frontSetback', 0, 80, 1 ).onChange( function( value ) { changeHF('front', value); } );
	folderParams.add( heightparams, 'rearSetback', 0, 80, 1 ).onChange( function( value ) { changeHF('rear', value); } );
	folderParams.add( heightparams, 'leftSetback', 0, 80, 1 ).onChange( function( value ) { changeHF('left', value); } );
	folderParams.add( heightparams, 'rightSetback', 0, 80, 1 ).onChange( function( value ) { changeHF('right', value); } );

	folderRendering = gui.addFolder( 'Rendering');
	folderRendering.add(hqToggle, 'Anti_Aliasing');

	folderParams.open();
}

function guiThree(){
	var gui = new dat.GUI( { width: 350, autoPlace: false } );
	gui.domElement.id = 'gui';
	gui_container.appendChild(gui.domElement);
	gui_container.style.position = 'absolute';
	gui_container.style.left = '42px';
	gui_container.style.top = '200px';

	folderFloors = gui.addFolder( 'Tower Floors' );
	folderFloors.add( towerparams, 'commercialFloors', 0, 6, 1 ).onChange( changeTower );
	folderFloors.add( towerparams, 'commercialFloorHeight', 10, 25, 1 ).onChange( changeTower );
	folderFloors.add( towerparams, 'residentialFloors', 0, 15, 1 ).onChange( changeTower );
	folderFloors.add( towerparams, 'residentialFloorHeight', 10, 25, 1 ).onChange( changeTower );
	folderFloors.add( towerparams, 'baseFloors', 6, 8, 1 ).onChange( changeTower );
	folderFloors.open();

	folderParams = gui.addFolder( 'Tower Parameters' );
	folderParams.add( towerparams, 'frontSetback', tParams.upper_sb, 80, 1 ).onChange( changeTower );
	folderParams.add( towerparams, 'rearSetback', 0, 80, 1 ).onChange( changeTower );
	folderParams.add( towerparams, 'leftSetback', 0, 80, 1 ).onChange( changeTower );
	folderParams.add( towerparams, 'rightSetback', 0, 80, 1 ).onChange( changeTower );

	folderRendering = gui.addFolder( 'Rendering');
	folderRendering.add(hqToggle, 'Anti_Aliasing');

	folderParams.open();
}

function removeGUI(){
	if (typeof gui != "undefined"){
		gui_container.removeChild(gui);
	}
}

function updateGUI(string){
	if (string == 'demo1'){
		folderFloors.__controllers[0].__max = commLimit;
		if (resLimit){
			folderFloors.__controllers[1].__max = resLimit;
		}
		folderParams.__controllers[1].__max = frontMax;
		folderParams.__controllers[2].__max = rearMax;
		folderParams.__controllers[3].__max = leftMax;
		folderParams.__controllers[4].__max = rightMax;
	}
	if (string == 'demo2'){

		folderParams.__controllers[1].__max = frontMax;
		folderParams.__controllers[2].__max = rearMax;
		folderParams.__controllers[3].__max = leftMax;
		folderParams.__controllers[4].__max = rightMax;
	}
	if (string == 'demo3'){
		folderFloors.__controllers[0].__max = commLimit;
		//folderFloors.__controllers[2].__max = resLimit;
		folderFloors.__controllers[4].__max = baseLimit;
		folderParams.__controllers[0].__max = frontMax;
		folderParams.__controllers[1].__max = rearMax;
		folderParams.__controllers[2].__max = leftMax;
		folderParams.__controllers[3].__max = rightMax;
	}

	for (var i in folderFloors.__controllers) {
			folderFloors.__controllers[i].updateDisplay();
  		}

  		for (var i in folderParams.__controllers) {
    		folderParams.__controllers[i].updateDisplay();
  		}
}

function getMinSetbacks(demo, maxWidth, maxDepth){
	//prevent floor plate from expanding beyond maximum FAR allowances
	//at current width, set max building depth with current floors
	//at current depth, set max building width with current floors
	//really only necessary for Height Factor Building

	frontMin = tParams.upper_sb;
	rearMin = 0;
	leftMin = siteWidth - maxWidth - rightSetback;
	rightMin = siteWidth - maxWidth - leftSetback;

	if (leftMin < 0){
		leftMin = 0
	}
	if (rightMin < 0){
		rightMin = 0
	}

	if (demo == 'demo2'){
		folderParams.__controllers[0].__min = frontMin;
		folderParams.__controllers[1].__min = rearMin;
		folderParams.__controllers[2].__min = leftMin;
		folderParams.__controllers[3].__min = rightMin;
	}

	/*
	console.log('minimums:')
	console.log(frontMin)
	console.log(rearMin)
	console.log(leftMin)
	console.log(rightMin)
	*/
}

function getMaxSetbacks(demo, buildingWidth, buildingDepth){
	//prevent building from collapsing in on itself
	//setback + buildingWidth + setback not to exceed SiteWidth-20
	//setback + buildingDepth + setback + front_sb not to exceed SiteDepth-20

	if (demo == 'demo1'){
		frontMax = siteDepth-zParams.upper_sb-25
		rearMax = siteDepth-frontSetback-20;
		leftMax = 8;
		rightMax = 8;
	}

	if (demo == 'demo2'){
		frontMax = siteDepth-buildingDepth;
		rearMax = siteDepth-frontSetback-20;
		leftMax = siteWidth-rightSetback-20;
		rightMax = siteWidth-leftSetback-20;
	}

	if (demo == 'demo3'){
		frontMax = siteDepth-rearSetback-tParams.upper_sb;
		rearMax = siteDepth-frontSetback-20;
		leftMax = siteWidth-rightSetback-20;
		rightMax = siteWidth-leftSetback-20;
	}

	/*
	console.log('maximums:')
	console.log(frontMax)
	console.log(rearMax)
	console.log(leftMax)
	console.log(rightMax)
	*/
}

function getCommLimit(archetype){
	if (archetype == 'bwu'){
		if (bwuparams.residentialFloors > 0){
			commLimit = Math.floor(maxCommSF / baseArea);
		}else{
			commLimit = Math.ceil(maxCommSF / baseArea);
		}
	}
	if (archetype == 'tob'){
		commLimit = Math.floor(maxCommSF / tParams.siteArea )
		console.log('CommLimit Tower')
	}
	return commLimit;
}

function getResLimit(limitToggle){
	if (limitToggle == true){
		resBaseFloors = 0
		floorVoxels.forEach( function( child ){
			if (child.usage == 'residential' && child.type == 'towerbase'){
				resBaseFloors += 1;
				console.log(resBaseFloors);
			}
		})

	remainingSF = getRemSF('residential');
	limitadd = Math.ceil(remainingSF/upperArea);
	setResLimit('tob', limitadd+resBaseFloors+2);
	}else{
		//console.log('toggled off')
	}
}

function getBaseLimit(){

	console.log(Math.max(commFloorHeight, resFloorHeight));
	console.log(tParams.max_base);

	var maxTowerBaseFloors = Math.floor(tParams.max_base / Math.max(commFloorHeight, resFloorHeight));
	console.log('max base floors: ' + maxTowerBaseFloors);

	return maxTowerBaseFloors
	//return 8;
}

function setResLimit(archetype, limit){
	resLimit = limit;
	if (archetype == 'bwu'){
		folderFloors.__controllers[1].__max = resLimit;
	}

	if (archetype == 'hf'){
		folderFloors.__controllers[2].__max = resLimit;
	}

	if (archetype == 'tob'){
		folderFloors.__controllers[2].__max = resLimit;
	}
	console.log('reslimit: ' + resLimit);

}

function getLimits(){
	//resLimit = 14

	maxCommSF = zParams.commFAR*zParams.siteArea
	maxResSF = zParams.resFAR*zParams.siteArea

	getBase( siteWidth, siteDepth, frontSetback, rearSetback,
		leftSetback, rightSetback, floorHeight, zParams.min_base, zParams.max_base );
	getUpper( baseWidth, baseDepth, floorHeight );

	//set max setbacks
	getMaxSetbacks('demo1', baseWidth, baseDepth);

	commLimit = getCommLimit('bwu');
}

function getHeightFactor(height_factor, zoningDesignation){
	if (zoningDesignation == 'R6'){
		minOSR_array = [27.5, 28.0, 28.5, 29.0, 29.5, 30.0, 30.5, 31.0, 31.5, 32.0, 32.5, 33.0, 33.5, 34.0, 34.5, 35.0, 35.5, 36.0, 36.5, 37.0, 37.5]
		maxFAR_array = [0.78, 1.28, 1.62, 1.85, 2.02, 2.14, 2.23, 2.30, 2.35, 2.38, 2.40, 2.42, 2.43, 2.43, 2.43, 2.42, 2.42, 2.40, 2.39, 2.38, 2.36]
	}

	if (zoningDesignation == 'R7'){
		minOSR_array = [15.5, 16.0, 16.5, 17.0, 17.5, 18.0, 18.5, 19.0, 19.5, 20.0, 20.5, 21.0, 21.5, 22.0, 22.5, 23.0, 23.5, 24.0, 24.5, 25.0, 25.5]
		maxFAR_array = [0.87, 1.52, 2.01, 2.38, 2.67, 2.88, 3.05, 3.17, 3.27, 3.33, 3.38, 3.41, 3.42, 3.44, 3.42, 3.41, 3.40, 3.38, 3.36, 3.33, 3.30]
	}

	if (zoningDesignation == 'R8'){
		minOSR_array = [5.9, 6.2, 6.5, 6.8, 7.1, 7.4, 7.7, 8.0, 8.3, 8.6, 8.9, 9.2, 9.5, 9.8, 10.1, 10.4, 10.7, 11.0, 11.3, 11.6, 11.9]
		maxFAR_array = [0.94, 1.78, 2.51, 3.14, 3.69, 4.15, 4.55, 4.88, 5.15, 5.38, 5.56, 5.71, 5.81, 5.92, 5.95, 5.99, 6.02, 6.02, 6.02, 6.02, 5.99]
	}

	if (zoningDesignation == 'R9'){
		minOSR_array = [1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4, 3.8, 4.2, 4.6, 5.0, 5.4, 5.8, 6.2, 6.6, 7.0, 7.4, 7.8, 8.2, 8.6, 9.0]
		maxFAR_array = [0.99, 1.95, 2.85, 3.68, 4.42, 5.08, 5.65, 6.13, 6.54, 6.85, 7.09, 7.30, 7.41, 7.52, 7.52, 7.52, 7.52, 7.46, 7.41, 7.35, 7.25]
	}

	hf = height_factor-1;
	minOSR = minOSR_array[hf];
	maxFAR = maxFAR_array[hf];

	getHFLimits(minOSR, maxFAR);
}

function getHFLimits(minOSR, maxFAR){

	OSR = minOSR;
	FAR = maxFAR;

	// max allowable per OSR (not super important)
	maxBaseFootprintSF = siteArea - (siteArea * OSR / 100);
	minimumOpenSpace = siteArea - maxBaseFootprintSF;

	// FAR limits
	maxSF = siteArea*FAR;
	maxCommSF = siteArea*hParams.commFAR;
	maxResSF = maxSF;

	getHFDimensions();
}

function getHFDimensions(param){
	// get ideal sf per floor
	baseFootprintSF = maxSF / heightparams.heightFactor;

	baseWidth = siteWidth - heightparams.leftSetback - heightparams.rightSetback;
	baseDepth = siteDepth - heightparams.rearSetback;
	maxDepth = baseFootprintSF / baseWidth;

	if (baseDepth < 25){
		//console.log('basedepth: ' + baseDepth );
		baseDepth = 25;

	}
	if ( (baseWidth*baseDepth) > baseFootprintSF ){
		console.log('already at max');
		//baseDepth = maxDepth;
	}
	if (baseDepth > siteDepth-heightparams.frontSetback){
		//console.log('depth issue');
		baseDepth = siteDepth-heightparams.frontSetback;
	}

	//adjust other setbacks, but control for the one that is being changed
	if ( param == 'front'){
		//heightparams.rearSetback = siteDepth-baseDepth;
	}
	// if reduced rear would force buildng beyond max depth
	if ( param == 'rear'){
		/*
		ndepth = siteDepth-heightparams.rearSetback
		if ( ndepth > (maxDepth+heightparams.frontSetback)){
			heightparams.frontSetback = ndepth-maxDepth;
		}else{
			console.log('front setback not changing');
		}
		*/
	}

	if ( param == 'left' || param == 'right'){
		heightparams.rearSetback = siteDepth-baseDepth;
	}

	baseArea = baseWidth*baseDepth;

	frontSetback = heightparams.frontSetback;
	rearSetback = heightparams.rearSetback;
	leftSetback = heightparams.leftSetback;
	rightSetback = heightparams.rightSetback;

	// set maxes to SF prevent overage
	//getMinSetbacks('demo2', baseWidth, siteDepth);
	getMaxSetbacks('demo2', baseWidth, baseDepth);
}

function getTowerOnBase(){
	maxCommSF = zParams.commFAR*tParams.siteArea
	maxResSF = zParams.resFAR*tParams.siteArea

	//BASE
	if (tParams.base_coverage == 1.0){
		baseWidth = siteWidth;
		baseDepth = siteDepth;
	}else{
		// do some other calculations for base
	}

	minBaseFloors = tParams.min_base / commFloorHeight;
	maxBaseFloors = tParams.max_base / commFloorHeight;
	//set base floor limits

	commFloorHeight = towerparams.commercialFloorHeight;
	resFloorHeight = towerparams.residentialFloorHeight;

	//TOWER
	minTowerFootprintSF = tParams.tower_coverage_min*siteArea;
	maxTowerFootprintSF = tParams.tower_coverage_max*siteArea;

	upperWidth =  baseWidth-leftSetback-rightSetback;
	upperDepth =  baseDepth-frontSetback-rearSetback;

	//getMinSetbacks('demo3')
	getMaxSetbacks('demo3', upperWidth, upperDepth);


	upperArea = maxTowerFootprintSF;

	commLimit = getCommLimit('tob');
	baseLimit = getBaseLimit();
}

function getBase(siteWidth, siteDepth, frontSetback, rearSetback, leftSetback, rightSetback, floorHeight ){
	baseWidth = siteWidth-leftSetback-rightSetback;
	baseDepth = siteDepth-frontSetback-rearSetback;
	baseArea = baseWidth*baseDepth
	minBaseFloors = zParams.min_base / floorHeight;
	maxBaseFloors = zParams.max_base / floorHeight;

	if ( totalFloors >= maxBaseFloors ){
		baseFloors = maxBaseFloors
	}
	if ( totalFloors < maxBaseFloors ){
		baseFloors = totalFloors
	}
}

function getUpper( baseWidth, baseDepth, floorHeight ){
	upperWidth = baseWidth; //minus some other setbacks, eventually
	if (frontSetback < zParams.upper_sb){
		upperDepth = baseDepth-zParams.upper_sb+frontSetback;
	}else{
		upperDepth = baseDepth;
	}
	upperArea = upperDepth*upperWidth;

	upperFloors = zParams.max_height / floorHeight;
}

function getRemainder( upperWidth, upperDepth, remainingSF ){
	remWidth = upperWidth; //minus some other setbacks, eventually
	remDepth = remainingSF / upperWidth;
	if (remDepth > upperDepth){
		remDepth = upperDepth
	}
}

function getTowerTop( upperWidth, upperDepth, remainingSF ){
	var ratio = upperDepth / upperWidth;
	remWidth = Math.sqrt(remainingSF / ratio);
	remDepth = remainingSF / remWidth;
}

// GET SPECIAL MODIFIERS

function getUsage(archetype){
	if (archetype == 'bwu'){
		if (currentFloors < bwuparams.commercialFloors){
			usage = 'commercial';
		}else if(bwuparams.residentialFloors > 0){
			usage = 'residential';
		}
	}

	if (archetype == 'hf'){
		if (currentFloors < heightparams.commercialFloors){
			usage = 'commercial';
		}else if(heightparams.residentialFloors > 0){
			usage = 'residential';
		}
	}

	if (archetype == 'tob'){
		if (currentFloors < towerparams.commercialFloors){
			usage = 'commercial';
		}else if(towerparams.residentialFloors > 0){
			usage = 'residential';
		}
	}
	return usage;
}

function getRemSF(usage){
	commSF = 0
	resSF = 0
	floorVoxels.forEach( function( child ){
			if (child.usage == 'commercial'){
				commSF += child.sf;
			}
			if (child.usage == 'residential'){
				resSF += child.sf;
			}
	})

	if (usage == 'commercial'){
		var remCommSF = maxCommSF - commSF;
		return remCommSF;
	}
	if (usage == 'residential'){
		var remResSF = maxResSF - resSF;
		return remResSF;
	}
}

function getTotalSF(type){
	var totalSF = 0
	commSF = 0
	resSF = 0
	floorVoxels.forEach( function( child ){
		if (child.usage == 'commercial'){
				commSF += child.sf;
			}
		if (child.usage == 'residential'){
				resSF += child.sf;
			}
		totalSF += child.sf;
		})

		if (type == 'commercial'){
			return commSF;
		}else if (type == 'residential'){
			return resSF;
		}else{
			return totalSF;
		}
}

function getType(special){
	if (currentFloors < baseFloors){
		if (special == 'tower'){
			type = 'towerbase';
		}else{
			type = 'base';
		}

	}else{
		type = 'upper'
	}
	//console.log(type);
	return type
}

function getSkyExpSetback(max_base, exposurePlaneRatio, buildingHeight){
	skySetback = Math.max(0,(buildingHeight - max_base) / exposurePlaneRatio);
	//console.log('sky setback: ' + skySetback);

	if (skySetback > 0){
		skySetback = Math.max(hParams.upper_sb, skySetback);
		//console.log('after comparison: ' + skySetback);
	}

	return skySetback
}


// MASTER BUILDER FUNCTIONS

function baseWithUpper(){
	for (currentFloors; currentFloors < totalFloors; currentFloors++){
		usage = getUsage('bwu');
		remainingSF = getRemSF(usage);
		type = getType();

		//console.log(usage + ' remaining: ' + remainingSF + ' ' + currentFloors);
		h = getCurrentHeight();

		if (type == 'base'){
			if (remainingSF < baseArea && remainingSF > 0 && currentFloors == totalFloors-1){
				getRemainder(baseWidth, baseDepth, remainingSF);
				if (h+floorHeight <= zParams.max_height){
					buildFloor(remWidth, remDepth, usage, type);
				}
				if (usage == 'commercial'){
					commLimit = currentFloors;
					bwuparams.commercialFloors = currentFloors;
				}
				if (usage == 'residential'){
					//resLimit = currentFloors-bwuparams.commercialFloors;
					bwuparams.residentialFloors = currentFloors-bwuparams.commercialFloors;
				}
			}else if (remainingSF > baseArea){
				buildFloor(baseWidth, baseDepth, usage, type);
			}
		}

		if ( type == 'upper' ){
			if (remainingSF < upperArea && remainingSF > 0){
				getRemainder(upperWidth, upperDepth, remainingSF);
				buildFloor(remWidth, remDepth, usage, type);
				if (usage == 'commercial'){
					commLimit = currentFloors;
					bwuparams.commercialFloors = currentFloors;
				}
				if (usage == 'residential'){
					//resLimit = currentFloors-bwuparams.commercialFloors;
					bwuparams.residentialFloors = currentFloors-bwuparams.commercialFloors;
				}
			}else if (remainingSF > upperArea){
				if (h+floorHeight >= zParams.max_height){
					console.log(h+floorHeight);
					console.log('height exceeded: ' + bwuparams.residentialFloors + ' ' + currentFloors + ' ' + bwuparams.commercialFloors);
					//resLimit = currentFloors-bwuparams.commercialFloors;
					bwuparams.residentialFloors = currentFloors-bwuparams.commercialFloors;
				}else{
					buildFloor(upperWidth, upperDepth, usage, type);
				}
			}
		}
	}
}

function heightFactor(){
	currentFloors = 0;
	floorVoxels = [];
	for (currentFloors; currentFloors < totalFloors; currentFloors++){
		usage = getUsage('hf');
		remainingSF = getRemSF(usage);

		//console.log(currentFloors + ' ' + remainingSF)

		if (remainingSF < baseArea && remainingSF > 0 && currentFloors == totalFloors-1){
			//getRemainder(baseWidth, baseDepth, remainingSF);
			//buildFloor(remWidth, remDepth, usage, type)
			console.log('remainder')
		}else if (remainingSF > baseArea){
			buildFloor(baseWidth, baseDepth, usage, 'base');
		}
	}
}

function towerOnBase(){
	var limitToggle = true;
	for (currentFloors; currentFloors < totalFloors; currentFloors++){
		usage = getUsage('tob');
		remainingSF = getRemSF(usage);
		type = getType('tower');

		//console.log(usage + ' remaining: ' + remainingSF + ' ' + currentFloors);

		if (type == 'towerbase'){
			if (remainingSF < baseArea && remainingSF > 0 && currentFloors == totalFloors-1){
				getRemainder(baseWidth, baseDepth, remainingSF);
				buildFloor(remWidth, remDepth, usage, type)
			}else if (remainingSF > baseArea){
				buildFloor(baseWidth, baseDepth, usage, type);
			}
		}

		if ( type == 'upper' ){
			//calculate new limits
			if (usage == 'residential'){
				getResLimit(limitToggle);
				limitToggle = false;
			}
				if (remainingSF < upperArea && remainingSF > 0){
					getTowerTop(upperWidth, upperDepth, remainingSF);
					buildFloor(remWidth, remDepth, usage, 'towertop');
				}else if (remainingSF > upperArea){
					buildFloor(upperWidth, upperDepth, usage, type);
				}
		}
	}
}

// VOXEL BUILDER FUNCTIONS

function buildSite(){
	cubeGeo = new THREE.BoxGeometry( siteWidth, 0.1, siteDepth );
	var siteVoxel = new THREE.Mesh( cubeGeo, resmaterial);
	adjust( siteVoxel, siteWidth, siteDepth, .1 )
	siteVoxels.push( siteVoxel );
	scene.add( siteVoxel );
}

function buildFloor(width, depth, usage, type){
	currentHeight = getCurrentHeight();

	if (project == '961 2nd Avenue'){
		if (usage == 'commercial'){
			floorHeight = commFloorHeight;
		}
		if (usage == 'residential'){
			floorHeight = resFloorHeight;
		}
	}

	if (project == '125 E 116th St'){
		var skySetback = getSkyExpSetback(hParams.max_base, hParams.exposurePlaneRatio, currentHeight+floorHeight )

		if (skySetback >= hParams.upper_sb){
			depth -= Math.max(skySetback, frontSetback)
		}else{
			depth -= frontSetback;
		}
	}

	// build geometry
	cubeGeo = new THREE.BoxGeometry( width, floorHeight-.1, depth );
	var baseVox = new THREE.Mesh( cubeGeo, commaterial);
	adjust(baseVox, width, depth, floorHeight);
	var resVox = new THREE.Mesh( cubeGeo, resmaterial);
	adjust(resVox, width, depth, floorHeight);


	if (usage == 'commercial'){
		moveFloorY(baseVox, currentHeight);
		if (type == 'base'){
			if (skySetback > 0){
				moveFloorXZ(baseVox, leftSetback, Math.max(skySetback, frontSetback));
			}else{
				moveFloorXZ(baseVox, leftSetback, frontSetback);
			}
		}else if (type == 'towerbase'){
			moveFloorXZ(baseVox, 0, 0);
		}else{
			adj = Math.max(0, frontSetback-zParams.upper_sb);
			moveFloorXZ(baseVox, leftSetback, zParams.upper_sb+adj);
		}
		baseVox.sf = width * depth;
		baseVox.usage = usage;
		baseVox.height = floorHeight;
		baseVox.type = type;
		floorVoxels.push(baseVox);
		scene.add( baseVox );
	}

	if (usage == 'residential'){
		moveFloorY(resVox, currentHeight);
		if (type == 'base'){
			if (skySetback > 0){
				moveFloorXZ(resVox, leftSetback, Math.max(skySetback, frontSetback));
			}else{
				moveFloorXZ(resVox, leftSetback, frontSetback);
			}
		}else if (type == 'towerbase'){
			moveFloorXZ(resVox, 0, 0);
		}else if (type == 'towertop'){
			moveFloorXZ(resVox, leftSetback, frontSetback);
			xDiff = upperWidth - width;
			yDiff = upperDepth - depth;
			moveFloorXZ(resVox, xDiff/2, yDiff/2);
		}else{
			adj = Math.max(0, frontSetback-zParams.upper_sb);
			moveFloorXZ(resVox, leftSetback, zParams.upper_sb+adj);
		}
		resVox.sf = width * depth;
		resVox.usage = usage;
		resVox.height = floorHeight;
		resVox.type = type;
		floorVoxels.push(resVox);
		scene.add( resVox );
	}
}

// DELETE FUNCTIONS
function deleteSite(){
	siteVoxels.forEach(function(siteVoxel){
		scene.remove( siteVoxel );
	})
	siteVoxels = [];
}

function deleteBuilding(){
	floorVoxels.forEach(function(floor){
		scene.remove(floor);
	})
	currentFloors = 0;
	floorVoxels = [];
}

function deleteEnvironment(){
	envVoxels.forEach(function(floor){
		scene.remove(floor);
	})
	envVoxels = [];
}

// MOVEMENT FUNCTIONS
function adjust(floor, width, depth, height){
	floor.translateX( width/2 );
	floor.translateY( height/2 );
	floor.translateZ( -depth/2 );
}

function moveFloorY(voxel, currentHeight){
	voxel.translateY( currentHeight );
}

function getCurrentHeight(){
	ch = 0
	floorVoxels.forEach( function( child ){
		ch += child.height;
	})
	return ch
}

function moveFloorXZ(voxel, leftSetback, frontSetback){
	voxel.translateX( leftSetback );
	voxel.translateZ( -frontSetback );
}

// GUI FUNCTIONS
// REFRESHES BUILDING EVERY TIME A VALUE IS CHANGED
function changeParam(param, value){
	deleteBuilding();

	totalFloors = bwuparams.commercialFloors + bwuparams.residentialFloors;
	floorHeight = bwuparams.floorHeight;
	frontSetback = bwuparams.frontSetback;
	rearSetback = bwuparams.rearSetback;
	leftSetback = bwuparams.leftSetback;
	rightSetback = bwuparams.rightSetback;

	getLimits();
	baseWithUpper();
	updateGUI('demo1');

}

function changeHF(param, value){
	deleteBuilding();

	if (param == 'hf'){
		if (heightparams.heightFactor >= heightparams.residentialFloors){
			heightparams.commercialFloors = heightparams.heightFactor-heightparams.residentialFloors;
		}else{
			heightparams.commercialFloors = 0;
			heightparams.residentialFloors = heightparams.heightFactor;
		}
		getHeightFactor(heightparams.heightFactor, 'R7');
	}

	if (param == 'comm'){
		heightparams.residentialFloors = heightparams.heightFactor-value;
		console.log('commercial value changed');
		//heightparams.commercialFloors = value;
		getHeightFactor(heightparams.heightFactor, 'R7');
	}
	if (param == 'res'){
		heightparams.commercialFloors = heightparams.heightFactor-value;
		console.log('res value changed');
		//heightparams.residentialFloors = value;
		getHeightFactor(heightparams.heightFactor, 'R7');
	}

	totalFloors = heightparams.heightFactor;
	floorHeight = heightparams.floorHeight;

	if (param == 'front' || param == 'rear' || param == 'left' || param == 'right'){
		getHFDimensions(param);
	}else if(param != 'hf' ){
		//getHFLimits();
	}

	heightFactor();
	updateGUI('demo2');
}

function changeTower(param, value){
	deleteBuilding();

	totalFloors = towerparams.commercialFloors + towerparams.residentialFloors;
	baseFloors = towerparams.baseFloors;
	commFloorHeight = towerparams.commercialFloorHeight;
	resFloorHeight = towerparams.residentialFloorHeight;

	frontSetback = towerparams.frontSetback;
	rearSetback = towerparams.rearSetback;
	leftSetback = towerparams.leftSetback;
	rightSetback = towerparams.rightSetback;

	getTowerOnBase();
	towerOnBase();
	updateGUI('demo3');

}

//INITIATION FUNCTIONS
function init(demo, whenLoaded){

	loadJSON(demo, function(response) {
	  // Parse JSON string into object
		initial = JSON.parse(response);
		setInit(initial)
		//postInit(initial);
		whenLoaded();
	 });
}

// uses JSON callback to read originaL building parameters
function loadJSON(demo, callback) {

var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    if (demo == 'demo1'){
    	xobj.open('GET', 'assets/buildings/141Chrystie.json', true);
    }
    if (demo == 'demo2'){
    	xobj.open('GET', 'assets/buildings/125East116th.json', true);
    }
    if (demo == 'demo3'){
    	xobj.open('GET', 'assets/buildings/961_2ndAve.json', true);
    }
	xobj.onreadystatechange = function () {
	      if (xobj.readyState == 4 && xobj.status == "200") {
	        // Required use of an anonymous callback as .open will NOT return a value
	        // simply returns undefined in asynchronous mode
	        callback(xobj.responseText);
	      }
	};
	xobj.send(null);
}

function setInit(){
	project = initial.Project;
	borough = initial.Borough;
	zoning = initial.Zoning;
	street = initial.Street;
	corner = initial.Corner;
	siteWidth = initial.Site1[0];
	siteDepth = initial.Site3[1];
	siteArea = siteWidth*siteDepth;

	if (zoning.indexOf('_') !== -1){
		disp = zoning.replace('_', '-')
	}
}

function postInit(data){
	$.ajax({
  type: "POST",
  url: "http://localhost:8080/",
  data: {buildingdata:JSON.stringify(data)},
  dataType: "application/json"
}).always(function(response){
  	var pydata = JSON.parse(response.responseText);
  	console.log(pydata);
  })
}

// ANIMATE
function animate() {
	if ( floorVoxels ){
		// find intersections
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( floorVoxels );

		floorVoxels.forEach( function( child ){
			if (child.usage == 'commercial'){
				child.material = commaterial;
			}

			if (child.usage == 'residential'){
				child.material = resmaterial;
			}

		})

		if ( intersects.length > 0 ){
			INTERSECTED = intersects[ 0 ].object;
			if ( INTERSECTED ){
				if (INTERSECTED.usage == 'commercial'){
					INTERSECTED.material = comHLmaterial;
				}
				if (INTERSECTED.usage == 'residential'){
					INTERSECTED.material = resHLmaterial;
				}
				var lvl = floorVoxels.indexOf(INTERSECTED)+1
				floorinfo.innerHTML = disp + ' zoning designation' + '<br />'
					+ 'floor '  + lvl + '<br />'
					+ INTERSECTED.sf.toFixed(2) + ' SF' + '<br />'
					+ INTERSECTED.usage ;
			}

		}else{
			if (typeof disp != "undefined"){
				totalSF = getTotalSF();
				totalComm = getTotalSF('commercial');
				totalRes = getTotalSF('residential');

				if (project == '141 Chrystie Street'){
					floorinfo.innerHTML = disp + ' zoning designation' + '<br />'
					+ 'lower east side' + '<br />'
					+ 'site area: ' + zParams.siteArea + ' SF' + '<br />'
					+ 'commercial FAR: ' + zParams.commFAR.toFixed(1) + '<br />'
					+ Math.ceil(totalComm) + ' // ' + Math.ceil(maxCommSF) + ' SF max' + '<br />'
					+ 'residential FAR: ' + zParams.resFAR.toFixed(1) + '<br />'
					+ Math.ceil(totalRes) + ' // ' + Math.ceil(maxResSF) + ' SF max' + '<br />';
				}
				if (project == '125 E 116th St'){
					floorinfo.innerHTML = disp + ' zoning designation' + '<br />'
					+ 'harlem' + '<br />'
					+ 'site area: ' + hParams.siteArea + ' SF' + '<br />'
					+ 'required open space: ' + minimumOpenSpace + ' SF' + '<br />'
					+ 'commercial FAR: ' + hParams.commFAR + '<br />'
					+ 'residential FAR: ' + FAR + '<br />'
					+ Math.ceil(totalSF) + ' // ' + maxSF + ' SF max' + '<br />';
				}
				if (project == '961 2nd Avenue'){
					floorinfo.innerHTML = disp + ' zoning designation' + '<br />'
					+ 'midtown east' + '<br />'
					+ 'site area: ' + tParams.siteArea + ' SF' + '<br />'
					+ 'commercial FAR: ' + tParams.commFAR.toFixed(1) + '<br />'
					+ Math.ceil(totalComm) + ' // ' + Math.ceil(maxCommSF) + ' SF max' + '<br />'
					+ 'residential FAR: ' + tParams.resFAR.toFixed(1) + '<br />'
					+ Math.ceil(totalRes) + ' // ' + Math.ceil(maxResSF) + ' SF max' + '<br />';
				}
			}
		}
	}

	if (blurToggle == false){
		if ( hqToggle.Anti_Aliasing == false){
			renderer.render( scene, camera );
		}else{
			ssaaComposer.render( scene, camera );
		}
	}else{
		postprocessing.composer.render( 0.1 );
	}
	requestAnimationFrame( animate );
	controls.update()
}

init("demo1", demoOne);
initPostprocessing();

function show(id, value) {
    document.getElementById(id).style.display = value ? 'block' : 'none';
}

animate();