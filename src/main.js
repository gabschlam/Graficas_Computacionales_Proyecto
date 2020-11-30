/*
Final Project
Gabriel Schlam Huber - A01024122
Alejandra Nissan Leizorek - A01024682
Samantha Barco Mejia - A01196844
*/ 

let renderer = null, 
scene = null, 
sceneTemp = null,
camera = null,
cube = null,
objLoader = null,
ambientLight = null;

let animationMice = false;

let index = 0;

// Array for the scenes
let scenes = [];

// Array for the texts for each scene
let textScenes = [
    'Once upon a time there was a very beautiful and kind young woman who had lost both her parents, and was left with her stepmother. This woman had two very ugly daughters, but their mother spoiled them and always made Cinderella do all the difficult housework. Because of this, Cinderella found herself often kneeling on the floor, covered in dirt and ashes, exhausted and with her clothes torn to rags. What’s more, she was left no time for any other activities. Since she was always dirty from ash and cinders, the townspeople called her Cinderella.',
    'One day, the prince announced a grand ball, and invited all young women who would like to marry him so that he could choose the most beautiful and make her his princess. The stepmother prepared her two daughters with the best ball gowns and made them up so that they would be pretty, but she prohibited Cinderella from attending the ball. She ordered her to stay at home mopping the floor and preparing dinner so that it would be ready when the three of them returned home. Cinderella obeyed, but as she watched her stepsisters leave for the ball at the royal palace, she couldn’t help but feel miserable and began to cry.',
    'Suddenly, her Fairy Godmother appeared, telling her she didn’t have to worry. She would be able to go to the ball too, but with one condition: she must return home before the palace clock struck midnight. Cinderella looked down at the rags she was wearing. “I can’t go to the ball wearing this,” she cried. The Fairy Godmother waved her magic wand and said the magic words, “Bippidy boppidy boo”, and transformed Cinderella’s ragged clothes into a beautiful ball gown with a pair of glass slippers on her feet. She was exquisitely beautiful.',
    'When Cinderella arrived and entered the ballroom, everyone gazed at her in awe. The prince, seeing her incredible beauty, approached her and danced the whole night with her. Nobody recognized her, not even her stepsisters. It was just like her most beautiful dreams. Suddenly, the palace clock rang out. It was midnight already! Cinderella dashed across the room as her ballgown began to transform back into rags, and she ran so fast that she lost one of her glass slippers on the palace stairs. The prince found the slipper and kept it, intent on finding the mysterious young woman again.',
    'The next day, the prince announced that he would marry whoever fit into the glass slipper. All of his heralds searched the kingdom for the woman to whom the shoe belonged. Finally, they arrived at the house of Cinderella’s stepmother. Her first step sister’s feet would not fit into the shoe, and the second step sister couldn’t fit either. When the herald asked if there were any other young women in the house, the step sisters laughed and said, “Only Cinderella, the girl who is covered in soot and ash”. But when Cinderella arrived, they saw that her foot fit perfectly in the glass slipper. The step sisters were furious. The prince was overjoyed and decided to marry Cinderella.'
]

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

//Scene 5 light
let spotlightOn = 0;

// Function for loading OBJ 3d model with MTL file, with material file
// receives urls, name, scene, scale, position, rotation 
// and true or false if it needs an outline (meaning that it will have animation on click)
function load3dModel(objModelUrl, mtlModelUrl, name, sceneObj, scale, x, y, z, rotationX, rotationY, outline)
{
    // Loading the material file
    mtlLoader = new THREE.MTLLoader(manager);

    mtlLoader.load(mtlModelUrl, materials =>{
        
        // Load the corresponding materials
        materials.preload();

        objLoader = new THREE.OBJLoader(manager);
        // Assign materials to object
        objLoader.setMaterials(materials);

        // Start loading object from url
        objLoader.load(objModelUrl, object=>{
            // Set scale
            object.scale.set(scale,scale,scale);
            // Set position
            object.position.set(x, y, z);

            // If there is rotation in X or Y
            if (rotationX) {
                object.rotation.x = rotationX ;
            }
            if (rotationY) {
                object.rotation.y = rotationY ;
            }
            object.name = name;

            object.traverse( function( child ) {
                // Assign geometry to mesh
                if ( child.isMesh ) 
                {
                    child.geometry.computeVertexNormals();

                    // If outline is needed
                    if (outline) {
                        // If object is fountain, assign more edges, with more angle (35)
                        if (name == "fountain") {
                            // only show edges with 35 degrees or more angle between faces
                            var thresholdAngle = 35;
                            var color = 0xffffff;
                        }
                        else {
                            // only show edges with 50 degrees or more angle between faces
                            var thresholdAngle = 50;
                            var color = 0xff0000;
                        }

                        // Create outline effect with EdgesGeometry
                        var lineGeometry = new THREE.EdgesGeometry(child.geometry, thresholdAngle);
                        var material = new THREE.LineBasicMaterial({color: color});
                        var mesh = new THREE.LineSegments(lineGeometry, material);
                        mesh.name = name;
                        object.add(mesh);
                    }
                   
                    // child.geometry.computeBoundingBox();
                }
            } );

            sceneObj.add(object);
            
        });
    });

}

