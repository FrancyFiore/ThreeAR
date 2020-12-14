var scene, camera, renderer; // three.js components

var arToolkitSource, arToolkitContext; // ARToolKit library integration

var markerRoot; //marker

var mesh1;

let raycaster = new THREE.Raycaster(), mixer, animations, clock;

initialize();
animate();

function initialize()
{
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
    scene.add( ambientLight );
           
    let light = new THREE.PointLight( 0xffffff, 1, 100 );
	light.position.set( 0, 10, 0 ); // default; light shining from top
	light.castShadow = true;
    scene.add( light );

    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias : true,
        alpha: true
    });

    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize( 640, 480 ); // get phone screen size
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );
    
    // Animation clock
    clock = new THREE.Clock();
    
    // setup arToolkitSource
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType : 'webcam',
    });

    function onResize()
    {
        arToolkitSource.onResize()	
        arToolkitSource.copySizeTo(renderer.domElement)	
        if ( arToolkitContext.arController !== null )
        {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
        }	
    }

    arToolkitSource.init(function onReady(){
        onResize()
    });
    
    // handle resize event
    window.addEventListener('resize', function(){
        onResize()
    });
    
   
    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'js/lib/data/camera_para.dat',
        detectionMode: 'mono'
    });
    
    // copy projection matrix to camera when initialization complete
    arToolkitContext.init( function onCompleted(){
        camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    });

    // build markerControls
    markerRoot = new THREE.Group();
    scene.add(markerRoot);
    let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern', patternUrl: "js/lib/data/hiro.patt",
    })
    
  
    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = true;
    loader.load( '../demo/models/urus/Urus.gltf', gltf => {
        let model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        markerRoot.add( model );


        // Generate animation
        mixer = new THREE.AnimationMixer( gltf.scene );
        animations = gltf.animations;

        for(let i = 0; i < 4; i++){

            mixer.clipAction(animations[i*4]).play();
            mixer.clipAction(animations[i*4]).setLoop( THREE.LoopRepeat, 2 );
            mixer.clipAction(animations[i*4]).clampWhenFinished = true;

            mixer.clipAction(animations[i*4 + 1]).play();
            mixer.clipAction(animations[i*4 + 1]).setLoop( THREE.LoopOnce );
            mixer.clipAction(animations[i*4 + 1]).clampWhenFinished = true;

            mixer.clipAction(animations[i*4 + 2]).play();
            mixer.clipAction(animations[i*4 + 2]).setLoop( THREE.LoopOnce );
            mixer.clipAction(animations[i*4 + 2]).clampWhenFinished = true;

            mixer.clipAction(animations[i*4 + 3]).play();
            mixer.clipAction(animations[i*4 + 3]).setLoop( THREE.LoopOnce );
            mixer.clipAction(animations[i*4 + 3]).clampWhenFinished = true;

        }

    });

    // window.addEventListener('click', e => raycast(e, false));
    // window.addEventListener('touchend', e => raycast(e, true))
}


function raycast(e, touch = false, controls = null) {

    let mouse = new THREE.Vector2();
    if (touch) {
        mouse.x = 2 * (e.changedTouches[0].clientX /canvasSize.width) - 1;
        mouse.y = 1 - 2 * (e.changedTouches[0].clientY / canvasSize.height);
    } else {
        mouse.x = 2 * (e.clientX / canvasSize.width) - 1;
        mouse.y = 1 - 2 * (e.clientY / canvasSize.height);
    }
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects( scene.children, true );
    
    if ( intersects.length > 0 ) {

        if(intersects[0].object.parent.parent.name == "FL" || intersects[0].object.parent.parent.name == "FR" ){
            
            // Play wheel animations
            for(let i = 0; i < 4; i++){

                mixer.clipAction(animations[i*4]).play();
                mixer.clipAction(animations[i*4]).setLoop( THREE.LoopRepeat, 2 );
                mixer.clipAction(animations[i*4]).clampWhenFinished = true;

                mixer.clipAction(animations[i*4 + 1]).play();
                mixer.clipAction(animations[i*4 + 1]).setLoop( THREE.LoopOnce );
                mixer.clipAction(animations[i*4 + 1]).clampWhenFinished = true;

                mixer.clipAction(animations[i*4 + 2]).play();
                mixer.clipAction(animations[i*4 + 2]).setLoop( THREE.LoopOnce );
                mixer.clipAction(animations[i*4 + 2]).clampWhenFinished = true;

                mixer.clipAction(animations[i*4 + 3]).play();
                mixer.clipAction(animations[i*4 + 3]).setLoop( THREE.LoopOnce );
                mixer.clipAction(animations[i*4 + 3]).clampWhenFinished = true;

            }

        }

    }
}

function update()
{
    // update artoolkit on every frame
    if ( arToolkitSource.ready !== false )
        arToolkitContext.update( arToolkitSource.domElement );
}


function render()
{
    renderer.render( scene, camera );
}


function animate()
{
    requestAnimationFrame(animate);
    update();

    if(mixer){
        // Get the time elapsed since the last frame, used for mixer update
        const mixerUpdateDelta = clock.getDelta();
        // Update the animation mixer, the stats panel, and render this frame
        mixer.update( mixerUpdateDelta );
    }
     
    render();
}