import * as THREE from "three";
import { buildingPlans, createPlanInteriors } from "./planInteriors";

type BoxBuilder = (parent: THREE.Group, x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => THREE.Mesh;
interface BuildingParts {
  floors: THREE.Group[];
  facades: THREE.Group[];
  roof: THREE.Group;
  entrance: THREE.Group;
  site: THREE.Group;
  materials: Record<string, THREE.MeshStandardMaterial>;
  box: BoxBuilder;
}

export function addArchitecturalDetails({ floors, facades, roof, entrance, site, materials, box }: BuildingParts) {
  const metal = materials.trim;
  const accent = new THREE.MeshStandardMaterial({ color: "#b8ac8f", roughness: 0.9 });
  const partitions: THREE.Group[] = [];
  const arch = (width: number, height: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(width / 2, height - 0.45);
    shape.quadraticCurveTo(width / 2, height, 0, height);
    shape.quadraticCurveTo(-width / 2, height, -width / 2, height - 0.45);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  };

  floors.forEach((floor, index) => {
    const facade = facades[index];
    const height = index === 0 ? 4.4 : 3.9;
    const wingWidth = 67.055 - 17.3;
    for (const side of [-1, 1]) {
      const centre = side * (67.055 + 17.3) / 2;
      // Deep window reveals, vertical fins and horizontal mullions at the front.
      box(facade, centre, 0.35, 29.2, wingWidth + 0.6, 0.22, 1.25, accent);
      box(facade, centre, height - 0.32, 29.3, wingWidth + 1.2, 0.18, 1.7, materials.slab);
      box(facade, centre, 2.15, 28.83, wingWidth, 0.1, 0.15, metal);
      for (let bay = 0; bay < 16; bay++) {
        const x = side * (17.3 + (bay + 0.5) * wingWidth / 16);
        box(facade, x, height / 2 + 0.25, 28.85, 0.12, height - 1.2, 0.2, metal);
      }
      for (const x of [side * 31.6, side * 43.7, side * 55.8]) {
        box(facade, x, height / 2, 29.45, 1.25, height, 1.35, accent);
        box(facade, x, height / 2, 30.16, 0.18, height, 0.12, materials.wall);
      }
      // Arched side-window heads are visible on sheet A06.
      for (let bay = 0; bay < 9; bay++) {
        const z = -25.595 + bay * 6.3;
        const frame = new THREE.Mesh(arch(3.9, 2.55), metal);
        frame.rotation.y = side * Math.PI / 2;
        frame.position.set(side * 67.29, 0.95, z);
        facade.add(frame);
        const pane = new THREE.Mesh(arch(3.5, 2.17), materials.glass);
        pane.rotation.y = side * Math.PI / 2;
        pane.position.set(side * 67.31, 1.08, z);
        facade.add(pane);
        box(facade, side * 67.35, 2.15, z, 0.12, 2.1, 0.09, metal);
        box(facade, side * 67.35, 1.06, z, 0.38, 0.13, 4.1, materials.slab);
      }

    }
    const outline = buildingPlans[index].outline;
    for (let edge = 0; edge < outline.length; edge++) {
      const [x1, z1] = outline[edge];
      const [x2, z2] = outline[(edge + 1) % outline.length];
      const outerX = Math.abs(Math.abs(x1) - 67.055) < 0.15 && Math.abs(Math.abs(x2) - 67.055) < 0.15;
      const outerZ = Math.abs(Math.abs(z1) - 28.595) < 0.15 && Math.abs(Math.abs(z2) - 28.595) < 0.15;
      if (outerX || outerZ) continue;
      const length = Math.hypot(x2 - x1, z2 - z1);
      const glass = box(facade, (x1 + x2) / 2, 1.8, (z1 + z2) / 2, length, 2.8, 0.12, materials.glass);
      glass.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      for (const railHeight of [0.4, 1.35]) {
        const rail = box(facade, (x1 + x2) / 2, railHeight, (z1 + z2) / 2, length, 0.1, 0.16, metal);
        rail.rotation.y = glass.rotation.y;
      }
      for (let post = 0; post <= Math.ceil(length / 3); post++) {
        const t = post / Math.ceil(length / 3);
        box(facade, x1 + (x2 - x1) * t, 1.8, z1 + (z2 - z1) * t, 0.12, 2.8, 0.12, metal);
      }
    }
    partitions.push(createPlanInteriors(floor, index, box, materials.wall));
  });

  // Roof coping follows the stepped third-floor outline.
  const roofOutline = buildingPlans[2].outline;
  roofOutline.forEach(([x1, z1], edge) => {
    const [x2, z2] = roofOutline[(edge + 1) % roofOutline.length];
    const length = Math.hypot(x2 - x1, z2 - z1);
    const angle = -Math.atan2(z2 - z1, x2 - x1);
    const parapet = box(roof, (x1 + x2) / 2, 15.05, (z1 + z2) / 2, length, 0.65, 0.3, materials.wall);
    parapet.rotation.y = angle;
    const coping = box(roof, (x1 + x2) / 2, 15.4, (z1 + z2) / 2, length + 0.15, 0.12, 0.55, metal);
    coping.rotation.y = angle;
  });
  for (const radius of [4.8, 9.6, 14.3]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.12, 6, 64), metal);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 10.6 + Math.sqrt(1 - (radius / 14.3) ** 2) * 3.45, 26.595);
    roof.add(ring);
  }

  // The entrance has a raised circular podium, column bases and a glazed canopy.
  for (const x of [-13.5, 13.5]) {
    for (const y of [1.9, 9.9]) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.35, 20), materials.slab);
      base.position.set(x, y, 27.595);
      entrance.add(base);
    }
  }
  for (let segment = 0; segment <= 28; segment++) {
    const angle = segment / 28 * Math.PI;
    const x = Math.cos(angle) * 16.8;
    const z = 26.595 + Math.sin(angle) * 16.8;
    box(entrance, x, 1.1, z, 0.07, 0.9, 0.07, metal);
  }
  const curvedRail = new THREE.Mesh(new THREE.TorusGeometry(16.8, 0.06, 6, 64, Math.PI), metal);
  curvedRail.rotation.x = Math.PI / 2;
  curvedRail.position.set(0, 1.55, 26.595);
  entrance.add(curvedRail);
  // A gently rising side ramp and landing, matching the access route in A03.
  const ramp = box(entrance, 25, 0.82, 32.5, 18, 0.22, 3.2, materials.paving);
  ramp.rotation.z = -Math.atan2(1.5, 18);
  box(entrance, 16, 1.55, 32.5, 3, 0.25, 3.2, materials.slab);
  for (const z of [30.95, 34.05]) {
    const rail = box(entrance, 25, 1.75, z, 18, 0.07, 0.07, metal);
    rail.rotation.z = ramp.rotation.z;
    for (let post = 0; post <= 6; post++) {
      const x = 16 + post * 3;
      box(entrance, x, 1.25 - (x - 16) / 18 * 1.5 + 0.45, z, 0.08, 0.9, 0.08, metal);
    }
  }
  for (const x of [-26, 26]) {
    box(entrance, x, 3.05, 28.9, 3.8, 2.8, 0.2, metal);
    box(entrance, x, 3.05, 29.04, 3.45, 2.5, 0.12, materials.glass);
    box(entrance, x, 3.05, 29.15, 0.09, 2.5, 0.09, materials.wall);
    box(entrance, x, 4.65, 29.4, 5.5, 0.2, 3.2, materials.slab);
  }

  // Entrance paving joints. The full site layout is built from sheet A02.
  for (let joint = -30; joint <= 30; joint += 3) {
    box(site, joint, 0.16, 40, 0.025, 0.02, 12, metal);
  }
  for (const z of [36, 40, 44]) box(site, 0, 0.16, z, 66, 0.02, 0.025, metal);
  return partitions;
}
