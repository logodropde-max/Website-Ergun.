/* endo.ai Hero: lebendige Drahtgitter-Kugel (nach Emres Vorlage „Anomalous Matter").
   Quelle für ki/js/orb.js. Neu bauen:
   npx esbuild ki/js/orb.quelle.js --bundle --minify --format=iife --target=es2018 --outfile=ki/js/orb.js
   (three.js Version 0.186.1 muss dafür installiert sein: npm i --no-save three@0.186.1 esbuild) */
import { Scene, PerspectiveCamera, WebGLRenderer, IcosahedronGeometry, ShaderMaterial, Color, Vector3, Mesh } from 'three';

const buehne = document.querySelector('[data-orb]');
if (buehne) start(buehne);

function webglMoeglich() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}

function start(el) {
  if (!webglMoeglich()) { el.classList.add('orb--ohne'); return; }
  const ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const klein = window.matchMedia && matchMedia('(max-width: 860px)').matches;
  const feineMaus = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000);
  /* Kugel (Radius 1,2 + 0,2 Ausschlag) füllt höchstens 66 % der kleineren Seite, damit sie immer ganz zu sehen ist */
  const abstand = () => Math.max(2.6, 1.45 / (0.66 * Math.tan(37.5 * Math.PI / 180) * Math.min(1, el.clientWidth / el.clientHeight)));
  camera.position.z = abstand();

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(el.clientWidth, el.clientHeight);
  el.appendChild(renderer.domElement);

  /* Feinheit: am Handy weniger Dreiecke, damit es flüssig bleibt */
  const geometry = new IcosahedronGeometry(1.2, klein ? 24 : 40);
  const material = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pointLightPosition: { value: new Vector3(0, 0, 5) },
      color: { value: new Color('#FF5A1F') }
    },
    vertexShader: `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
      void main() {
        vNormal = normal;
        vPosition = position;
        float displacement = snoise(position * 2.0 + time * 0.5) * 0.2;
        vec3 newPosition = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 color;
      uniform vec3 pointLightPosition;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(pointLightPosition - vPosition);
        float diffuse = max(dot(normal, lightDir), 0.0);
        float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
        fresnel = pow(fresnel, 2.0);
        vec3 neon = vec3(0.80, 0.82, 0.88);   /* ruhiges Silberweiß (25.09. nachts: Orange nur noch für Premium) */
        vec3 finalColor = neon * (0.24 + diffuse * 0.82) + vec3(1.0, 1.0, 1.0) * fresnel * 0.6;
        gl_FragColor = vec4(finalColor, 1.0);
      }`,
    wireframe: true
  });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  /* Licht folgt der Maus; am Handy wandert es langsam von selbst */
  const ziel = new Vector3(0, 0, 5), licht = material.uniforms.pointLightPosition.value;
  function lichtAuf(clientX, clientY) {
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    const vec = new Vector3(x, y, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    ziel.copy(camera.position).add(dir.multiplyScalar(dist));
    ziel.z = 2.5;
  }
  if (feineMaus) window.addEventListener('pointermove', (e) => lichtAuf(e.clientX, e.clientY), { passive: true });

  let frameId = 0, laeuft = false, start0 = performance.now();
  function bild(t) {
    const zeit = t - start0;
    material.uniforms.time.value = zeit * 0.0003;
    mesh.rotation.y += 0.0005 * 4;
    mesh.rotation.x += 0.0002 * 4;
    if (!feineMaus) { ziel.set(Math.sin(zeit * 0.0004) * 2.2, Math.cos(zeit * 0.0003) * 1.4, 2.5); }
    licht.lerp(ziel, 0.06);
    renderer.render(scene, camera);
    if (laeuft) frameId = requestAnimationFrame(bild);
  }
  function an() { if (laeuft || ruhig || el.hasAttribute('data-halt')) return; laeuft = true; frameId = requestAnimationFrame(bild); }
  function aus() { laeuft = false; cancelAnimationFrame(frameId); }

  if (ruhig) { material.uniforms.time.value = 1.3; renderer.render(scene, camera); }
  /* Nur rechnen, solange der Hero sichtbar und der Tab aktiv ist */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => { e[0].isIntersecting ? an() : aus(); }).observe(el);
  } else an();
  document.addEventListener('visibilitychange', () => { document.hidden ? aus() : (el.getBoundingClientRect().bottom > 0 && an()); });
  /* Chat aktiv: Kugel hält still (Emre, 25.09.: Hintergrund soll sich im Chat nicht bewegen) */
  el.addEventListener('orb:halt', () => { el.setAttribute('data-halt', ''); aus(); });
  el.addEventListener('orb:weiter', () => { el.removeAttribute('data-halt'); if (el.getBoundingClientRect().bottom > 0) an(); });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.position.z = abstand();
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      if (ruhig) renderer.render(scene, camera);
    }, 120);
  });
  el.classList.add('orb--bereit');
}
