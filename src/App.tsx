import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { fa, numeral } from './content/fa';
import { usePresentation } from './presentation/usePresentation';
import { sceneRegistry } from './presentation/sceneRegistry';
import { beatCounts } from './presentation/navigation';
import { ThreeStage } from './three/ThreeStage';

export default function App() {
 const {scene,beat,dispatch,fullscreen,fullscreenError}=usePresentation();
 const overlay=useRef<HTMLDivElement>(null!);
 const Scene=sceneRegistry[scene];
 const isEnd=scene===12&&beat===4;
 useLayoutEffect(()=>{document.title=`${fa.brandLatin} — ${fa.sections[scene]}`;const ctx=gsap.context(()=>{gsap.fromTo(overlay.current,{opacity:0,y:12},{opacity:1,y:0,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:.55,ease:'power2.out',clearProps:'transform'});},overlay);return()=>ctx.revert();},[scene]);
 return <main className={`presentation scene-${scene+1} `} data-scene={scene+1} data-beat={beat+1} onClick={e=>{if((e.target as HTMLElement).closest('button,a,input,[data-interactive]')||window.getSelection()?.toString())return;dispatch('next')}}>
   <div className="ambient-grain"/>
   <ThreeStage scene={scene} beat={beat}/>
   <header className="topbar"><div className="brand-lockup"><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span><strong>{fa.brandLatin}</strong><span className="topbar-divider"/><span>{fa.project}</span></div><div className="chapter-label"><span>{numeral(scene+1,2)}</span>{fa.sections[scene]}</div></header>
   <div className="scene-overlay" ref={overlay} key={scene} aria-live="polite" aria-atomic="false"><Scene beat={beat}/></div>
   <footer className="presentation-footer"><div className="slide-counter" dir="ltr"><strong>{String(scene+1).padStart(2,'0')}</strong><span>/</span><span>13</span></div><div className="footer-progress"><div className="scene-track">{beatCounts.map((_,i)=><span key={i} className={i===scene?'current':i<scene?'passed':''}/>)}</div><div className="beat-track">{Array.from({length:beatCounts[scene]},(_,i)=><i key={i} className={i<=beat?'passed':''}/>)}</div></div><div className="presenter-controls" data-interactive><span className="keyboard-hint">{isEnd?fa.ui.end:fa.ui.controls}</span><button onClick={()=>dispatch('previous')} aria-label={fa.ui.previous} title={fa.ui.previous} disabled={scene===0&&beat===0}>←</button><button onClick={()=>dispatch('next')} aria-label={fa.ui.next} title={fa.ui.next} disabled={isEnd}>→</button><button onClick={()=>dispatch('restart')} aria-label={fa.ui.restart} title={`${fa.ui.restart} · R`}>↺</button><button onClick={()=>void fullscreen()} aria-label={fa.ui.fullscreen} title={`${fa.ui.fullscreen} · F`}>⛶</button></div></footer>
   {fullscreenError&&<div className="notice" role="status">{fa.ui.fullscreenFailed}</div>}
 </main>;
}
