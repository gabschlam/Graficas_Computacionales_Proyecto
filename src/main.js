let renderer = null, 
scene = null, 
sceneTemp = null,
camera = null,
cube = null,
objLoader = null,
ambientLight = null,
grupoBaile = null,
sphere = null;

let index = 0;

let scenes = [];

// For LoadingManager
let manager;

let duration = 10, // sec
loopAnimation = false;

// Raycaster
let mouseVector = new THREE.Vector2(), INTERSECTED, CLICKED;
let raycaster = new THREE.Raycaster();
let width = 0;
let height = 0;
let animator = null;

// Function for loading OBJ 3d model with MTL file
function load3dModel(objModelUrl, mtlModelUrl, name, sceneObj, scale, x, y, z, rotationX, rotationY)
{
    mtlLoader = new THREE.MTLLoader(manager);

    mtlLoader.load(mtlModelUrl, materials =>{
        
        materials.preload();
        // console.log(materials);

        objLoader = new THREE.OBJLoader(manager);
        objLoader.setMaterials(materials);

        objLoader.load(objModelUrl, object=>{
            object.scale.set(scale,scale,scale);
            object.position.set(x, y, z);
            if (rotationX) {
                object.rotation.x = rotationX ;
            }
            if (rotationY) {
                object.rotation.y = rotationY ;
            }
            object.name = name;

            object.traverse( function( child ) {
                if ( child.isMesh ) 
                {
                    child.geometry.computeVertexNormals();
                    // child.geometry.computeBoundingBox();
                }
            } );

            sceneObj.add(object);
        });
    });

}

// Function for loading OBJ 3d model without MTL file
function loadOnly3dObjModel(objModelUrl, scale, x, y, z) 
{
    var loader = new THREE.OBJLoader(manager);
    const params = {
        color: 0xffffff,
        transmission: 0.90,
        envMapIntensity: 1,
        lightIntensity: 1,
        exposure: 1
    };
    
    loader.load(objModelUrl, function (object) {
        object.traverse( function (child){
            if(child.isMesh){
                child.material = new THREE.MeshPhysicalMaterial({
                    color: params.color,
					metalness: 0,
                    roughness: 0,
					alphaTest: 0.5,
					envMapIntensity: params.envMapIntensity,
					depthWrite: false,
					transmission: params.transmission, // use material.transmission for glass materials
					opacity: 1, // set material.opacity to 1 when material.transmission is non-zero
					transparent: true,
                    side: THREE.DoubleSide,
                    reflectivity: 0,
                  });
            }
        });

        object.scale.x = object.scale.y = object.scale.z = scale;
        object.position.set(x,y,z);
        scenes[0].add(object);
        // console.log("FBX");
        // console.log(object);
    });
}

// Function for loading FBX 3d model
function load3dFbxModel(modelUrl, textureUrl, normalUrl, aoUrl, metalUrl, roughnessUrl, name, sceneObj, scale, x, y, z, rotationX, rotationY)
{
    var loader = new THREE.FBXLoader(manager);
    loader.load(modelUrl, function (object) {
        object.traverse( function (child){
            if(child.isMesh){
                let texture = new THREE.TextureLoader(manager).load(textureUrl);
                let normal = null;
                let ao = null;
                let metallic = null;
                let roughness = null;
                if(normalUrl != null){
                    normal = new THREE.TextureLoader(manager).load(normalUrl);
                    // console.log("loaded normal", normalUrl)
                }
                if(aoUrl != null){
                    ao = new THREE.TextureLoader(manager).load(aoUrl);
                    // console.log("loaded ao",aoUrl)
                }
                if(metalUrl != null){
                    metallic = new THREE.TextureLoader(manager).load(metalUrl);
                    // console.log("loaded metal",metalUrl)
                }
                if(roughnessUrl != null){
                    roughness = new THREE.TextureLoader(manager).load(roughnessUrl);
                    // console.log("loaded rough",roughnessUrl)
                }
                child.material = new THREE.MeshStandardMaterial( { map: texture, normalMap: normal, aoMap:ao, aoMapIntensity: 1, metalnessMap: metallic, metalness: 0,  roughnessMap: roughness, roughness: 0 } );
            }
        });

        object.scale.x = object.scale.y = object.scale.z = scale;
        object.position.set(x,y,z);
        if (rotationX) {
            object.rotation.x = rotationX ;
        }
        if (rotationY) {
            object.rotation.y = rotationY ;
        }
        object.name = name;
        sceneObj.add(object);
        // console.log("FBX");
        // console.log(object);
    });
}

