import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { InterpretationCategory, ThemeMode } from '../types.js';

interface Ring3DSceneProps {
	activeCategory?: InterpretationCategory;
	isDegraded?: boolean;
	theme: ThemeMode;
}

export const Ring3DScene: React.FC<Ring3DSceneProps> = ({
	activeCategory,
	isDegraded = false,
	theme,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [webglSupported, setWebglSupported] = useState(true);

	const isLight = theme === 'light';
	const isContrast = theme === 'contrast';

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Check WebGL availability
		try {
			const testCanvas = document.createElement('canvas');
			if (!window.WebGLRenderingContext || !testCanvas.getContext('webgl')) {
				setWebglSupported(false);
				return;
			}
		} catch {
			setWebglSupported(false);
			return;
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const width = container.clientWidth || 320;
		const height = container.clientHeight || 280;

		const scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
		camera.position.set(0, 0, 5.2);

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance',
		});
		renderer.setSize(width, height, false);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		container.innerHTML = '';
		container.appendChild(renderer.domElement);

		// Lights tuned for light and dark environments
		const ambientLight = new THREE.AmbientLight(
			0xffffff,
			isContrast ? 1.5 : isLight ? 1.2 : 0.85
		);
		scene.add(ambientLight);

		const keyLight = new THREE.DirectionalLight(isLight ? 0x0284c7 : 0x38bdf8, isLight ? 2.8 : 2.2);
		keyLight.position.set(4, 5, 4);
		scene.add(keyLight);

		const fillLight = new THREE.DirectionalLight(0xffffff, isLight ? 1.6 : 1.2);
		fillLight.position.set(-4, -2, -2);
		scene.add(fillLight);

		// Group for Doorbell device
		const doorbellGroup = new THREE.Group();
		scene.add(doorbellGroup);

		// 1. Chassis Body (Matte Obsidian or Brushed Nickel)
		const bodyGeom = new THREE.BoxGeometry(1.4, 3.0, 0.45);
		const bodyMat = new THREE.MeshStandardMaterial({
			color: isContrast ? 0x000000 : isLight ? 0x334155 : 0x1e293b,
			metalness: isContrast ? 0.0 : isLight ? 0.8 : 0.7,
			roughness: isContrast ? 0.1 : isLight ? 0.25 : 0.35,
			wireframe: isContrast,
		});
		const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
		doorbellGroup.add(bodyMesh);

		// 2. Upper Gloss Camera Plate
		const cameraPlateGeom = new THREE.BoxGeometry(1.36, 1.4, 0.48);
		const cameraPlateMat = new THREE.MeshStandardMaterial({
			color: 0x0a0f1d,
			metalness: 0.9,
			roughness: 0.08,
		});
		const cameraPlate = new THREE.Mesh(cameraPlateGeom, cameraPlateMat);
		cameraPlate.position.set(0, 0.75, 0.01);
		doorbellGroup.add(cameraPlate);

		// 3. Camera Lens Assembly
		const lensRingGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 32);
		lensRingGeom.rotateX(Math.PI / 2);
		const lensRingMat = new THREE.MeshStandardMaterial({
			color: 0x475569,
			metalness: 0.95,
			roughness: 0.15,
		});
		const lensRing = new THREE.Mesh(lensRingGeom, lensRingMat);
		lensRing.position.set(0, 0.9, 0.26);
		doorbellGroup.add(lensRing);

		const lensGeom = new THREE.SphereGeometry(0.24, 32, 16);
		lensGeom.scale(1, 1, 0.4);
		const lensMat = new THREE.MeshPhysicalMaterial({
			color: 0x0284c7,
			metalness: 0.3,
			roughness: 0.05,
			transmission: 0.9,
			thickness: 0.5,
			clearcoat: 1.0,
		});
		const lens = new THREE.Mesh(lensGeom, lensMat);
		lens.position.set(0, 0.9, 0.31);
		doorbellGroup.add(lens);

		// 4. Lower Satin Faceplate
		const faceplateGeom = new THREE.BoxGeometry(1.36, 1.5, 0.47);
		const faceplateMat = new THREE.MeshStandardMaterial({
			color: isContrast ? 0xffffff : isLight ? 0x94a3b8 : 0x475569,
			metalness: isContrast ? 0.0 : isLight ? 0.85 : 0.6,
			roughness: isContrast ? 0.1 : isLight ? 0.3 : 0.4,
		});
		const faceplate = new THREE.Mesh(faceplateGeom, faceplateMat);
		faceplate.position.set(0, -0.72, 0.01);
		doorbellGroup.add(faceplate);

		// 5. Chime Button & Glowing LED Ring Halo
		const buttonBaseGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32);
		buttonBaseGeom.rotateX(Math.PI / 2);
		const buttonBaseMat = new THREE.MeshStandardMaterial({
			color: isLight ? 0x1e293b : 0x0f172a,
			metalness: 0.6,
			roughness: 0.3,
		});
		const buttonBase = new THREE.Mesh(buttonBaseGeom, buttonBaseMat);
		buttonBase.position.set(0, -0.65, 0.26);
		doorbellGroup.add(buttonBase);

		// Concentric LED Chime Ring
		const ledRingGeom = new THREE.TorusGeometry(0.35, 0.04, 16, 64);
		const ledRingMat = new THREE.MeshStandardMaterial({
			color: 0x0284c7,
			emissive: 0x0284c7,
			emissiveIntensity: 2.8,
			roughness: 0.15,
		});
		const ledRing = new THREE.Mesh(ledRingGeom, ledRingMat);
		ledRing.position.set(0, -0.65, 0.28);
		doorbellGroup.add(ledRing);

		// 6. Sonar / Radar Rings
		const sonarRings: THREE.Mesh[] = [];
		const sonarCount = 3;
		for (let i = 0; i < sonarCount; i++) {
			const ringGeom = new THREE.TorusGeometry(0.7 + i * 0.45, 0.018, 8, 48);
			const ringMat = new THREE.MeshBasicMaterial({
				color: 0x0284c7,
				transparent: true,
				opacity: 0.3 - i * 0.08,
			});
			const ringMesh = new THREE.Mesh(ringGeom, ringMat);
			ringMesh.position.set(0, -0.65, 0.2);
			doorbellGroup.add(ringMesh);
			sonarRings.push(ringMesh);
		}

		// Category theme color resolver
		const getThemeColor = () => {
			if (isDegraded) return 0xf43f5e; // Rose / red
			if (isContrast) return 0xfacc15; // Yellow
			switch (activeCategory) {
				case 'Possible delivery':
					return 0xf59e0b; // Amber
				case 'Possible familiar-context match':
					return 0x10b981; // Emerald
				case 'Person detected, identity unknown':
					return 0x0284c7; // Sky cyan
				case 'Motion detected, person not confirmed':
					return 0x6366f1; // Indigo
				case 'Unclassified event':
				default:
					return isLight ? 0x0ea5e9 : 0x38bdf8; // Light blue
			}
		};

		// Mouse parallax interaction
		let mouseX = 0;
		let mouseY = 0;
		let targetRotationX = 0;
		let targetRotationY = 0;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;
			mouseX = x * 2;
			mouseY = y * 2;
		};

		container.addEventListener('mousemove', handleMouseMove);

		let animationFrameId: number;
		let clock = new THREE.Clock();

		const animate = () => {
			const elapsedTime = clock.getElapsedTime();
			const themeColorHex = getThemeColor();

			ledRingMat.color.setHex(themeColorHex);
			ledRingMat.emissive.setHex(themeColorHex);

			const pulse = Math.sin(elapsedTime * 4.0) * 0.6 + 2.2;
			ledRingMat.emissiveIntensity = pulse;

			sonarRings.forEach((ring, idx) => {
				const ringMat = ring.material as THREE.MeshBasicMaterial;
				ringMat.color.setHex(themeColorHex);
				const phase = (elapsedTime * 0.8 + idx * 0.3) % 1.0;
				const scale = 1.0 + phase * 0.7;
				ring.scale.set(scale, scale, 1);
				ringMat.opacity = Math.max(0, (1.0 - phase) * (isLight ? 0.45 : 0.35));
			});

			if (!prefersReducedMotion) {
				targetRotationY = mouseX * 0.45;
				targetRotationX = -mouseY * 0.35;

				doorbellGroup.rotation.y += (targetRotationY - doorbellGroup.rotation.y) * 0.08;
				doorbellGroup.rotation.x += (targetRotationX - doorbellGroup.rotation.x) * 0.08;

				doorbellGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
			}

			renderer.render(scene, camera);
			animationFrameId = requestAnimationFrame(animate);
		};

		animate();

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentRect.width;
				const h = entry.contentRect.height;
				if (w > 0 && h > 0) {
					renderer.setSize(w, h, false);
					camera.aspect = w / h;
					camera.updateProjectionMatrix();
				}
			}
		});

		resizeObserver.observe(container);

		return () => {
			cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
			container.removeEventListener('mousemove', handleMouseMove);

			bodyGeom.dispose();
			bodyMat.dispose();
			cameraPlateGeom.dispose();
			cameraPlateMat.dispose();
			lensRingGeom.dispose();
			lensRingMat.dispose();
			lensGeom.dispose();
			lensMat.dispose();
			faceplateGeom.dispose();
			faceplateMat.dispose();
			buttonBaseGeom.dispose();
			buttonBaseMat.dispose();
			ledRingGeom.dispose();
			ledRingMat.dispose();
			sonarRings.forEach((r) => {
				r.geometry.dispose();
				(r.material as THREE.Material).dispose();
			});

			renderer.dispose();
			if (container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		};
	}, [activeCategory, isDegraded, theme]);

	if (!webglSupported) {
		return (
			<div
				className={`w-full h-64 flex items-center justify-center rounded-2xl border text-xs text-center p-4 ${
					isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
				}`}
				aria-hidden="true"
			>
				3D WebGL preview unavailable on this device.
			</div>
		);
	}

	return (
		<div
			className={`relative w-full h-[280px] sm:h-[320px] flex items-center justify-center overflow-hidden rounded-2xl border select-none transition-colors ${
				isContrast
					? 'bg-black border-2 border-white'
					: isLight
					? 'bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-slate-200/90 shadow-sm'
					: 'bg-gradient-to-b from-slate-900/40 to-slate-950/80 border-slate-800/80 backdrop-blur-sm'
			}`}
			aria-hidden="true"
		>
			<div
				ref={containerRef}
				className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
			/>
			<div
				className={`absolute bottom-3 left-4 flex items-center gap-2 pointer-events-none text-[11px] font-mono px-2.5 py-1 rounded-full border backdrop-blur-xs ${
					isLight
						? 'bg-white/90 text-slate-600 border-slate-200 shadow-xs'
						: 'bg-slate-950/70 text-slate-400 border-slate-800/60'
				}`}
			>
				<span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
				<span>Live 3D Telemetry Device</span>
			</div>
			<div
				className={`absolute top-3 right-4 text-[10px] font-mono pointer-events-none hidden sm:block ${
					isLight ? 'text-slate-400' : 'text-slate-500'
				}`}
			>
				Hover / Drag to inspect
			</div>
		</div>
	);
};
export default Ring3DScene;
