let renderer = null, 
scene = null, 
sceneTemp = null,
camera = null,
cube = null,
objLoader = null,
ambientLight = null,
sphere = null;

let animationMice = false;

let index = 0;

let scenes = [];
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

// Function for loading OBJ 3d model with MTL file
function load3dModel(objModelUrl, mtlModelUrl, name, sceneObj, scale, x, y, z, rotationX, rotationY, outline)
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

                    if (outline) {
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
                        var lineGeometry = new THREE.EdgesGeometry(child.geometry, thresholdAngle);
                        var material = new THREE.LineBasicMaterial({color: color});
                        //material.linewidth = 4.0;
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
function loadOnly3dObjModel(objModelUrl, name, scale, x, y, z) 
{
    var loader = new THREE.OBJLoader(manager);
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
    sceneTemp.background = new THREE.Color( 0x89d0f1);

    scenes.push(sceneTemp);

    // //Title
    textCreation('Cinderella', 3,-10,8.5,-1, 0xd6ecef, scenes[0]);

    // Names
    textCreation('Gabriel Schlam Huber - A01024122\nAlejandra Nissan Leizorek - A01024682\nSamantha Barco Mejia - A01196844',0.3,-9,-5,15, 0x115e82, scenes[0]);

    // Slipper
    loadOnly3dObjModel("../models/slipper/3d-model.obj", 'slipper', 0.3, 0,-8,0);

    //Butterfly https://www.pngegg.com/es/png-dktlp
    butterfly = createCharacterMesh("../models/butterfly.png", 'butterfly' ,10,7.5,9.5,8,-12);
    //butterfly.color.setHex(0xff00ff);
    butterfly.material.emissive.setHex(0x000000);
    sceneTemp.add(butterfly);

    // Floor
    const geometry = new THREE.PlaneGeometry( 120, 100, 1 );
    const material = new THREE.MeshPhongMaterial( {color: 0x45b5e9, side: THREE.DoubleSide, reflectivity: 1} );
    const plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = -Math.PI/2;
    plane.position.y = -12;
    scenes[0].add( plane );


    // Spotlight, https://threejs.org/docs/#api/en/lights/SpotLight
    const spotLight = new THREE.SpotLight( 0xffffff );
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
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene2";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene2_background.jpg");
    
    // Put in a ground plane to show off the lighting
    //727 x 902 px
    sceneTemp.add(createCharacterMesh("../models/cinderella_cleaningOutline.png", 'cinderella_cleaning' ,12,15,-30,-5,-2));
    //470x496px
    sceneTemp.add(createCharacterMesh("../models/stepsisters_normalOutline.png", 'stepsisters_normal' ,14,14,30,-5,0));
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

    //Mouse
    gusGus = createCharacterMesh("../models/gusgus.png", 'gusgus', 3,4,6,-10,-1);
    gusGus.rotation.y = Math.PI;
    sceneTemp.add(gusGus);
    
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
    sceneTemp.add(createCharacterMesh("../models/cinderella_cryingOutline2.png", 'cinderella_crying', 8,10,-30,-8,-2));
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
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[2], 3.5, 15, -30, -75, -Math.PI / 18, null, true);

    textScene3Array =  splitText(textScenes[1], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[2].add(textGroup);
    textScene3Array.forEach((line, i) => {
        textCreation(line, 2.8,-75,25-(i*3.5),-100, 0xd6ecef, scenes[2], textGroup, true);
    });

    /////////////////////////////////////////////////
    //       Scene 4                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene4";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader(manager).load("../images/Backgrounds/scene3-4_background.jpg");

    sceneTemp.add(createCharacterMesh("../models/cinderella_crying.png", 'cinderella_crying', 8,10,-15,-8,-2));
    godmother = createCharacterMesh("../models/fairy_godmotherOutline2.png", 'fairy_godmother', 16,18,-2,30,-7);
    godmother.rotation.y = Math.PI;
    sceneTemp.add(godmother);

    scenes.push(sceneTemp);

    // Create the fountain: https://sketchfab.com/3d-models/fountain-9812aa1535454df886fea502373edf08
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[3], 3.5, 15, -30, -75, -Math.PI / 18, null, false);
    
    // Create carruaje: https://www.blendswap.com/blend/9819 
    load3dModel('../models/cinderella_carrosse/Cinderella_Carosse.obj', '../models/cinderella_carrosse/Cinderella_Carosse.mtl', 'Cinderella_Carosse', scenes[3], 9, 60, -60, -50, null, Math.PI / 3, true);

    textScene4Array =  splitText(textScenes[2], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[3].add(textGroup);
    textScene4Array.forEach((line, i) => {
        textCreation(line, 2.8,0,25-(i*3.5),-100, 0xd6ecef, scenes[3], textGroup, true);
    });

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
    sceneTemp.add(grupoBaile.add(createCharacterMesh("../models/prince_charming_scene_5_Outline.png", 'prince_dancing', 10,10,0,-7,0)));
    //grupoBaile.add(prince);

    //Loading Cinderella
    sceneTemp.add(grupoBaile.add(createCharacterMesh("../models/cinderellaOutline.png", 'cinderella_dancing', 9,12,4,-9,-5)));
    //grupoBaile.add(cinderella);

    scenes.push(sceneTemp);

    let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5);
    sceneTemp.add( directionalLight );
    directionalLight.position.set(-15, 0, -10);
    
    // Create the columns
    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', 'column', scenes[4], 1.8, 16, -1, 0, 0, 0, true);

    textScene5Array =  splitText(textScenes[3], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[4].add(textGroup);
    textScene5Array.forEach((line, i) => {
        textCreation(line, 2.8,-75,25-(i*3.5),-100, 0x000000, scenes[4], textGroup, true);
    });

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

    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', 'column1', scenes[5], 1.8, 16, -1, 0, 0, 0, true);

    textScene6Array =  splitText(textScenes[4], 37);
    textGroup = new THREE.Object3D;
    textGroup.name = "textGroup";
    scenes[5].add(textGroup);
    textScene6Array.forEach((line, i) => {
        textCreation(line, 2.8,-75,25-(i*3.5),-100, 0x000000, scenes[5], textGroup, true);
    });
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
                    case "gusgus":
                        enterAnimationX(0.125, 0.250, 30, 6, element);
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
            // Animations
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_crying":
                        element.material.map = new THREE.TextureLoader().load( "../models/cinderella_crying.png" ); 
                        element.scale.set(1, 1, 1);
                        enterAnimationYRotation(0, 0.8, 0.95, -8, -8, -2, 0.8, 0.95, (8*Math.PI)/3, (16*Math.PI)/3, Math.PI*8, element);
                        setTimeout( () => {
		
                            element.material.map = new THREE.TextureLoader().load( "../models/cinderella.png" ); 
                            element.scale.set(1.5, 1.5, 1.5);
                        }, (duration - 1) * 1000 );
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
            // Animations
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_dancing":
                        break;
                    case "prince_dancing":
                        break;
                    case "grupoBaile":
                        enterAnimationX(0, 0.125, -30, 0, element);
                        break;
                    case "textGroup":
                        textAnimation(0, 0.7, 0.5, 55, 0.5, element.children);
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
                        case "textGroup":
                            textAnimation(0, 0.7, 0.5, 55, 0.5, element.children);
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
            if (CLICKED.parent.name == "slipper") {
                enterAnimationYRotation(0, 0.25, 0.5, -8, -8, -8, 0, 0.2, 0, Math.PI, 2*Math.PI, CLICKED.parent);
            }
            // Para mariposa
            if (CLICKED.name == "butterfly") {
                zigzagAnimation(0.05,0.3,8,10,6,9.5,-20,CLICKED);
                //zigzagAnimation(0.05,0.3,11.5,13.5,9.5,-20,8,CLICKED);
            }
            break;
        case "scene2":
            console.log("Escena 2", CLICKED.name);
            // Animations
            if (CLICKED.parent.name == "sofa") {
                for(i = 0; i< scene.getObjectByName("bubbles").children.length;i++)
                {
                    enterAnimationY(0, Math.random() + 0.1, 0, 30, scene.getObjectByName("bubbles").children[i]);
                }
            }
            switch(CLICKED.name)
            {
                case "cinderella_cleaning":
                    for(i = 0; i< scene.getObjectByName("bubbles").children.length;i++)
                    {
                        enterAnimationY(0, Math.random() + 0.1, 0, 30, scene.getObjectByName("bubbles").children[i]);
                    }
                    break;
                case "stepsisters_normal":
                    outZigzagAnimation(0.05,0.3,-10,-9,6,-25,scene.getObjectByName("gusgus"));
                    break;
            }
            break;
        case "scene3":
            console.log("Escena 3", CLICKED.name);
            // Animations
            switch(CLICKED.name)
            {
                case "fountain":
                    // For water splash
                    element = scene.getObjectByName("water_splash");        
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
                    break;
                case "cinderella_crying":
                case "gusgus":
                case "jackjack":
                    scene.children.forEach(element => {
                        if(element.name=="gusgus"){
                            element.visible = true;
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
                        if(element.name=="jackjack"){
                            element.visible = true;
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
                    animationMice = !animationMice;
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
                    element = scene.getObjectByName("grupoBaile");    
                    danceAnimations(element);
                    break;
            }
            break;
        case "scene6":
            console.log("Escena 6");
            // Animaciones
            break;            
    
        default:
            break;
    }
}

function zigzagAnimation(ti, tf, y_init, y_top, y_bottom, pos1_x, pos2_x, element){
    animator = new KF.KeyFrameAnimator;
    animator2 = new KF.KeyFrameAnimator;
    timeJump = (tf-ti)/6;
    xJump = (pos2_x - pos1_x)/3;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
                { 
                    keys:[0, ti, ti+timeJump, ti+timeJump*2, ti+timeJump*3, ti+timeJump*4, tf], 
                    values:[
                            { x : pos1_x, y : y_init },    
                            { x : pos1_x + xJump, y : y_top },    
                            { x : pos1_x + xJump*2, y : y_bottom },
                            { x : pos2_x, y : y_top },
                            { x : pos1_x + xJump*2, y : y_bottom },
                            { x : pos1_x + xJump, y : y_top },
                            { x : pos1_x, y : y_init },
                            ],
                    target: element.position
                },
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
    animator.start();
}

function outZigzagAnimation(ti, tf, y_init, y_bottom, pos1_x, pos2_x, element){
    animator = new KF.KeyFrameAnimator;
    animator2 = new KF.KeyFrameAnimator;
    timeJump = (tf-ti)/6;
    xJump = (pos2_x - pos1_x)/3;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
                { 
                    keys:[0, ti, ti+timeJump, ti+timeJump*2, ti+timeJump*3, ti+timeJump*4, ti+timeJump*5, tf], 
                    values:[
                            { y : y_init, z : -1 },    
                            { y : y_init, z : -1 },    
                            { y : y_bottom, z : -1 },
                            { y : y_init, z : -1 },
                            { y : y_bottom, z : -1 },
                            { y : y_init, z : 1 },
                            { y : y_bottom, z : 1 },
                            { y : y_init, z : 1 },
                            ],
                    target: element.position
                },
                
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

function AnimationRotationMouse(t1, t2, t3, pos1_x, pos2_x, pos3_x, pos4_x, pos1_z, pos2_z, pos3_z, pos4_z, rot1, rot2, rot3, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
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

        var textMaterial = new THREE.MeshPhongMaterial( 
            { color: color, specular: 0xffffff }
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

function textAnimation(ti, tf, pos1_y, pos2_y, speed, textArray)
{
    len = textArray.length;
    for (let i = 0, p = Promise.resolve(); i < len; i++) {
        p = p.then(_ => new Promise(resolve =>
            setTimeout(function () {
                textArray[i].visible = true;
                enterAnimationY(ti, tf, pos1_y + (i*1), pos2_y, textArray[i]);
                resolve();
            }, speed * 1000)
        ));
    }    
}

// Dance animation
function danceAnimations(element) 
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
                    target:element.position,
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