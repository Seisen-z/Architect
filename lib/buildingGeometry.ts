import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { addArchitecturalDetails } from "./buildingDetails";
import { createSiteModel } from "./siteModel";
import { buildingPlans } from "./planInteriors";

// Metres, traced from NGC architectural sheets A03-A06.
const WIDTH = 134.11;
const DEPTH = 57.19;
const HALF_W = WIDTH / 2;
const HALF_D = DEPTH / 2;
const COURT_HALF_W = 17.3;
export const FLOOR_LEVELS = [1.5, 6.2, 10.4];
export const FLOOR_NAMES = ["Ground floor · A03", "Second floor · A04", "Third floor · A05"];

export interface ModelOptions {
  floor: number | null;
  exploded: boolean;
  roof: boolean;
  plans: boolean;
}

export function createBuilding(scene: THREE.Scene, onTextureLoad: () => void) {
  const root = new THREE.Group();
  scene.add(root);
  const materials = {
    wall: new THREE.MeshStandardMaterial({ color: "#ded8c7", roughness: 0.85 }),
    slab: new THREE.MeshStandardMaterial({ color: "#e9e4d7", roughness: 0.9 }),
    trim: new THREE.MeshStandardMaterial({ color: "#4b5150", roughness: 0.65 }),
    glass: new THREE.MeshStandardMaterial({ color: "#416468", metalness: 0.25, roughness: 0.26 }),
    ground: new THREE.MeshStandardMaterial({ color: "#8c9481", roughness: 1 }),
    paving: new THREE.MeshStandardMaterial({ color: "#b3afa2", roughness: 1 }),
    green: new THREE.MeshStandardMaterial({ color: "#526b47", roughness: 1 }),
  };
  const box = (parent: THREE.Group, x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const footprint = (floorIndex: number) => {
    const outline = new THREE.Shape();
    buildingPlans[floorIndex].outline.forEach(([x, z], index) => {
      if (index === 0) outline.moveTo(x, -z);
      else outline.lineTo(x, -z);
    });
    outline.closePath();
    return outline;
  };
  const slab = (parent: THREE.Group, level: number, thickness: number, floorIndex: number) => {
    const geometry = new THREE.ExtrudeGeometry(footprint(floorIndex), { depth: thickness, bevelEnabled: false });
    geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, materials.slab);
    mesh.position.y = level;
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
  };
  const site = new THREE.Group();
  root.add(site);
  const { courtyardTrees } = createSiteModel(site, box, materials);

  const floors: THREE.Group[] = [];
  const facades: THREE.Group[] = [];
  const plans: THREE.Mesh[] = [];
  const floorDrawings: THREE.Mesh[] = [];
  const loader = new THREE.TextureLoader();
  FLOOR_LEVELS.forEach((level, floorIndex) => {
    const floor = new THREE.Group();
    floor.position.y = level;
    root.add(floor);
    floors.push(floor);
    slab(floor, 0, 0.3, floorIndex);
    const facade = new THREE.Group();
    floor.add(facade);
    facades.push(facade);
    const wallHeight = floorIndex === 0 ? 4.4 : 3.9;
    // Two continuous wings, with window bays following a regular structural grid.
    for (const wingSign of [-1, 1]) {
      const wingCenter = wingSign * (HALF_W + COURT_HALF_W) / 2;
      const wingWidth = HALF_W - COURT_HALF_W;
      box(facade, wingCenter, 0.65, HALF_D, wingWidth, 0.7, 0.4, materials.wall);
      box(facade, wingCenter, wallHeight - 0.1, HALF_D, wingWidth, 0.5, 0.55, materials.wall);
      box(facade, wingCenter, wallHeight / 2 + 0.2, HALF_D - 0.05, wingWidth, wallHeight - 1.2, 0.2, materials.glass);
      box(facade, wingSign * HALF_W, wallHeight / 2, 0, 0.35, wallHeight, DEPTH, materials.wall);

      for (let bay = 0; bay <= 8; bay++) {
        const x = wingSign * (COURT_HALF_W + bay * wingWidth / 8);
        box(facade, x, wallHeight / 2 + 0.1, HALF_D + 0.18, 0.65, wallHeight, 0.8, materials.wall);
      }

    }
    if (floorIndex > 0) {
      box(facade, 0, wallHeight / 2, -HALF_D, WIDTH, wallHeight, 0.3, materials.glass);
    } else {
      for (const sign of [-1, 1]) {
        box(facade, sign * (HALF_W + COURT_HALF_W) / 2, wallHeight / 2, -HALF_D, HALF_W - COURT_HALF_W, wallHeight, 0.3, materials.glass);
      }
    }
    for (let bay = 0; bay <= 20; bay++) {
      const x = -HALF_W + bay * WIDTH / 20;
      if (floorIndex > 0 || Math.abs(x) > COURT_HALF_W) box(facade, x, wallHeight / 2, -HALF_D, 0.5, wallHeight, 0.8, materials.wall);
    }

    const texture = loader.load(`/drawings/floor-${floorIndex + 1}.png`, onTextureLoad);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const planGeometry = new THREE.PlaneGeometry(WIDTH, DEPTH);
    planGeometry.rotateX(-Math.PI / 2);
    const plan = new THREE.Mesh(planGeometry, new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    plan.position.y = 0.32;
    plan.visible = false;
    floor.add(plan);
    plans.push(plan);
    const drawingGeometry = new THREE.ShapeGeometry(footprint(floorIndex));
    drawingGeometry.rotateX(-Math.PI / 2);
    const positions = drawingGeometry.getAttribute("position");
    const uv = new Float32Array(positions.count * 2);
    for (let vertex = 0; vertex < positions.count; vertex++) {
      uv[vertex * 2] = (positions.getX(vertex) + HALF_W) / WIDTH;
      uv[vertex * 2 + 1] = (HALF_D - positions.getZ(vertex)) / DEPTH;
    }
    drawingGeometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const drawing = new THREE.Mesh(drawingGeometry, new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    drawing.position.y = 0.33;
    drawing.visible = false;
    floor.add(drawing);
    floorDrawings.push(drawing);
  });

  // Circular Ugyunan entrance hall, shown in plan A03 and elevation A06.
  const entrance = new THREE.Group();
  root.add(entrance);
  const entranceSlab = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 0.35, 64), materials.slab);
  entranceSlab.position.set(0, 1.55, HALF_D - 2);
  entranceSlab.receiveShadow = true;
  entrance.add(entranceSlab);
  for (let step = 0; step < 4; step++) {
    const geometry = new THREE.CylinderGeometry(15.3 + step * 0.5, 15.3 + step * 0.5, 0.25, 64, 1, false, -Math.PI / 2, Math.PI);
    const mesh = new THREE.Mesh(geometry, materials.paving);
    mesh.position.set(0, 1.25 - step * 0.25, HALF_D - 2);
    entrance.add(mesh);
  }
  for (const x of [-13.5, 13.5]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 8.5, 20), materials.wall);
    column.position.set(x, 5.9, HALF_D - 1);
    column.castShadow = true;
    entrance.add(column);
  }
  const roof = new THREE.Group();
  root.add(roof);
  slab(roof, 14.6, 0.35, 2);
  // A low glazed dome above the entrance, with radial ribs visible in sheet A05.
  const domeGeometry = new THREE.SphereGeometry(14.2, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  domeGeometry.scale(1, 0.24, 1);
  const dome = new THREE.Mesh(domeGeometry, new THREE.MeshStandardMaterial({ color: "#8bafae", transparent: true, opacity: 0.55, roughness: 0.25, metalness: 0.2, side: THREE.DoubleSide }));
  dome.position.set(0, 10.6, HALF_D - 2);
  roof.add(dome);
  for (let rib = 0; rib < 16; rib++) {
    const angle = rib * Math.PI * 2 / 16;
    const points: THREE.Vector3[] = [];
    for (let step = 0; step <= 20; step++) {
      const t = step / 20 * Math.PI / 2;
      points.push(new THREE.Vector3(Math.sin(t) * 14.3 * Math.cos(angle), 10.6 + Math.cos(t) * 3.45, HALF_D - 2 + Math.sin(t) * 14.3 * Math.sin(angle)));
    }
    const ribMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.09, 5, false), materials.trim);
    roof.add(ribMesh);
  }
  site.remove(courtyardTrees);
  floors[0].add(courtyardTrees);
  courtyardTrees.position.y = -FLOOR_LEVELS[0];
  const partitions = addArchitecturalDetails({ floors, facades, roof, entrance, site, materials, box });
  // Batch static details by material so the richer model stays responsive.
  const groups: THREE.Group[] = [];
  root.traverse(object => { if (object instanceof THREE.Group) groups.push(object); });
  for (const group of groups) {
    const batches = new Map<string, THREE.Mesh[]>();
    for (const child of group.children) {
      if (!(child instanceof THREE.Mesh) || !child.visible || Array.isArray(child.material)) continue;
      if ("map" in child.material && child.material.map) continue;
      const key = child.material.uuid + Boolean(child.geometry.index);
      const batch = batches.get(key) ?? [];
      batch.push(child);
      batches.set(key, batch);
    }
    for (const meshes of Array.from(batches.values())) {
      if (meshes.length < 2) continue;
      const geometries = meshes.map(mesh => {
        mesh.updateMatrix();
        return mesh.geometry.clone().applyMatrix4(mesh.matrix);
      });
      const geometry = mergeGeometries(geometries);
      geometries.forEach(item => item.dispose());
      if (!geometry) continue;
      const combined = new THREE.Mesh(geometry, meshes[0].material);
      combined.castShadow = combined.receiveShadow = true;
      meshes.forEach(mesh => { group.remove(mesh); mesh.geometry.dispose(); });
      group.add(combined);
    }
  }
  return {
    root,
    update(options: ModelOptions) {
      site.visible = options.floor === null;
      floors.forEach((floor, index) => {
        floor.visible = options.floor === null || options.floor === index + 1;
        floor.position.y = FLOOR_LEVELS[index] + (options.exploded ? index * 8 : 0);
        facades[index].visible = options.floor === null;
        plans[index].visible = options.plans && options.floor !== null;
        floorDrawings[index].visible = options.plans && options.floor === null;
        partitions[index].visible = options.exploded || options.floor !== null || !options.roof;
      });
      entrance.visible = options.floor === null || options.floor === 1;
      roof.visible = options.roof && options.floor === null && !options.exploded;
    },
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      const materialSet = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      root.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
          if (object instanceof THREE.Mesh) geometries.add(object.geometry);
          const list = Array.isArray(object.material) ? object.material : [object.material];
          list.forEach(material => {
            materialSet.add(material);
            if ("map" in material && material.map instanceof THREE.Texture) textures.add(material.map);
          });
        }
      });
      geometries.forEach(geometry => geometry.dispose());
      materialSet.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
      scene.remove(root);
    },
  };
}
