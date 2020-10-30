let renderer = null, 
scene = null, 
sceneTemp = null,
camera = null,
cube = null,
sphere = null;

let index = 0;

let scenes = [];

let duration = 5000; // ms
let currentTime = Date.now();

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.02;

}

function run() {
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

    if (index < 1) {
        document.getElementById('previousButton').style.display = 'none';
        document.getElementById('nextButton').style.marginLeft = "750px";
    }

    else if (index > (scenes.length-2)) {
        document.getElementById('nextButton').style.display = 'none';
    }
    
    else {
        document.getElementById('nextButton').style.marginLeft = "690px";
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

    // Set the background color 
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 30;

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    /////////////////////////////////////////////////
    //       Scene 1                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();
    let geometry = new THREE.CubeGeometry(5, 5, 5);
    let material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    sceneTemp.add(cube);

    scenes.push(sceneTemp);

    // Choosing default scene as scene1
    scene = sceneTemp;
    scene.add(camera);

    /////////////////////////////////////////////////
    //       Scene 2                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();

    geometry = new THREE.SphereGeometry(5, 20, 20);
    material = new THREE.MeshNormalMaterial();

    sphere = new THREE.Mesh(geometry, material);
    sceneTemp.add(sphere); // so note need to be able to switch this on 

    scenes.push(sceneTemp);

    /////////////////////////////////////////////////
    //       Scene 3                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();
    geometry = new THREE.CubeGeometry(5, 5, 5);
    material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    sceneTemp.add(cube);

    scenes.push(sceneTemp);

    /////////////////////////////////////////////////
    //       Scene 4                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();

    geometry = new THREE.SphereGeometry(5, 20, 20);
    material = new THREE.MeshNormalMaterial();

    sphere = new THREE.Mesh(geometry, material);
    sceneTemp.add(sphere); // so note need to be able to switch this on 

    scenes.push(sceneTemp);

    /////////////////////////////////////////////////
    //       Scene 5                               //
    /////////////////////////////////////////////////  

    sceneTemp = new THREE.Scene();
    geometry = new THREE.CubeGeometry(5, 5, 5);
    material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    sceneTemp.add(cube);

    scenes.push(sceneTemp);

    /////////////////////////////////////////////////
    //       Scene 6                               //
    /////////////////////////////////////////////////

    sceneTemp = new THREE.Scene();

    geometry = new THREE.SphereGeometry(5, 20, 20);
    material = new THREE.MeshNormalMaterial();

    sphere = new THREE.Mesh(geometry, material);
    sceneTemp.add(sphere); // so note need to be able to switch this on 

    scenes.push(sceneTemp);
}