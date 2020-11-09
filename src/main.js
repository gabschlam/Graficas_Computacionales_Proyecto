let renderer = null, 
scene = null, 
sceneTemp = null,
camera = null,
cube = null,
objLoader = null,
ambientLight = null,
sphere = null;

let index = 0;

let scenes = [];

let duration = 5000; // ms
let currentTime = Date.now();

let controls;

function load3dModel(objModelUrl, mtlModelUrl, sceneObj, scale, x, y, z, rotationX, rotationY)
{
    mtlLoader = new THREE.MTLLoader();

    mtlLoader.load(mtlModelUrl, materials =>{
        
        materials.preload();
        console.log(materials);

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
            sceneObj.add(object);
        });
    });

}

function load3dDaeModel(sceneObj)
{
    var loader = new THREE.ColladaLoader();
    loader.load("../models/sofa/model.dae", function (collada) {
        dae = collada.scene;
        dae.position.set(0,0,0);
        dae.children[1].children[0].material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF, } );
        dae.scale.set(1,1,1);
        console.log(dae);
        sceneObj.add(dae);
    },
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded dae' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	});
}

function load3dFbxModel(modelUrl, textureUrl, normalUrl, aoUrl, metalUrl, roughnessUrl, sceneObj, scale, x, y, z, rotationX, rotationY)
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
                    console.log("loaded normal", normalUrl)
                }
                if(aoUrl != null){
                    ao = new THREE.TextureLoader().load(aoUrl);
                    console.log("loaded ao",aoUrl)
                }
                if(metalUrl != null){
                    metallic = new THREE.TextureLoader().load(metalUrl);
                    console.log("loaded metal",metalUrl)
                }
                if(roughnessUrl != null){
                    roughness = new THREE.TextureLoader().load(roughnessUrl);
                    console.log("loaded rough",roughnessUrl)
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
        sceneObj.add(object);
        console.log("FBX");
        console.log(object);
    });
}

function load3dObjModel(modelUrl, textureUrl, normalUrl, aoUrl, metalUrl, roughnessUrl, sceneObj, scale, x, y, z, rotationX, rotationY)
{
    let loader = new THREE.OBJLoader();
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
                }
                if(aoUrl != null){
                    ao = new THREE.TextureLoader().load(aoUrl);
                }
                if(metalUrl != null){
                    metallic = new THREE.TextureLoader().load(metalUrl);
                }
                if(roughnessUrl != null){
                    roughness = new THREE.TextureLoader().load(roughnessUrl);
                }
                child.material = new THREE.MeshStandardMaterial( { map: texture, normalMap: normal, aoMap:ao, metalnessMap: metallic,  roughnessMap: roughness } );
            }
        });
        object.position.set(-70,-10,0);
        object.scale.set(0.01,0.01,0.01);
        object.rotation.y = Math.PI /4;
        sceneObj.add(object);
        console.log("OBJ");
        console.log(object);
    },
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	});
}

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

   controls.update();

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
    
    animate();
}

