/* endo-Form als Mond der Startseite „All“ (ERGUN., 01.10.2026): Vertex- und Fragment-Shader der endo-Hero-Form, 1:1 KOPIERT aus
   dem endo-Repo: _code/endo-studio/js/ethereal-shader.quelle.js (Stand 01.10.2026, Vorlage „Ethereal / ScrollHero“ von 21st.dev mit den
   RUHIG-Werten von ERGUN.). Nicht umfärben, nicht nachbauen – bei Änderungen dort hierher neu kopieren. Gebündelt in js/all.js. */
const paletteGLSL = `
  vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d){
    return a + b*cos(6.28318*(c*t + d));
  }
`;

// Vertex shader: displacement + derivatives-friendly output for better shading
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vDist;

  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uScrollProgress;
  uniform float uScrollVelocity;
  uniform float uSectionT;

  // Simplex noise
  vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
  vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0*floor(p*ns.z*ns.z);
    vec4 x_ = floor(j*ns.z);
    vec4 y_ = floor(j - 7.0*x_);
    vec4 x = x_*ns.x + ns.yyyy;
    vec4 y = y_*ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1),
                                   dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1),
                            dot(x2,x2), dot(x3,x3)), 0.0);
    m = m*m;
    return 42.0*dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }

  float fbm(vec3 p){
    float v = 0.0;
    float a = 0.5;
    for(int i=0;i<5;i++){
      v += a * snoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main(){
    vUv = uv;

    // base pos
    vec3 pos = position;

    // organic domain warping
    vec3 p = pos * 1.1;
    float t = uTime * 0.125;   // RUHIG: Vorlage 0.25 – halb so schnell, weniger Wabern
    // smooth “breathing” that doesn’t rotate the mesh
    float warp1 = fbm(p + vec3(t, -t, t*0.5));
    float warp2 = snoise(p*2.0 + vec3(-t*0.7, t*0.9, t*0.2));
    float warp = warp1*0.25 + warp2*0.1;

    // scroll-velocity twist only when scrolling (cinematic inertia)
    float twist = uScrollVelocity * 0.6;   // RUHIG: uScrollVelocity kommt nur noch gedämpft aus der Überfahrt (max. ±0.06)
    float angle = pos.y * twist;
    mat2 R = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    pos.xz = R * pos.xz;

    // displacement along normal for sculpted look
    float ridge = max(0.0, 1.0 - abs(snoise(p*1.5)));
    float disp = warp + ridge*0.15;
    vDist = disp;
    pos += normal * disp;

    vec4 world = modelMatrix * vec4(pos,1.0);
    vWorldPos = world.xyz;

    // send original normal (we’ll recompute better normal in fragment via derivatives)
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Fragment shader: Cook-Torrance-ish lighting, animated color gradients, env-ish reflection
const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vDist;

  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uSectionIndex;
  uniform vec2  uMouse;

  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uAccent;

  // palette
  ${paletteGLSL}

  // ACES-ish clamp
  float saturate(float x){ return clamp(x,0.0,1.0); }

  // Recompute geometric normal from derivatives for better shading on displaced surface
  vec3 normalFromDerivatives(vec3 p){
    vec3 dx = dFdx(p);
    vec3 dy = dFdy(p);
    return normalize(cross(dx,dy));
  }

  // Fresnel (Schlick)
  vec3 F_Schlick(float cosTheta, vec3 F0){
    return F0 + (1.0 - F0)*pow(1.0 - cosTheta, 5.0);
  }

  // GGX
  float D_GGX(float NdotH, float rough){
    float a = rough*rough;
    float a2 = a*a;
    float d = (NdotH*NdotH)*(a2 - 1.0) + 1.0;
    return a2 / (3.14159 * d * d);
  }

  float G_SchlickGGX(float NdotV, float rough){
    float r = rough + 1.0;
    float k = (r*r)/8.0;
    return NdotV / (NdotV*(1.0 - k) + k);
  }

  float G_Smith(float NdotV, float NdotL, float rough){
    return G_SchlickGGX(NdotV, rough) * G_SchlickGGX(NdotL, rough);
  }

  // Fake environment gradient (sky/ground)
  vec3 envGradient(vec3 r, vec3 skyA, vec3 skyB, vec3 ground){
    float h = r.y * 0.5 + 0.5;
    vec3 sky = mix(skyB, skyA, h);
    return mix(ground, sky, saturate(h*1.2));
  }

  // Domain-warped gradient parameter
  float gradParam(vec2 uv, float time){
    vec2 q = uv*2.0 - 1.0;
    q.x *= 1.2;
    float a = sin(q.x*2.5 + time*0.25);
    float b = cos(q.y*3.0 - time*0.2);
    return saturate(0.5 + 0.5*(a*0.6 + b*0.4));
  }

  void main(){
    // derive world-space normal for correct specular on displaced mesh
    vec3 N = normalFromDerivatives(vWorldPos);

    // view/light setup
    vec3 V = normalize(cameraPosition - vWorldPos);

    // three cinematic lights moving slowly (not rotating the mesh)
    float t = uTime*0.3;   // RUHIG: Vorlage 0.6 – Lichter wandern halb so schnell
    vec3 L1pos = vec3( 6.0*sin(t*0.7),  4.0,  6.0*cos(t*0.7));
    vec3 L2pos = vec3(-5.0*cos(t*0.5), -3.5, 5.0*sin(t*0.45));
    vec3 L3pos = vec3( 0.0,  6.0*sin(t*0.25), -6.0);

    vec3 L1 = normalize(L1pos - vWorldPos);
    vec3 L2 = normalize(L2pos - vWorldPos);
    vec3 L3 = normalize(L3pos - vWorldPos);

    // animated palette (cosine palette + section crossfade)
    float gp = gradParam(vUv, uTime) + vDist*0.6;
    float sectionMix = clamp(uSectionIndex/3.0, 0.0, 1.0);

    // Two palettes we blend between for a richer filmic feel
    vec3 palA = cosPalette(
      gp,
      vec3(0.55,0.55,0.58),
      vec3(0.45,0.35,0.35),
      vec3(0.95,0.80,0.70),
      vec3(0.00,0.35,0.55)
    );

    vec3 palB = cosPalette(
      gp + 0.15*sin(uTime*0.25),
      vec3(0.55,0.56,0.58),
      vec3(0.35,0.45,0.55),
      vec3(0.90,0.55,0.75),
      vec3(0.25,0.10,0.60)
    );

    vec3 baseAlbedo = mix(palA, palB, sectionMix);
    // bias toward your provided brand colors
    baseAlbedo = mix(baseAlbedo, uColor1, 0.15);
    baseAlbedo = mix(baseAlbedo, uColor2, 0.10);

    // Microfacet parameters
    float metallic = 0.25 + 0.15*sin(uTime*0.2 + gp*3.0);
    float rough    = clamp(0.18 + 0.12*sin(gp*6.283 + uTime*0.35), 0.06, 0.6);

    vec3 F0 = mix(vec3(0.04), baseAlbedo, metallic);

    // BRDF for each light
    vec3 H1 = normalize(V + L1);
    vec3 H2 = normalize(V + L2);
    vec3 H3 = normalize(V + L3);

    float NdotV = saturate(dot(N,V));
    float NdotL1= saturate(dot(N,L1));
    float NdotL2= saturate(dot(N,L2));
    float NdotL3= saturate(dot(N,L3));

    float NdotH1= saturate(dot(N,H1));
    float NdotH2= saturate(dot(N,H2));
    float NdotH3= saturate(dot(N,H3));

    float D1 = D_GGX(NdotH1, rough);
    float D2 = D_GGX(NdotH2, rough);
    float D3 = D_GGX(NdotH3, rough);

    float G1 = G_Smith(NdotV, NdotL1, rough);
    float G2 = G_Smith(NdotV, NdotL2, rough);
    float G3 = G_Smith(NdotV, NdotL3, rough);

    vec3  F1 = F_Schlick(saturate(dot(V,H1)), F0);
    vec3  F2 = F_Schlick(saturate(dot(V,H2)), F0);
    vec3  F3 = F_Schlick(saturate(dot(V,H3)), F0);

    vec3 spec1 = (D1*G1*F1) / max(4.0*NdotV*NdotL1, 0.001);
    vec3 spec2 = (D2*G2*F2) / max(4.0*NdotV*NdotL2, 0.001);
    vec3 spec3 = (D3*G3*F3) / max(4.0*NdotV*NdotL3, 0.001);

    vec3 kS = F_Schlick(NdotV, F0);
    vec3 kD = (vec3(1.0) - kS) * (1.0 - metallic);

    vec3 diffuse = baseAlbedo / 3.14159;

    // cinematic light colors
    vec3 c1 = vec3(1.0);
    vec3 c2 = mix(uColor3, vec3(0.9,0.95,1.0), 0.6);
    vec3 c3 = mix(uAccent, vec3(1.0,0.9,0.75), 0.5);

    vec3 direct =
      (kD*diffuse + spec1) * c1 * NdotL1 * 0.9 +
      (kD*diffuse + spec2) * c2 * NdotL2 * 0.6 +
      (kD*diffuse + spec3) * c3 * NdotL3 * 0.5;

    // fake environment reflection
    vec3 R = reflect(-V, N);
    vec3 env = envGradient(R,
      vec3(0.12,0.16,0.25),  // zenith
      vec3(0.04,0.06,0.10),  // horizon
      vec3(0.01,0.01,0.012)  // ground
    );
    vec3 Fenv = F_Schlick(saturate(dot(N,V)), F0);
    vec3 envSpec = Fenv * env * (1.0 - rough) * 0.6;

    // rim/iris accent
    float rim = pow(1.0 - saturate(dot(N,V)), 2.0);
    vec3 rimCol = mix(uAccent, uColor3, 0.4) * rim * 0.35;

    // glow from displacement
    vec3 glow = mix(uAccent, uColor3, 0.5) * abs(vDist) * 0.25;

    vec3 color = direct + envSpec + rimCol + glow;

    // subtle holographic shimmer
    float pattern = sin(vUv.x*40.0 + uTime) * sin(vUv.y*38.0 - uTime);
    color += pattern * 0.002;   // RUHIG: Vorlage 0.015 – das Muster flimmerte

    // mild exposure/gamma here; final look in post
    color = clamp(color, 0.0, 4.0);
    gl_FragColor = vec4(color, 1.0 - uScrollProgress*0.12);
  }
`;

// Cinematic post: ACES filmic + color temp/tint + grain + vignette + subtle CA + gentle bloom pass in pipeline
export { vertexShader, fragmentShader };
