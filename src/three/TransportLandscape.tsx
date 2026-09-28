import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const blue = '#147DFF';
const cyan = '#27D9E8';
type Point = [number, number, number];
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ring = (radius: number, y = .025): Point[] => Array.from({ length: 97 }, (_, i) => [Math.cos(i / 96 * Math.PI * 2) * radius, y, Math.sin(i / 96 * Math.PI * 2) * radius]);

function Part({ position, size, color = '#3e5d70' }: { position: Point; size: Point; color?: string }) {
  return <mesh position={position} scale={size}><boxGeometry /><meshStandardMaterial color={color} metalness={.3} roughness={.6} /></mesh>;
}

function Industry() {
  return <group>
    <Part position={[-.48, .45, -.3]} size={[1.65, .9, 1.1]} />
    {[-.98, -.36, .26].map(x => <Part key={x} position={[x, .68, .261]} size={[.34, .22, .02]} color="#82a5b7" />)}
    <Part position={[-1.07, 1.21, -.61]} size={[.27, 1.28, .27]} color="#708995" />
    <Part position={[-.57, 1.44, -.61]} size={[.27, 1.73, .27]} color="#708995" />
    <group position={[1.05, 0, .65]} rotation={[0, -.15, 0]}>
      <Part position={[0, .51, 0]} size={[1.1, .43, .7]} color="#466779" />
      <Part position={[.64, .46, 0]} size={[.4, .55, .62]} color="#7392a2" />
      <Part position={[.85, .62, 0]} size={[.02, .19, .43]} color="#b1c8d2" />
      {[-.36, .5].map(x => <mesh key={x} position={[x, .18, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.2, .2, .8, 20]} /><meshStandardMaterial color="#132331" /></mesh>)}
    </group>
  </group>;
}

function PublicTransport() {
  return <group>
    <group position={[-.27, 0, -.31]}>
      <Part position={[0, .66, 0]} size={[2.65, .98, .82]} color="#557a92" />
      <Part position={[0, .86, .422]} size={[2.3, .34, .016]} color="#a9c7d6" />
      {[-.64, -.03, .57].map(x => <Part key={x} position={[x, .86, .44]} size={[.045, .35, .026]} color="#385a73" />)}
      <Part position={[1.34, .85, 0]} size={[.025, .36, .63]} color="#a9c7d6" />
      {[-.87, .87].map(x => <mesh key={x} position={[x, .17, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.22, .22, .96, 20]} /><meshStandardMaterial color="#12212e" /></mesh>)}
    </group>
    <group position={[.8, 0, .83]}>
      <Part position={[-.2, .47, 0]} size={[.95, .64, .55]} color="#b0c1c9" />
      <Part position={[.5, .38, 0]} size={[.49, .46, .55]} color="#718e9e" />
      {[-.4, .46].map(x => <mesh key={x} position={[x, .14, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.16, .16, .66, 16]} /><meshStandardMaterial color="#12212e" /></mesh>)}
    </group>
  </group>;
}

function Sector({ index, beat, active, children }: { index: number; beat: number; active: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const model = useRef<THREE.Group>(null!);
  const surface = useRef<THREE.MeshStandardMaterial>(null!);
  const colors = useRef(new WeakMap<THREE.Material, THREE.Color>());
  const secondary = index < 2 && beat > index;
  const selected = index === 2 && beat === 3;
  const radius = index === 2 ? 1.75 : 2.05;

  useLayoutEffect(() => {
    const duration = reduced() || !active ? 0 : .95;
    const scale = secondary ? index === 0 ? .7 : .78 : selected ? 1.27 : 1;
    const timeline = gsap.timeline({ defaults: { duration, ease: 'power2.inOut' } });
    timeline.to(group.current.position, { z: secondary ? index === 0 ? -2.2 : -1.55 : selected ? .72 : 0 }, 0);
    timeline.to(group.current.scale, { x: scale, y: scale, z: scale }, 0);
    model.current.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        if (!colors.current.has(material)) colors.current.set(material, material.color.clone());
        const target = colors.current.get(material)!.clone().multiplyScalar(secondary ? .48 : 1);
        timeline.to(material.color, { r: target.r, g: target.g, b: target.b }, 0);
      }
    });
    const color = new THREE.Color(selected ? '#1a4c60' : secondary ? '#0a1b29' : '#183344');
    timeline.to(surface.current.color, { r: color.r, g: color.g, b: color.b }, 0);
    return () => { timeline.kill(); };
  }, [active, beat, index, secondary, selected]);

  return <group position={[-6.3 + index * 6.3, 0, 0]}>
    <group ref={group}>
      <mesh position={[0, -.115, 0]}><cylinderGeometry args={[radius, radius, .17, 64]} /><meshStandardMaterial ref={surface} color="#183344" metalness={.3} roughness={.65} /></mesh>
      <Line points={ring(radius + .02)} color={index === 2 && beat >= 2 ? cyan : blue} transparent opacity={secondary ? .17 : selected ? .95 : .42} lineWidth={selected ? 1.7 : 1} />
      <group ref={model}>{children}</group>
      <group visible={selected}>
        <Line points={ring(radius + .2)} color={cyan} transparent opacity={.25} lineWidth={1} />
        <Line points={[[radius + .42, .04, -.48], [radius + .42, .04, .48]]} color={cyan} lineWidth={2} />
      </group>
    </group>
  </group>;
}

function Route({ start, end, visible, selected }: { start: number; end: number; visible: boolean; selected: boolean }) {
  const geometry = useRef<THREE.BufferGeometry>(null!);
  const object = useMemo(() => new THREE.Line(), []);
  const points = useMemo(() => new Float32Array(Array.from({ length: 50 }, (_, i) => [start + (end - start) * i / 49, -.015, 1.9]).flat()), [start, end]);
  useLayoutEffect(() => {
    const value = { count: 0 };
    geometry.current.setDrawRange(0, visible && reduced() ? 50 : 0);
    if (!visible || reduced()) return;
    const tween = gsap.to(value, { count: 50, duration: .75, delay: .15, ease: 'power2.out', onUpdate: () => geometry.current.setDrawRange(0, Math.floor(value.count)) });
    return () => { tween.kill(); };
  }, [visible]);
  return <group>
    <Line points={[[start, -.02, 1.9], [end, -.02, 1.9]]} color="#2d4a5d" transparent opacity={.25} lineWidth={1} />
    <primitive object={object}><bufferGeometry ref={geometry}><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry><lineBasicMaterial color={selected ? cyan : blue} /></primitive>
    <Line points={[[end - .32, -.015, 1.69], [end, -.015, 1.9], [end - .32, -.015, 2.11]]} color={selected ? cyan : blue} transparent opacity={visible ? .9 : .2} lineWidth={1.5} />
  </group>;
}

export function TransportLandscape({ beat, active, motorcycle }: { beat: number; active: boolean; motorcycle: ReactNode }) {
  return <group>
    <Sector index={0} beat={beat} active={active}><Industry /></Sector>
    <Sector index={1} beat={beat} active={active}><PublicTransport /></Sector>
    <Sector index={2} beat={beat} active={active}>{motorcycle}</Sector>
    <Route start={-4.3} end={-1.5} visible={active && beat >= 1} selected={false} />
    <Route start={2.1} end={4.7} visible={active && beat >= 2} selected={beat === 3} />
  </group>;
}
