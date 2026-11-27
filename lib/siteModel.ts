import * as THREE from "three";
import { buildingPlans } from "./planInteriors";

type BoxBuilder = (parent: THREE.Group, x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) => THREE.Mesh;

// A02 is rotated relative to the floor-plan sheets. Coordinates below are
// traced in its 1600px sheet image, then registered to the NGC footprint.
function sitePoint(px: number, py: number): [number, number] {
  return [(py - 496.5) * 134.11 / 301, (831 - px) * 57.19 / 130];
}

export function createSiteModel(site: THREE.Group, box: BoxBuilder, materials: Record<string, THREE.MeshStandardMaterial>) {
  const asphalt = new THREE.MeshStandardMaterial({ color: "#42494b", roughness: 0.95 });
  const marking = new THREE.MeshStandardMaterial({ color: "#ece8d6", roughness: 0.9 });
  const soil = new THREE.MeshStandardMaterial({ color: "#62664f", roughness: 1 });
  const foliage = new THREE.MeshStandardMaterial({ color: "#426044", roughness: 1 });
  const trunk = new THREE.MeshStandardMaterial({ color: "#695841", roughness: 1 });
  const tyre = new THREE.MeshStandardMaterial({ color: "#25282b", roughness: 0.95 });
  const carGlass = new THREE.MeshStandardMaterial({ color: "#789597", metalness: 0.3, roughness: 0.25 });
  const carColours = ["#d3d5d3", "#497086", "#936654", "#555c64", "#b7b2a3"].map(color => new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.45 }));
  const boundaryPoints = [[662,161],[800,189],[1118,339],[1038,784],[662,784]].map(([x,y]) => sitePoint(x,y));
  const boundary = new THREE.Shape();
  boundaryPoints.forEach(([x,z],index) => index === 0 ? boundary.moveTo(x,-z) : boundary.lineTo(x,-z));
  boundary.closePath();
  const siteGeometry = new THREE.ExtrudeGeometry(boundary, { depth: 0.6, bevelEnabled: false });
  siteGeometry.rotateX(-Math.PI / 2);
  const plot = new THREE.Mesh(siteGeometry, materials.ground);
  plot.position.y = -0.65;
  plot.receiveShadow = true;
  site.add(plot);

  const line = (x1: number, z1: number, x2: number, z2: number, width: number, material: THREE.Material, y = 0.025) => {
    const mesh = box(site, (x1+x2)/2, y, (z1+z2)/2, Math.hypot(x2-x1,z2-z1), 0.045, width, material);
    mesh.rotation.y = -Math.atan2(z2-z1,x2-x1);
    mesh.castShadow = false;
    return mesh;
  };
  const road = (points: number[][], width: number) => {
    const world = points.map(([x,y]) => sitePoint(x,y));
    for(let i=1;i<world.length;i++) line(...world[i-1],...world[i],width,asphalt);
  };
  // The highway frontage and the continuous internal service loop on A02.
  road([[639,140],[639,804]],18);
  road([[674,317],[735,317],[930,317],[930,694],[735,694],[674,694]],6.5);
  road([[735,317],[735,694]],6.5);
  road([[930,500],[985,500]],8);
  road([[985,330],[985,500],[953,785],[674,785]],6);
  for(let x=-150;x<130;x+=12) line(x,84.5,x+6,84.5,0.16,marking,0.06);
  // Pedestrian apron around the actual 134.11 x 57.19m building footprint.
  box(site,0,0.08,0,142,0.14,65,materials.paving);
  box(site,0,0.17,-11.5,29,0.1,31,soil);
  const frontAccess=sitePoint(762,502);
  line(frontAccess[0],31,frontAccess[0],60,5.5,materials.paving,0.09);

  const car = (x: number,z: number,angle: number,index: number) => {
    const group = new THREE.Group();
    group.position.set(x,0.07,z);
    group.rotation.y = angle;
    site.add(group);
    const body = carColours[index % carColours.length];
    box(group,0,0.66,0,1.78,0.65,4.2,body);
    box(group,0,1.12,-0.1,1.55,0.6,2.2,carGlass);
    box(group,0,1.47,-0.1,1.58,0.12,1.65,body);
    for(const side of [-1,1]){
      for(const zWheel of [-1.25,1.25]){
        const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.33,0.2,12),tyre);
        wheel.rotation.z=Math.PI/2;
        wheel.position.set(side*0.9,0.38,zWheel);
        group.add(wheel);
      }
      box(group,side*0.52,0.72,2.13,0.42,0.15,0.05,marking);
    }
  };
  let vehicleIndex=0;
  const parkingRow = (start: number[],end: number[],depth: number) => {
    const a=sitePoint(start[0],start[1]),b=sitePoint(end[0],end[1]);
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const count=Math.max(1,Math.floor(length/2.5));
    const ux=(b[0]-a[0])/length,uz=(b[1]-a[1])/length;
    const nx=-uz,nz=ux;
    line(...a,...b,depth+0.5,asphalt,0.03);
    for(let bay=0;bay<=count;bay++){
      const t=bay/count;
      const x=a[0]+ux*length*t,z=a[1]+uz*length*t;
      line(x-nx*depth/2,z-nz*depth/2,x+nx*depth/2,z+nz*depth/2,0.065,marking,0.065);
      if(bay<count&&bay%3===1){
        const cx=x+ux*length/count/2,cz=z+uz*length/count/2;
        car(cx,cz,Math.atan2(nx,nz),vehicleIndex++);
      }
    }
    line(a[0]-nx*depth/2,a[1]-nz*depth/2,b[0]-nx*depth/2,b[1]-nz*depth/2,0.09,marking,0.065);
  };
  // Stall-row locations are traced from the site's parking bands.
  parkingRow([715,338],[715,476],5);
  parkingRow([715,551],[715,662],5);
  parkingRow([912,354],[912,481],5);
  parkingRow([912,520],[912,647],5);
  parkingRow([950,525],[950,686],5);
  parkingRow([760,331],[813,331],5);
  parkingRow([852,665],[910,665],5);
  parkingRow([812,705],[861,705],5);

  const auxiliary = (name: string,px1: number,py1: number,px2: number,py2: number,height: number) => {
    const a=sitePoint(px1,py1),b=sitePoint(px2,py2);
    const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,w=Math.abs(b[0]-a[0]),d=Math.abs(b[1]-a[1]);
    box(site,x,height/2,z,w,height,d,materials.wall);
    box(site,x,height+0.12,z,w+0.7,0.3,d+0.7,materials.trim);
    box(site,x,1.5,z+d/2+0.02,Math.min(w*0.6,8),2.8,0.08,materials.glass);
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=80;
    const context=canvas.getContext('2d');
    if(context){context.fillStyle='#26322d';context.font='600 36px Arial';context.textAlign='center';context.fillText(name,256,52);}
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));
    label.position.set(x,height+3,z);label.scale.set(22,3.5,1);site.add(label);
  };
  auxiliary('EVENT HALL',805,718,921,777,6);
  auxiliary('POWER HOUSE',711,715,799,748,4);
  auxiliary('MRF',722,751,746,776,3.5);
  auxiliary('MOTORPOOL',944,334,1006,392,4.5);

  const courtyardTrees = new THREE.Group();
  site.add(courtyardTrees);
  const tree = (x: number,z: number,radius: number,parent = site,base = 0) => {
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.28,3.2,8),trunk);
    stem.position.set(x,base+1.6,z);stem.castShadow=true;parent.add(stem);
    for(const [dx,dy,dz,size] of [[0,0.7,0,1],[-.5,0,.2,.8],[.45,0,.35,.8],[.1,-.15,-.5,.75]]){
      const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(radius*size,1),foliage);
      leaves.position.set(x+dx*radius,base+3.7+dy*radius,z+dz*radius);
      leaves.scale.y=0.8;leaves.castShadow=true;parent.add(leaves);
    }
  };
  for(const object of buildingPlans[0].objects.filter(object=>object.type==='tree')){
    tree(object.x,object.z,Math.min(object.w,object.d)/2,courtyardTrees,object.z>0?1.5:0);
  }
  // Street planting occupies the open landscape strips shown around the site.
  for(const x of [-120,-95,-70,-45,-20,5,30,55,80,105,125])tree(x,65,2.7);
  for(const x of [-130,-116,-102,-88]){
    tree(x,22,2.7);tree(x,46,2.7);
  }
  for(let edge=0;edge<boundaryPoints.length;edge++){
    const a=boundaryPoints[edge],b=boundaryPoints[(edge+1)%boundaryPoints.length];
    line(...a,...b,0.2,materials.trim,0.3);
  }
  return { courtyardTrees };
}
