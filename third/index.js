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

  const texture = new THREE.TextureLoader().load('https://i.imgur.com/xhRGQLu.png', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(5, 5);
  });

  const material = new THREE.MeshBasicMaterial({ map: texture });

  var step = 0;
  var spGroup;
  var hullMesh;
  height = 50;
  var r1 = 25;
  var r2 = 10;
  var generatedPointsCount = 800;

  generatePoints(material);

  function redraw(propHeight, propR1, propR2, points) {
    height = propHeight;
    r1 = propR1;
    r2 = propR2;
    generatedPointsCount = points;
    scene.remove(spGroup);
    scene.remove(hullMesh);
    generatePoints(material);
  }

  const props = { height, r1, r2, generatedPointsCount }

  const gui = new dat.GUI();
  gui.add(props, 'height', 10, 100)
    .step(1)
    .name('Height')
    .onFinishChange(() => redraw(props.height, props.r1, props.r2, props.generatedPointsCount));
  gui.add(props, 'r1', 25, 50)
    .step(1)
    .name('R1')
    .onFinishChange(() => redraw(props.height, props.r1, props.r2, props.generatedPointsCount));
  gui.add(props, 'r2', 5, 20)
    .step(1)
    .name('R2')
    .onFinishChange(() => redraw(props.height, props.r1, props.r2, props.generatedPointsCount));
  gui.add(props, 'generatedPointsCount', 800, 1500)
    .step(100)
    .name('Points generated')
    .onFinishChange(() => redraw(props.height, props.r1, props.r2, props.generatedPointsCount));


  render();

  function getRnd(min, max) {
    return (Math.random() * (max - min)) + min;
  }

  function isCutConeShape(randomX, randomZ, randomY, epsilon) {
    let result;
    let m = Math.pow(r1 - r2, 2) / Math.pow(height, 2);
    let d = (height / 2) * (r1 + r2) / (r1 - r2);

    result = Math.abs(
      Math.pow(randomX, 2) - m * Math.pow((randomY - d), 2) + Math.pow(randomZ, 2)
    );
    return result < epsilon;
  }

  function generatePoints(texture) {
    var points = [];
    const pointCount = generatedPointsCount;
    const epsilon = 0.1;
    var count = 0;
    spGroup = new THREE.Group();
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: false });

    while (pointCount > count) {
      const randomS = getRnd(0, 2 * Math.PI);
      const v = count / pointCount;

      const randomX = ((1 - v) * r1 + v * r2) * Math.sin(randomS);
      const randomY = (height * (2 * v - 1)) / 2;
      const randomZ = ((1 - v) * r1 + v * r2) * Math.cos(randomS);

      if (isCutConeShape(randomX, randomZ, randomY, epsilon)) {
        points.push(new THREE.Vector3(randomX, randomY, randomZ));
        const spGeom = new THREE.SphereGeometry(0.2);
        const spMesh = new THREE.Mesh(spGeom, pointMaterial);
        spMesh.position.set(randomX, randomY, randomZ);
        spGroup.add(spMesh);
        count++;
      }
    }

    scene.add(spGroup);

    const hullGeometry = new THREE.ConvexGeometry(points);
    console.log(hullGeometry);

    const twoPI = 2 * Math.PI;
    hullGeometry.faces.forEach((val, index) => {
      var uvPoints = [];
      var verticeX = hullGeometry.vertices[val.a];
      var verticeY = hullGeometry.vertices[val.b];
      var verticeZ = hullGeometry.vertices[val.c];

      var u1 = ((Math.atan2(verticeX.x, verticeX.z)) / twoPI);
      var v1 = ((2 * verticeX.y + height) / (2 * height));

      var u2 = ((Math.atan2(verticeY.x, verticeY.z)) / twoPI);
      var v2 = ((2 * verticeY.y + height) / (2 * height));

      var u3 = ((Math.atan2(verticeZ.x, verticeZ.z)) / twoPI);
      var v3 = ((2 * verticeZ.y + height) / (2 * height));
      
      if (Math.max(u1, u2, u3) - Math.min(u1, u2, u3) > 0.7) {
        switch (Math.max(u1, u2, u3)) {
          case u1:
            u1 = Math.abs(u1) - 1;
          case u2:
            u2 = Math.abs(u2) - 1;
          default:
            u3 = Math.abs(u3) - 1;
        }
      }

      uvPoints.push(new THREE.Vector2(u1, v1));
      uvPoints.push(new THREE.Vector2(u2, v2));
      uvPoints.push(new THREE.Vector2(u3, v3));
      hullGeometry.faceVertexUvs[0][index] = uvPoints;
    });

    hullGeometry.uvsNeedUpdate = true;

    console.log(hullGeometry.faces);
    console.log(hullGeometry);
    hullMesh = new THREE.Mesh(hullGeometry, texture);
    scene.add(hullMesh);
  }

  function render() {
    stats.update();

    spGroup.rotation.y = step;
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