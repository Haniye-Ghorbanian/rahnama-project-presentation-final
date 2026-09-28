export const beatCounts = [4, 6, 4, 6, 4, 5, 7, 5, 9, 5, 7, 4, 5];
export const initialState = { scene: 0, beat: 0 };
export function validState(value) {
  return value && Number.isInteger(value.scene) && Number.isInteger(value.beat) && value.scene >= 0 && value.scene < beatCounts.length && value.beat >= 0 && value.beat < beatCounts[value.scene];
}
export function navigate(state, action) {
  const { scene, beat } = state;
  switch (action) {
    case 'next': return beat + 1 < beatCounts[scene] ? { scene, beat: beat + 1 } : scene + 1 < beatCounts.length ? { scene: scene + 1, beat: 0 } : state;
    case 'previous': return beat > 0 ? { scene, beat: beat - 1 } : scene > 0 ? { scene: scene - 1, beat: beatCounts[scene - 1] - 1 } : state;
    case 'home': return initialState;
    case 'end': return { scene: 12, beat: 4 };
    case 'restart': return { scene, beat: 0 };
    default: return state;
  }
}
