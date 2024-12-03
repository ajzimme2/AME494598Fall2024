// JavaScript Code for Model Rotation and Bluetooth Management

// Variables for Three.js setup
let renderer, scene, camera, pivot, model, controls;
let currentRotation = { x: 0, y: 0, z: 0, w: 1 };
let calibrationRotation = { x: 0, y: 0, z: 0, w: 1 };

// UUIDs for the Bluetooth service and characteristic
const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

// Arrays for connected devices and their characteristics
const devices = [];
const deviceCharacteristics = [];

/**
 * Initialize the Three.js scene
 */
function initializeScene() {
    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    // Scene and camera setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 7.2, 10);

    // Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Axes Helper
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Grid Helper
    const grid = new THREE.GridHelper(100, 100, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
}

/**
 * Load the 3D model and prepare it for rotation
 */
function loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('box.glb', (gltf) => {
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);

        // Center the model
        const boundingBox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        model.position.sub(center);

        // Create a pivot for rotation
        pivot = new THREE.Object3D();
        pivot.position.copy(center);
        pivot.add(model);

        scene.add(pivot);
    });
}

/**
 * Calibrate the model's rotation to the current quaternion
 */
function calibrateModel() {
    calibrationRotation = { ...currentRotation };
    console.log('Calibration set:', calibrationRotation);
}

/**
 * Update the model's rotation based on incoming quaternion data
 * @param {number} x - Quaternion x
 * @param {number} y - Quaternion y
 * @param {number} z - Quaternion z
 * @param {number} w - Quaternion w
 */
function updateModelRotation(x, y, z, w) {
    currentRotation = { x, y, z, w };

    const currentQuat = new THREE.Quaternion(x, y, z, w);
    const calibQuat = new THREE.Quaternion(
        calibrationRotation.x,
        calibrationRotation.y,
        calibrationRotation.z,
        calibrationRotation.w
    );
    const refQuatInverse = calibQuat.clone().invert();
    const transformedQuat = refQuatInverse.multiply(currentQuat);

    pivot.quaternion.copy(new THREE.Quaternion(
        transformedQuat.x,
        -transformedQuat.z,
        transformedQuat.y,
        transformedQuat.w
    ));

    renderer.render(scene, camera);
}

/**
 * Handle Bluetooth device connection
 */
async function connectBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "Quatro-" }],
            optionalServices: [SERVICE_UUID],
        });

        console.log('Connected to:', device.name);

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        deviceCharacteristics.push(characteristic);

        characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleBluetoothMessage);

        devices.push(device);
    } catch (error) {
        console.error('Bluetooth connection error:', error);
    }
}

/**
 * Handle incoming data from the Bluetooth device
 * @param {Event} event - The event containing the characteristic value
 */
function handleBluetoothMessage(event) {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const message = decoder.decode(value);

    const args = message.split(' ');
    if (args.length === 5 && args[0] === 'ROTATION') {
        updateModelRotation(parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3]), parseFloat(args[4]));
    }
}

/**
 * Animate the scene
 */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the application
window.addEventListener('load', () => {
    initializeScene();
    loadModel();
    animate();

    document.getElementById('blebtn').addEventListener('click', connectBluetooth);
    document.getElementById('calibrate').addEventListener('click', calibrateModel);
});
