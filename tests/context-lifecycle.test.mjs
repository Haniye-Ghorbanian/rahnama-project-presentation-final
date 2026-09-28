import test from 'node:test';
import assert from 'node:assert/strict';
import { observeWebGLContext } from '../src/three/contextLifecycle.js';
function canvas() { return Object.assign(new EventTarget(), { isConnected: true }); }
test('temporary loss allows restoration of the same canvas', () => {
 const target=canvas(), states=[];
 const cleanup=observeWebGLContext(target,{onLost:()=>states.push('lost'),onRestored:()=>states.push('ready')});
 const loss=new Event('webglcontextlost',{cancelable:true}); target.dispatchEvent(loss);
 assert.equal(loss.defaultPrevented,true);
 target.dispatchEvent(new Event('webglcontextrestored'));
 assert.deepEqual(states,['lost','ready']); cleanup();
});
test('renderer disposal and detached canvases do not report presentation failure', () => {
 const target=canvas(); let calls=0;
 const cleanup=observeWebGLContext(target,{onLost:()=>calls++,onRestored:()=>calls++});
 target.isConnected=false; target.dispatchEvent(new Event('webglcontextlost'));
 target.isConnected=true; cleanup(); target.dispatchEvent(new Event('webglcontextlost'));target.dispatchEvent(new Event('webglcontextrestored'));
 assert.equal(calls,0);
});
test('StrictMode-style setup/cleanup/setup leaves only one active listener', () => {
 const target=canvas();let calls=0;const handlers={onLost:()=>calls++,onRestored:()=>calls++};
 observeWebGLContext(target,handlers)();const cleanup=observeWebGLContext(target,handlers);
 target.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));target.dispatchEvent(new Event('webglcontextrestored'));
 assert.equal(calls,2);cleanup();
});
