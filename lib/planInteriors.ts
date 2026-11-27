import * as THREE from "three";
import planData from "./buildingPlan.json";

export interface PlanRoom { id: string; name: string; x: number; z: number }
interface PlanDoor { hinge: number[]; width: number; angle: number; closedAngle: number }
interface PlanObject { id: string; type: string; x: number; z: number; w: number; d: number; door?: PlanDoor }
interface FloorPlan {
  level: number;
  outline: number[][];
  walls: { line: number[]; thickness: number }[];
  objects: PlanObject[];
  rooms: PlanRoom[];
}
export const buildingPlans = planData as FloorPlan[];
type BoxBuilder = (parent: THREE.Group, x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => THREE.Mesh;

export function createPlanInteriors(floor: THREE.Group, level: number, box: BoxBuilder, wallMaterial: THREE.Material) {
  const plan = buildingPlans[level];
  const interior = new THREE.Group();
  interior.visible = false;
  floor.add(interior);
  const wood = new THREE.MeshStandardMaterial({ color: "#a67e53", roughness: 0.7 });
  const upholstery = new THREE.MeshStandardMaterial({ color: "#354953", roughness: 0.9 });
  const metal = new THREE.MeshStandardMaterial({ color: "#636b70", metalness: 0.35, roughness: 0.5 });
  const cabinet = new THREE.MeshStandardMaterial({ color: "#b7b7a5", roughness: 0.8 });
  const ceramic = new THREE.MeshStandardMaterial({ color: "#f0eee5", roughness: 0.4 });
  const screen = new THREE.MeshStandardMaterial({ color: "#182c3c", emissive: "#17314b", emissiveIntensity: 0.25, roughness: 0.35 });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: "#8d623c", roughness: 0.65 });

  // These segmented wall outlines retain the openings present in the PDF.
  for (const wall of plan.walls) {
    const [x1, z1, x2, z2] = wall.line;
    const length = Math.hypot(x2 - x1, z2 - z1);
    const mesh = box(interior, (x1 + x2) / 2, 1.68, (z1 + z2) / 2, length, 2.7, wall.thickness, wallMaterial);
    mesh.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
  }
  for (const item of plan.objects) {
    if (item.type === "tree") continue;
    if (item.type === "door" && item.door) {
      const door = item.door;
      const [x, z] = door.hinge;
      const dx = Math.cos(door.angle) * door.width;
      const dz = Math.sin(door.angle) * door.width;
      const leaf = box(interior, x + dx / 2, 1.4, z + dz / 2, door.width, 2.1, 0.045, doorMaterial);
      leaf.rotation.y = -door.angle;
      const closedX = Math.cos(door.closedAngle) * door.width;
      const closedZ = Math.sin(door.closedAngle) * door.width;
      for (const end of [0, 1]) {
        box(interior, x + closedX * end, 1.45, z + closedZ * end, 0.09, 2.25, 0.12, wood);
      }
      const header = box(interior, x + closedX / 2, 2.58, z + closedZ / 2, door.width + 0.1, 0.12, 0.13, wood);
      header.rotation.y = -door.closedAngle;
      box(interior, x + dx * 0.85, 1.35, z + dz * 0.85 + 0.055, 0.12, 0.04, 0.04, metal);
      continue;
    }
    const { x, z, w, d } = item;
    // Fixtures in the corner comfort rooms use their original symbol footprints.
    const isComfortRoom = Math.abs(x) > 53 && (z < -23 || z > 24);
    if (isComfortRoom && Math.max(w, d) < 1.5) {
      box(interior, x, 0.75, z, w * 0.8, 0.8, d * 0.8, ceramic);
      box(interior, x, 1.18, z, w * 0.9, 0.08, d * 0.9, ceramic);
      continue;
    }
    if (item.type === "chair") {
      const seatWidth = Math.min(w * 0.8, 0.7);
      const seatDepth = Math.min(d * 0.8, 0.7);
      box(interior, x, 0.82, z, seatWidth, 0.12, seatDepth, upholstery);
      box(interior, x, 1.12, z + seatDepth * 0.4, seatWidth, 0.55, 0.09, upholstery);
      box(interior, x, 0.56, z, 0.09, 0.45, 0.09, metal);
      box(interior, x, 0.36, z, seatWidth * 0.85, 0.05, 0.05, metal);
      box(interior, x, 0.36, z, 0.05, 0.05, seatDepth * 0.85, metal);
      continue;
    }
    if (Math.min(w, d) < 0.55) {
      // Narrow storage and counter symbols retain their drawn dimensions.
      box(interior, x, 1.05, z, w, 1.4, d, cabinet);
      box(interior, x, 1.78, z, w + 0.04, 0.08, d + 0.04, wood);
      continue;
    }
    const tableHeight = item.type === "meeting" ? 1.1 : 1.12;
    if (item.type === "desk" && w > 1.2 && d > 1.2) {
      box(interior, x, tableHeight, z - d * 0.3, w, 0.1, d * 0.4, wood);
      box(interior, x - w * 0.3, tableHeight, z + d * 0.2, w * 0.4, 0.1, d * 0.6, wood);
    } else {
      box(interior, x, tableHeight, z, w, 0.1, d, wood);
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box(interior, x + sx * w * 0.38, 0.74, z + sz * d * 0.36, 0.07, 0.75, 0.07, metal);
      }
    }
    if (item.type === "desk" && Math.max(w, d) < 2.5) {
      const monitor = box(interior, x, 1.43, z - d * 0.25, Math.min(w * 0.5, 0.6), 0.36, 0.06, screen);
      if (d > w) monitor.rotation.y = Math.PI / 2;
      box(interior, x, 1.22, z - d * 0.25, 0.06, 0.2, 0.06, metal);
    }
  }
  return interior;
}
