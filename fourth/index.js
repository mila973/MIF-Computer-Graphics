// once everything is loaded, we run our Three.js stuff.
$(function () {

  const stats = initStats();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  var webGLRenderer = new THREE.WebGLRenderer();
  webGLRenderer.setClearColor(0x4287f5, 1);
  webGLRenderer.setSize(window.innerWidth, window.innerHeight);
  webGLRenderer.shadowMap.enabled = true;

  camera.position.x = -30;
  camera.position.y = 200;
  camera.position.z = 50;
  camera.lookAt(new THREE.Vector3(10, 0, 0));

  $("#WebGL-output").append(webGLRenderer.domElement);
  camControl = new THREE.TrackballControls(camera, webGLRenderer.domElement);

  var ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  ambientLight.position.set(100, 50, 100);
  scene.add(ambientLight);
  var dLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  scene.add(dLight);

  effectController = {

    shininess: 40.0,
    ka: 0.17,
    kd: 0.51,
    ks: 0.2,
    metallic: true,

    hue: 0.121,
    saturation: 0.73,
    lightness: 0.66,

    lhue: 0.04,
    lsaturation: 0.01,	// non-zero so that fractions will be shown
    llightness: 1.0,

    // bizarrely, if you initialize these with negative numbers, the sliders
    // will not show any decimal places.
    lx: 0.32,
    ly: 0.39,
    lz: 0.7,
    newTess: 15,
    bottom: true,
    lid: true,
    body: true,
    fitLid: true,
    nonblinn: false,
    newShading: "glossy",

    scale: 13.0


  };

  const props = {}

  const gui = new dat.GUI();

  // light (directional)

  h = gui.addFolder("Light direction");

  h.add(effectController, "lx", -1.0, 1.0, 0.025).name("x").onChange(update);
  h.add(effectController, "ly", -1.0, 1.0, 0.025).name("y").onChange(update);
  h.add(effectController, "lz", -1.0, 1.0, 0.025).name("z").onChange(update);

  gui.add(effectController, "scale", 0, 104, 13).name("scale").onChange(update);

  var tilingMaterial = new THREE.ShaderMaterial({
    uniforms: {
        "color1": {
          type: "c",
          value: new THREE.Color(0xFFFF1A)
        },
        "color2": {
          type: "c",
          value: new THREE.Color(0x1A1AFF)
        },
      uScale: { type: 'f', value: 10.0 },
      uEdge: { type: 'f', value: 0.0 }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
  });

  var materialColor = new THREE.MeshPhongMaterial({ color: 0xffffFF, wireframe: false, polygonOffset: true });

  var teapotSize = 50;
  var teapotBufferGeometry = new TeapotBufferGeometry(teapotSize,
    effectController.newTess,
    effectController.bottom,
    effectController.lid,
    effectController.body,
    effectController.fitLid,
    !effectController.nonblinn);
  var teapotGeometry = new THREE.Geometry().fromBufferGeometry(teapotBufferGeometry);
  console.log(teapotGeometry);
  teapot = new THREE.Mesh(teapotGeometry, [materialColor, tilingMaterial]);
  scene.add(teapot);

  var stripStart = 0.1;
  stripStart = stripStart * (teapotSize / 2);
  var stripSize = 8;
  var stripMeasurePoint = teapot.position.clone();

  for (f = 0; f < teapotGeometry.faces.length; f++) {
    var face = teapotGeometry.faces[f];
    var vert = [teapotGeometry.vertices[face.a], teapotGeometry.vertices[face.b], teapotGeometry.vertices[face.c]];
    vert.sort(function (a, b) { return a.y < b.y ? -1 : 1; });
    var high = vert[0];
    var low = vert[2];
    stripMeasurePoint.y = low.y;
    if (low.y > stripStart && high.y < stripStart + stripSize) {
      if (low.distanceTo(stripMeasurePoint) < teapotSize + 10) {
        face.materialIndex = 1;
        //face remap
        // teapotGeometry.faceVertexUvs[0][f] = [new THREE.Vector2(1, 1), new THREE.Vector2(0, 1), new THREE.Vector2(0, 0)];
      }
    }
  }
  teapotGeometry.uvsNeedUpdate = true;




  render();

  function update() {


    // orbitFree.target.set(walker.position.x, walker.position.y, walker.position.z);

    dLight.position.set(effectController.lx, effectController.ly, effectController.lz);
    // dLight.color.setHSL(effectController.lhue, effectController.lsaturation, effectController.llightness);
    tilingMaterial.uniforms.uScale.value = effectController.scale;
  }

  function render() {
    stats.update();
    camControl.update();

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
});