// Function for creating mesh for 2d characters
function createCharacterMesh( address, name, width, height, X, Y, Z ) 
{
    let map = new THREE.TextureLoader(manager).load(address);

    let geometry = new THREE.PlaneGeometry(width, height, 5, 5);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide, transparent:true}));
    mesh.position.setX(X);
    mesh.position.setY(Y);
    mesh.position.setZ(Z);
    mesh.name = name;
    mesh.side = THREE.DoubleSide;
    return mesh;
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Validations for showing or hidding previous and next buttons
    if (index < 1) {
        document.getElementById('previousButton').style.display = 'none';
        document.getElementById('nextButton').style.marginLeft = "850px";
    }

    else if (index > (scenes.length-2)) {
        document.getElementById('nextButton').style.display = 'none';
    }
    
    else {
        document.getElementById('nextButton').style.marginLeft = "790px";
        document.getElementById('previousButton').style.display = 'inline';
        document.getElementById('nextButton').style.display = 'inline';
    }
    
    // Update the animations
    KF.update();
}

function createScene(canvas)
{    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    width = canvas.width;
    height = canvas.height;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 30;

    // This light globally illuminates all objects in the scene equally.
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

    // Raycaster
    renderer.domElement.addEventListener( 'click', raycast, false );
    initAnimator();

    // For loading objects before showing scenes
    loadingDiv = document.getElementById("loading");

    manager = new THREE.LoadingManager();
    // On start function for loading objects
    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        document.getElementById('nextButton').style.display = 'none';
    };

    // When finishing loading all object
    manager.onLoad = function ( ) {
        console.log( 'Loading complete!');
        loadingDiv.remove();
        // Choosing default scene as scene1
        scene = scenes[0];
        scene.add(camera);
        scene.add(ambientLight)
        document.getElementById('nextButton').style.display = 'inline';

    };

    // On progress for loading each object
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );

    };

    /////////////////////////////////////////////////
    //       Scene 1                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene1";
    // Set the background image 
    sceneTemp.background = new THREE.Color( 0x000000);

    scenes.push(sceneTemp);

    // //Title
    textAnimation('Cinderella', 3,-10,8.5,-1, scenes[0]);

    // Names
    textAnimation('Gabriel Schlam Huber - A01024122\nAlejandra Nissan Leizorek - A01024682\nSamantha Barco Mejia - A01196844',2,-80,-46,-100, scenes[0]);

    // Slipper
    loadOnly3dObjModel("../models/slipper/3d-model.obj", 0.3, 0,-8,0);

    /////////////////////////////////////////////////
    //       Scene 2                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene2";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene2_background.jpg");
    
    // Put in a ground plane to show off the lighting
    //727 x 902 px
    sceneTemp.add(createCharacterMesh("../models/cinderella_cleaning.png", 'cinderella_cleaning' ,12,15,-30,-5,-2));
    //470x496px
    sceneTemp.add(createCharacterMesh("../models/stepsisters_normal.png", 'stepsisters_normal' ,14,14,30,-5,0));
    //277x655 px
    sceneTemp.add(createCharacterMesh("../models/stepmother.png", 'stepmother', 7,15,30,-5,0.5));

    //Bubbles
    bubblesGroup = new THREE.Object3D;
    bubblesGroup.name = "bubbles";
    bubblesGroup.add(createCharacterMesh("../models/bubble.png", 'bubble', 1.0,1.0,0,0,0));
    bubblesGroup.add(createCharacterMesh("../models/bubble.png", 'bubble', 0.8,0.8,0.4,-1.1,0));
    bubblesGroup.add(createCharacterMesh("../models/bubble.png", 'bubble', 0.8,0.8,-0.7,0.8,0));
    bubblesGroup.add(createCharacterMesh("../models/bubble.png", 'bubble', 0.3,0.3,0.4,0.7,0));
    bubblesGroup.add(createCharacterMesh("../models/bubble.png", 'bubble', 0.3,0.3,-0.6,-1.2,0));
    sceneTemp.add(bubblesGroup);
    bubblesGroup.position.set(-10,-9.85,2);

    scenes.push(sceneTemp);

    // Create the table https://sketchfab.com/3d-models/classic-coffee-table-0b151b371da847d3a2dd960f9339eef1
    load3dFbxModel("../models/table/source/table.fbx", "../models/table/textures/texture.jpg", null, null, null, null, 'table', scenes[1], 0.1,-4, -11, 0.2, 0, 0);

    // Create the bucket https://sketchfab.com/3d-models/old-wooden-bucket-7649d45e7d6f408b9b5929ab51895dfa
    load3dFbxModel("../models/bucket/source/Bucket.fbx", "../models/bucket/textures/Bucket_Albedo.png", "../models/bucket/textures/Bucket_Normal.png", "../models/bucket/textures/Bucket_AO.png", "../models/bucket/textures/Bucket_Metallic.png", "../models/bucket/textures/Bucket_Roughness.png", 'bucket', scenes[1], 5,-10,-11,2, 80, 0);

    //Sofa https://sketchfab.com/3d-models/sofa-a9695e97f8c74667a2c89f7d98ca3a9f
    load3dFbxModel("../models/sofa/source/Sofa010_001.FBX", "../models/sofa/textures/Sofa010_D1024.png", "../models/sofa/textures/Sofa010_N1024.png", "../models/sofa/textures/Sofa010_AO1024.png", "../models/sofa/textures/Sofa010_S1024.png", null, 'sofa', scenes[1], 0.06,-16,-12,-14, 0, 0.7);


    /////////////////////////////////////////////////
    //       Scene 3                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene3";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene3-4_background.jpg");
    sceneTemp.add(createCharacterMesh("../models/cinderella_crying.png", 'cinderella_crying', 8,10,-30,-8,-2));
    objectGroup = new THREE.Object3D;
    objectGroup.name = "groupStepSistersMother"
    stepSisters = createCharacterMesh("../models/stepsisters_party.png", 'stepsisters_party', 13,14,16,-8,-5);
    stepMother = createCharacterMesh("../models/stepmother_party.png", 'stepmother_party', 8,15,9,-8,-5);
    stepSisters.rotation.y = Math.PI;
    objectGroup.add(stepSisters);
    objectGroup.add(stepMother);
    objectGroup.position.x = 20;
    sceneTemp.add(objectGroup)

    // Fountain's water splash
    waterSplash = createCharacterMesh("../models/water_splash.png", 'water_splash', 8, 10, 6.3,-3.7,-13);
    waterSplash.visible = false;
    sceneTemp.add(waterSplash);

    // Mice
    gusGus = createCharacterMesh("../models/gusgus.png", 'gusgus', 4,5,-16,-10,-5);
    gusGus.visible = false;
    sceneTemp.add(gusGus);
    jackJack = createCharacterMesh("../models/jackjack.png", 'jackjack', 5,5,-16,-10,-5);
    jackJack.visible = false;
    sceneTemp.add(jackJack);
    scenes.push(sceneTemp);

    // Create the fountain: https://sketchfab.com/3d-models/fountain-9812aa1535454df886fea502373edf08
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[2], 3.5, 15, -30, -75, -Math.PI / 18);

    textScene3 = 'One day, the prince announced a grand ball, and invited all young women who would like to marry him so that he could choose the most beautiful and make her his princess. The stepmother prepared her two daughters with the best ball gowns and made them up so that they would be pretty, but she prohibited Cinderella from attending the ball. She ordered her to stay at home mopping the floor and preparing dinner so that it would be ready when the three of them returned home. Cinderella obeyed, but as she watched her stepsisters leave for the ball at the royal palace, she couldn’t help but feel miserable and began to cry.';
    textAnimation(splitText(textScene3, 37), 2.8,-75,25,-100, scenes[2]);

    /////////////////////////////////////////////////
    //       Scene 4                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene4";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene3-4_background.jpg");

    sceneTemp.add(createCharacterMesh("../models/cinderella_crying.png", 'cinderella_crying', 8,10,-15,-8,-2));
    godmother = createCharacterMesh("../models/fairy_godmother.png", 'fairy_godmother', 16,18,-2,30,-7);
    godmother.rotation.y = Math.PI;
    sceneTemp.add(godmother);

    scenes.push(sceneTemp);

    // Create the fountain: https://sketchfab.com/3d-models/fountain-9812aa1535454df886fea502373edf08
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[3], 3.5, 15, -30, -75, -Math.PI / 18);
    
    // Create carruaje: https://www.blendswap.com/blend/9819 
    load3dModel('../models/cinderella_carrosse/Cinderella_Carosse.obj', '../models/cinderella_carrosse/Cinderella_Carosse.mtl', 'Cinderella_Carosse', scenes[3], 9, 60, -60, -50, null, Math.PI / 3);

    /////////////////////////////////////////////////
    //       Scene 5                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();  
    sceneTemp.name = "scene5";

    grupoBaile = new THREE.Object3D;
    grupoBaile.name = "grupoBaile";

    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene5-6_background.jpg");

    //Loading the prince
    sceneTemp.add(grupoBaile.add(createCharacterMesh("../models/prince_charming_scene_5.png", 'prince_dancing', 10,10,0,-7,0)));
    //grupoBaile.add(prince);

    //Loading Cinderella
    sceneTemp.add(grupoBaile.add(createCharacterMesh("../models/cinderella.png", 'cinderella_dancing', 9,12,4,-9,-5)));
    //grupoBaile.add(cinderella);

    scenes.push(sceneTemp);

    let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5);
    sceneTemp.add( directionalLight );
    directionalLight.position.set(-15, 0, -10);
    
    // Create the columns
    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', 'column', scenes[4], 1.8, 16, -1, 0, 0, 0);

    //Referencias:
    /*
    Princesa 
    Príncipe https://www.pngwing.com/es/free-png-zdlha
     Columna https://free3d.com/3d-model/white-column-44873.html
     Textura columna https://www.pinterest.es/pin/825495806689115334/
    */
   
    /////////////////////////////////////////////////
    //       Scene 6                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene6";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene5-6_background.jpg");

    //Loading the prince
    sceneTemp.add(createCharacterMesh("../models/prince_scene6.png", 'prince', 5,12,-4,-9,-5));

    //Loading Cinderella
    sceneTemp.add(createCharacterMesh("../models/cinderella_bride.png", 'cinderella', 8,12,4,-9,-5));

    //Loading Mice
    sceneTemp.add(createCharacterMesh("../models/ratones_scene6.png", 'mice', 5,3,12,-12.5,-5));

    //Loading Birds
    sceneTemp.add(createCharacterMesh("../models/birds_scene6.png", 'birds', 5,3,12,12.5,-5));

    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5);
    sceneTemp.add( directionalLight );
    directionalLight.position.set(-15, 0, -10);

    scenes.push(sceneTemp);

    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', 'column1', scenes[5], 1.8, 16, -1, 0, 0, 0);

    /*
    Prince and cinderella https://www.jing.fm/iclipt/Thmwx/
    */
}

