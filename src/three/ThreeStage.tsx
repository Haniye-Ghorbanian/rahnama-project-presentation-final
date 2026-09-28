import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { HeroAssembly } from './HeroAssembly';
import { TransportLandscape } from './TransportLandscape';
import { observeWebGLContext } from './contextLifecycle';
import { fa } from '../content/fa';

const blue = '#147DFF', cyan = '#27D9E8', green = '#5BE3A3', warm = '#FFB84D';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const circle = (r:number,y=0): [number,number,number][] => Array.from({length:97},(_,i)=>[Math.cos(i/96*Math.PI*2)*r,y,Math.sin(i/96*Math.PI*2)*r]);
function Circuit({r,y=0,color=blue,opacity=.5}:{r:number;y?:number;color?:string;opacity?:number}) { return <Line points={circle(r,y)} color={color} transparent opacity={opacity} lineWidth={1}/>; }
function Block({position=[0,0,0],scale=[1,1,1],color='#12344b',emissive=false}:{position?:[number,number,number];scale?:[number,number,number];color?:string;emissive?:boolean}) { return <mesh position={position} scale={scale}><boxGeometry/><meshStandardMaterial color={color} metalness={.5} roughness={.4} emissive={emissive?color:'#000000'} emissiveIntensity={.3}/></mesh>; }
function Reveal({show,children}:{show:boolean;children:ReactNode}) {
 const ref=useRef<THREE.Group>(null!);
 useLayoutEffect(()=>{ const tween=gsap.to(ref.current.scale,{x:show?1:.001,y:show?1:.001,z:show?1:.001,duration:reduced()?0:.65,ease:'power2.out',overwrite:true});return()=>{tween.kill()}; },[show]);
 return <group ref={ref} scale={.001}>{children}</group>;
}
function Motorcycle({position=[0,0,0],scale=1,color=cyan}:{position?:[number,number,number];scale?:number;color?:string}) {
 return <group position={position} scale={scale}>
  {[-.93,.93].map(x=><group key={x} position={[x,.45,0]} rotation={[Math.PI/2,0,0]}><mesh><cylinderGeometry args={[.44,.44,.24,32]}/><meshStandardMaterial color="#061018" roughness={.65}/></mesh><mesh><cylinderGeometry args={[.3,.3,.26,24]}/><meshStandardMaterial color="#52697b" metalness={.8} roughness={.3}/></mesh><mesh><cylinderGeometry args={[.11,.11,.29,16]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.3}/></mesh></group>)}
  <Block position={[0,.7,0]} scale={[1.28,.16,.27]} color="#6e8798"/>
  <Block position={[-.1,.96,0]} scale={[.73,.57,.43]} color={color}/>
  <Block position={[-.24,1.31,0]} scale={[.85,.13,.46]} color="#10202d"/>
  <group position={[.69,1.05,0]} rotation={[0,0,-.28]}><Block scale={[.13,1.15,.13]} color="#91a7b5"/></group>
  <Block position={[.47,1.67,0]} scale={[.19,.11,.72]} color="#6e8798"/>
  <Block position={[-.89,1.57,0]} scale={[.72,.62,.65]} color="#d5e1e6"/>
  <Block position={[-.89,1.57,.331]} scale={[.52,.06,.01]} color={blue} emissive/>
  <Block position={[.85,1.3,0]} scale={[.1,.16,.3]} color="#f4f7fa" emissive/>
 </group>;
}
function City({fleet=false}:{fleet?:boolean}) {
 const buildings=useRef<THREE.InstancedMesh>(null!); const units=useRef<THREE.InstancedMesh>(null!);
 useLayoutEffect(()=>{const dummy=new THREE.Object3D();for(let i=0;i<72;i++){ const x=(i%9-4)*1.1,z=(Math.floor(i/9)-3.5)*1.1; const h=.22+((i*17)%13)/9;dummy.position.set(x,h/2,z);dummy.scale.set(.55,h,.58);dummy.updateMatrix();buildings.current.setMatrixAt(i,dummy.matrix);} buildings.current.instanceMatrix.needsUpdate=true;
 for(let i=0;i<240;i++){dummy.position.set((i%24-11.5)*.39,.09,(Math.floor(i/24)-4.5)*.83);dummy.scale.set(.055,.06,.13);dummy.updateMatrix();units.current.setMatrixAt(i,dummy.matrix);} units.current.instanceMatrix.needsUpdate=true;},[]);
 return <group><instancedMesh ref={buildings} args={[undefined,undefined,72]}><boxGeometry/><meshStandardMaterial color="#17394d" roughness={.6} metalness={.5}/></instancedMesh><instancedMesh ref={units} args={[undefined,undefined,240]} visible={fleet}><boxGeometry/><meshBasicMaterial color={cyan}/></instancedMesh></group>;
}
function FleetUnits({count=10,active=10,connected=false}:{count?:number;active?:number;connected?:boolean}) {
 const bodies=useRef<THREE.InstancedMesh>(null!), wheels=useRef<THREE.InstancedMesh>(null!);
 const positions=useMemo(()=>Array.from({length:count},(_,i)=>[(i%5-2)*1.22, .35, (Math.floor(i/5)-.5)*2.4] as [number,number,number]),[count]);
 useLayoutEffect(()=>{const d=new THREE.Object3D();positions.forEach(([x,y,z],i)=>{d.rotation.set(0,0,0);d.position.set(x,y,z);d.scale.set(.7,.4,.35);d.updateMatrix();bodies.current.setMatrixAt(i,d.matrix);bodies.current.setColorAt(i,new THREE.Color(i<active?cyan:'#24323e'));[-.28,.28].forEach((dx,j)=>{d.rotation.set(Math.PI/2,0,0);d.position.set(x+dx,.14,z);d.scale.set(.17,.13,.17);d.updateMatrix();wheels.current.setMatrixAt(i*2+j,d.matrix);});});bodies.current.instanceMatrix.needsUpdate=true;if(bodies.current.instanceColor)bodies.current.instanceColor.needsUpdate=true;wheels.current.instanceMatrix.needsUpdate=true;},[positions,active]);
 return <group><instancedMesh ref={bodies} args={[undefined,undefined,count]}><boxGeometry/><meshStandardMaterial metalness={.5} roughness={.4}/></instancedMesh><instancedMesh ref={wheels} args={[undefined,undefined,count*2]}><cylinderGeometry args={[1,1,1,16]}/><meshStandardMaterial color="#718694"/></instancedMesh>{connected&&positions.map((p,i)=><Line key={i} points={[p,[p[0],.05,0],[0,.05,0]]} color={blue} lineWidth={1} transparent opacity={.5}/>)}</group>;
}
function Core(){return <group><Block position={[0,.7,0]} scale={[1.6,1.4,1.6]} color="#23649b"/>{[.2,.55,.9,1.25].map(y=><Block key={y} position={[0,y,.81]} scale={[1.4,.025,.02]} color={cyan} emissive/>)}</group>}
function Pillars({beat}:{beat:number}) {return <group><Core/>{[[3,0,0],[0,0,3],[-3,0,0],[0,0,-3]].map((p,i)=><Reveal key={i} show={beat>=i+1}><Block position={[p[0],.85,p[2]]} scale={[1,1.7,1]} color={i===1?blue:'#24506a'}/><Circuit r={.7} y={.03}/>{beat===5&&<Line points={[[0,.03,0],[p[0],.03,p[2]]]} color={cyan}/>}</Reveal>)}</group>}
function Nodes({beat,capabilities=false}:{beat:number;capabilities?:boolean}) {
 const count=capabilities?5:3;
 return <group><Core/>{Array.from({length:count},(_,i)=>{const a=i/count*Math.PI*2-.3;const p:[number,number,number]=[Math.cos(a)*3.4,.4,Math.sin(a)*3.4];return <Reveal key={i} show={beat>=i}><group position={p}><mesh><cylinderGeometry args={[.65,.75,.65,6]}/><meshStandardMaterial color={[green,blue,cyan,warm,blue][i]} metalness={.6} roughness={.4}/></mesh><Circuit r={.95} y={-.3}/></group><Line points={[[0,.04,0],[p[0],.04,p[2]]]} color={beat>=count?cyan:blue} transparent opacity={beat>=count?.9:.35}/></Reveal>})}</group>;
}
function Flows({beat}:{beat:number}) { const costs=beat>=4;return <group><Core/>{Array.from({length:costs?5:4},(_,i)=><Reveal key={`${costs}-${i}`} show={i<=(costs?beat-4:beat)}><Block position={[(costs?-1:1)*4,.3,(i-2)*1.3]} scale={[.6,.6,.6]} color={costs?warm:cyan}/><Line points={[[(costs?-1:1)*4,.08,(i-2)*1.3],[(costs?-1:1)*2,.08,(i-2)*1.3],[0,.08,0]]} color={costs?warm:cyan} transparent opacity={.65}/></Reveal>)}</group>}
function FlowParticles({scene,beat}:{scene:number;beat:number}) {
 const ref=useRef<THREE.Points>(null!);
 const positions=useMemo(()=>new Float32Array(18*3),[]);
 useFrame(({clock})=>{if(reduced()||scene===9||scene===10||scene===12&&beat===4)return;const t=clock.getElapsedTime();for(let i=0;i<18;i++){const v=((t*.12+i/18)%1);positions[i*3]=scene===8?(beat>=4?-v*4:4-v*4):(v-.5)*11;positions[i*3+1]=.07;positions[i*3+2]=scene===8?(i%5-2)*1.3:(i%3-1)*2.2;}ref.current.geometry.attributes.position.needsUpdate=true;});
 return <points ref={ref} visible={[0,5,8,11].includes(scene)}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial size={.065} color={scene===8&&beat>=4?warm:cyan} transparent opacity={.7} sizeAttenuation/></points>;
}
function CameraRig({scene,beat}:{scene:number;beat:number}) {
 const {camera}=useThree();
 useLayoutEffect(()=>{if(scene===7)return;const wide=scene===4; const final=scene===12; const hero=scene===7;const t=gsap.to(camera.position,{x:wide?0:hero?8:9,y:wide?8:hero?6.5:final?11:9,z:wide?14:hero?11:final?16:13,duration:reduced()?0:1.35,ease:'power2.inOut',onUpdate:()=>camera.lookAt(0,.3,0),overwrite:true});return()=>{t.kill()};},[scene,camera]);
 useLayoutEffect(()=>{if(scene===7){const assembled=beat===4;const t=gsap.to(camera.position,{x:assembled?5.6:7.1,y:assembled?7.1:9.3,z:assembled?12.2:15.4,duration:reduced()?0:1.5,ease:'power2.inOut',onUpdate:()=>camera.lookAt(0,.4,0),overwrite:true});return()=>{t.kill()};}if(scene!==12&&scene!==0)return;const base=scene===12?16:13;const t=gsap.to(camera.position,{z:base-(scene===0?beat*.12:0),duration:reduced()?0:1.2,onUpdate:()=>camera.lookAt(0,.3,0),overwrite:'auto'});return()=>{t.kill()};},[scene,beat,camera]);
 return null;
}
function World({scene,beat}:{scene:number;beat:number}) {
 return <><color attach="background" args={['#06131F']}/><fog attach="fog" args={['#06131F',19,40]}/><hemisphereLight args={['#aecfe5','#07111c',2]}/><directionalLight position={[5,10,5]} intensity={scene===7?2:3} color="#b9dbf4"/><pointLight position={[-4,4,-3]} intensity={scene===7?5:35} color={blue}/><CameraRig scene={scene} beat={beat}/><gridHelper visible={scene!==7} args={[36,36,'#174057','#102b3b']} position={[0,-.27,0]}/>
 <group visible={scene===0||scene===5}><City fleet={scene===5&&beat>=1}/></group>
 <group visible={scene===1}><Pillars beat={scene===1?beat:0}/></group>
 <group visible={scene===2}><Nodes beat={scene===2?beat:0}/></group>
 <group visible={scene===3}><Nodes capabilities beat={scene===3?beat:0}/></group>
 <group visible={scene===4}><TransportLandscape beat={scene===4?beat:0} active={scene===4} motorcycle={<Motorcycle/>}/></group>
 <group visible={scene===6}><Circuit r={4.5}/><FleetUnits active={beat===0||beat>=5?10:beat===1?7:beat===2?5:3} connected={beat>=5}/><Reveal show={scene===6&&beat===4}><Block position={[0,1.1,-2]} scale={[6,2.2,.15]} color="#713e36"/></Reveal></group>
 <group visible={scene===7}><HeroAssembly beat={scene===7?beat:0} active={scene===7}><Motorcycle position={[0,.02,0]} scale={1.18}/></HeroAssembly></group>
 <group visible={scene===8}><Flows beat={scene===8?beat:0}/></group>
 <group visible={scene===9||scene===10}><Circuit r={4.5} opacity={.2}/></group>
 <group visible={scene===11}><Circuit r={4.4}/><mesh position={[0,-.15,0]}><cylinderGeometry args={[3.8,3.8,.1,64]}/><meshStandardMaterial color="#102637"/></mesh><Reveal show={scene===11&&beat>=1}><FleetUnits connected={beat>=2}/></Reveal></group>
 <group visible={scene===12}><Core/>{[-1,1].map((s,i)=><Reveal key={s} show={scene===12&&beat>=i+2}><Line points={[[0,0,0],[s*2,0,1],[s*4,0,1]]} color={i===0?blue:cyan}/><Block position={[s*4,.25,1]} scale={[.8,.5,.8]} color={i===0?blue:cyan}/></Reveal>)}</group>
 <FlowParticles scene={scene} beat={beat}/></>;
}
class StageBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}> {state={failed:false};static getDerivedStateFromError(){return {failed:true}}componentDidCatch(){this.props.onFailure()}render(){return this.state.failed?null:this.props.children}}
function ContextLifecycle({ onLost, onReady }: { onLost: () => void; onReady: () => void }) {
 const gl = useThree(state => state.gl);
 useEffect(() => {
   const cleanup = observeWebGLContext(gl.domElement, { onLost, onRestored: onReady });
   onReady();
   return cleanup;
 }, [gl, onLost, onReady]);
 return null;
}

