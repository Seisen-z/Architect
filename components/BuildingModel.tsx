"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createBuilding, FLOOR_NAMES, FLOOR_LEVELS, ModelOptions } from "@/lib/buildingGeometry";

import { buildingPlans, PlanRoom } from "@/lib/planInteriors";

type View = "perspective" | "front" | "rear" | "top" | "site";
interface ViewerActions {
  update: (options: ModelOptions, rotate: boolean) => void;
  view: (view: View) => void;
  zoom: (factor: number) => void;
  orbit: (angle: number) => void;
  focusRoom: (floor: number, room: PlanRoom) => void;
}

export default function BuildingModel({ onFloorChange }: { onFloorChange?: (floor: number | null) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<ViewerActions | null>(null);
  const [view, setView] = useState<View>("perspective");
  const [roomId, setRoomId] = useState("");
  const [floor, setFloor] = useState<number | null>(null);
  const [exploded, setExploded] = useState(false);
  const [roof, setRoof] = useState(true);
  const [plans, setPlans] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setError("The 3D viewer needs WebGL. You can still view the original floor plan below.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#dce8df");
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-label", "Three-dimensional NGC building model. Drag to orbit, scroll or pinch to zoom.");
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1200);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 6, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 6;
    controls.maxDistance = 400;
    controls.maxPolarAngle = Math.PI / 2 - 0.025;
    controls.autoRotateSpeed = 0.7;
    scene.add(new THREE.HemisphereLight("#ffffff", "#727b62", 2.6));
    const sun = new THREE.DirectionalLight("#fff1d4", 3.2);
    sun.position.set(-70, 110, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 100, bottom: -100, near: 1, far: 300 });
    sun.shadow.normalBias = 0.12;
    scene.add(sun);
    const fill = new THREE.DirectionalLight("#dbe8ff", 1.1);
    fill.position.set(90, 40, -80);
    scene.add(fill);
    let disposed = false;
    const building = createBuilding(scene, () => { if (!disposed) renderer.render(scene, camera); });
    building.update({ floor: null, exploded: false, roof: true, plans: false });

    let currentFloor: number | null = null;
    let separated = false;
    const marker = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.1, 32), new THREE.MeshBasicMaterial({ color: "#2b7b7b", side: THREE.DoubleSide, depthTest: false }));
    marker.rotation.x = -Math.PI / 2;
    marker.visible = false;
    marker.renderOrder = 10;
    scene.add(marker);
    const positionView = (view: View) => {
      marker.visible = false;
      controls.target.set(0, currentFloor === null ? (separated ? 14 : 6) : FLOOR_LEVELS[currentFloor - 1] + 0.5, view === "site" ? -20 : 0);
      const target = controls.target;
      const distance = host.clientWidth < 600 ? 260 : 180;
      const positions: Record<View, THREE.Vector3> = {
        perspective: new THREE.Vector3(distance * 0.65, distance * 0.5, distance * 0.8),
        front: new THREE.Vector3(0, 32, distance),
        rear: new THREE.Vector3(0, 38, -distance),
        top: new THREE.Vector3(0, distance, 0.01),
        site: new THREE.Vector3(260, 240, 280),
      };
      camera.position.copy(positions[view]).add(target);
      controls.update();
    };
    positionView("perspective");
    const resize = new ResizeObserver(() => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    resize.observe(host);
    actionsRef.current = {
      update(options, rotate) {
        building.update(options);
        currentFloor = options.floor;
        separated = options.exploded;
        controls.autoRotate = rotate;
        controls.target.y = options.floor === null ? (options.exploded ? 14 : 6) : FLOOR_LEVELS[options.floor - 1] + 0.5;
        controls.update();
      },
      view: positionView,
      focusRoom(level, room) {
        const height = FLOOR_LEVELS[level - 1] + (separated ? (level - 1) * 8 : 0);
        marker.position.set(room.x, height + 0.4, room.z);
        marker.visible = true;
        controls.target.set(room.x, height + 0.7, room.z);
        camera.position.set(room.x + 10, height + 13, room.z + 14);
        controls.update();
      },
      zoom(factor) {
        const offset = camera.position.clone().sub(controls.target);
        offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
        camera.position.copy(controls.target).add(offset);
        controls.update();
      },
      orbit(angle) {
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.position.copy(controls.target).add(offset);
        controls.update();
      },
    };
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });
    setReady(true);
    return () => {
      disposed = true;
      actionsRef.current = null;
      resize.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      building.dispose();
      marker.geometry.dispose();
      marker.material.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    actionsRef.current?.update({ floor, exploded, roof, plans }, rotating);
  }, [floor, exploded, roof, plans, rotating, ready]);

  useEffect(() => {
    actionsRef.current?.view(view);
  }, [view, floor, exploded, ready]);

  const rooms = floor === null ? [] : buildingPlans[floor - 1].rooms;
  const selectedRoom = rooms.find(room => room.id === roomId);
  const buttonClass = "border border-stone-700 px-3 py-2 text-sm text-stone-300 transition-colors hover:border-architect-400 hover:text-architect-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-architect-400 disabled:opacity-40";
  return (
    <div className="w-full bg-stone-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 p-3 sm:p-4">
        <label className="mr-auto flex items-center gap-2 text-sm text-stone-300">
          Level
          <select
            aria-label="Model floor"
            value={floor ?? "all"}
            onChange={event => {
              const value = event.target.value === "all" ? null : Number(event.target.value);
              setFloor(value);
              setRoomId("");
              setView(value === null ? "perspective" : "top");
              if (value !== null) setPlans(false);
              onFloorChange?.(value);

            }}
            className="max-w-[210px] border border-stone-700 bg-stone-950 px-3 py-2 text-stone-200"
          >
            <option value="all">Whole building</option>
            {FLOOR_NAMES.map((name, index) => <option value={index + 1} key={name}>{name}</option>)}
          </select>
        </label>
        <label className="flex min-w-0 basis-full sm:basis-auto sm:flex-1 items-center gap-2 text-sm text-stone-300">
          Room
          <select
            aria-label="Inspect a room"
            disabled={floor === null}
            value={roomId}
            onChange={event => {
              setRoomId(event.target.value);
              setPlans(false);
              const room = rooms.find(item => item.id === event.target.value);
              if (room && floor !== null) actionsRef.current?.focusRoom(floor, room);
            }}
            className="w-full min-w-0 max-w-[340px] border border-stone-700 bg-stone-950 px-3 py-2 disabled:text-stone-500"
          >
            <option value="">{floor === null ? "Choose a floor first" : "Select a room"}</option>
            {rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
          </select>
        </label>
        <button className={buttonClass} aria-pressed={exploded} onClick={() => { setExploded(value => !value); setPlans(false); }}>Separate floors</button>
        <button className={buttonClass} aria-pressed={plans} onClick={() => setPlans(value => !value)}>Floor drawings</button>
        <button className={buttonClass} aria-pressed={roof} disabled={floor !== null || exploded} onClick={() => setRoof(value => !value)}>Roof</button>
      </div>
      <div
        className="relative h-[420px] sm:h-[560px] lg:h-[650px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-architect-400"
        tabIndex={0}
        aria-label="Building model controls. Use left and right arrow keys to rotate. Plus and minus zoom."
        onKeyDown={event => {
          const actions = actionsRef.current;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            actions?.orbit(event.key === "ArrowLeft" ? -Math.PI / 12 : Math.PI / 12);
          }
          if (event.key === "+" || event.key === "=") actions?.zoom(0.85);
          if (event.key === "-") actions?.zoom(1.15);
        }}
      >
        <div ref={hostRef} className="absolute inset-0 touch-none" />
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-stone-950 p-6 text-center text-stone-300">
            <p role="status">{error}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/drawings/ground-floor.png" alt="Original NGC ground floor drawing, sheet A03" className="max-h-[65%] object-contain" />
          </div>
        ) : !ready && <p className="absolute inset-0 flex items-center justify-center text-stone-400" role="status">Loading building model…</p>}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="h-10 w-10 border border-stone-300 bg-stone-950/95 text-xl text-stone-100 shadow" aria-label="Zoom in" onClick={() => actionsRef.current?.zoom(0.85)}>+</button>
          <button className="h-10 w-10 border border-stone-300 bg-stone-950/95 text-xl text-stone-100 shadow" aria-label="Zoom out" onClick={() => actionsRef.current?.zoom(1.15)}>−</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-stone-800 p-3 sm:p-4">
        {([['perspective', 'Building'], ['site', 'Site overview'], ['front', 'Front'], ['rear', 'Rear'], ['top', 'Top']] as const).map(([view, label]) => (
          <button className={buttonClass} onClick={() => { setRoomId(""); if (view === "site") { setFloor(null); onFloorChange?.(null); } setView(view); actionsRef.current?.view(view); }} key={view}>{label}</button>
        ))}
        <button className={buttonClass + " sm:ml-auto"} aria-pressed={rotating} onClick={() => setRotating(value => !value)}>{rotating ? "Pause rotation" : "Rotate automatically"}</button>
      </div>
      <div className="space-y-1 border-t border-stone-800 px-4 py-3 text-sm leading-relaxed text-stone-400">
        <p>Drag to rotate 360°. Scroll or pinch to zoom. Choose a floor, then a room, to inspect doors and furniture.</p>
        {selectedRoom && <p className="text-architect-400" role="status">Inspecting {selectedRoom.name}</p>}
        <p>Building and site follow sheets A02–A06. Wall outlines and furniture locations are extracted from the floor plans. Furniture forms, finishes, vehicles, and auxiliary building heights are schematic.</p>
      </div>
    </div>
  );
}
