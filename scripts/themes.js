export const PALETTES = [
 {id:'case',name:'CASE / Arctic blue',note:'Electric blue. Titanium. Clear glass.',swatch:['#45bdff','#147fbe','#a1dffa'],tones:{all:'steel',daily:'azure',limited:'indigo',social:'teal'}},
 {id:'mint',name:'Mint / Graphite',note:'Soft mint. Warm metal. Deep graphite.',swatch:['#79dfbf','#384d44','#e4c48c'],tones:{all:'steel',daily:'mint',limited:'gold',social:'mint'}}
];
const KEY='case:palette';
export function readPalette(){try {const id=localStorage.getItem(KEY);return PALETTES.some(p=>p.id===id)?id:'case';}catch{return 'case';}}
export function savePalette(id){if(!PALETTES.some(p=>p.id===id))return 'case';try{localStorage.setItem(KEY,id);}catch{}return id;}
export function tonesFor(id){return (PALETTES.find(p=>p.id===id)||PALETTES[0]).tones;}