export function ThreeStage({scene,beat}:{scene:number;beat:number}) {
 const [status, setStatus] = useState<'ready' | 'recovering' | 'error'>('ready');
 const [generation, setGeneration] = useState(0);
 const onLost = useCallback(() => setStatus('recovering'), []);
 const onReady = useCallback(() => setStatus('ready'), []);
 const onFailure = useCallback(() => setStatus('error'), []);
 const retry = useCallback(() => { setStatus('ready'); setGeneration(value => value + 1); }, []);
 useEffect(() => {
   if (status === 'ready' || status === 'error' && generation > 0) return;
   // Give the browser time to restore the existing canvas. If it cannot, try one
   // lighter renderer; further attempts stay under the presenter's control.
   const timer = window.setTimeout(() => {
     if (generation === 0) retry();
     else setStatus('error');
   }, status === 'recovering' ? 4000 : 800);
   return () => window.clearTimeout(timer);
 }, [status, generation, retry]);
 useEffect(() => {
   if (status !== 'error' || generation === 0) return;
   // A Chrome tab can reject contexts after a GPU reset while a fresh tab works.
   // Recreate the renderer when the presenter returns to that tab.
   let lastAttempt = Date.now();
   const tryOnReturn = () => {
     if (document.visibilityState === 'visible' && Date.now() - lastAttempt > 5000) {
       lastAttempt = Date.now();
       retry();
     }
   };
   document.addEventListener('visibilitychange', tryOnReturn);
   return () => document.removeEventListener('visibilitychange', tryOnReturn);
 }, [status, generation, retry]);
 useEffect(() => {
   if (status !== 'error' || generation === 0) return;
   // A full document reload releases contexts left unusable by an old tab or HMR.
   // The timestamp prevents a permanent GPU failure from causing a reload loop.
   const key = 'mapna-webgl-reload-v1';
   let previous = 0;
   try { previous = Number(sessionStorage.getItem(key) || 0); } catch { /* storage is optional */ }
   if (Date.now() - previous < 60_000) return;
   const timer = window.setTimeout(() => {
     if (document.visibilityState !== 'visible') return;
     try { sessionStorage.setItem(key, String(Date.now())); } catch { /* storage is optional */ }
     window.location.reload();
   }, 1500);
   return () => window.clearTimeout(timer);
 }, [status, generation]);
 return <>
   <div className={`three-stage ${scene===4?'stage-wide':''} ${scene===9||scene===10?'stage-financial':''} ${scene===12?'stage-ending':''}`} aria-hidden="true" data-renderer-status={status} data-renderer-generation={generation}>
     <StageBoundary key={generation} onFailure={onFailure}>
       <Canvas dpr={generation ? 1 : [1,1.25]} camera={{position:[9,9,13],fov:39,near:.1,far:70}} gl={{antialias:false,alpha:false,powerPreference:'default'}}>
         <ContextLifecycle onLost={onLost} onReady={onReady}/>
         <Suspense fallback={null}><World scene={scene} beat={beat}/></Suspense>
       </Canvas>
     </StageBoundary>
     <div className="stage-vignette"/>
   </div>
   {status === 'error' && generation > 0 && <button className="renderer-retry" data-interactive onClick={retry} aria-label={fa.ui.retryGraphics} title={fa.ui.retryGraphics}>↻</button>}
 </>;
}
