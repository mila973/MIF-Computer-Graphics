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

  const props = {
    x: 0.32,
    y: 0.39,
    z: 0.7,
    newTess: 15,
    bottom: true,
    lid: true,
    body: true,
    fitLid: true,
    nonblinn: false,
    newShading: "glossy",
    scale: 13.0,
    edge: 0.0
  }

  const gui = new dat.GUI();

  h = gui.addFolder("Light direction");
  h.add(props, "x", -1.0, 1.0, 0.025).name("x").onChange(update);
  h.add(props, "y", -1.0, 1.0, 0.025).name("y").onChange(update);
  h.add(props, "z", -1.0, 1.0, 0.025).name("z").onChange(update);
  gui.add(props, "scale", 0, 104, 13).name("scale").onChange(update);
  gui.add(props, "edge", 0, 1000, 1).name("edge").onChange(update);

  var tilingMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib['lights'],
      {
        "color1": {
          type: "c",
          value: new THREE.Color(0xFFFF1A)
        },
        "color2": {
          type: "c",
          value: new THREE.Color(0x1A1AFF)
        },
        uScale: { type: 'f', value: 10.0 },
        uEdge: { type: 'f', value: 0.0 },
        dx: { type: 'f', value: 0.0 },
        dy: { type: 'f', value: 0.0 },
        dz: { type: 'f', value: 1.0 }
      }
    ]),
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    lights: true
  });

  var materialColor = new THREE.ShaderMaterial({
    uniforms: {
      dx: { type: 'f', value: 0.0 },
      dy: { type: 'f', value: 0.0 },
      dz: { type: 'f', value: 1.0 }
    },
    vertexShader: document.getElementById('teapotVertex').textContent,
    fragmentShader: document.getElementById('teapotShader').textContent
  });

  var teapotSize = 50;
  var teapotBufferGeometry = new TeapotBufferGeometry(teapotSize,
    props.newTess,
    props.bottom,
    props.lid,
    props.body,
    props.fitLid,
    !props.nonblinn);
  var teapotGeometry = new THREE.Geometry().fromBufferGeometry(teapotBufferGeometry);
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
      }
    }
  }
  teapotGeometry.uvsNeedUpdate = true;

  render();

  function update() {
    materialColor.uniforms.dx.value = props.x; 
    materialColor.uniforms.dy.value = props.y; 
    materialColor.uniforms.dz.value = props.z;
    tilingMaterial.uniforms.uEdge.value = props.edge;
    tilingMaterial.uniforms.dx.value = props.x; 
    tilingMaterial.uniforms.dy.value = props.y; 
    tilingMaterial.uniforms.dz.value = props.z;
    tilingMaterial.uniforms.uScale.value = props.scale;
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