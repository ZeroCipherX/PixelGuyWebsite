import * as THREE from 'three';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

// We wrap the whole thing in a function so we can spawn it multiple times
function initRocket(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return; // Exit if container doesn't exist

    var OutlineShader = {
      uniforms: {
        offset: { type: 'f', value: 0.3 },
        color: { type: 'v3', value: new THREE.Color('#000000') },
        alpha: { type: 'f', value: 1.0 },
      },
      vertexShader: `
        uniform float offset;
        void main() {
          vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );
          gl_Position = projectionMatrix * pos;
        }
      `,
      fragmentShader: `
        uniform vec3 color; uniform float alpha;
        void main() { gl_FragColor = vec4( color, alpha ); }
      `,
    };

    THREE.ColorManagement.enabled = false;

    // Use container dimensions instead of window
    var width = container.clientWidth;
    var height = container.clientHeight;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // added alpha:true for transparent background
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    
    // Clear background to be transparent so it blends with your site
    renderer.setClearColor(0x000000, 0); 
    container.appendChild(renderer.domElement);

    var camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100000);
    camera.position.set(0, -6, 3);
    camera.lookAt(0, 0, 0);

    var scene = new THREE.Scene();

    // lights
    var aLight = new THREE.AmbientLight(0x555555);
    scene.add(aLight);
    var dLight1 = new THREE.DirectionalLight(0xffffff, 2);
    dLight1.position.set(0.7, 1, 1);
    scene.add(dLight1);

    var rocketGroup = new THREE.Group();
    scene.add(rocketGroup);

    var rocket = new THREE.Group();
    rocket.position.y = -1.5;
    rocketGroup.add(rocket);

    // Rocket Body
    var points = [];
    points.push(new THREE.Vector2(0, 0));
    for (var i = 0; i < 11; i++) {
      points.push(new THREE.Vector2(Math.cos(i * 0.227 - 0.75) * 8, i * 4.0));
    }
    points.push(new THREE.Vector2(0, 40));
    var rocketGeo = new THREE.LatheGeometry(points, 32);
    var rocketMat = new THREE.MeshToonMaterial({ color: 0x999999 });
    var rocketOutlineMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(OutlineShader.uniforms),
      vertexShader: OutlineShader.vertexShader,
      fragmentShader: OutlineShader.fragmentShader,
      side: THREE.BackSide,
    });
    var rocketObj = SceneUtils.createMultiMaterialObject(rocketGeo, [rocketMat, rocketOutlineMat]);
    rocketObj.scale.setScalar(0.1);
    rocket.add(rocketObj);

    // Window / Portal
    var portalGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.6, 32);
    var portalMat = new THREE.MeshToonMaterial({ color: 0x016589 });
    var portalOutlineMat = rocketOutlineMat.clone();
    portalOutlineMat.uniforms.offset.value = 0.03;
    var portal = SceneUtils.createMultiMaterialObject(portalGeo, [portalMat, portalOutlineMat]);
    portal.position.y = 2;
    portal.rotation.x = Math.PI / 2;
    rocket.add(portal);

    var circle = new THREE.Shape();
    circle.absarc(0, 0, 3.5, 0, Math.PI * 2);
    var hole = new THREE.Path();
    hole.absarc(0, 0, 3, 0, Math.PI * 2);
    circle.holes.push(hole);
    var tubeExtrudeSettings = { depth: 17, steps: 1, bevelEnabled: false };
    var tubeGeo = new THREE.ExtrudeGeometry(circle, tubeExtrudeSettings);
    tubeGeo.computeVertexNormals();
    tubeGeo.center();
    var tubeMat = new THREE.MeshToonMaterial({ color: 0x930000 });
    var tubeOutlineMat = rocketOutlineMat.clone();
    tubeOutlineMat.uniforms.offset.value = 0.2;
    var tube = SceneUtils.createMultiMaterialObject(tubeGeo, [tubeMat, tubeOutlineMat]);
    tube.position.y = 2;
    tube.scale.setScalar(0.1);
    rocket.add(tube);

    // Wings
    var shape = new THREE.Shape();
    shape.moveTo(3, 0);
    shape.quadraticCurveTo(25, -8, 15, -37);
    shape.lineTo(14.8, -37);
    shape.quadraticCurveTo(13, -21, 0, -20);
    shape.lineTo(3, 0);
    var extrudeSettings = { steps: 1, depth: 4, bevelEnabled: true, bevelThickness: 2, bevelSize: 2, bevelSegments: 5 };
    var wingGroup = new THREE.Group();
    rocket.add(wingGroup);
    var wingGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    wingGeo.deleteAttribute('normal');
    wingGeo = BufferGeometryUtils.mergeVertices(wingGeo);
    wingGeo.computeVertexNormals();
    var wingMat = new THREE.MeshToonMaterial({ color: 0x930000 });
    wingMat.needsUpdate = true;
    var wingOutlineMat = rocketOutlineMat.clone();
    wingOutlineMat.uniforms.offset.value = 1;
    var wing = SceneUtils.createMultiMaterialObject(wingGeo, [wingMat, wingOutlineMat]);
    wing.scale.setScalar(0.03);
    wing.position.set(0.6, 0.9, 0);
    wingGroup.add(wing);

    var wing2 = wingGroup.clone(); wing2.rotation.y = Math.PI; rocket.add(wing2);
    var wing3 = wingGroup.clone(); wing3.rotation.y = Math.PI / 2; rocket.add(wing3);
    var wing4 = wingGroup.clone(); wing4.rotation.y = -Math.PI / 2; rocket.add(wing4);

    // Fire
    var firePoints = [];
    for (var i = 0; i <= 10; i++) {
      firePoints.push(new THREE.Vector2(Math.sin(i * 0.18) * 8, (-10 + i) * 2.5));
    }
    var fireGeo = new THREE.LatheGeometry(firePoints, 32);
    var fireMat = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color('yellow') },
        color2: { value: new THREE.Color(0xff7b00) },
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 color1; uniform vec3 color2; varying vec2 vUv; void main() { gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0); }`,
    });
    var fire = new THREE.Mesh(fireGeo, fireMat);
    fire.scale.setScalar(0.06);
    rocket.add(fire);

    var fireLight = new THREE.PointLight(0xff7b00, 6, 9, 2);
    fireLight.position.set(0, -1, 0);
    rocket.add(fireLight);

    var fireUpdate = function () {
      fire.scale.y = THREE.MathUtils.randFloat(0.04, 0.08);
    };

    // Resize Handler
    window.addEventListener('resize', function() {
        if(!container) return;
        var w = container.clientWidth;
        var h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }, false);

    var clock = new THREE.Clock();
    var time = 0;

    // THE NEW ANIMATION LOOP
    function loop() {
      requestAnimationFrame(loop);
      time += clock.getDelta();

      // 1. Continuous slow turn Left to Right
      rocketGroup.rotation.y = Math.sin(time * 2) * 0.6; // Speed 2, Width 0.6
      
      // 2. High frequency small vibration (Wobble)
      rocketGroup.rotation.z = Math.cos(time * 25) * 0.02; 
      rocketGroup.position.x = Math.sin(time * 30) * 0.03; 

      fireUpdate();

      renderer.render(scene, camera);
    }
    loop();
}

// Initialize the rockets in both divs!
initRocket('rocket-left');
initRocket('rocket-right');