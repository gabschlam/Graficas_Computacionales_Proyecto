let renderer = null, 
scene = null, 
sceneTemp = null,
camera = null,
cube = null,
objLoader = null,
ambientLight = null,
sphere = null;

let index = 5;

let scenes = [];

//let animator = null;
let duration = 10, // sec
loopAnimation = false;

let currentTime = Date.now();

let controls;

function load3dModel(objModelUrl, mtlModelUrl, name, sceneObj, scale, x, y, z, rotationX, rotationY)
{
    mtlLoader = new THREE.MTLLoader();

    mtlLoader.load(mtlModelUrl, materials =>{
        
        materials.preload();
        // // console.log(materials);

        objLoader = new THREE.OBJLoader();
        
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

function load3dFbxModel(modelUrl, textureUrl, normalUrl, aoUrl, metalUrl, roughnessUrl, name, sceneObj, scale, x, y, z, rotationX, rotationY)
{
    var loader = new THREE.FBXLoader();
    loader.load(modelUrl, function (object) {
        object.traverse( function (child){
            if(child.isMesh){
                let texture = new THREE.TextureLoader().load(textureUrl);
                let normal = null;
                let ao = null;
                let metallic = null;
                let roughness = null;
                if(normalUrl != null){
                    normal = new THREE.TextureLoader().load(normalUrl);
                    // console.log("loaded normal", normalUrl)
                }
                if(aoUrl != null){
                    ao = new THREE.TextureLoader().load(aoUrl);
                    // console.log("loaded ao",aoUrl)
                }
                if(metalUrl != null){
                    metallic = new THREE.TextureLoader().load(metalUrl);
                    // console.log("loaded metal",metalUrl)
                }
                if(roughnessUrl != null){
                    roughness = new THREE.TextureLoader().load(roughnessUrl);
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

function run() {
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

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

function createCharacterMesh( address, name, width, height, X, Y, Z ) {
    let map = new THREE.TextureLoader().load(address);

    let geometry = new THREE.PlaneGeometry(width, height, 5, 5);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide, transparent:true}));
    mesh.position.setX(X);
    mesh.position.setY(Y);
    mesh.position.setZ(Z);
    mesh.name = name;
    return mesh;
}

function createScene(canvas)
{    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 30;

    //Orbit controls for test
    //controls = new THREE.OrbitControls (camera, renderer.domElement);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    //scene.add(ambientLight);

    /////////////////////////////////////////////////
    //       Scene 1                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene1";
    // Set the background image 
    sceneTemp.background = new THREE.Color( 0xffffff);

    scenes.push(sceneTemp);

    // //Title
    textAnimation('Cinderella', 3,-12,8.5,-1, scenes[0]);

    // const loaderText = new THREE.FontLoader();

    // loaderText.load( '../fonts/book.json', function ( font ) {

    //     let textGeometry = new THREE.TextGeometry( 'Cinderella', {
    //         font: font,
    //         size: 3,
    //         height: 1,
    //         curveSegments: 12,
    //         bevelEnabled: true,
    //         bevelThickness: 0,
    //         bevelSize: 0,
    //         bevelOffset: 0,
    //         bevelSegments: 5
    //     } );

    //     var textMaterial = new THREE.MeshPhongMaterial( 
    //         { color: 0xd6ecef, specular: 0xffffff }
    //     );
    //     var mesh = new THREE.Mesh(textGeometry, textMaterial);
    //     mesh.position.set(-12,8.5,-1);
    //     scenes[0].add(mesh);
    // } );
    // Slipper
    var loader = new THREE.FBXLoader();
    loader.load("../models/slipper/3d-model.fbx", function (object) {
        object.traverse( function (child){
            if(child.isMesh){
                child.material = new THREE.MeshPhysicalMaterial({
                    color: 0x80c4e2,
                    opacity: 0.6,
                    roughness: 0.3,
                    metalness:1,
                    reflectivity: 0.88,
                    transparent: true,
                    side: THREE.DoubleSide,
                  });
            }
        });

        object.scale.x = object.scale.y = object.scale.z = 0.3;
        object.position.set(0,-8,0);
        scenes[0].add(object);
        // console.log("FBX");
        // console.log(object);
    });
    
    //Slipper
     // Create the table https://sketchfab.com/3d-models/classic-coffee-table-0b151b371da847d3a2dd960f9339eef1
     //load3dFbxModel("../models/slipper/source/Heel.fbx", null, null, null, null, null, scenes[0], 1,0, 0, 0, 0, 0);


    // Choosing default scene as scene1
    scene = sceneTemp;
    scene.add(camera);
    scene.add(ambientLight)

    /////////////////////////////////////////////////
    //       Scene 2                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene2";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene2_background.jpg");
    
    // Put in a ground plane to show off the lighting
    //727 x 902 px
    sceneTemp.add(createCharacterMesh("../models/cinderella_cleaning.png", 'cinderella_cleaning' ,12,15,-13,-5,-2));
    //470x496px
    sceneTemp.add(createCharacterMesh("../models/stepsisters_normal.png", 'stepsisters_normal' ,14,14,13,-5,0));
    //277x655 px
    sceneTemp.add(createCharacterMesh("../models/stepmother.png", 'stepmother', 7,15,7,-5,0.5));

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
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene3-4_background.jpg");
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

    scenes.push(sceneTemp);

    // Create the fountain: https://sketchfab.com/3d-models/fountain-9812aa1535454df886fea502373edf08
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[2], 3.5, 15, -30, -75, -Math.PI / 18);

    /////////////////////////////////////////////////
    //       Scene 4                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    sceneTemp.name = "scene4";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene3-4_background.jpg");

    sceneTemp.add(createCharacterMesh("../models/cinderella_crying.png", 'cinderella_crying', 8,10,-15,-8,-2));
    godmother = createCharacterMesh("../models/fairy_godmother.png", 'fairy_godmother', 16,18,-2,-5,-7);
    godmother.rotation.y = Math.PI;
    sceneTemp.add(godmother);

    scenes.push(sceneTemp);

    // Create the fountain: https://sketchfab.com/3d-models/fountain-9812aa1535454df886fea502373edf08
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', 'fountain', scenes[3], 3.5, 15, -30, -75, -Math.PI / 18);
    
    // Create carruaje: https://www.blendswap.com/blend/9819 
    load3dModel('../models/cinderella_carrosse/Cinderella_Carosse.obj', '../models/cinderella_carrosse/Cinderella_Carosse.mtl', 'Cinderella_Carosse', scenes[3], 9, 35, -30, -50, null, Math.PI / 3);

    /////////////////////////////////////////////////
    //       Scene 5                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();  
    sceneTemp.name = "scene5";
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene5-6_background.jpg");

    //Loading the prince
    sceneTemp.add(createCharacterMesh("../models/prince_charming_scene_5.png", 'prince', 10,10,0,-7,0));

    //Loading Cinderella
    sceneTemp.add(createCharacterMesh("../models/cinderella.png", 'cinderella', 9,12,4,-9,-5));

    scenes.push(sceneTemp);

    // Create the columns
    //1
    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', 'column', scenes[4], 3.5, 15, -30, -75, -Math.PI / 18);

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
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene5-6_background.jpg");
    geometry = new THREE.SphereGeometry(5, 20, 20);
    material = new THREE.MeshNormalMaterial();

    sphere = new THREE.Mesh(geometry, material);
    //sceneTemp.add(sphere);

    scenes.push(sceneTemp);

}

function playAnimations() 
{
    switch (scene.name) {
        case "scene1":
            // console.log("Escena 1");
            // Animaciones
            break;
        case "scene2":
            // console.log("Escena 2");
            // Animaciones
            break;
        case "scene3":
            // console.log("Escena 3");
            // Animaciones
            scene.children.forEach(element => {
                switch (element.name) {
                    case "cinderella_crying":
                        enterAnimation(0, 0.125, -30, -15, element);
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
            // console.log("Escena 4");
            // Animaciones
            break;
        case "scene5":
            // console.log("Escena 5");
            // Animaciones
            break;
        case "scene6":
            // console.log("Escena 6");
            // Animaciones
            break;            
    
        default:
            break;
    }
}

function enterAnimation(ti, tf, pos1_x, pos2_x, element){
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                // Keys for the entry animation
                { 
                    keys:[ti, tf], 
                    values:[
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

function textAnimation(text, size, x, y, z, scene){
    const loaderText = new THREE.FontLoader();

    loaderText.load( '../fonts/book.json', function ( font ) {

        let textGeometry = new THREE.TextGeometry( text, {
            font: font,
            size: size,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 5
        } );

        var textMaterial = new THREE.MeshPhongMaterial( 
            { color: 0xd6ecef, specular: 0xffffff }
        );
        var mesh = new THREE.Mesh(textGeometry, textMaterial);

        mesh.position.set(x, y, z);
        scene.add(mesh);
    } );
}