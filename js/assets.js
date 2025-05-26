// Function to create realistic cloud using volumetric approach
function createRealisticCloud(x, y, z, scale) {
    // Create a simplex noise generator instance
    const simplex = new SimplexNoise();
    
    // Create a group to hold all cloud parts
    const cloudGroup = new THREE.Group();
    
    // Function to generate noise value at a point
    function getNoiseValue(x, y, z, frequency, amplitude) {
        return simplex.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    }
    
    // Create cloud particles
    const cloudParticleCount = 10 + Math.floor(Math.random() * 10);
    const cloudGeometry = new THREE.BufferGeometry();
    const cloudPositions = [];
    const cloudSizes = [];
    const cloudOpacities = [];
    
    // Generate points for the cloud with noise-based distribution
    for (let i = 0; i < cloudParticleCount; i++) {
        // Initial random point within sphere
        let rx = (Math.random() - 0.5) * 8;
        let ry = (Math.random() - 0.5) * 4;
        let rz = (Math.random() - 0.5) * 8;
        
        // Apply noise to position
        let noise = getNoiseValue(rx, ry, rz, 0.1, 1);
        
        // If noise value is positive, add a particle here
        if (noise > 0) {
            // Adjust position with noise to make it more cloud-like
            rx += getNoiseValue(rx, ry, rz, 0.2, 2);
            ry += getNoiseValue(rx, ry, rz, 0.2, 1);
            rz += getNoiseValue(rx, ry, rz, 0.2, 2);
            
            cloudPositions.push(rx, ry, rz);
            
            // Vary particle sizes
            const particleSize = 0.7 + Math.random() * 0.8 + noise * 0.5;
            cloudSizes.push(particleSize);
            
            // Vary opacity based on position in cloud
            const distFromCenter = Math.sqrt(rx*rx + ry*ry + rz*rz);
            const opacity = Math.max(0.1, 1.0 - distFromCenter / 6);
            cloudOpacities.push(opacity);
        }
    }
    
    // Create point cloud geometry
    cloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cloudPositions, 3));
    cloudGeometry.setAttribute('size', new THREE.Float32BufferAttribute(cloudSizes, 1));
    cloudGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(cloudOpacities, 1));
    
    // Create vertex and fragment shaders for the cloud material
    const cloudVertexShader = `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        
        void main() {
            vOpacity = opacity;
            
            // Calculate position
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // Ensure particles stay the same size regardless of distance
            gl_PointSize = size * 2.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    
    const cloudFragmentShader = `
        varying float vOpacity;
        
        void main() {
            // Create soft particles (circular)
            float r = 0.0;
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            r = dot(cxy, cxy);
            
            // Discard pixels outside of circle
            if (r > 1.0) {
                discard;
            }
            
            // Soften the edges
            float alpha = 1.0 - smoothstep(0.7, 1.0, r);
            
            // Final color and opacity
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * vOpacity * 0.8);
        }
    `;
    
    // Create cloud material
    const cloudMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: cloudVertexShader,
        fragmentShader: cloudFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    // Create cloud mesh
    const cloudMesh = new THREE.Points(cloudGeometry, cloudMaterial);
    
    // Add solid cloud core for additional volume
    const cloudCoreGeometry = new THREE.SphereGeometry(3, 16, 16);
    const cloudCoreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        transmission: 0.5,
        roughness: 1.0,
        metalness: 0.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.5,
        depthWrite: false,
    });
    
    // Create random deformations for the core to make it more cloud-like
    const corePositionAttrib = cloudCoreGeometry.attributes.position;
    const corePositions = corePositionAttrib.array;
    
    for (let i = 0; i < corePositions.length; i += 3) {
        const x = corePositions[i];
        const y = corePositions[i + 1];
        const z = corePositions[i + 2];
        
        const noise = getNoiseValue(x, y, z, 0.3, 1);
        const factor = 1 + noise * 0.4;
        
        corePositions[i] *= factor;
        corePositions[i + 1] *= factor;
        corePositions[i + 2] *= factor;
    }
    
    cloudCoreGeometry.attributes.position.needsUpdate = true;
    cloudCoreGeometry.computeVertexNormals();
    
    const cloudCore = new THREE.Mesh(cloudCoreGeometry, cloudCoreMaterial);
    
    // Add meshes to cloud group
    cloudGroup.add(cloudMesh);
    cloudGroup.add(cloudCore);
    
    // Add smaller detail clouds
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        const detailCloudGeometry = new THREE.SphereGeometry(
            1 + Math.random() * 2,
            16, 16
        );
        
        // Deform the detail cloud
        const detailPositionAttrib = detailCloudGeometry.attributes.position;
        const detailPositions = detailPositionAttrib.array;
        
        for (let j = 0; j < detailPositions.length; j += 3) {
            const x = detailPositions[j];
            const y = detailPositions[j + 1];
            const z = detailPositions[j + 2];
            
            const noise = getNoiseValue(x, y, z, 0.5, 1);
            const factor = 1 + noise * 0.3;
            
            detailPositions[j] *= factor;
            detailPositions[j + 1] *= factor;
            detailPositions[j + 2] *= factor;
        }
        
        detailCloudGeometry.attributes.position.needsUpdate = true;
        detailCloudGeometry.computeVertexNormals();
        
        const detailCloud = new THREE.Mesh(detailCloudGeometry, cloudCoreMaterial.clone());
        
        // Position the detail cloud
        detailCloud.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 6
        );
        
        cloudGroup.add(detailCloud);
    }
    
    // Scale and position the entire cloud group
    cloudGroup.scale.set(scale, scale * 0.6, scale);
    cloudGroup.position.set(x, y, z);
    
    // Add animation properties
    cloudGroup.userData = {
        initialY: y,
        speed: 0.1 + Math.random() * 0.2,
        amplitude: 0.5 + Math.random() * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.001
    };
    
    return cloudGroup;
}

// Create sun with realistic appearance
function createSun() {
    // Create sun core
    const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
    
    // Create custom shader material for the sun
    const vertexShader = `
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const fragmentShader = `
        uniform float time;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
            // Base sun color
            vec3 baseColor = vec3(1.0, 0.9, 0.6);
            
            // Add some noise variation to create a more dynamic appearance
            float noise1 = noise(vUv * 10.0 + time * 0.05);
            float noise2 = noise(vUv * 20.0 - time * 0.03);
            float noiseFactor = mix(noise1, noise2, 0.5) * 0.2;
            
            // Make the edges dimmer for a more realistic sun look
            float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 1.0));
            intensity = pow(intensity, 3.0);
            
            // Combine colors with noise and intensity
            vec3 finalColor = mix(baseColor, vec3(1.0, 0.8, 0.3), noiseFactor) * (1.0 + intensity * 0.5);
            
            // Output the color
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;
    
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.x = 10;
    sun.position.y = 5;
    sun.position.z = -50;
    
    // Create corona (outer glow)
    const coronaGeometry = new THREE.SphereGeometry(25, 16, 16);
    const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                vec3 glowColor = mix(vec3(1.0, 0.9, 0.6), vec3(1.0, 0.6, 0.1), intensity);
                gl_FragColor = vec4(glowColor, intensity * 0.75);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sun.add(corona);
    
    // Add a larger, subtle glow
    const glowGeometry = new THREE.SphereGeometry(35, 16, 16);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            
            void main() {
                float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
                gl_FragColor = vec4(1.0, 0.9, 0.6, intensity * 0.35);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);
    
    // Create lens flare effect
    const lensFlareTexture = new THREE.CanvasTexture(createLensFlareTexture());
    const lensFlareGeometry = new THREE.PlaneGeometry(80, 80);
    const lensFlareMaterial = new THREE.MeshBasicMaterial({
        map: lensFlareTexture,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });
    
    const lensFlare = new THREE.Mesh(lensFlareGeometry, lensFlareMaterial);
    lensFlare.position.z = -10;
    lensFlare.renderOrder = 9;
    sun.add(lensFlare);
    
    return sun;
}

// Helper function to create lens flare texture
function createLensFlareTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for lens flare
    const gradient = ctx.createRadialGradient(
        256, 256, 0,
        256, 256, 256
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.5)');
    gradient.addColorStop(0.3, 'rgba(255, 240, 150, 0.3)');
    gradient.addColorStop(0.7, 'rgba(255, 220, 100, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    return canvas;
}