function createCharacterMesh( address, width, height, X, Y, Z ) {
    let map = new THREE.TextureLoader().load(address);

    let geometry = new THREE.PlaneGeometry(width, height, 5, 5);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide, transparent:true}));
    mesh.position.setX(X);
    mesh.position.setY(Y);
    mesh.position.setZ(Z);
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
    controls = new THREE.OrbitControls (camera, renderer.domElement);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    //scene.add(ambientLight);

    /////////////////////////////////////////////////
    //       Scene 1                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    // Set the background image 
    sceneTemp.background = new THREE.Color( 0xffffff);

    scenes.push(sceneTemp);

    //Title
    const loaderText = new THREE.FontLoader();

    loaderText.load( '../fonts/book.json', function ( font ) {

        let textGeometry = new THREE.TextGeometry( 'Cinderella', {
            font: font,
            size: 5,
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
        mesh.position.set(-17.5,5,-1);
        scenes[0].add(mesh);
    } );
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
        console.log("FBX");
        console.log(object);
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
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene2_background.jpg");
    
    // Put in a ground plane to show off the lighting
    //727 x 902 px
    sceneTemp.add(createCharacterMesh("../models/cinderella_cleaning.png",12,15,-13,-5,-2));
    //470x496px
    sceneTemp.add(createCharacterMesh("../models/stepsisters_normal.png",14,14,13,-5,0));
    //277x655 px
    sceneTemp.add(createCharacterMesh("../models/stepmother.png",7,15,7,-5,0.5));

    scenes.push(sceneTemp);

    // Create the table https://sketchfab.com/3d-models/classic-coffee-table-0b151b371da847d3a2dd960f9339eef1
    load3dFbxModel("../models/table/source/table.fbx", "../models/table/textures/texture.jpg", null, null, null, null, scenes[1], 0.1,-4, -11, 0.2, 0, 0);

    // Create the bucket https://sketchfab.com/3d-models/old-wooden-bucket-7649d45e7d6f408b9b5929ab51895dfa
    load3dFbxModel("../models/bucket/source/Bucket.fbx", "../models/bucket/textures/Bucket_Albedo.png", "../models/bucket/textures/Bucket_Normal.png", "../models/bucket/textures/Bucket_AO.png", "../models/bucket/textures/Bucket_Metallic.png", "../models/bucket/textures/Bucket_Roughness.png", scenes[1], 5,-10,-11,2, 80, 0);

    //Sofa https://sketchfab.com/3d-models/sofa-a9695e97f8c74667a2c89f7d98ca3a9f
    load3dFbxModel("../models/sofa/source/Sofa010_001.FBX", "../models/sofa/textures/Sofa010_D1024.png", "../models/sofa/textures/Sofa010_N1024.png", "../models/sofa/textures/Sofa010_AO1024.png", "../models/sofa/textures/Sofa010_S1024.png", null, scenes[1], 0.06,-16,-12,-14, 0, 0.7);



    /////////////////////////////////////////////////
    //       Scene 3                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene3-4_background.jpg");
    sceneTemp.add(createCharacterMesh("../models/cinderella_crying.png",8,10,-15,-8,-2));
    stepSisters = createCharacterMesh("../models/stepsisters_party.png",13,14,16,-8,-5);
    stepMother = createCharacterMesh("../models/stepmother_party.png",8,15,9,-8,-5);
    stepSisters.rotation.y = Math.PI;
    sceneTemp.add(stepSisters);
    sceneTemp.add(stepMother);

    scenes.push(sceneTemp);

    // Create the fountain
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', scenes[2], 3.5, 15, -30, -75, -Math.PI / 18);

    /////////////////////////////////////////////////
    //       Scene 4                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene3-4_background.jpg");

    sceneTemp.add(createCharacterMesh("../models/cinderella_crying.png",8,10,-15,-8,-2));
    godmother = createCharacterMesh("../models/fairy_godmother.png",16,18,-2,-5,-7);
    godmother.rotation.y = Math.PI;
    sceneTemp.add(godmother);

    scenes.push(sceneTemp);

    // Create the fountain
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', scenes[3], 3.5, 15, -30, -75, -Math.PI / 18);
    
    load3dModel('../models/cinderella_carrosse/Cinderella_Carosse.obj', '../models/cinderella_carrosse/Cinderella_Carosse.mtl', scenes[3], 9, 35, -30, -50, null, Math.PI / 3);

    /////////////////////////////////////////////////
    //       Scene 5                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();  
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene5-6_background.jpg");

    //Loading the prince
    let map_scene5_prince = new THREE.TextureLoader().load("../models/prince_charming_scene_5.png");

    let geometry_scene5_prince = new THREE.PlaneGeometry(10, 10, 5, 5);
    let mesh_scene5_prince = new THREE.Mesh(geometry_scene5_prince, new THREE.MeshPhongMaterial({map:map_scene5_prince, side:THREE.DoubleSide, transparent:true}));
    mesh_scene5_prince.position.y = -7;
    sceneTemp.add(mesh_scene5_prince);

    //Loading Cinderella
    sceneTemp.add(createCharacterMesh("../models/cinderella.png",9,12,4,-9,-5));

    scenes.push(sceneTemp);

    // Create the columns
    //1
    load3dModel('../models/Column/Column_Made_By_Tyro_Smith.obj', '../models/Column/Column_Made_By_Tyro_Smith.mtl', scenes[4], 3.5, 15, -30, -75, -Math.PI / 18);

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
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene5-6_background.jpg");
    geometry = new THREE.SphereGeometry(5, 20, 20);
    material = new THREE.MeshNormalMaterial();

    sphere = new THREE.Mesh(geometry, material);
    //sceneTemp.add(sphere);

    scenes.push(sceneTemp);

}