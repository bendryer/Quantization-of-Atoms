import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { besselJ, getBesselRoot } from '../utils/bessel';
import { getHydrogenPsi, getRadialNodeRadii, getAngularNodeAngles } from '../utils/hydrogen';

interface DrumCanvasProps {
  l: number; // Angular mode
  n: number; // Radial mode
  isPlaying: boolean;
  speed: number;
  amplitude: number;
  resolution: number;
  viewMode: 'DRUM' | 'ORBITAL' | 'STRING';
  zoom: number;
  slicePosition: number;
  radialClip: number;
  particleBrightness: number;
  probPower: number;
}

const DrumCanvas: React.FC<DrumCanvasProps> = ({ l, n, isPlaying, speed, amplitude, resolution, viewMode, zoom, slicePosition, radialClip, particleBrightness, probPower }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectRef = useRef<THREE.Object3D | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const timeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  // Props Ref for Animation Loop
  const propsRef = useRef({ l, n, isPlaying, speed, amplitude, resolution, viewMode, zoom, slicePosition, radialClip, particleBrightness, probPower });
  useEffect(() => {
    propsRef.current = { l, n, isPlaying, speed, amplitude, resolution, viewMode, zoom, slicePosition, radialClip, particleBrightness, probPower };
  }, [l, n, isPlaying, speed, amplitude, resolution, viewMode, zoom, slicePosition, radialClip, particleBrightness, probPower]);

  // --- INIT THREE.JS SCENE ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean previous
    container.innerHTML = '';
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.08); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Initial position - will be updated by OrbitControls and viewMode effects
    camera.position.set(4, 3.5, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const { isPlaying, speed, viewMode: currentMode } = propsRef.current;

      if (controlsRef.current) controlsRef.current.update();

      if (isPlaying) {
         const dt = currentMode === 'DRUM' ? 0.01 : 0.005; 
         timeRef.current += dt * speed;
      }

      const t = timeRef.current;

      if (currentMode === 'DRUM' && objectRef.current) {
         animateDrum(t);
      } else if (currentMode === 'STRING' && objectRef.current) {
         animateString(t);
      } else if (currentMode === 'ORBITAL' && objectRef.current) {
         // Manual rotation via controls mostly, but we can add slow drift if needed
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  // --- CAMERA CONTROL ---
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    let targetPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3(0,0,0);
    
    if (viewMode === 'DRUM') {
        targetPos.set(3.5, 3.5, 3.5);
    } else if (viewMode === 'STRING') {
        targetPos.set(0, 1.5, 5.5);
    } else {
        targetPos.set(0, 0, 16);
    }
    
    const distanceScale = 1.0 / zoom;
    targetPos.multiplyScalar(distanceScale);
    
    cameraRef.current.position.copy(targetPos);
    cameraRef.current.lookAt(targetLookAt);
    controlsRef.current.target.copy(targetLookAt);
    controlsRef.current.update();
    
  }, [viewMode]); 

  // Handle Zoom change separately to not reset rotation
  useEffect(() => {
     if (!cameraRef.current || !controlsRef.current) return;
     const controls = controlsRef.current;
     const direction = new THREE.Vector3().subVectors(cameraRef.current.position, controls.target).normalize();
     
     let baseDist = 16;
     if (viewMode === 'DRUM') baseDist = 6;
     if (viewMode === 'STRING') baseDist = 6;

     const newDist = baseDist / zoom;
     
     cameraRef.current.position.copy(controls.target).add(direction.multiplyScalar(newDist));
     controls.update();

  }, [zoom]);


  // --- UNIFORM UPDATES FOR SLICE/CROP/BRIGHTNESS/CONTRAST ---
  useEffect(() => {
     if (!objectRef.current || viewMode !== 'ORBITAL') return;
     
     let points: THREE.Points | null = null;
     objectRef.current.traverse((child) => {
        if (child instanceof THREE.Points) points = child;
     });

     if (points && points.material) {
         const mat = points.material as THREE.PointsMaterial;
         const shader = mat.userData.shader;
         if (shader) {
             const visualBound = 7.0;
             const zCut = visualBound - (slicePosition * 2.0 * visualBound);
             const rCut = radialClip * 8.0; 

             shader.uniforms.uSlice.value = zCut;
             shader.uniforms.uRadial.value = rCut;
             shader.uniforms.uBrightness.value = particleBrightness;
             shader.uniforms.uContrast.value = probPower;
         }
     }
  }, [slicePosition, radialClip, particleBrightness, probPower, viewMode]);


  // --- OBJECT GENERATION LOGIC ---
  useEffect(() => {
    if (!sceneRef.current) return;

    if (objectRef.current) {
        sceneRef.current.remove(objectRef.current);
        objectRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m: any) => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
        objectRef.current = null;
    }

    if (viewMode === 'DRUM') {
        createDrum();
    } else if (viewMode === 'STRING') {
        createString();
    } else {
        createOrbital();
    }

  }, [viewMode, l, n, resolution, amplitude]); 

  // --- ANIMATION FUNCTIONS ---

  const animateString = (t: number) => {
    if (!objectRef.current) return;
    const mesh = objectRef.current.getObjectByName("stringLine") as THREE.Line;
    if (!mesh || !mesh.geometry) return;
    
    const positions = mesh.geometry.attributes.position;
    const colors = mesh.geometry.attributes.color;
    const count = positions.count;
    const { n, amplitude } = propsRef.current;
    
    for (let i = 0; i < count; i++) {
        const xWorld = positions.getX(i); // -2.5 to 2.5
        const xNorm = (xWorld + 2.5) / 5.0; // 0 to 1
        
        const y = amplitude * Math.sin(n * Math.PI * xNorm) * Math.cos(t * 2);
        
        positions.setY(i, y);
        
        if (y > 0) {
            const intensity = Math.min(1, Math.abs(y) / (amplitude * 0.5));
             colors.setXYZ(i, 0.22 + (1-0.22)*(1-intensity), 0.74 + (1-0.74)*(1-intensity), 0.97); 
        } else {
            const intensity = Math.min(1, Math.abs(y) / (amplitude * 0.5));
            colors.setXYZ(i, 0.98 + (1-0.98)*(1-intensity), 0.44 + (1-0.44)*(1-intensity), 0.52 + (1-0.52)*(1-intensity));
        }
    }
    positions.needsUpdate = true;
    colors.needsUpdate = true;
  }

  const animateDrum = (t: number) => {
     if (!objectRef.current) return;
     const mesh = objectRef.current.getObjectByName("drumSkin") as THREE.Mesh;
     if (!mesh || !mesh.geometry) return;
     const geometry = mesh.geometry;
     if (!geometry.attributes || !geometry.attributes.position) return;

     const { l, n, amplitude } = propsRef.current;
     const positionAttribute = geometry.attributes.position;
     const colorAttribute = geometry.attributes.color;
     const count = positionAttribute.count;
     const root = getBesselRoot(l, n);
     const cosT = Math.cos(t * root);

     for (let i = 0; i < count; i++) {
        const x = positionAttribute.getX(i);
        const z = positionAttribute.getZ(i);
        const r = Math.sqrt(x*x + z*z);
        const theta = Math.atan2(z, x);

        let height = 0;
        if (r < 1.15) { 
             const val = besselJ(l, root * (r / 1.2));
             const angular = Math.cos(l * theta);
             height = 0.5 * amplitude * val * angular * cosT; 
        } 
        positionAttribute.setY(i, height);

        const intensity = height * (2.0 / Math.max(0.5, amplitude * 0.5)); 
        if (r > 1.18) {
             if (colorAttribute) colorAttribute.setXYZ(i, 0.06, 0.09, 0.16); 
        } else {
             if (colorAttribute) {
                 if (intensity > 0) {
                     const tCol = Math.min(1, intensity);
                     colorAttribute.setXYZ(i, 0.06 + (0.22 - 0.06) * tCol, 0.09 + (0.74 - 0.09) * tCol, 0.16 + (0.97 - 0.16) * tCol);
                 } else {
                     const tCol = Math.min(1, Math.abs(intensity));
                     colorAttribute.setXYZ(i, 0.06 + (0.98 - 0.06) * tCol, 0.09 + (0.44 - 0.09) * tCol, 0.16 + (0.52 - 0.16) * tCol);
                 }
             }
        }
     }
     positionAttribute.needsUpdate = true;
     if (colorAttribute) colorAttribute.needsUpdate = true;
     geometry.computeVertexNormals();
  };

  // --- CREATORS ---
  
  const createString = () => {
     if (!sceneRef.current) return;
     const group = new THREE.Group();
     
     const segmentCount = 200;
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array(segmentCount * 3);
     const colors = new Float32Array(segmentCount * 3);
     
     const width = 5.0;
     
     for (let i = 0; i < segmentCount; i++) {
         const t = i / (segmentCount - 1);
         const x = (t - 0.5) * width;
         positions[i * 3] = x;
         positions[i * 3 + 1] = 0;
         positions[i * 3 + 2] = 0;
         
         colors[i*3] = 1; colors[i*3+1] = 1; colors[i*3+2] = 1;
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
     
     const material = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 3 });
     const line = new THREE.Line(geometry, material);
     line.name = "stringLine";
     group.add(line);
     
     const anchorGeo = new THREE.SphereGeometry(0.1, 16, 16);
     const anchorMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
     const leftAnchor = new THREE.Mesh(anchorGeo, anchorMat);
     leftAnchor.position.set(-width/2, 0, 0);
     const rightAnchor = new THREE.Mesh(anchorGeo, anchorMat);
     rightAnchor.position.set(width/2, 0, 0);
     group.add(leftAnchor);
     group.add(rightAnchor);
     
     const axisGeo = new THREE.BufferGeometry().setFromPoints([
         new THREE.Vector3(-width/2, 0, 0),
         new THREE.Vector3(width/2, 0, 0)
     ]);
     const axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true });
     const axis = new THREE.Line(axisGeo, axisMat);
     group.add(axis);

     objectRef.current = group;
     sceneRef.current.add(group);
  };

  const createDrum = () => {
    if (!sceneRef.current) return;
    const group = new THREE.Group();

    const rimGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 100);
    rimGeo.rotateX(-Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.name = "rim";
    group.add(rim);

    const geometry = new THREE.PlaneGeometry(2.4, 2.4, resolution, resolution);
    geometry.rotateX(-Math.PI / 2);
    if (geometry.attributes && geometry.attributes.position) {
        const count = geometry.attributes.position.count;
        const colors = new Float32Array(count * 3);
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        for(let i=0; i<count; i++) {
            colors[i*3] = 0.06; colors[i*3+1] = 0.09; colors[i*3+2] = 0.16;
        }
    }

    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
      shininess: 80,
      specular: 0x222222,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "drumSkin"; 
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    objectRef.current = group;
    sceneRef.current.add(group);
  };

  // --- ORBITAL CREATOR ---
  const createOrbital = () => {
    if (!sceneRef.current) return;
    const N = n + l;
    const L = l;
    const group = new THREE.Group();

    const bound = 3.0 * N * N + 5; 
    const scaleFactor = 6.0 / bound; 

    // INCREASED PARTICLE COUNT for higher resolution
    const particleCount = 150000 * amplitude;
    const positions = [];
    const colors = [];
    // Store relative intensity for dynamic contrast shading
    const intensities = []; 
    
    let count = 0;
    const maxAttempts = particleCount * 200; 
    let attempts = 0;
    // Base multiplier for generation (Power = 1.0)
    // We generate using a softer distribution to ensure we have particles everywhere
    // Then we use the shader to sharpen the view.
    const probMultiplier = 150 * Math.pow(N, 2.5);

    let maxProbFound = 0.00001;

    // Temporary array to store raw probabilities
    const rawProbs = [];

    while (count < particleCount && attempts < maxAttempts) {
        attempts++;
        const x = (Math.random() - 0.5) * 2 * bound;
        const y = (Math.random() - 0.5) * 2 * bound;
        const z = (Math.random() - 0.5) * 2 * bound;
        const r = Math.sqrt(x*x + y*y + z*z);
        if (r === 0) continue;
        const cosTheta = y / r; 
        
        const psi = getHydrogenPsi(N, L, r, cosTheta);
        // Generation uses simple Power 1.0 (Linear Density)
        // This ensures better coverage of "faint" areas initially
        const prob = psi * psi; 
        const threshold = Math.random();
        
        if (prob * probMultiplier > threshold) {
             positions.push(x * scaleFactor, y * scaleFactor, z * scaleFactor);
             rawProbs.push(prob);
             if (prob > maxProbFound) maxProbFound = prob;

             if (psi > 0) {
                 colors.push(0.22, 0.74, 0.97); 
             } else {
                 colors.push(0.98, 0.44, 0.52); 
             }
             count++;
        }
    }

    // Normalize probabilities into intensities [0, 1]
    for (let i = 0; i < rawProbs.length; i++) {
        intensities.push(rawProbs[i] / maxProbFound);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('intensity', new THREE.Float32BufferAttribute(intensities, 1));

    // Custom Shader Injection for Clipping, Brightness, and Contrast
    const initialVisualBound = 7.0;
    const initialZCut = initialVisualBound - (propsRef.current.slicePosition * 2.0 * initialVisualBound);
    const initialRCut = propsRef.current.radialClip * 8.0;
    const initialBrightness = propsRef.current.particleBrightness;
    const initialContrast = propsRef.current.probPower;

    const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    
    material.onBeforeCompile = (shader) => {
        shader.uniforms.uSlice = { value: initialZCut };
        shader.uniforms.uRadial = { value: initialRCut };
        shader.uniforms.uBrightness = { value: initialBrightness };
        shader.uniforms.uContrast = { value: initialContrast };
        
        shader.vertexShader = `
          attribute float intensity;
          varying vec3 vWorldPos;
          varying vec3 vLocalPos;
          varying float vIntensity;
          ${shader.vertexShader}
        `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
           vLocalPos = position;
           vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
           vIntensity = intensity;
          `
        );
        
        shader.fragmentShader = `
          uniform float uSlice;
          uniform float uRadial;
          uniform float uBrightness;
          uniform float uContrast;
          varying vec3 vWorldPos;
          varying vec3 vLocalPos;
          varying float vIntensity;
          ${shader.fragmentShader}
        `.replace(
          `#include <color_fragment>`,
          `#include <color_fragment>
           // Slice based on World Z
           if (vWorldPos.z > uSlice) discard;
           
           // Crop based on Local Radius
           if (length(vLocalPos) > uRadial) discard;

           // Dynamic Contrast: Apply power law to simulate sharper probability distribution
           // Alpha scales with intensity^(contrast-1)
           // If contrast is high, low intensity particles become very transparent
           float visibility = pow(vIntensity, uContrast - 1.0);
           diffuseColor.a *= visibility;

           // Apply Brightness
           diffuseColor.rgb *= uBrightness;
          `
        );
        
        material.userData.shader = shader;
    };

    const points = new THREE.Points(geometry, material);
    group.add(points);
    
    // Nodal Structures
    const nodeMat = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.15,
        depthWrite: false 
    });

    const radialRoots = getRadialNodeRadii(N, L);
    radialRoots.forEach(r => {
        const visualRadius = r * scaleFactor;
        const geo = new THREE.SphereGeometry(visualRadius, 32, 32);
        const wireframe = new THREE.WireframeGeometry(geo);
        const line = new THREE.LineSegments(wireframe, nodeMat);
        group.add(line);
    });

    const angularRoots = getAngularNodeAngles(L);
    angularRoots.forEach(theta => {
        const size = 6;
        if (Math.abs(theta - Math.PI/2) < 0.01) {
             const geo = new THREE.CircleGeometry(size, 64);
             geo.rotateX(Math.PI/2);
             const wireframe = new THREE.WireframeGeometry(geo);
             const line = new THREE.LineSegments(wireframe, nodeMat);
             group.add(line);
        } else {
            const h = size * Math.cos(theta);
            const r = size * Math.sin(theta);
            const coneH = 6;
            const coneR = Math.abs(coneH * Math.tan(theta));
            const geo = new THREE.ConeGeometry(coneR, coneH, 32, 1, true);
            geo.translate(0, -coneH/2, 0); 
            if (theta > Math.PI/2) geo.rotateX(Math.PI); 
            const wireframe = new THREE.WireframeGeometry(geo);
            const line = new THREE.LineSegments(wireframe, nodeMat);
            group.add(line);
        }
    });

    const coreGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.8, transparent: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    objectRef.current = group;
    sceneRef.current.add(group);
  };

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 relative"
    >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/50 to-transparent"></div>
    </div>
  );
};

export default DrumCanvas;