function playAnimations() 
{
    animator.start();
    switch (scene.name) {
        case "scene1":
            console.log("Escena 1");
            // Animaciones
            break;
        case "scene2":
            console.log("Escena 2");
            // Animations
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_cleaning":
                        enterAnimationX(0, 0.125, -30, -13, element);
                        break;
                    case "stepmother":
                        enterAnimationX(0.125, 0.250, 30, 7, element);
                        break;
                    case "stepsisters_normal":
                        enterAnimationX(0.180, 0.305, 30, 13, element);
                        break;
                }
            });
            break;
        case "scene3":
            console.log("Escena 3");
            // Animations
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_crying":
                        enterAnimationX(0, 0.125, -30, -15, element);
                        break;
                    case "gusgus":
                    case "jackjack":
                    case "water_splash":
                        element.visible = false;
                        break;
                    case "groupStepSistersMother":
                        animator = new KF.KeyFrameAnimator;
                        animator.init({ 
                            interps:
                                [
                                    // Keys for the entry and exit animation
                                    { 
                                        keys:[0.125, 0.25, 0.9, 1], 
                                        values:[
                                                { x : 20  },
                                                { x : 0 },
                                                { x : 0 },
                                                { x : 20 },
                                                ],
                                        target:element.position
                                    },
                                    { 
                                        keys:[0, 0.8, 0.9, 1], 
                                        values:[
                                                { y : -Math.PI },
                                                { y : -Math.PI },
                                                { y : 0 },
                                                { y : 0 },
                                                ],
                                        target:element.children[0].rotation
                                    },
                                    { 
                                        keys:[0, 0.8, 0.9, 1], 
                                        values:[
                                                { y : 0  },
                                                { y : 0  },
                                                { y : Math.PI  },
                                                { y : Math.PI  },
                                                ],
                                        target:element.children[1].rotation
                                    }
                                ],
                            loop: loopAnimation,
                            duration: duration * 1000,
                        });
                        animator.start();
                        break;
                
                    default:
                        break;
                }
            });
            break;
        case "scene4":
            console.log("Escena 4");
            // Animations
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_crying":
                        element.material.map = new THREE.TextureLoader().load( "../models/cinderella_crying.png" ); 
                        element.scale.set(1, 1, 1);
                        enterAnimationYRotation(0, 0.3, 0.5, -8, -8, -2, 0.3, 0.5, (8*Math.PI)/3, (16*Math.PI)/3, Math.PI*8, element);
                        /* let promise = new Promise(function(resolve, reject) {
                            enterAnimationYRotation(0.3, 0.5, -8, -2, 0.3, 0.5, (8*Math.PI)/3, (16*Math.PI)/3, Math.PI*8, element);
                          
                                if (animator.running == false) {
                                    console.log("Entre");
                                    resolve(element.material.map = new THREE.TextureLoader().load( "../models/cinderella.png" ) )
                                }
                            
                          });
                          
                        promise.then(); */
                        setTimeout( () => {
		
                            element.material.map = new THREE.TextureLoader().load( "../models/cinderella.png" ); 
                            element.scale.set(1.5, 1.5, 1.5);
                        }, (duration - 0.99) * 1000 );
                        break;
                    case "fairy_godmother":
                        enterAnimationYRotation(0, 0.125, 0.25, 30, 30, -5, 0.125, 0.25, -Math.PI, Math.PI, -Math.PI, element);
                        break;
                    case "Cinderella_Carosse":
                        animator = new KF.KeyFrameAnimator;
                        animator.init({ 
                            interps:
                                [
                                    // Keys for the entry and exit animation
                                    { 
                                        keys:[0, 0.750, 1], 
                                        values:[
                                                { x : 60, y : -60 },
                                                { x : 60, y : -60 },
                                                { x : 35, y : -30 },
                                                ],
                                        target:element.position
                                    }
                                ],
                            loop: loopAnimation,
                            duration: duration * 1000,
                        });
                        animator.start();
                        break;
                    default:
                        break;
                }
            });
            break;
        case "scene5":
            console.log("Escena 5");
            // Animations
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_dancing":
                        break;
                    case "prince_dancing":
                        break;
                    case "grupoBaile":
                        enterAnimationX(0, 0.125, -30, 0, element);
                        //danceAnimations();
                        break;
                }
            });            
            break;
        case "scene6":
            console.log("Escena 6");
            // Animations
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella":
                        enterAnimationX(0, 0.125, 12, 5.3, element);
                        break;
                    case "prince":
                        enterAnimationX(0, 0.125, -4, -0.5, element);
                        break;
                }
            });            
            break;            
    
        default:
            break;
    }
}

