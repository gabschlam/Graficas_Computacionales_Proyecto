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

function load3dModel(objModelUrl, mtlModelUrl, sceneObj, scale, x, y, z, rotationX)
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
            sceneObj.add(object);
        });
    });

}

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

   // console.log(carruaje);

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

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    //scene.add(ambientLight);

    /////////////////////////////////////////////////
    //       Scene 1                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene1_background_3.jpg");

    scenes.push(sceneTemp);

    // Choosing default scene as scene1
    scene = sceneTemp;
    scene.add(camera);

    /////////////////////////////////////////////////
    //       Scene 2                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene2_background.jpg");
    
    // Put in a ground plane to show off the lighting
    let map = new THREE.TextureLoader().load("../models/cinderella.png");

    let geometry = new THREE.PlaneGeometry(20, 20, 5, 5);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide, transparent:true}));
    sceneTemp.add(mesh);
    scenes.push(sceneTemp);

    /////////////////////////////////////////////////
    //       Scene 3                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene3-4_background.jpg");

    scenes.push(sceneTemp);

    // Create the fountain
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', scenes[2], 3.5, 15, -30, -75, -Math.PI / 18);

    /////////////////////////////////////////////////
    //       Scene 4                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    // Set the background image 
    sceneTemp.background = new THREE.TextureLoader().load("../images/Backgrounds/scene3-4_background.jpg");

    scenes.push(sceneTemp);

    // Create the fountain
    load3dModel('../models/fountain/fountain.obj', '../models/fountain/fountain.mtl', scenes[3], 3.5, 15, -30, -75, -Math.PI / 18);

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
    let map_scene5_cinderella = new THREE.TextureLoader().load("../models/cinderella.png");

    let geometry_scene5_cinderella = new THREE.PlaneGeometry(9, 9, 2, 2);
    let mesh_scene5_cinderella = new THREE.Mesh(geometry_scene5_cinderella, new THREE.MeshPhongMaterial({map:map_scene5_cinderella, side:THREE.DoubleSide, transparent:true}));
    sceneTemp.add(mesh_scene5_cinderella);

    mesh_scene5_cinderella.position.y = -8;
    mesh_scene5_cinderella.position.x = 4;
    scenes.push(sceneTemp);

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