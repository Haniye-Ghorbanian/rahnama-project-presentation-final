import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { numeral } from '../content/fa';

const COLORS = ['#147DFF', '#27D9E8', '#5BE3A3'];
const TAU = Math.PI * 2;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
type Point = [number, number, number];
const radial = (angle: number, radius: number, y = 0): Point => [Math.sin(angle) * radius, y, Math.cos(angle) * radius];
const arc = (start: number, length: number, radius: number, y: number, steps = 64): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => radial(start + length * i / steps, radius, y));

function Part({ position = [0, 0, 0], scale, color = '#7798ac' }: { position?: Point; scale: Point; color?: string }) {
  return <mesh position={position} scale={scale}><boxGeometry /><meshStandardMaterial color={color} metalness={.38} roughness={.48} /></mesh>;
}

// These three glyphs depict only the three existing services; they carry no data or text.
function ServiceGlyph({ index }: { index: number }) {
  const color = COLORS[index];
  if (index === 0) return <group rotation={[0, -.2, 0]}>
    {[-.32, .32].map(z => <group key={z} position={[0, .13, z]}>
      <Part position={[0, .15, 0]} scale={[.75, .23, .22]} color={color} />
      <Part position={[-.24, .36, 0]} scale={[.29, .26, .27]} color="#b6ccd7" />
      {[-.25, .25].map(x => <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.13, .13, .25, 20]} /><meshStandardMaterial color="#11232f" /></mesh>)}
    </group>)}
  </group>;
  if (index === 1) return <group rotation={[0, .3, 0]}>
    {[-.24, .24].map((x, i) => <group key={x} position={[x, i * .08, 0]}>
      <Part position={[0, .34, 0]} scale={[.33, .62, .3]} color={i ? '#829daa' : color} />
      <Part position={[0, .69, 0]} scale={[.13, .08, .13]} color="#c6d8df" />
      <Part position={[0, .38, .155]} scale={[.18, .05, .012]} color="#d7edf2" />
    </group>)}
    <Line points={arc(.25, Math.PI * 1.4, .67, .04, 36)} color={color} lineWidth={1.2} />
    <Line points={[[.47, .04, -.35], [.62, .04, -.25], [.65, .04, -.45]]} color={color} lineWidth={1.2} />
  </group>;
  return <group rotation={[0, .4, 0]}>
    <Part position={[0, .43, 0]} scale={[1.05, .66, .09]} color="#173448" />
    <Part position={[0, .12, 0]} scale={[.1, .25, .1]} />
    <Part position={[0, .015, 0]} scale={[.55, .03, .28]} />
    <Line points={[[-.41, .21, .052], [-.41, .68, .052], [.41, .68, .052], [.41, .21, .052], [-.41, .21, .052]]} color={color} transparent opacity={.65} lineWidth={1} />
    <Line points={[[-.32, .32, .06], [-.13, .32, .06], [.04, .53, .06], [.31, .53, .06]]} color={color} lineWidth={1.7} />
    {[-.32, .04, .31].map((x, i) => <mesh key={x} position={[x, i ? .53 : .32, .062]}><sphereGeometry args={[.027, 8, 8]} /><meshBasicMaterial color={color} /></mesh>)}
  </group>;
}