function playClickAnimations() 
{
    //animator.start();
    switch (scene.name) {
        case "scene1":
            console.log("Escena 1",CLICKED.name);
            
            break;
        case "scene2":
            console.log("Escena 2", CLICKED.name);
            // Animations
            switch(CLICKED.name)
            {
                case "cinderella_cleaning":
                    scene.children.forEach(element => {
                        if(element.name=="bubbles"){
                            for(i = 0; i< element.children.length;i++)
                            {
                                enterAnimationY(0, Math.random() + 0.1, 0, 30, element.children[i]);
                            }
                        }
                    });
                    break;
            }
            break;
        case "scene3":
            console.log("Escena 3", CLICKED.name);
            // Animations
            switch(CLICKED.name)
            {
                case "fountain":
                    scene.children.forEach(element => {
                        if(element.name=="water_splash"){
                            element.scale.y = 0.5;
                            element.scale.x = 0.15;
                            element.position.y = -3.7;
                            element.visible = !element.visible;
                            animator = new KF.KeyFrameAnimator;
                            animator.init({ 
                                interps:
                                    [
                                        // Keys for the entry animation
                                        { 
                                            keys:[0, 0.05, 0.1], 
                                            values:[
                                                    { y : -3.7 },
                                                    { y : -3.2 },
                                                    { y : -2.7 },
                                                    ],
                                            target: element.position
                                        },
                                        { 
                                            keys:[0, 0.05, 0.1], 
                                            values:[
                                                    { x : 0.15, y : 0.5 },
                                                    { x : 0.5, y : 0.75 },
                                                    { x : 1, y : 1 },
                                                    ],
                                            target: element.scale
                                        }
                                    ],
                                loop: loopAnimation,
                                duration: duration * 1000,
                            });
                            animator.start();
                            return;
                        }
                    });
                    break;
                case "cinderella_crying":
                case "gusgus":
                case "jackjack":
                    scene.children.forEach(element => {
                        if(element.name=="gusgus"){
                            element.visible = !element.visible;
                            AnimationRotationMouse(0.1, 0.2, 0.3, -16, -10, -10, -10, -Math.PI, element);
                        }
                        if(element.name=="jackjack"){
                            element.visible = !element.visible;
                            AnimationRotationMouse(0.1, 0.2, 0.3, -16, -20, -20, -16, -Math.PI, element);
                        }
                    });
                    break;
            }
            break;
        case "scene4":
            console.log("Escena 4", CLICKED.name);
            // Animations
            if (CLICKED.parent.name == "Cinderella_Carosse") {
                console.log("Carrouse");
                enterAnimationYRotation(0, 0.1, 0.2, -30, -10, -30, 0, 0.2, 0, Math.PI, (7*Math.PI) / 3, CLICKED.parent);
                return;
            }
            if (CLICKED.name == "fairy_godmother") {
                enterAnimationYRotation(0, 0.15, 0.3, -5, 7, -5, 0, 0.3, -Math.PI, Math.PI, -Math.PI, CLICKED);
            }
            break;
        case "scene5":
            // Animations
            console.log("Escena 5", CLICKED.name);
            switch(CLICKED.name)
            {
                case "cinderella_dancing":
                    scene.children.forEach(element => {
                        if(element.name=="grupoBaile"){
                            danceAnimations();
                        }
            });
            break;
        }
        case "scene6":
            console.log("Escena 6");
            // Animaciones
            break;            
    
        default:
            break;
    }
}