// Function for loading OBJ 3d model without MTL file
// Function to load obj models with no material
// Crystal effect references: https://threejs.org/examples/?q=refra#webgl_materials_cubemap_refraction
// https://threejs.org/examples/#webgl_materials_variations_standard
// https://threejs.org/examples/?q=trans#webgl_materials_physical_transmission
function loadOnly3dObjModel(objModelUrl, name, scale, x, y, z) 
{
    var loader = new THREE.OBJLoader(manager);
    // Parameters for the material to look like crystal
    const params = {
        color: 0xffffff,
        transmission: 0.60,
        envMapIntensity: 1,
        lightIntensity: 1,
        exposure: 1
    };
    
    loader.load(objModelUrl, function (object) {
        object.traverse( function (child){
            if(child.isMesh){
                // These parameters allow th slippers to look transparent and like crystal
                // https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial
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
                    clearcoat: 1,
                    clearcoatRoughness:0,
                  });
            }
        });

        object.scale.x = object.scale.y = object.scale.z = scale;
        object.position.set(x,y,z);
        object.name = name;
        scenes[0].add(object);
    });
}

// Function for loading FBX 3d model
// receives urls, name, scene, scale, position and rotation
function load3dFbxModel(modelUrl, textureUrl, normalUrl, aoUrl, metalUrl, roughnessUrl, name, sceneObj, scale, x, y, z, rotationX, rotationY)
{
    var loader = new THREE.FBXLoader(manager);
    loader.load(modelUrl, function (object) {
        // Loads sent urls and material
        object.traverse( function (child){
            if(child.isMesh){
                let texture = new THREE.TextureLoader(manager).load(textureUrl);
                let normal = null;
                let ao = null;
                let metallic = null;
                let roughness = null;
                if(normalUrl != null){
                    normal = new THREE.TextureLoader(manager).load(normalUrl);
                }
                if(aoUrl != null){
                    ao = new THREE.TextureLoader(manager).load(aoUrl);
                }
                if(metalUrl != null){
                    metallic = new THREE.TextureLoader(manager).load(metalUrl);
                }
                if(roughnessUrl != null){
                    roughness = new THREE.TextureLoader(manager).load(roughnessUrl);
                }
                child.material = new THREE.MeshStandardMaterial( { map: texture, normalMap: normal, aoMap:ao, aoMapIntensity: 1, metalnessMap: metallic, metalness: 0,  roughnessMap: roughness, roughness: 0 } );
            }
        });

        // scales, rotates, and sets the object
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
    });
}