function ServiceSection({ index, beat, active }: { index: number; beat: number; active: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const material = useRef<THREE.MeshStandardMaterial>(null!);
  const angle = .4 + index * TAU / 3;
  const start = angle - Math.PI / 3 + .015;
  const span = TAU / 3 - .03;
  const docked = beat === 4;
  const revealed = active && beat >= index + 1;
  const glyphPosition = radial(angle, 2.82, .085);

  useLayoutEffect(() => {
    const duration = reduced() || !active ? 0 : docked ? .95 : .65;
    const offset = docked ? 0 : 1.1;
    const [x, , z] = radial(angle, offset);
    const timeline = gsap.timeline();
    // Absolute targets make interrupted assembly, reverse, restart, and re-entry deterministic.
    timeline.to(group.current.position, { x, y: docked ? -.13 : .1 + index * .47, z, duration, delay: docked && !reduced() ? index * .1 : 0, ease: 'power2.inOut' }, 0);
    timeline.to(group.current.scale, { x: revealed ? 1 : .001, y: revealed ? 1 : .001, z: revealed ? 1 : .001, duration: Math.min(duration, .6), ease: 'power2.out' }, 0);
    timeline.to(material.current, { emissiveIntensity: docked ? .075 : .025, duration }, 0);
    return () => { timeline.kill(); };
  }, [active, angle, beat, docked, index, revealed]);

  return <group ref={group} scale={.001}>
    <mesh position={[0, -.045, 0]}>
      <cylinderGeometry args={[3.85, 3.85, .17, 64, 1, false, start, span]} />
      <meshStandardMaterial ref={material} color={['#123049', '#12353f', '#153932'][index]} emissive={COLORS[index]} emissiveIntensity={.025} metalness={.3} roughness={.62} />
    </mesh>
    <Line points={arc(start, span, 3.85, .045)} color={COLORS[index]} transparent opacity={.85} lineWidth={1.5} />
    <Line points={arc(start, span, 1.62, .045)} color={COLORS[index]} transparent opacity={.35} lineWidth={1} />
    {[start, start + span].map(a => <Line key={a} points={[radial(a, 1.65, .045), radial(a, 3.85, .045)]} color={COLORS[index]} transparent opacity={.25} lineWidth={1} />)}
    <group position={glyphPosition}><ServiceGlyph index={index} /></group>
    {revealed && <Html position={radial(angle, 3.38, .07)} center zIndexRange={[1, 0]} style={{ pointerEvents: 'none' }}>
      <span className={`hero-spatial-index hero-index-${index}`}>{numeral(index + 1, 2)}</span>
    </Html>}
  </group>;
}

function DrawnConnection({ points, show, delay, color, opacity = .8 }: { points: Point[]; show: boolean; delay: number; color: string; opacity?: number }) {
  const geometry = useRef<THREE.BufferGeometry>(null!);
  const object = useMemo(() => new THREE.Line(), []);
  const coordinates = useMemo(() => new Float32Array(points.flat()), [points]);
  useLayoutEffect(() => {
    const progress = { count: 0 };
    geometry.current.setDrawRange(0, show && reduced() ? points.length : 0);
    if (!show || reduced()) return;
    const tween = gsap.to(progress, { count: points.length, delay, duration: .55, ease: 'power1.inOut', onUpdate: () => geometry.current.setDrawRange(0, Math.floor(progress.count)) });
    return () => { tween.kill(); };
  }, [show, delay, points.length]);
  return <primitive object={object}>
    <bufferGeometry ref={geometry}><bufferAttribute attach="attributes-position" args={[coordinates, 3]} /></bufferGeometry>
    <lineBasicMaterial color={color} transparent opacity={opacity} />
  </primitive>;
}

export function HeroAssembly({ beat, active, children }: { beat: number; active: boolean; children: ReactNode }) {
  const assembled = active && beat === 4;
  const fleet = useRef<THREE.Group>(null!);
  const keyLight = useRef<THREE.PointLight>(null!);
  const connections = useMemo(() => [0, 1, 2].map(i => Array.from({ length: 40 }, (_, p) => radial(.4 + i * TAU / 3, 2.35 - p / 39 * .94, -.018))), []);
  const boundary = useMemo(() => arc(0, TAU, 4.02, -.03, 150), []);
  useLayoutEffect(() => {
    const duration = reduced() || !active ? 0 : 1.15;
    const timeline = gsap.timeline();
    timeline.to(fleet.current.position, { y: assembled ? .04 : .37, duration, ease: 'power2.inOut' }, 0);
    timeline.to(keyLight.current, { intensity: active ? assembled ? 24 : 16 : 0, duration, ease: 'power2.inOut' }, 0);
    return () => { timeline.kill(); };
  }, [active, assembled]);
  return <group>
    <pointLight ref={keyLight} position={[1, 5, 4]} color="#d8edf5" intensity={0} distance={15} decay={2} />
    <pointLight position={[-4, 3, -2]} color="#72a6c9" intensity={active ? 12 : 0} distance={12} />
    <group ref={fleet}>
      <mesh position={[0, -.13, 0]}><cylinderGeometry args={[1.61, 1.68, .23, 64]} /><meshStandardMaterial color="#203d50" metalness={.4} roughness={.55} /></mesh>
      <Line points={arc(0, TAU, 1.63, -.015)} color="#6a9bb7" transparent opacity={.45} lineWidth={1} />
      {children}
    </group>
    {[0, 1, 2].map(index => <ServiceSection key={index} index={index} beat={beat} active={active} />)}
    {connections.map((points, index) => <DrawnConnection key={index} points={points} show={assembled} delay={1.04 + index * .09} color={COLORS[index]} />)}
    <DrawnConnection points={boundary} show={assembled} delay={1.3} color="#9bc4d8" opacity={.5} />
  </group>;
}