function enterAnimationX(ti, tf, pos1_x, pos2_x, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
                { 
                    keys:[0, ti, tf], 
                    values:[
                            { x : pos1_x },    
                            { x : pos1_x },
                            { x : pos2_x },
                            ],
                    target: element.position
                }
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

function enterAnimationY(ti, tf, pos1_y, pos2_y, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
                { 
                    keys:[0, ti, tf], 
                    values:[
                            { y : pos1_y },
                            { y : pos1_y },
                            { y : pos2_y },
                            ],
                    target: element.position
                }
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

function enterAnimationYRotation(t1, t2, t3, pos1_y, pos2_y, pos3_y, tiR, tfR, rot1, rot2, rot3, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
                { 
                    keys:[t1, t2, t3], 
                    values:[
                            { y : pos1_y },
                            { y : pos2_y },
                            { y : pos3_y },
                            ],
                    target: element.position
                },
                { 
                    keys:[tiR, (tiR+tfR)/2, tfR], 
                    values:[
                            { y : rot1 },
                            { y : rot2 },
                            { y : rot3 },
                            ],
                    target:element.rotation
                }
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

function AnimationRotationMouse(t1, t2, t3, pos1_x, pos2_x, pos3_x, pos4_x, rot, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
                { 
                    keys:[0, t1, t2, t3], 
                    values:[
                            { x : pos1_x, y : -10, z : -5 },
                            { x : pos2_x, y : -10, z : -5 },
                            { x : pos3_x, y : -10, z : -2.5 },
                            { x : pos4_x, y : -10, z : 0 },
                            ],
                    target: element.position
                },
                { 
                    keys:[0, t2, t3], 
                    values:[
                            { y : 0 },
                            { y : 0 },
                            { y : rot },
                            ],
                    target:element.rotation
                }
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

function textAnimation(text, size, x, y, z, scene){
    const loaderText = new THREE.FontLoader(manager);

    loaderText.load( '../fonts/book.json', function ( font ) {

        let textGeometry = new THREE.TextGeometry( text, {
            font: font,
            size: size,
            height: 0.5,
            curveSegments: 1,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 1
        } );

        var textMaterial = new THREE.MeshPhongMaterial( 
            { color: 0xd6ecef, specular: 0xffffff }
        );
        var mesh = new THREE.Mesh(textGeometry, textMaterial);

        mesh.position.set(x, y, z);
        scene.add(mesh);
    } );
}

// Dance animation
function danceAnimations() 
{
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the movement in ∞ by the group
                { 
                    keys:[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], 
                    values:[
                            { x : 0, z : 0 },
                            { x : 4, z : -4 },
                            { x : 8, z : 0 },
                            { x : 4, z : 4 },
                            { x : 0, z : 0 },
                            { x : -4, z : -4 },
                            { x : -8, z : 0 },
                            { x : -4, z : 4 },
                            { x : 0, z : 0 },
                            ],
                    target:grupoBaile.position,
                    easing:TWEEN.Easing.Exponential.Out
                }
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

// /Computer-Graphics/13_threejsInteraction/threejsInteraction.html
function initAnimator()
{
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, .5, 1], 
                    values:[
                            { y : 0 },
                            { y : Math.PI  },
                            { y : Math.PI * 2 },
                            ],
                },
            ],
        loop: loopAnimation,
        duration:duration * 1000,
    });
}

// /Computer-Graphics/13_threejsInteraction/threejsInteraction.html
//https://threejs.org/docs/#api/en/core/Raycaster.intersectObjects
//https://riptutorial.com/three-js/example/17088/object-picking---raycasting
function raycast ( e )
{
    e.preventDefault();
    mouseVector.x = 2 * (e.clientX / width) - 1;
	mouseVector.y = 1 - 2 * ( e.clientY / height );

    raycaster.setFromCamera(mouseVector, camera);
    
    let intersects = raycaster.intersectObjects(scene.children, true);

    if(intersects.length > 0)
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        //CLICKED.material.emissive.setHex( 0x00ff00 );
        playClickAnimations();
    }
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );
        CLICKED = null;
    }

}

function splitText(text, limit) 
{
    words = text.split(' ');
    newText = words.shift();
    charCount = newText.length;

    words.forEach(word => {
        charCount += word.length + 1;
        if (charCount <= limit) {
            newText += ' ';
        } 
        else {
            newText += '\n';
            charCount = word.length
        }
        newText += word;
    });
    return newText;
}