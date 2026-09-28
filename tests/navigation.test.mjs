import test from 'node:test';
import assert from 'node:assert/strict';
import { beatCounts, navigate, initialState, validState } from '../src/presentation/navigation.js';
test('all 71 beats can be traversed forward and exactly reversed',()=>{
 const states=[];for(let scene=0;scene<beatCounts.length;scene++)for(let beat=0;beat<beatCounts[scene];beat++)states.push({scene,beat});
 let state=initialState;assert.equal(states.length,71);
 for(let i=1;i<states.length;i++){state=navigate(state,'next');assert.deepEqual(state,states[i]);}
 assert.deepEqual(navigate(state,'next'),state);
 for(let i=states.length-2;i>=0;i--){state=navigate(state,'previous');assert.deepEqual(state,states[i]);}
 assert.deepEqual(navigate(state,'previous'),initialState);
});
test('home, end, restart, and repeated navigation remain bounded',()=>{
 let state={scene:7,beat:4};assert.deepEqual(navigate(state,'restart'),{scene:7,beat:0});assert.deepEqual(navigate(state,'home'),initialState);assert.deepEqual(navigate(state,'end'),{scene:12,beat:4});
 for(let i=0;i<1000;i++)state=navigate(state,'next');assert.deepEqual(state,{scene:12,beat:4});
 for(let i=0;i<1000;i++)state=navigate(state,'previous');assert.deepEqual(state,initialState);
});
test('restored state rejects invalid or stale storage',()=>{
 for(const value of [null,{}, {scene:13,beat:0},{scene:-1,beat:0},{scene:0,beat:4},{scene:0,beat:-1},{scene:'0',beat:0},{scene:0,beat:1.5}])assert.ok(!validState(value));
 assert.ok(validState({scene:12,beat:4}));
});
