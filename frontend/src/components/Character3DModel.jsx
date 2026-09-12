import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Character3DModel = ({
  characterClass = 'Warrior',
  size = 300,
  interactive = true,
}) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Group for the entire 3D character
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // 2. Class-specific Color Palette & Materials
    let primaryColor = 0xf59e0b; // Amber / Gold
    let secondaryColor = 0x3b82f6; // Blue Steel
    let armorColor = 0x1e293b; // Slate armor
    let glowColor = 0xf59e0b; // Flame
    let particleColor = 0xfbbf24;

    if (characterClass === 'Mage') {
      primaryColor = 0x8b5cf6; // Arcane Violet
      secondaryColor = 0x06b6d4; // Cyan Mana
      armorColor = 0x181329; // Mystic Robes
      glowColor = 0xa855f7;
      particleColor = 0x38bdf8;
    } else if (characterClass === 'Rogue') {
      primaryColor = 0x10b981; // Emerald
      secondaryColor = 0x047857; // Dark Green
      armorColor = 0x0f172a; // Stealth Leather
      glowColor = 0x34d399;
      particleColor = 0x6ee7b7;
    } else if (characterClass === 'Paladin') {
      primaryColor = 0xfacc15; // Bright Solar Gold
      secondaryColor = 0xe0f2fe; // Holy White
      armorColor = 0x334155; // Polished Plate
      glowColor = 0xfef08a;
      particleColor = 0xfde047;
    }

    const armorMat = new THREE.MeshStandardMaterial({
      color: armorColor,
      roughness: 0.3,
      metalness: 0.8,
    });

    const primaryMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.2,
      metalness: 0.7,
      emissive: primaryColor,
      emissiveIntensity: 0.25,
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });

    // 3. Build Procedural 3D Hero Body Structure
    // --- Head / Helmet ---
    const headGeo = new THREE.DodecahedronGeometry(0.5, 0);
    const headMesh = new THREE.Mesh(headGeo, armorMat);
    headMesh.position.y = 1.6;
    characterGroup.add(headMesh);

    // Glowing Eyes / Visor Slit
    const visorGeo = new THREE.BoxGeometry(0.45, 0.09, 0.45);
    const visorMesh = new THREE.Mesh(visorGeo, glowMat);
    visorMesh.position.set(0, 1.6, 0.25);
    characterGroup.add(visorMesh);

    // --- Torso / Chest Armor ---
    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.35, 1.0, 6);
    const torsoMesh = new THREE.Mesh(torsoGeo, armorMat);
    torsoMesh.position.y = 0.8;
    characterGroup.add(torsoMesh);

    // Torso Emblem / Mana Core
    const coreGeo = new THREE.OctahedronGeometry(0.18, 0);
    const coreMesh = new THREE.Mesh(coreGeo, glowMat);
    coreMesh.position.set(0, 0.9, 0.35);
    characterGroup.add(coreMesh);

    // --- Shoulder Pauldrons ---
    const pauldronGeo = new THREE.TetrahedronGeometry(0.35, 0);
    const leftPauldron = new THREE.Mesh(pauldronGeo, primaryMat);
    leftPauldron.position.set(-0.65, 1.15, 0);
    leftPauldron.rotation.z = -0.4;
    characterGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronGeo, primaryMat);
    rightPauldron.position.set(0.65, 1.15, 0);
    rightPauldron.rotation.z = 0.4;
    characterGroup.add(rightPauldron);

    // --- Arms ---
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 5);
    const leftArm = new THREE.Mesh(armGeo, armorMat);
    leftArm.position.set(-0.6, 0.65, 0.1);
    leftArm.rotation.z = 0.2;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armorMat);
    rightArm.position.set(0.6, 0.65, 0.1);
    rightArm.rotation.z = -0.2;
    characterGroup.add(rightArm);

    // --- Class Specific Weapons & Props ---
    const weaponGroup = new THREE.Group();
    characterGroup.add(weaponGroup);

    if (characterClass === 'Warrior') {
      // 3D Heavy Greatsword (Right Hand)
      const bladeGeo = new THREE.BoxGeometry(0.1, 1.6, 0.04);
      const bladeMesh = new THREE.Mesh(bladeGeo, primaryMat);
      bladeMesh.position.set(0.85, 0.9, 0.35);
      bladeMesh.rotation.z = -0.3;
      weaponGroup.add(bladeMesh);

      // Sword Guard & Hilt
      const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
      const hiltMesh = new THREE.Mesh(hiltGeo, armorMat);
      hiltMesh.position.set(0.75, 0.05, 0.35);
      hiltMesh.rotation.z = -0.3;
      weaponGroup.add(hiltMesh);

      // 3D Tower Shield (Left Hand)
      const shieldGeo = new THREE.BoxGeometry(0.65, 1.1, 0.08);
      const shieldMesh = new THREE.Mesh(shieldGeo, armorMat);
      shieldMesh.position.set(-0.8, 0.6, 0.3);
      shieldMesh.rotation.y = 0.3;
      weaponGroup.add(shieldMesh);

      // Shield Emblem
      const shieldEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), primaryMat);
      shieldEmblem.position.set(-0.8, 0.6, 0.38);
      weaponGroup.add(shieldEmblem);
    } else if (characterClass === 'Mage') {
      // 3D Arcane Staff (Right Hand)
      const staffPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), armorMat);
      staffPole.position.set(0.8, 0.9, 0.2);
      weaponGroup.add(staffPole);

      // Floating Arcane Crystal Orb atop Staff
      const staffOrb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), glowMat);
      staffOrb.position.set(0.8, 2.1, 0.2);
      weaponGroup.add(staffOrb);

      // Floating Orbital Spell Circle (Left Hand)
      const spellRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.03, 16, 30),
        new THREE.MeshBasicMaterial({ color: glowColor, wireframe: true })
      );
      spellRing.position.set(-0.75, 0.7, 0.4);
      spellRing.rotation.x = Math.PI / 2;
      weaponGroup.add(spellRing);
    } else if (characterClass === 'Rogue') {
      // 3D Dual Shadow Daggers
      const dagger1 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.8, 4), primaryMat);
      dagger1.position.set(0.75, 0.4, 0.4);
      dagger1.rotation.x = Math.PI;
      weaponGroup.add(dagger1);

      const dagger2 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.8, 4), primaryMat);
      dagger2.position.set(-0.75, 0.4, 0.4);
      dagger2.rotation.x = Math.PI;
      weaponGroup.add(dagger2);

      // Shadow Cowl Hood Over Head
      const hood = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.6, 5), armorMat);
      hood.position.set(0, 1.85, 0);
      weaponGroup.add(hood);
    } else if (characterClass === 'Paladin') {
      // 3D Solar Halo Ring Above Head
      const haloGeo = new THREE.TorusGeometry(0.45, 0.04, 16, 40);
      const haloMesh = new THREE.Mesh(haloGeo, glowMat);
      haloMesh.position.set(0, 2.3, 0);
      haloMesh.rotation.x = Math.PI / 3;
      weaponGroup.add(haloMesh);

      // 3D Warhammer of Light
      const hammerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), armorMat);
      hammerHandle.position.set(0.8, 0.8, 0.2);
      weaponGroup.add(hammerHandle);

      const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.6), primaryMat);
      hammerHead.position.set(0.8, 1.7, 0.2);
      weaponGroup.add(hammerHead);

      // Sun Shield
      const sunShield = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 8), armorMat);
      sunShield.position.set(-0.8, 0.65, 0.3);
      sunShield.rotation.x = Math.PI / 2;
      weaponGroup.add(sunShield);
    }

    // 4. Floating Character Aura Particles
    const particleCount = 45;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      partPos[i * 3] = (Math.random() - 0.5) * 2.8;
      partPos[i * 3 + 1] = Math.random() * 2.5;
      partPos[i * 3 + 2] = (Math.random() - 0.5) * 2.8;
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.12,
      color: particleColor,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const auraParticles = new THREE.Points(partGeo, partMat);
    characterGroup.add(auraParticles);

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(primaryColor, 2.5);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(secondaryColor, 1.5);
    fillLight.position.set(-4, -2, -2);
    scene.add(fillLight);

    const underGlow = new THREE.PointLight(glowColor, 2, 10);
    underGlow.position.set(0, -0.5, 2);
    scene.add(underGlow);

    // 6. Mouse Interaction & Physics
    let isDragging = false;
    let previousMouseX = 0;
    let rotationVelocity = 0.005;
    let mouseX = 0;
    let mouseY = 0;
    let targetTiltX = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handlePointerMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        characterGroup.rotation.y += deltaX * 0.015;
        rotationVelocity = deltaX * 0.001;
        previousMouseX = e.clientX;
      } else {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX = x * 2;
        mouseY = y * 2;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    if (interactive) {
      container.addEventListener('mousedown', handlePointerDown);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      // Touch support
      container.addEventListener('touchstart', (e) => {
        if (e.touches[0]) {
          isDragging = true;
          previousMouseX = e.touches[0].clientX;
        }
      });
      window.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches[0]) {
          const deltaX = e.touches[0].clientX - previousMouseX;
          characterGroup.rotation.y += deltaX * 0.015;
          previousMouseX = e.touches[0].clientX;
        }
      });
      window.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    // 7. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getElapsedTime();

      // Idle levitation & breathing
      characterGroup.position.y = Math.sin(delta * 2) * 0.08 - 0.6;
      headMesh.rotation.y = Math.sin(delta * 1.5) * 0.1;
      visorMesh.rotation.y = Math.sin(delta * 1.5) * 0.1;
      coreMesh.rotation.y = delta * 2;

      // Slow automatic continuous rotation if not dragging
      if (!isDragging) {
        characterGroup.rotation.y += rotationVelocity;
        rotationVelocity += (0.008 - rotationVelocity) * 0.02;

        targetTiltX += (mouseY * 0.2 - targetTiltX) * 0.05;
        characterGroup.rotation.x = targetTiltX;
      }

      // Aura particles drift upward
      const positions = auraParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.015;
        if (positions[i] > 2.8) positions[i] = 0;
      }
      auraParticles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        container.removeEventListener('mousedown', handlePointerDown);
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      headGeo.dispose();
      torsoGeo.dispose();
      pauldronGeo.dispose();
      armGeo.dispose();
      armorMat.dispose();
      primaryMat.dispose();
      glowMat.dispose();
      partGeo.dispose();
      partMat.dispose();
      renderer.dispose();
    };
  }, [characterClass, size, interactive]);

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{ width: size, height: size }}
      title="Drag to rotate character in 3D"
    />
  );
};