// Function for creating mesh for 2d characters
// It receives an image address, measures, and position
function createCharacterMesh( address, name, width, height, X, Y, Z ) 
{
    let map = new THREE.TextureLoader(manager).load(address); //Loads texture
    let geometry = new THREE.PlaneGeometry(width, height, 5, 5); //Creates geometry
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide, transparent:true})); //Finally creates the mesh
    //Set position
    mesh.position.setX(X);
    mesh.position.setY(Y);
    mesh.position.setZ(Z); 
    mesh.name = name; //The name is important for the animations and raycasting 
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

    //////////////////////////////////////////////////
    //   Load objects before rendering scenes       //
    //////////////////////////////////////////////////

    // Loading screen
    loadingDiv = document.getElementById("loading");

    // Initialize Loading Manager
    manager = new THREE.LoadingManager();

    // On start function for loading objects
    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        document.getElementById('nextButton').style.display = 'none';
    };

    // When finishing loading all object
    manager.onLoad = function ( ) {
        console.log( 'Loading complete!');
        // Removing Loading Screen
        loadingDiv.remove();
        // Choosing default scene as scene1
        scene = scenes[0];
        scene.add(camera);
        scene.add(ambientLight)
        // Displaying next button
        document.getElementById('nextButton').style.display = 'inline';

    };

    // On progress for loading each object
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    // On error when loading some object
    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );

    };

    /////////////////////////////////////////////////
    //       Scene 1                               //
    // Story cover, cinderella slippers, name, and //
    // butterfly.                                  //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene1";
    // Set the background for scene 1 
    sceneTemp.background = new THREE.Color( 0x89d0f1);

    // Adding scene to Array of Scenes
    scenes.push(sceneTemp);

    // Title
    textCreation('Cinderella', 3,-10,8.5,-1, 0x0D4F6E, scenes[0]);

    // Names
    textCreation('Gabriel Schlam Huber - A01024122\nAlejandra Nissan Leizorek - A01024682\nSamantha Barco Mejia - A01196844',0.3,-9,-5,15, 0x115e82, scenes[0]);

    // Loading slippers
    loadOnly3dObjModel("../models/slipper/3d-model.obj", 'slipper', 0.3, 0,-8,0);

    // Loading butterfly
    butterfly = createCharacterMesh("../models/2d_images/butterfly.png", 'butterfly' ,8,6,13,13,-12);
    butterfly.material.emissive.setHex(0x000000);
    sceneTemp.add(butterfly);

    // Floor
    let geometry = new THREE.PlaneGeometry( 120, 100, 1 );
    let material = new THREE.MeshPhongMaterial( {color: 0x45b5e9, side: THREE.DoubleSide, reflectivity: 1} );
    let plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = -Math.PI/2;
    plane.position.y = -12;
    scenes[0].add( plane );

    // Creating spotlight, https://threejs.org/docs/#api/en/lights/SpotLight
    let spotLight = new THREE.SpotLight( 0xffffff );
    // Alternative position to increase light 20,0,20
    spotLight.position.set( 29, 0, 29 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    scenes[0].add( spotLight );


    /////////////////////////////////////////////////
    //       Scene 2                               //
    // Cinderella and her step-family are in the   //
    // living room for the introduction.           //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene2";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene2_background.jpg");
    
    // Loading Cinderella's 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/cinderella_cleaningOutline.png", 'cinderella_cleaning' ,12,15,-30,-5,-2));
    
    // Loading Stepsisters' 2D objects
    sceneTemp.add(createCharacterMesh("../models/2d_images/stepsisters_normalOutline.png", 'stepsisters_normal' ,14,14,30,-5,0));
    
    // Loading Stepmother's 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/stepmother.png", 'stepmother', 7,15,30,-5,1.5));

    // Loading Bubbles
    //Creates a groups for the bubbles
    bubblesGroup = new THREE.Object3D;
    bubblesGroup.name = "bubbles";
    // Sets different sizes and positions for the bubbles, and adds them to the group
    bubblesGroup.add(createCharacterMesh("../models/2d_images/bubble.png", 'bubble', 1.0,1.0,0,0,0));
    bubblesGroup.add(createCharacterMesh("../models/2d_images/bubble.png", 'bubble', 0.8,0.8,0.4,-1.1,0));
    bubblesGroup.add(createCharacterMesh("../models/2d_images/bubble.png", 'bubble', 0.8,0.8,-0.7,0.8,0));
    bubblesGroup.add(createCharacterMesh("../models/2d_images/bubble.png", 'bubble', 0.3,0.3,0.4,0.7,0));
    bubblesGroup.add(createCharacterMesh("../models/2d_images/bubble.png", 'bubble', 0.3,0.3,-0.6,-1.2,0));
    // Adds the bubbles to the scenes
    sceneTemp.add(bubblesGroup);
    bubblesGroup.position.set(-10,-9.85,2);

    // Loading Mouse's 2D object
    gusGus = createCharacterMesh("../models/2d_images/gusgus.png", 'gusgus', 3,4,6,-10,-2);
    gusGus.rotation.y = Math.PI;
    sceneTemp.add(gusGus);
    
    // Adding scene to Array of Scenes
    scenes.push(sceneTemp);

    // Loading the table
    load3dFbxModel("../models/table/source/table.fbx", "../models/table/textures/texture.jpg", null, null, null, null, 'table', scenes[1], 0.1,-4, -11, 0.2, 0, 0);

    // Loading the bucket
    load3dFbxModel("../models/bucket/source/Bucket.fbx", "../models/bucket/textures/Bucket_Albedo.png", "../models/bucket/textures/Bucket_Normal.png", "../models/bucket/textures/Bucket_AO.png", "../models/bucket/textures/Bucket_Metallic.png", "../models/bucket/textures/Bucket_Roughness.png", 'bucket', scenes[1], 5,-10,-11,2, 80, 0);

    // Loading the Sofa
    load3dFbxModel("../models/sofa/source/Sofa010_001.FBX", "../models/sofa/textures/Sofa010_D1024.png", "../models/sofa/textures/Sofa010_N1024.png", "../models/sofa/textures/Sofa010_AO1024.png", "../models/sofa/textures/Sofa010_S1024.png", null, 'sofa', scenes[1], 0.06,-16,-12,-14, 0, 0.7);

    // Creating text
    textScene2Array = splitText(textScenes[0], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[1].add(textGroup);
    // Create for each line a Text Object
    textScene2Array.forEach((line, i) => {
        textCreation(line, 2.8,0,25-(i*3.5),-100, 0xffffff, scenes[1], textGroup, true);
    });


    /////////////////////////////////////////////////
    //       Scene 3                               //
    // Cinderella and her step-family are outside  //
    // getting ready for the ball.                 //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene3";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene3-4_background.jpg");

    // Loading Cinderella Crying's 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/cinderella_cryingOutline.png", 'cinderella_crying', 8,10,-30,-8,-2));

    // Creating group for Stepsisters and Mother
    objectGroup = new THREE.Object3D;
    objectGroup.name = "groupStepSistersMother"
    // Loading Stepsisters' 2D objects
    stepSisters = createCharacterMesh("../models/2d_images/stepsisters_party.png", 'stepsisters_party', 13,14,16,-8,-5);
    // Loading Stepmother's 2D object
    stepMother = createCharacterMesh("../models/2d_images/stepmother_party.png", 'stepmother_party', 8,15,9,-8,-5);
    stepSisters.rotation.y = Math.PI;
    objectGroup.add(stepSisters);
    objectGroup.add(stepMother);
    objectGroup.position.x = 20;
    sceneTemp.add(objectGroup)

    // Loading fountain's water splash
    waterSplash = createCharacterMesh("../models/2d_images/water_splash.png", 'water_splash', 8, 10, 6.3,-3.7,-13);
    waterSplash.visible = false;
    sceneTemp.add(waterSplash);

    // Loading mice
    gusGus = createCharacterMesh("../models/2d_images/gusgus.png", 'gusgus', 4,5,-16,-10,-5);
    gusGus.visible = false;
    sceneTemp.add(gusGus);
    jackJack = createCharacterMesh("../models/2d_images/jackjack.png", 'jackjack', 5,5,-16,-10,-5);
    jackJack.visible = false;
    sceneTemp.add(jackJack);

    // Adding scene to Array of Scenes
    scenes.push(sceneTemp);

    // Create the fountain:
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[2], 3.5, 15, -30, -75, -Math.PI / 18, null, true);

    // Creating text
    textScene3Array =  splitText(textScenes[1], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[2].add(textGroup);
    // Create for each line a Text Object
    textScene3Array.forEach((line, i) => {
        textCreation(line, 2.8,-75,25-(i*3.5),-100, 0xd6ecef, scenes[2], textGroup, true);
    });

    /////////////////////////////////////////////////
    //       Scene 4                               //
    // Cinderella is outside crying and suddenly   //
    // the Fairy Godmother shows up.               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene4";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene3-4_background.jpg");

    // Loading Cinderella's 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/cinderella_crying.png", 'cinderella_crying', 8,10,-15,-8,-2));
    
    // Loading Fairy Godmother's 2D object
    godmother = createCharacterMesh("../models/2d_images/fairy_godmotherOutline.png", 'fairy_godmother', 16,18,-2,30,-7);
    godmother.rotation.y = Math.PI;
    sceneTemp.add(godmother);

    // Adding scene to Array of Scenes
    scenes.push(sceneTemp);

    // Loading the fountain:
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[3], 3.5, 15, -30, -75, -Math.PI / 18, null, false);
    
    // Loading the carruaje:
    load3dModel('../models/cinderella_carrosse/Cinderella_Carosse.obj', '../models/cinderella_carrosse/Cinderella_Carosse.mtl', 'Cinderella_Carosse', scenes[3], 9, 60, -60, -50, null, Math.PI / 3, true);

    // Creating text
    textScene4Array = splitText(textScenes[2], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[3].add(textGroup);
    // Create for each line a Text Object
    textScene4Array.forEach((line, i) => {
        textCreation(line, 2.8,0,25-(i*3.5),-100, 0xffffff, scenes[3], textGroup, true);
    });

    /////////////////////////////////////////////////
    //       Scene 5                               //
    // Cinderella meets Prince charming in the ball//
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();  
    sceneTemp.name = "scene5";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene5-6_background.jpg");

    // Creating group for Cinderella and Prince for dancing animation
    grupoBaile = new THREE.Object3D;
    grupoBaile.name = "grupoBaile";

    // Loading the prince 2D object
    sceneTemp.add(grupoBaile.add(createCharacterMesh("../models/2d_images/prince_charming_scene_5_Outline.png", 'prince_dancing', 10,10,0,-7,0)));

    // Loading Cinderella 2D object
    sceneTemp.add(grupoBaile.add(createCharacterMesh("../models/2d_images/cinderellaOutline.png", 'cinderella_dancing', 9,12,4,-9,-5)));

    grupoBaile.position.x = -30; //Setting the x position of the group

    // Adding scene to Array of Scenes
    scenes.push(sceneTemp);

    // Adding light for the column
    let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5);
    sceneTemp.add( directionalLight );
    directionalLight.position.set(-15, 0, -10);
    
    // Loading the column 3D object
    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', 'column', scenes[4], 1.8, 16, -1, 0, 0, 0, true);

    // Loading invisible plane for text 
    geometry = new THREE.PlaneGeometry( 95, 70, 1 );
    material = new THREE.MeshBasicMaterial( {color: 0xffffff, opacity: 0.25, transparent: true, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.position.x = -46;
    plane.position.y = 30;
    plane.position.z = -120;
    scenes[4].add( plane );

    // Creating text
    textScene5Array =  splitText(textScenes[3], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[4].add(textGroup);
    // Create for each line a Text Object
    textScene5Array.forEach((line, i) => {
        textCreation(line, 2.8,-75,25-(i*3.5),-100, 0x000000, scenes[4], textGroup, true);
    });

    // Creating spotlight, https://threejs.org/docs/#api/en/lights/SpotLight
    spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.name = "light";
    // Alternative position to increase light 20,0,20
    spotLight.position.set( 29, 0, 29 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    spotLight.intensity = 0;
    scenes[4].add( spotLight );

   
    /////////////////////////////////////////////////
    //       Scene 6                               //
    // Prince charming finds Cinderella and they   //
    // get married                                 //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene6";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene5-6_background.jpg");

    // Loading the prince 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/prince_scene6.png", 'prince', 5,12,-4,-9,-5));

    // Loading Cinderella 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/cinderella_bride.png", 'cinderella', 8,12,4,-9,-5));

    // Loading Mice 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/ratones_scene6.png", 'mice', 5,3,18,-14,-8));

    // Loading Birds 2D object
    sceneTemp.add(createCharacterMesh("../models/2d_images/birds_scene6Outline.png", 'birds', 5,3,12,12.5,-5));

    // For the petals rain
    // Rose Petals group
    petalsGroup = new THREE.Object3D;
    petalsGroup.name = "petals";

    // Generate 20 petals in random positions (above cinderella and prince)
    for ( let petalCount = 0; petalCount<25; petalCount++ )
    {
        let width = Math.random() * 0.4;
        let height = width * 1.1;
        let x = Math.random() * 10 -2; // Adds petals randomly over Cinderella and the prince
        // https://www.pngkey.com/maxpic/u2q8a9i1y3e6q8y3/
        petalsGroup.add(createCharacterMesh("../models/2d_images/rose_petal.png", 'petal', width,height,x,13,1))
    }
    // Adding petals group to the scene
    sceneTemp.add(petalsGroup);

    // Adding light for the column
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5);
    sceneTemp.add( directionalLight );
    directionalLight.position.set(-15, 0, -10);

    // Adding scene to Array of Scenes
    scenes.push(sceneTemp);

    // Loading the columns 3D object
    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', 'column1', scenes[5], 1.8, 16, -1, 0, 0, 0, true);
    
    // Loading invisible plane for text
    geometry = new THREE.PlaneGeometry( 95, 70, 1 );
    material = new THREE.MeshBasicMaterial( {color: 0xffffff, opacity: 0.25, transparent: true, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.position.x = -46;
    plane.position.y = 30;
    plane.position.z = -120;
    scenes[5].add( plane );

    // Creating text
    textScene6Array =  splitText(textScenes[4], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[5].add(textGroup);
    // Create for each line a Text Object
    textScene6Array.forEach((line, i) => {
        textCreation(line, 2.8,-75,25-(i*3.5),-100, 0x000000, scenes[5], textGroup, true);
    });

}

// Function for initing Animation
// Computer-Graphics/13_threejsInteraction/threejsInteraction.html
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

// Function to use raycasting and managing the user click on object
// Computer-Graphics/13_threejsInteraction/threejsInteraction.html
// https://threejs.org/docs/#api/en/core/Raycaster.intersectObjects
// https://riptutorial.com/three-js/example/17088/object-picking---raycasting
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
        playClickAnimations();
    }
    else 
    {
        CLICKED = null;
    }
}

// Function for playing enter and exit animations
function playAnimations() 
{
    animator.start();
    switch (scene.name) {
        case "scene2":
            console.log("Escena 2");
            // Animations for the characters to enter the scene
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
                    case "gusgus":
                        enterAnimationX(0.125, 0.250, 30, 6, element);
                        break;
                    // Animation for the text to iterate
                    case "textGroup":
                        textAnimation(0, 1, 10, 64, 0.8, element.children);
                        break;
                }
            });
            break;
        case "scene3":
            console.log("Escena 3");
            // Animations for the characters to enter the scene
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_crying":
                        enterAnimationX(0, 0.125, -30, -15, element);
                        break;
                    // For making visible either gusgus, jackjack and water_splash object
                    case "gusgus":
                    case "jackjack":
                    case "water_splash":
                        element.visible = false;
                        break;
                    case "groupStepSistersMother":
                        // Animation for position and different rotation for the stepsisters and stepmother
                        animator = new KF.KeyFrameAnimator;
                        animator.init({ 
                            interps:
                                [
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
                                    // Rotation for stepsisters
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
                                    // Rotation for stepmother                                  
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
                    // Animation for the text to iterate
                    case "textGroup":
                        textAnimation(0, 1, 0.5, 55, 0.8, element.children);
                        break;
                    default:
                        break;
                }
            });
            break;
        case "scene4":
            console.log("Escena 4");
            // Animations for the characters to enter the scene
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_crying":
                        // Reset texture and scale
                        element.material.map = new THREE.TextureLoader().load( "../models/2d_images/cinderella_crying.png" ); 
                        element.scale.set(1, 1, 1);
                        enterAnimationYRotation(0, 0.8, 0.95, -8, -8, -2, 0.8, 0.95, (8*Math.PI)/3, (16*Math.PI)/3, Math.PI*8, element);
                        
                        // Set timeout for changing texture and scale for cinderella's in dress                 
                        setTimeout( () => {
                            element.material.map = new THREE.TextureLoader().load( "../models/2d_images/cinderella.png" ); 
                            element.scale.set(1.5, 1.5, 1.5);
                        }, (duration - 1) * 1000 );
                        break;
                    case "fairy_godmother":
                        enterAnimationYRotation(0, 0.125, 0.25, 30, 30, -5, 0.125, 0.25, -Math.PI, Math.PI, -Math.PI, element);
                        break;
                    case "Cinderella_Carosse":
                        // Animation for position in x and y axis
                        animator = new KF.KeyFrameAnimator;
                        animator.init({ 
                            interps:
                                [
                                    { 
                                        keys:[0, 0.85, 1], 
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
                    // Animation for the text to iterate
                    case "textGroup":
                        textAnimation(0, 1, 0.5, 55, 0.8, element.children);
                        break;
                    default:
                        break;
                }
            });
            break;
        case "scene5":
            console.log("Escena 5");
            // Animations for the characters to enter the scene
            scene.children.forEach(element => {
                switch (element.name) {
                    // Animation for Cinderella and Prince Charming to enter the scene
                    case "grupoBaile":
                        enterAnimationX(0, 0.125, -30, 0, element);
                        break;
                    // Animation for the text to iterate
                    case "textGroup":
                        textAnimation(0, 1, 0.5, 55, 0.8, element.children);
                        break;
                    default:
                        break;
                }
            });            
            break;
        case "scene6":
            console.log("Escena 6");
            // Animations for the characters to enter the scene
            scene.children.forEach(element => {
                switch (element.name) {
                    // Animation for Cinderella to enter the scene
                    case "cinderella":
                        enterAnimationX(0, 0.125, 12, 5.3, element);
                        break;
                    // Animation for Prince Charming to enter the scene
                    case "prince":
                        enterAnimationX(0, 0.125, -4, -0.5, element);
                        break;
                    // Animation for the text to iterate
                    case "textGroup":
                        textAnimation(0, 1, 0.5, 55, 0.5, element.children);
                        break;
                    default:
                        break;
                }
            });            
            break;
        default:
            break;
    }
}

// Function for playing animations on click
// This function is called each time user clicks over an object.
function playClickAnimations() 
{
    // There is a switch for scenes because each one has different animations
    switch (scene.name) {
        //Each case determines which animation to play with an if, it depends on character name or parent name
        case "scene1":
            console.log("Escena 1",CLICKED.name);
            // For this scene, if user clicks on the slippers they turn
            if (CLICKED.parent.name == "slipper") {
                enterAnimationYRotation(0, 0.25, 0.5, -8, -8, -8, 0, 0.2, 0, Math.PI, 2*Math.PI, CLICKED.parent);
            }
            // If user clicks on the butterfly, it goes to the beginning of the page and returns to its initial position, rotating on y axis
            if (CLICKED.name == "butterfly") {
                zigzagAnimation(0.05,0.3,13,15,11,13,-20, -Math.PI / 2, Math.PI / 2, CLICKED);
            }
            break;
        case "scene2":
            console.log("Escena 2", CLICKED.name);
            // Animations
            // If user clicks the sofa, bubbles arise from the bucket
            if (CLICKED.parent.name == "sofa") {
                for(i = 0; i< scene.getObjectByName("bubbles").children.length;i++)
                {
                    enterAnimationY(0, Math.random() + 0.1, 0, 30, scene.getObjectByName("bubbles").children[i]);
                }
            }
            switch(CLICKED.name)
            {
                // If user clicks on Cinderella, bubbles arise from the bucket
                case "cinderella_cleaning":
                    for(i = 0; i< scene.getObjectByName("bubbles").children.length;i++)
                    {
                        enterAnimationY(0, Math.random() + 0.1, 0, 30, scene.getObjectByName("bubbles").children[i]);
                    }
                    break;
                // If user clicks on the stepsisters, Gus gus leaves the scene
                case "stepsisters_normal":
                    outZigzagAnimation(0.05,0.3,-10,-9,6,-25, -1, 1,scene.getObjectByName("gusgus"));
                    break;
                default:
                    break;
            }
            break;
        case "scene3":
            console.log("Escena 3", CLICKED.name);
            // Animations
            switch(CLICKED.name)
            {
                // If user clicks on the fountain, the water splash is shown with its proper animation
                case "fountain":
                    // Animation for the water splash, position and scale
                    element = scene.getObjectByName("water_splash");        
                    element.scale.y = 0.5;
                    element.scale.x = 0.15;
                    element.position.y = -3.7;
                    // Hide or unhide depending on current state
                    element.visible = !element.visible;
                    animator = new KF.KeyFrameAnimator;
                    animator.init({ 
                        interps:
                            [
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
                    break;
                // If user clicks on cinderella, or failing that, on gusgus or jackjack, both gusgus and jackjack (mice) go to keep cinderella company
                case "cinderella_crying":
                case "gusgus":
                case "jackjack":
                    scene.children.forEach(element => {
                        // If element is gusgus, makes proper animation with different values for position and rotation
                        if(element.name=="gusgus"){
                            element.visible = true;
                            // If animation already happened, make the inverse animation for the mice to hide
                            if (animationMice == true) {
                                AnimationRotationMouse(0.1, 0.2, 0.3, -10, -10, -10, -16, 0, -2.5, -5, -5, -Math.PI, 0, -Math.PI, element);
                                setTimeout( () => {
                                    element.visible = !element.visible;
                                }, (duration - 6) * 1000 );
                            } 
                            else {
                                AnimationRotationMouse(0.1, 0.2, 0.3, -16, -10, -10, -10, -5, -5, -2.5, 0, 0, 0, -Math.PI, element);   
                            }
                        }
                        // If element is gusgus, makes proper animation with different values for position and rotation
                        if(element.name=="jackjack"){
                            element.visible = true;
                            // If animation already happened, make the inverse animation for the mice to hide
                            if (animationMice == true) {
                                AnimationRotationMouse(0.1, 0.2, 0.3, -16, -20, -20, -16, 0, -2.5, -5, -5, -Math.PI, 0, -Math.PI, element);
                                setTimeout( () => {
                                    element.visible = !element.visible;
                                }, (duration - 6) * 1000 );
                            } 
                            else {
                                AnimationRotationMouse(0.1, 0.2, 0.3, -16, -20, -20, -16, -5, -5, -2.5, 0, 0, 0, -Math.PI, element);
                            }
                        }
                    });
                    // Make variable true or false depending on current state
                    animationMice = !animationMice;
                    break;
            }
            break;
        case "scene4":
            console.log("Escena 4", CLICKED.name);
            // Animations
            // If user clicks on the carruaje, it will go up and down, while rotating on y axis
            if (CLICKED.parent.name == "Cinderella_Carosse") {
                enterAnimationYRotation(0, 0.1, 0.2, -30, -10, -30, 0, 0.2, 0, Math.PI, (7*Math.PI) / 3, CLICKED.parent);
            }
            // If user clicks on the fairy godmother, it will go up and down, while rotating on y axis
            if (CLICKED.name == "fairy_godmother") {
                enterAnimationYRotation(0, 0.15, 0.3, -5, 7, -5, 0, 0.3, -Math.PI, Math.PI, -Math.PI, CLICKED);
            }
            break;
        case "scene5":
            // Animations
            console.log("Escena 5", CLICKED.name);
            // When clicked, Cinderella and Prince Charming dance in an eight 
            if(CLICKED.name=="cinderella_dancing")
            {
                element = scene.getObjectByName("grupoBaile");    
                danceAnimations(element);
            }
            // When clicked, the light intensity increases or decreases by using a boolean
            if(CLICKED.parent.name=="column"){
                if (spotlightOn == 1) 
                {
                    scene.getObjectByName("light").intensity= 0;
                    spotlightOn = 0;
                }
                else
                {
                    scene.getObjectByName("light").intensity= 0.3;
                    spotlightOn = 1;
                }
            }   
            break;
        case "scene6":
            // Animaciones
            console.log("Escena 6", CLICKED.name);
            // When clicked, the birds start flying and the rose petals start falling in the scene 
            if(CLICKED.name=="birds")
            {
                zigzagAnimation(0.05,0.3,12,10,6,12.5,-12,0,0,CLICKED);
                for(i = 0; i< scene.getObjectByName("petals").children.length;i++)
                {
                    enterAnimationY(0, Math.random() + 0.5, 13, -30, scene.getObjectByName("petals").children[i]);
                }
            }
            // When clicked, the mice start running
            if(CLICKED.parent.name=="column1"){
                outZigzagAnimation(0.05,0.3,-14,-12,18,-30, -8, -8,scene.getObjectByName("mice"));
            }   
            break;    
    }
}

/////////////////////////////////////////////////
//    Enter Animations                         //
// To reuse code, we created a group of        //
// animations for all of our characters to     //
// enter scenes. These ones also worked for on //
// click animations.                           //
/////////////////////////////////////////////////

// Function for entering to the scene in X axis
//It just asks for two positions, two times and of course the element it will be assigned to
function enterAnimationX(ti, tf, pos1_x, pos2_x, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
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

// Function for entering to the scene in Y axis
//It just asks for two positions, two times and of course the element it will be assigned to
function enterAnimationY(ti, tf, pos1_y, pos2_y, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
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

// Function for entering to the scene in Y axis with rotation
function enterAnimationYRotation(t1, t2, t3, pos1_y, pos2_y, pos3_y, tiR, tfR, rot1, rot2, rot3, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
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

/////////////////////////////////////////////////
//    On Click Animations                      //
// To reuse code, we created multiple anima-   //
// tions with generic movements like zigzag,   //
// rotations, and an infinity sign.            //
/////////////////////////////////////////////////

// Function for creating a Zig Zag Animation 
// As parameters, it receives times, y-limits, x start and end positions, rotations, and element to move 
function zigzagAnimation(ti, tf, y_init, y_top, y_bottom, pos1_x, pos2_x, rot1, rot2, element){
    animator = new KF.KeyFrameAnimator;
    // For the element to go up and down we divide the x range into three segments and time into six, one pint in time is one position in x
    // As the element returns to its initial position, x is divided into 3 and not six
    timeJump = (tf-ti)/6;
    xJump = (pos2_x - pos1_x)/3;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, ti, ti+timeJump, ti+timeJump*2, ti+timeJump*3, ti+timeJump*4, tf], 
                    values:[
                            // Starting position
                            { x : pos1_x, y : y_init },    
                            { x : pos1_x + xJump, y : y_top },    
                            { x : pos1_x + xJump*2, y : y_bottom },
                            // Reach the x's limit and goes back to initiial position, alternates between y top andd bottom to create the zigzag
                            { x : pos2_x, y : y_top }, 
                            { x : pos1_x + xJump*2, y : y_bottom },
                            { x : pos1_x + xJump, y : y_top },
                            // Starting position again
                            { x : pos1_x, y : y_init },
                            ],
                    target: element.position
                },
                { 
                    keys:[0, ti, ti+timeJump, ti+timeJump*2, ti+timeJump*3, ti+timeJump*4, tf], 
                    values:[
                            // Starting position
                            { y : 0 },    
                            { y : rot1 },    
                            { y : rot1 },
                            // Reach the x's limit and goes back to initiial position, alternates between y top andd bottom to create the zigzag
                            { y : rot2 }, 
                            { y : rot2 },
                            { y : rot2 },
                            // Starting position again
                            { y : 0 },
                            ],
                    target: element.rotation
                }
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

// Function for creating an out Zig Zag Animation
// It works to create a zigzag animation ffor characters to leave the scene
function outZigzagAnimation(ti, tf, y_init, y_bottom, pos1_x, pos2_x, z_init, z_end,element){
    animator = new KF.KeyFrameAnimator;
    // For the element to go up and down we divide the x range into three segments and time into six, one pint in time is one position in x
    // As the element returns to its initial position, x is divided into 3 and not six
    timeJump = (tf-ti)/6;
    xJump = (pos2_x - pos1_x)/3;
    animator.init({ 
        interps:
            [
                { 
                    // Generates the zigzag effect by alternating between y-top and y-bottom, and uses z to create a movement in depth
                    keys:[0, ti, ti+timeJump, ti+timeJump*2, ti+timeJump*3, ti+timeJump*4, ti+timeJump*5, tf], 
                    values:[
                            { y : y_init, z : z_init },    
                            { y : y_init, z : z_init },    
                            { y : y_bottom, z : z_init },
                            { y : y_init, z : z_init },
                            { y : y_bottom, z : z_init },
                            { y : y_init, z : z_end },
                            { y : y_bottom, z : z_end },
                            { y : y_init, z : z_end },
                            ],
                    target: element.position
                },
                // As for x we use only 3 points in time
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

// Function for the mouse animation with rotation
// It works to create a movement for the mouse for going from the back of cinderella and go to in front of her, and vice versa
function AnimationRotationMouse(t1, t2, t3, pos1_x, pos2_x, pos3_x, pos4_x, pos1_z, pos2_z, pos3_z, pos4_z, rot1, rot2, rot3, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, t1, t2, t3], 
                    values:[
                            { x : pos1_x, y : -10, z : pos1_z },
                            { x : pos2_x, y : -10, z : pos2_z },
                            { x : pos3_x, y : -10, z : pos3_z },
                            { x : pos4_x, y : -10, z : pos4_z },
                            ],
                    target: element.position
                },
                { 
                    keys:[0, t2, t3], 
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

// Function for the dance animation
// It works to create a dance movement for cinderella and the prince
function danceAnimations(element) 
{
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the movement in ∞ by the group
                { 
                    // It was done by dividing the ∞ in the most significant vertices
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
                    target:element.position,
                    easing:TWEEN.Easing.Exponential.Out // Helps the animation look more smooth
                }
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

/////////////////////////////////////////////////
//          Text Functions                     //
// This section includes animations that allow //
// us to manage texts. Including creation and  //
// the animation.                              //
/////////////////////////////////////////////////

// Function for the text creation (textGeometry)
function textCreation(text, size, x, y, z, color, scene, textGroup, shown){
    const loaderText = new THREE.FontLoader(manager);

    loaderText.load( '../fonts/book.json', function ( font ) {

        let textGeometry = new THREE.TextGeometry( text, {
            font: font,
            size: size,
            height: 0.1,
            curveSegments: 1,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 1
        } );

        var textMaterial = new THREE.MeshBasicMaterial( 
            { color: color }
        );
        var mesh = new THREE.Mesh(textGeometry, textMaterial);

        mesh.position.set(x, y, z);
        if (shown) {
            mesh.visible = false;
        }
        if (textGroup) {
            textGroup.add(mesh);
        }
        else {
            scene.add(mesh);
        }
    } );
}

// Function for spliting the text into lines in an array of texts
function splitText(text, limit) 
{
    let arr = [];
    words = text.split(' ');
    newText = words.shift();
    charCount = newText.length;

    words.forEach(word => {
        charCount += word.length + 1;
        if (charCount <= limit) {
            newText += ' ';
        } 
        else {
            arr.push(newText);
            newText = '';
            charCount = word.length
        }
        newText += word;
    });
    arr.push(newText);
    return arr;
}

// Function for the text animation
function textAnimation(ti, tf, pos1_y, pos2_y, speed, textArray)
{
    len = textArray.length;
    for (let i = 0, p = Promise.resolve(); i < len; i++) {
        p = p.then(_ => new Promise(resolve =>
            setTimeout(function () {
                textArray[i].visible = true;
                enterAnimationY(ti, tf, pos1_y + (i*0.7), pos2_y, textArray[i]);
                resolve();
            }, speed * 1000)
        ));
    }    
}