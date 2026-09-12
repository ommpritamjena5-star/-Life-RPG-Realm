import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DModel = ({
  characterClass = 'Warrior',
  size = 280,
  interactive = true,
}) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Class Color Profiles
    let primaryHex = 0xf59e0b; // Amber for Warrior
    let secondaryHex = 0xef4444;
    let particleHex = 0xfbbf24;

    if (characterClass === 'Mage') {
      primaryHex = 0x8b5cf6; // Arcane Violet
      secondaryHex = 0x06b6d4; // Mana Cyan
      particleHex = 0xc084fc;
    } else if (characterClass === 'Rogue') {
      primaryHex = 0x10b981; // Emerald
      secondaryHex = 0x06b6d4;
      particleHex = 0x34d399;
    } else if (characterClass === 'Paladin') {
      primaryHex = 0xfbbf24; // Solar Gold
      secondaryHex = 0x38bdf8;
      particleHex = 0xfef08a;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Group containing the entire 3D artifact
    const artifactGroup = new THREE.Group();
    scene.add(artifactGroup);

    // 1. Inner Core Glowing Mana Crystal (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(1.4, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    artifactGroup.add(coreMesh);

    // 2. Outer Protective Hexagonal Cage
    const outerGeo = new THREE.IcosahedronGeometry(2.1, 0);
    const outerMat = new THREE.MeshStandardMaterial({
      color: secondaryHex,
      emissive: secondaryHex,
      emissiveIntensity: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    artifactGroup.add(outerMesh);

    // 3. Orbital Energy Ring
    const ringGeo = new THREE.TorusGeometry(2.6, 0.04, 16, 60);
    const ringMat = new THREE.MeshBasicMaterial({
      color: particleHex,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    artifactGroup.add(ringMesh);

    // 4. Orbiting Rune Moons
    const orbitGroup = new THREE.Group();
    const moonGeo = new THREE.TetrahedronGeometry(0.25, 0);
    const moonMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.8,
    });

    for (let i = 0; i < 3; i++) {
      const moon = new THREE.Mesh(moonGeo, moonMat);
      const angle = (i * Math.PI * 2) / 3;
      moon.position.x = Math.cos(angle) * 2.8;
      moon.position.y = Math.sin(angle) * 2.8;
      orbitGroup.add(moon);
    }
    artifactGroup.add(orbitGroup);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryHex, 3, 20);
    pointLight.position.set(3, 4, 4);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(secondaryHex, 2, 20);
    rimLight.position.set(-4, -3, -2);
    scene.add(rimLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    if (interactive) {
      container.addEventListener('mousemove', handlePointerMove);
    }

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getElapsedTime();

      // Continuous levitation & rotation
      coreMesh.rotation.y = delta * 0.8;
      coreMesh.rotation.x = Math.sin(delta * 0.5) * 0.3;

      outerMesh.rotation.y = -delta * 0.4;
      outerMesh.rotation.z = delta * 0.3;

      ringMesh.rotation.z = delta * 0.6;
      orbitGroup.rotation.z = -delta * 0.9;
      orbitGroup.rotation.x = Math.sin(delta * 0.4) * 0.4;

      // Floating bounce
      artifactGroup.position.y = Math.sin(delta * 1.5) * 0.2;

      // Interactive mouse tilt
      targetRotationX += (mouseY * 0.8 - targetRotationX) * 0.08;
      targetRotationY += (mouseX * 0.8 - targetRotationY) * 0.08;

      artifactGroup.rotation.x = targetRotationX;
      artifactGroup.rotation.y = targetRotationY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        container.removeEventListener('mousemove', handlePointerMove);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      renderer.dispose();
    };
  }, [characterClass, size, interactive]);

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
      style={{ width: size, height: size }}
    />
  );
};
