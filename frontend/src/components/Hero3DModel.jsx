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

    // 1. Color Palettes by Class
    let skinColor = 0xffdfc4; // Skin tone
    let primaryColor = 0xf59e0b; // Amber / Gold
    let armorColor = 0x1e293b; // Obsidian Plate
    let clothColor = 0x8b5cf6; // Cape / Cloth
    let glowColor = 0xf59e0b;
    let weaponMetal = 0x94a3b8;

    if (characterClass === 'Mage') {
      skinColor = 0xfde047;
      primaryColor = 0x8b5cf6; // Arcane Violet
      armorColor = 0x181329; // Mystic Silk Robes
      clothColor = 0x06b6d4; // Mana Cyan Sash
      glowColor = 0xa855f7;
    } else if (characterClass === 'Rogue') {
      skinColor = 0xfcd34d;
      primaryColor = 0x10b981; // Emerald Green
      armorColor = 0x0f172a; // Stealth Leather
      clothColor = 0x047857;
      glowColor = 0x34d399;
    } else if (characterClass === 'Paladin') {
      skinColor = 0xfef08a;
      primaryColor = 0xfacc15; // Solar Gold
      armorColor = 0x334155; // Polished Knight Steel
      clothColor = 0x38bdf8; // Sky Blue Mantle
      glowColor = 0xfde047;
    }

    // 2. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.4, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Root Group
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5, metalness: 0.1 });
    const armorMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.3, metalness: 0.8 });
    const primaryMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.2, metalness: 0.7, emissive: primaryColor, emissiveIntensity: 0.2 });
    const clothMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.7, metalness: 0.1 });
    const glowMat = new THREE.MeshStandardMaterial({ color: glowColor, emissive: glowColor, emissiveIntensity: 1.2, roughness: 0.1 });
    const metalMat = new THREE.MeshStandardMaterial({ color: weaponMetal, roughness: 0.2, metalness: 0.9 });

    // ==========================================
    // 3. HUMAN-LIKE ANATOMY & RIGGING
    // ==========================================

    // --- HEAD & FACE ---
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.0;
    heroGroup.add(headGroup);

    // Head base (Cranium)
    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(headMesh);

    // Humanoid Jaw / Chin
    const jawGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.25, 8);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.15, 0.08);
    headGroup.add(jawMesh);

    // Helmet / Crown / Hood
    if (characterClass === 'Warrior' || characterClass === 'Paladin') {
      const helmGeo = new THREE.SphereGeometry(0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
      const helmMesh = new THREE.Mesh(helmGeo, armorMat);
      headGroup.add(helmMesh);

      // Glowing Eyes / Visor
      const visorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.1), glowMat);
      visorMesh.position.set(0, 0.02, 0.3);
      headGroup.add(visorMesh);

      if (characterClass === 'Paladin') {
        // Solar Halo
        const haloMesh = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.03, 16, 36), glowMat);
        haloMesh.position.set(0, 0.55, 0);
        haloMesh.rotation.x = Math.PI / 3;
        headGroup.add(haloMesh);
      }
    } else {
      // Mage / Rogue Hood
      const hoodGeo = new THREE.ConeGeometry(0.48, 0.65, 8);
      const hoodMesh = new THREE.Mesh(hoodGeo, clothMat);
      hoodMesh.position.set(0, 0.15, -0.05);
      hoodMesh.rotation.x = -0.2;
      headGroup.add(hoodMesh);

      // Glowing Arcane Eyes
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowMat);
      eyeL.position.set(-0.1, 0.02, 0.28);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowMat);
      eyeR.position.set(0.1, 0.02, 0.28);
      headGroup.add(eyeL);
      headGroup.add(eyeR);
    }

    // --- NECK ---
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 8), skinMat);
    neckMesh.position.y = 1.72;
    heroGroup.add(neckMesh);

    // --- TORSO (CHEST & ABDOMEN) ---
    // Upper Chest Plate
    const chestGeo = new THREE.BoxGeometry(0.85, 0.55, 0.45);
    const chestMesh = new THREE.Mesh(chestGeo, armorMat);
    chestMesh.position.y = 1.4;
    heroGroup.add(chestMesh);

    // Emblem Core on Chest
    const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), glowMat);
    chestCore.position.set(0, 1.45, 0.24);
    heroGroup.add(chestCore);

    // Abdomen / Waist
    const waistGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.45, 8);
    const waistMesh = new THREE.Mesh(waistGeo, armorMat);
    waistMesh.position.y = 0.95;
    heroGroup.add(waistMesh);

    // Gold Belt with Buckle
    const beltMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 12), primaryMat);
    beltMesh.position.y = 0.72;
    heroGroup.add(beltMesh);

    // Cape flowing on the back
    const capeGeo = new THREE.PlaneGeometry(0.8, 1.6, 4, 8);
    const capeMesh = new THREE.Mesh(capeGeo, clothMat);
    capeMesh.position.set(0, 0.85, -0.26);
    capeMesh.rotation.y = Math.PI;
    capeMesh.rotation.x = 0.1;
    heroGroup.add(capeMesh);

    // --- SHOULDERS & PAULDRONS ---
    const pauldronGeo = new THREE.DodecahedronGeometry(0.24, 0);
    const leftPauldron = new THREE.Mesh(pauldronGeo, primaryMat);
    leftPauldron.position.set(-0.55, 1.55, 0);
    heroGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronGeo, primaryMat);
    rightPauldron.position.set(0.55, 1.55, 0);
    heroGroup.add(rightPauldron);

    // --- ARMS (BICEPS, FOREARMS, HANDS) ---
    // Left Arm Group
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.5, 1.45, 0);
    heroGroup.add(leftArmGroup);

    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 8), skinMat);
    leftBicep.position.set(-0.08, -0.22, 0);
    leftBicep.rotation.z = -0.2;
    leftArmGroup.add(leftBicep);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 8), armorMat);
    leftForearm.position.set(-0.16, -0.58, 0.1);
    leftForearm.rotation.x = 0.35;
    leftArmGroup.add(leftForearm);

    // Right Arm Group
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.5, 1.45, 0);
    heroGroup.add(rightArmGroup);

    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 8), skinMat);
    rightBicep.position.set(0.08, -0.22, 0);
    rightBicep.rotation.z = 0.2;
    rightArmGroup.add(rightBicep);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 8), armorMat);
    rightForearm.position.set(0.16, -0.58, 0.1);
    rightForearm.rotation.x = 0.35;
    rightArmGroup.add(rightForearm);

    // --- LEGS & ARMORED BOOTS ---
    // Left Leg
    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.6, 8), armorMat);
    leftThigh.position.set(-0.22, 0.35, 0);
    heroGroup.add(leftThigh);

    const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.6, 8), primaryMat);
    leftShin.position.set(-0.22, -0.25, 0);
    heroGroup.add(leftShin);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.35), armorMat);
    leftBoot.position.set(-0.22, -0.58, 0.08);
    heroGroup.add(leftBoot);

    // Right Leg
    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.6, 8), armorMat);
    rightThigh.position.set(0.22, 0.35, 0);
    heroGroup.add(rightThigh);

    const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.6, 8), primaryMat);
    rightShin.position.set(0.22, -0.25, 0);
    heroGroup.add(rightShin);

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.35), armorMat);
    rightBoot.position.set(0.22, -0.58, 0.08);
    heroGroup.add(rightBoot);

    // --- CLASS WEAPONS HELD IN HANDS ---
    if (characterClass === 'Warrior') {
      // Greatsword in Right Hand
      const swordGroup = new THREE.Group();
      swordGroup.position.set(0.72, 0.8, 0.25);
      swordGroup.rotation.z = -0.25;

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.03), metalMat);
      blade.position.y = 0.9;
      swordGroup.add(blade);

      const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.08), primaryMat);
      swordGroup.add(crossguard);

      const swordHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), armorMat);
      swordHilt.position.y = -0.22;
      swordGroup.add(swordHilt);

      const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), primaryMat);
      pommel.position.y = -0.44;
      swordGroup.add(pommel);

      heroGroup.add(swordGroup);

      // Shield in Left Hand
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.08), primaryMat);
      shield.position.set(-0.72, 0.8, 0.3);
      shield.rotation.y = 0.35;
      heroGroup.add(shield);
    } else if (characterClass === 'Mage') {
      // Arcane Staff
      const staffPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), armorMat);
      staffPole.position.set(0.75, 1.1, 0.2);
      heroGroup.add(staffPole);

      // Levitating Mana Crystal atop Staff
      const staffOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glowMat);
      staffOrb.position.set(0.75, 2.35, 0.2);
      heroGroup.add(staffOrb);

      // Orbiting Spell Halo (Left Hand)
      const spellRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.03, 16, 32),
        new THREE.MeshBasicMaterial({ color: glowColor, wireframe: true })
      );
      spellRing.position.set(-0.7, 0.9, 0.4);
      spellRing.rotation.x = Math.PI / 2;
      heroGroup.add(spellRing);
    } else if (characterClass === 'Rogue') {
      // Dual Daggers
      const daggerR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7, 4), primaryMat);
      daggerR.position.set(0.7, 0.6, 0.35);
      daggerR.rotation.x = Math.PI;
      heroGroup.add(daggerR);

      const daggerL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7, 4), primaryMat);
      daggerL.position.set(-0.7, 0.6, 0.35);
      daggerL.rotation.x = Math.PI;
      heroGroup.add(daggerL);
    } else if (characterClass === 'Paladin') {
      // Warhammer of Light
      const hammerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), armorMat);
      hammerPole.position.set(0.75, 0.95, 0.2);
      heroGroup.add(hammerPole);

      const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.65), primaryMat);
      hammerHead.position.set(0.75, 1.9, 0.2);
      heroGroup.add(hammerHead);

      // Sun Shield
      const sunShield = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 8), armorMat);
      sunShield.position.set(-0.75, 0.85, 0.32);
      sunShield.rotation.x = Math.PI / 2;
      heroGroup.add(sunShield);
    }

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(primaryColor, 2.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(glowColor, 2, 8);
    bottomGlow.position.set(0, -0.6, 2);
    scene.add(bottomGlow);

    // ==========================================
    // 4. INTERACTIVE 360° MOUSE DRAG & PHYSICS
    // ==========================================
    let isDragging = false;
    let previousMouseX = 0;
    let rotationVelocity = 0.006;
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
        heroGroup.rotation.y += deltaX * 0.015;
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
          heroGroup.rotation.y += deltaX * 0.015;
          previousMouseX = e.touches[0].clientX;
        }
      });
      window.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    // ==========================================
    // 5. ANIMATION LOOP (BREATHING & SWAY)
    // ==========================================
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getElapsedTime();

      // Humanoid breathing / idle stance bounce
      heroGroup.position.y = Math.sin(delta * 2.2) * 0.06 - 0.5;
      chestMesh.scale.x = 1 + Math.sin(delta * 2.2) * 0.03;
      chestMesh.scale.z = 1 + Math.sin(delta * 2.2) * 0.03;

      // Head slight look & tracking
      headGroup.rotation.y = Math.sin(delta * 1.5) * 0.1 + mouseX * 0.15;
      headGroup.rotation.x = Math.sin(delta * 2.0) * 0.05 + mouseY * 0.1;

      // Arms slight breathing swing
      leftArmGroup.rotation.x = Math.sin(delta * 1.8) * 0.08;
      rightArmGroup.rotation.x = -Math.sin(delta * 1.8) * 0.08;

      // Cape flowing flutter
      capeMesh.rotation.x = 0.12 + Math.sin(delta * 3.5) * 0.08;

      // Chest core pulse
      chestCore.rotation.y = delta * 2.5;

      // Continuous 360° drift if not dragged
      if (!isDragging) {
        heroGroup.rotation.y += rotationVelocity;
        rotationVelocity += (0.006 - rotationVelocity) * 0.02;

        targetTiltX += (mouseY * 0.15 - targetTiltX) * 0.05;
        heroGroup.rotation.x = targetTiltX;
      }

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
      jawGeo.dispose();
      chestGeo.dispose();
      waistGeo.dispose();
      skinMat.dispose();
      armorMat.dispose();
      primaryMat.dispose();
      clothMat.dispose();
      glowMat.dispose();
      metalMat.dispose();
      renderer.dispose();
    };
  }, [characterClass, size, interactive]);

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{ width: size, height: size }}
      title="Click and drag to spin 3D character 360°"
    />
  );
};
