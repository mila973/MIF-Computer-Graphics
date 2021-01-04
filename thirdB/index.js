// once everything is loaded, we run our Three.js stuff.
$(function () {

  const stats = initStats();
  const scene = new THREE.Scene();

  var webGLRenderer = new THREE.WebGLRenderer();
  webGLRenderer.setClearColor(0x4287f5, 1);
  webGLRenderer.setSize(window.innerWidth, window.innerHeight);
  webGLRenderer.shadowMap.enabled = true;
  webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var camera_pivot = new THREE.Object3D();

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  $("#WebGL-output").append(webGLRenderer.domElement);
  camControl = new THREE.TrackballControls(camera, webGLRenderer.domElement);
  console.log(camControl);

  const props = { cameraNumber: 1, dollyZoomValue: 50, wireframeVisible: false }

  const chessBoardStepFromCenter = 5;
  const chessBoardStep = 11.5;
  const movingSpeed = 1;
  var cameraNumber = 1;

  var lights;
  var movingFigure;
  var nonMovingFigure;
  var isFigureMoved = false;
  var figureStartingPositionZ = chessBoardStepFromCenter + chessBoardStep * 3;
  var figureStartingPositionX = chessBoardStepFromCenter + chessBoardStep;
  var nonMovingFigureStartZ = -(chessBoardStepFromCenter + chessBoardStep * 3);
  var nonMovingFigureStartX = 0;

  var dollyCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  var dollyControls = new THREE.TrackballControls(dollyCamera, webGLRenderer.domElement);
  var dollyHelper = new THREE.CameraHelper(dollyCamera);
  dollyHelper.visible = props.wireframeVisible;
  scene.add(dollyHelper);

  var cameraEye;

  const gui = new dat.GUI();
  const controlFunctions = {
    moveQueen: () => moveFigure(6)
  }

  gui.add(controlFunctions, 'moveQueen').name('Move Queen');
  gui.add(props, 'cameraNumber', 1, 3)
    .step(1)
    .name('Camera')
    .onFinishChange(() => changeCamera(props.cameraNumber));
  gui.add(props, 'dollyZoomValue', 30, 80)
    .step(1)
    .name('Dolly zoom')
    .onFinishChange(() => updateDollyZoomValue(props.dollyZoomValue));
  gui.add(props, 'wireframeVisible').name('Dolly wireframe');

  initView(scene);
  initRotatingCamera();
  initFOVCamera();
  initDollyZoomCamera();

  render();

  function render() {
    stats.update();

    camControl.update();
    dollyHelper.visible = props.wireframeVisible;
    dollyCamera.updateProjectionMatrix();

    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);
  }

  function initStats() {

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    $("#Stats-output").append(stats.domElement);

    return stats;
  }

  function initFOVCamera() {
    camera.position.x = -30;
    camera.position.y = 100;
    camera.position.z = 100;
  }

  function changeCamera(num) {
    switch (num) {
      case 1: {
        selectFOVCamera();
        cameraNumber = num;
        break;
      }
      case 2: {
        selectRotatingCamera();
        cameraNumber = num;
        break;
      }
      case 3: {
        selectDollyZoomCamera();
        cameraNumber = num;
      }
      default: { }
    }
  }
  function buildCameraObject() {
    const cameraObject = new THREE.Object3D();

    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 10);
    const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const firstCylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    firstCylinder.position.x = 1.5;
    firstCylinder.position.y = 2;
    firstCylinder.rotation.x = -0.5 * Math.PI;

    const secondCylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    secondCylinder.position.y = 2;
    secondCylinder.rotation.x = -0.5 * Math.PI;

    const boxGeometry = new THREE.BoxGeometry(4, 2, 2);
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.x = 0.5;

    const thirdGeometry = new THREE.CylinderGeometry(0.5, 0.25, 0.5, 10);
    const thirdCylinder = new THREE.Mesh(thirdGeometry, cylinderMaterial);
    thirdCylinder.position.x = -1.75;
    thirdCylinder.rotation.z = 0.5 * Math.PI;

    const eyeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 5);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const eyeCylinder = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeCylinder.position.x = -2.15;
    eyeCylinder.rotation.z = 0.5 * Math.PI;
    cameraEye = eyeCylinder;

    cameraObject.add(firstCylinder, secondCylinder, box, thirdCylinder, eyeCylinder);
    cameraObject.rotation.z = 0.5 * Math.PI;

    return cameraObject;
  }

  function initRotatingCamera() {
    var X_AXIS = new THREE.Vector3(1, 0, 0);
    camera_pivot = new THREE.Object3D();
    camera_pivot.add(buildCameraObject());
    scene.add(camera_pivot);
    camera_pivot.rotateOnAxis(X_AXIS, 1 * (isFigureMoved ? 1 : -1));
    camera.updateProjectionMatrix()
    camera_pivot.position.x = chessBoardStep * 1.5;
    camera_pivot.position.y = 20;
    camera_pivot.position.z = chessBoardStepFromCenter;
    camera.updateProjectionMatrix();
  }

  function initDollyZoomCamera() {
    dollyCamera.position.x = cameraEye.getWorldPosition().x;
    dollyCamera.position.y = cameraEye.getWorldPosition().y;
    dollyCamera.position.z = cameraEye.getWorldPosition().z;
    dollyControls.target = new THREE.Vector3(nonMovingFigureStartX, 0, nonMovingFigureStartZ);
  }

  function selectFOVCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camControl = new THREE.TrackballControls(camera, webGLRenderer.domElement);
    camera.position.x = -30;
    camera.position.y = 100;
    camera.position.z = 100;
    camera.updateProjectionMatrix();
    camera.target = new THREE.Vector3(0, 0, 0);
    console.log(camera_pivot);
  }

  function selectRotatingCamera() {
    camera_pivot.add(camera);
    camera.position.x = -2.15;
    camera.position.y = 0;
    camera.position.z = 0;
    camControl.target = movingFigure.position;
  }

  function selectDollyZoomCamera() {
    camera = dollyCamera;
    camControl = dollyControls;
    dollyCamera.position.x = 0;
    dollyCamera.position.y = 15;
    dollyCamera.position.z = -70;
    dollyControls.target = new THREE.Vector3(nonMovingFigureStartX, 0, nonMovingFigureStartZ);
    dollyCamera.fov = props.dollyZoomValue;
    dollyCamera.position.z = -70 - 40 / (2 * Math.tan(Math.PI / 180 * props.dollyZoomValue))
    dollyCamera.updateProjectionMatrix();
  }

  function updateDollyZoomValue(val) {
      // camera.position.x -= 0.4 * val;
      dollyCamera.position.z = -70 - 40 / (2 * Math.tan(Math.PI / 180 * val));
      dollyCamera.fov = val;
      console.log(dollyCamera.position.x, dollyCamera.position.z, dollyCamera.fov);
      dollyCamera.updateProjectionMatrix();
  }

  function drawChessBoard(chessBoardTexture) {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshPhongMaterial({ map: chessBoardTexture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.rotation.x = -0.5 * Math.PI;
    console.log(mesh);
    return mesh;
  }

  function buildFigure({ figureColor, x, z }) {
    let material = new THREE.MeshPhongMaterial({ color: figureColor });
    const { geometry } = new OldTHREE.JSONLoader().parse(FIGURE.data);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.scale.x = 5;
    mesh.scale.y = 5;
    mesh.scale.z = 5;

    mesh.position.x = x;
    mesh.position.z = z;

    console.log(mesh);
    return mesh;
  }

  function initLights() {
    const spotLight = new THREE.SpotLight({ color: 0xffffff, intensity: 0.5 });
    spotLight.position.set(100, 90, 100);
    spotLight.castShadow = true;
    const ambientLight = new THREE.AmbientLight(0x404040, 1);

    return { spotLight, ambientLight };
  }

  function initView(scene) {
    const texture = new THREE.TextureLoader().load('https://i.imgur.com/vUX7bAK.jpg');
    lights = initLights(scene);
    const board = drawChessBoard(texture);
    movingFigure = buildFigure({ figureColor: 0xffffff, x: figureStartingPositionX, z: figureStartingPositionZ });
    nonMovingFigure = buildFigure({ figureColor: 0x000000, x: nonMovingFigureStartX, z: nonMovingFigureStartZ });
    const axesHelper = new THREE.AxesHelper(33.5);
    scene.add(...Object.values(lights), board, movingFigure, nonMovingFigure, axesHelper);
  }

  async function moveFigure(stepsCount) {
    const movingIndex = isFigureMoved ? 1 : -1;
    var X_AXIS = new THREE.Vector3(1, 0, 0);

    console.log(cameraNumber);
    const finalFigurePositionZ = movingFigure.position.z + (stepsCount * chessBoardStep * movingIndex);
    while (finalFigurePositionZ !== movingFigure.position.z) {
      movingFigure.position.z += movingSpeed * movingIndex;

      camera_pivot.rotateOnAxis(X_AXIS, -0.03 * movingIndex);
      if (cameraNumber === 2) {
        camControl.target = movingFigure.position; // moves perspective view;
        camera.updateProjectionMatrix();
      }
      await sleep(25);
    }
    isFigureMoved = !isFigureMoved;
  }

  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
});