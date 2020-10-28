let renderer = null, 
scene = null, 
scene1 = null,
scene2 = null,
camera = null,
cube = null,
sphere = null;

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

    // Spin all pivots for next frame
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
    scene.add(camera);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    scene1 = new THREE.Scene();
    let geometry = new THREE.CubeGeometry(5, 5, 5);
    let material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    scene1.add(cube);

    /////////////////////////////////////////////////
    //       Scene 2                               //
    /////////////////////////////////////////////////

    scene2 = new THREE.Scene();

    geometry = new THREE.SphereGeometry(5, 20, 20);
    material = new THREE.MeshNormalMaterial();

    sphere = new THREE.Mesh(geometry, material);
    scene2.add(sphere); // so note need to be able to switch this on 

    // Choosing default scene as scene1
    scene = scene1;
    scene.add(camera);
}