// CASE — original 3D icon family.
// Every icon is assembled the same way: an extruded body behind the face, a
// metal rim, a multi-stop face gradient, a clipped glass sweep and a coloured
// ambient glow. Drawn from scratch for this page; nothing is traced from
// third-party artwork.
let serial = 0;

const TONES = {
  gold:    {l:'#FFF8D0', m:'#FFD84A', d:'#FF9F16', s:'#B4560A', g:'#FFB020', rim:'#FFE18A'},
  amber:   {l:'#FFEFC6', m:'#FFC44D', d:'#F57C1F', s:'#98380A', g:'#FF8F2E', rim:'#FFDA9A'},
  violet:  {l:'#F2E6FF', m:'#BE92FF', d:'#7B3FF2', s:'#3A1590', g:'#8B4DFF', rim:'#CDA8FF'},
  magenta: {l:'#FFE2F6', m:'#FF95D8', d:'#E23FA2', s:'#7E0F53', g:'#FF57B4', rim:'#FFB4E2'},
  cyan:    {l:'#E2FBFF', m:'#7FE2FF', d:'#1E9CF0', s:'#0A4794', g:'#32B4FF', rim:'#A5E9FF'},
  mint:    {l:'#DFFFF3', m:'#79F0C6', d:'#1FB98E', s:'#08594A', g:'#2FD6A2', rim:'#9CF6DC'},
  teal:    {l:'#DCFFFA', m:'#6FF0E2', d:'#16B8AB', s:'#065A55', g:'#2FD6C6', rim:'#A8F7EE'},
  steel:   {l:'#F2F6FF', m:'#B8C6E6', d:'#6B7BA8', s:'#25304F', g:'#8FA5D8', rim:'#D6E2FA'}
};

// A tapered sun ray, repeated around the disc.
const ray = angle => `<path d="M29.2 14.6 30.6 2.4a1.4 1.4 0 0 1 2.8 0l1.4 12.2Z" transform="rotate(${angle} 32 32)"/>`;
const rays = [0, 45, 90, 135, 180, 225, 270, 315].map(ray).join('');

// 64×64 grid. `body` is the silhouette: it is extruded, filled and used as the
// glass clip. `top` draws details that sit above the glass.
const SHAPES = {
  bolt: {
    tone:'gold', rim:3.4,
    body:'<path d="M38.6 2.5 11.8 35.4a1.6 1.6 0 0 0 1.2 2.6h11.6l-3.6 22.2a1.2 1.2 0 0 0 2.1.9l27.1-33.4a1.6 1.6 0 0 0-1.2-2.6H36.6l4.1-21.6a1.2 1.2 0 0 0-2.1-1Z"/>',
    top:`<g fill="none" stroke-linecap="round">
      <g filter="url(#bl%N%)"><path d="M15.4 45.6c6 4 10.8-1.8 17-.2 6.2 1.6 11.2-1.6 14.4-6.2" stroke="#2FC8FF" stroke-width="5.2" stroke-opacity=".85"/></g>
      <path d="M15.4 45.6c6 4 10.8-1.8 17-.2 6.2 1.6 11.2-1.6 14.4-6.2" stroke="#5FE2FF" stroke-width="2.8"/>
      <path d="M15.4 45.6c6 4 10.8-1.8 17-.2 6.2 1.6 11.2-1.6 14.4-6.2" stroke="#F0FEFF" stroke-width="1" stroke-opacity=".95"/>
      <path d="M20.4 52.6c4-1.4 6.4 1.8 10.4.6" stroke="#5FE2FF" stroke-width="2" stroke-opacity=".75"/>
    </g>
    <circle cx="47.6" cy="38.6" r="2" fill="#E6FCFF"/><circle cx="14.6" cy="46.4" r="1.6" fill="#E6FCFF"/>
    <ellipse cx="27" cy="16" rx="3.4" ry="8.4" fill="#FFFDF0" opacity=".45" transform="rotate(18 27 16)"/>`
  },
  sun: {
    tone:'gold', rim:2.6,
    body:`<circle cx="32" cy="32" r="16.4"/>${rays}`,
    top:'<ellipse cx="25.6" cy="25" rx="6.4" ry="4.4" fill="#FFFCE8" opacity=".5" transform="rotate(-34 25.6 25)"/>'
  },
  crown: {
    tone:'magenta', rim:3,
    body:'<path d="M4.6 17.4a3.4 3.4 0 0 1 5.2-1l9.5 7.2L28.9 7a3.6 3.6 0 0 1 6.2 0l9.6 16.6 9.5-7.2a3.4 3.4 0 0 1 5.2 3.7L54 49.6a3 3 0 0 1-2.9 2.3H12.9a3 3 0 0 1-2.9-2.3Z"/><rect x="11.4" y="51.4" width="41.2" height="9" rx="3.2"/>',
    top:`<rect x="11.4" y="51.4" width="41.2" height="3.4" rx="1.7" fill="#FFD3EE" opacity=".7"/>
      <path d="m32 21.4 5.8 8L32 37.4l-5.8-8Z" fill="#7CE9FF"/>
      <path d="m32 21.4 5.8 8L32 29.4Z" fill="#E4FBFF" opacity=".85"/>
      <circle cx="12" cy="20.4" r="3.4" fill="#FFE07A"/><circle cx="52" cy="20.4" r="3.4" fill="#FFE07A"/>
      <circle cx="10.9" cy="19.3" r="1.2" fill="#FFFBE8"/><circle cx="50.9" cy="19.3" r="1.2" fill="#FFFBE8"/>`
  },
  users: {
    tone:'mint', rim:2.6,
    body:'<circle cx="23" cy="20.1" r="10.6"/><path d="M23 33.4c10.8 0 18.6 5.2 18.6 14.6v9.4a2.6 2.6 0 0 1-2.6 2.6H7a2.6 2.6 0 0 1-2.6-2.6V48c0-9.4 7.8-14.6 18.6-14.6Z"/>',
    top:`<g opacity=".95">
      <circle cx="46.8" cy="18.6" r="8.4" fill="#26BE93" stroke="#0B6B55" stroke-width="1.4"/>
      <circle cx="44.6" cy="15.4" r="3.2" fill="#C6FCE8" opacity=".55"/>
      <path d="M46.8 29.6c8 0 13 4 13 10.8v6.6a2.2 2.2 0 0 1-2.2 2.2H44.4v-2.4c0-6.4-2.6-11.4-7.3-14.4a24 24 0 0 1 9.7-2.8Z" fill="#21AE85" stroke="#0B6B55" stroke-width="1.4"/>
      <path d="M46.8 29.6c2.4 0 4.6.3 6.4 1l-2.2 2.2a22 22 0 0 0-9.2-1.2 20 20 0 0 1 5-2Z" fill="#B4F8E0" opacity=".45"/>
    </g>
    <ellipse cx="17.6" cy="16.4" rx="4.8" ry="3.4" fill="#F2FFFA" opacity=".5" transform="rotate(-30 17.6 16.4)"/>`
  },
  grid: {
    tone:'violet', rim:2.6,
    body:'<rect x="4.8" y="6.4" width="24" height="24" rx="6"/><rect x="35.2" y="6.4" width="24" height="24" rx="6"/><rect x="4.8" y="36.8" width="24" height="24" rx="6"/><rect x="35.2" y="36.8" width="24" height="24" rx="6"/>',
    top:''
  },
  trophy: {
    tone:'gold', rim:2.8,
    body:'<path d="M17 5h30a2.6 2.6 0 0 1 2.6 2.6v16.6c0 9.7-7.9 16.2-17.6 16.2s-17.6-6.5-17.6-16.2V7.6A2.6 2.6 0 0 1 17 5Z"/><path d="M27.4 39.4h9.2v10.4h-9.2Z"/><path d="M18.4 49.2h27.2a2.8 2.8 0 0 1 2.8 2.8v7H15.6v-7a2.8 2.8 0 0 1 2.8-2.8Z"/>',
    top:`<g fill="none" stroke="#E8891A" stroke-width="4.4" stroke-linecap="round">
      <path d="M13.6 12H8v7.8c0 6.2 4.6 9.6 9.2 10.4"/><path d="M50.4 12H56v7.8c0 6.2-4.6 9.6-9.2 10.4"/>
    </g>
    <g fill="none" stroke="#FFD261" stroke-width="2" stroke-linecap="round">
      <path d="M13.6 12H8v7.8c0 6.2 4.6 9.6 9.2 10.4"/><path d="M50.4 12H56v7.8c0 6.2-4.6 9.6-9.2 10.4"/>
    </g>
    <path d="m32 13.4 3.3 6.8 7.5 1.1-5.4 5.3 1.3 7.4L32 30.5l-6.7 3.5 1.3-7.4-5.4-5.3 7.5-1.1Z" fill="#FFF3C0"/>
    <ellipse cx="22.4" cy="14.4" rx="4" ry="6.6" fill="#FFFBEA" opacity=".4" transform="rotate(-16 22.4 14.4)"/>`
  },
  gem: {
    tone:'cyan', rim:2.6,
    body:'<path d="M17.6 6.8h28.8a3 3 0 0 1 2.5 1.4l11 17.4a3 3 0 0 1-.3 3.6L34.2 58.6a3 3 0 0 1-4.4 0L4.4 29.2a3 3 0 0 1-.3-3.6l11-17.4a3 3 0 0 1 2.5-1.4Z"/>',
    top:`<path d="M22.6 27 32 7.4 41.4 27 32 57.4Z" fill="#CFF6FF" opacity=".24"/>
      <path d="m17.8 7.4 4.8 19.6H4.6Z" fill="#FFFFFF" opacity=".28"/>
      <g fill="none" stroke="#E6FAFF" stroke-opacity=".8" stroke-width="1.5" stroke-linejoin="round">
        <path d="M17.8 7.4 22.6 27 32 57.4 41.4 27l4.8-19.6M4.6 27h54.8M22.6 27 32 7.4 41.4 27"/>
      </g>`
  },
  star: {
    tone:'gold', rim:3,
    body:'<path d="m32 3.2 8.6 17.8 19.5 2.7a2.4 2.4 0 0 1 1.3 4.1L47.2 41.4l3.4 19.4a2.4 2.4 0 0 1-3.5 2.5L32 54.1l-15.1 9.2a2.4 2.4 0 0 1-3.5-2.5l3.4-19.4L2.6 27.8a2.4 2.4 0 0 1 1.3-4.1l19.5-2.7Z"/>',
    top:'<ellipse cx="24" cy="20.4" rx="5.4" ry="3.4" fill="#FFFDF0" opacity=".55" transform="rotate(-38 24 20.4)"/>'
  },
  check: {
    tone:'mint', rim:3,
    body:'<circle cx="32" cy="32" r="28.6"/>',
    top:`<path d="M19.4 32.8 28 41.4l17-18.4" fill="none" stroke="#064437" stroke-opacity=".3" stroke-width="7.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.4 31.4 28 40l17-18.4" fill="none" stroke="#FFFFFF" stroke-width="6.6" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="21.4" cy="16.4" rx="7.6" ry="4.6" fill="#FFFFFF" opacity=".38" transform="rotate(-32 21.4 16.4)"/>`
  },
  gift: {
    tone:'magenta', rim:2.6,
    body:'<rect x="6.6" y="26.6" width="50.8" height="33" rx="3.4"/><rect x="2.6" y="15.6" width="58.8" height="15" rx="3.4"/>',
    top:`<rect x="26.6" y="15.6" width="10.8" height="44" fill="#FFCE3F"/>
      <rect x="26.6" y="15.6" width="3.4" height="44" fill="#FFF0B8" opacity=".65"/>
      <path d="M32 16.4C22.6 17 12.4 14 14 8.2c1.4-5.2 9-4 13.2.6 2.4 2.6 3.8 5.4 4.8 7.6Zm0 0c9.4.6 19.6-2.4 18-8.2-1.4-5.2-9-4-13.2.6-2.4 2.6-3.8 5.4-4.8 7.6Z" fill="#FFC22F" stroke="#C97B08" stroke-width="1.2"/>
      <path d="M32 16.4C22.6 17 12.4 14 14 8.2c1.4-5.2 9-4 13.2.6" fill="none" stroke="#FFF2C2" stroke-width="1.4" opacity=".7"/>`
  },
  rocket: {
    tone:'violet', rim:2.8,
    body:'<path d="M38.6 6.2c9.6-6 17-4.2 17-4.2s1.8 7.4-4.2 17L31.6 48.4 15.6 32.4Z"/><path d="M22.6 36.2 8.4 39.6 2.6 52.4l12.4-2.8Z"/><path d="m27.8 41.4-3 14.2 12.8-5.8-2.8-12.4Z"/>',
    top:`<circle cx="41.6" cy="20.4" r="6.6" fill="#2A1070"/><circle cx="41.6" cy="20.4" r="4.4" fill="#6FE7FF"/>
      <circle cx="39.8" cy="18.6" r="1.6" fill="#EAFDFF"/>
      <path d="M13.4 47.4 4.6 59.2l11.8-8.4Z" fill="#FFB43C"/>`
  },
  ton: {
    tone:'cyan', rim:2.6,
    body:'<circle cx="32" cy="32" r="28.6"/>',
    top:`<path d="M18.6 19.4h26.8a2.2 2.2 0 0 1 1.9 3.3L33.9 46.4a2.2 2.2 0 0 1-3.8 0L16.7 22.7a2.2 2.2 0 0 1 1.9-3.3Z" fill="#FFFFFF"/>
    <g stroke="#1B7CD4" stroke-width="2.1" fill="none">
      <path d="M32 20.4v24.6"/><path d="m24.4 20.4 7.6 13.2 7.6-13.2"/>
    </g>
    <path d="M20.4 22.2h23.2l-1.7 3H22.1Z" fill="#CFEBFF" opacity=".5"/>
    <ellipse cx="21.6" cy="16.6" rx="7.6" ry="4.4" fill="#FFFFFF" opacity=".32" transform="rotate(-30 21.6 16.6)"/>`
  },
  send: {
    tone:'cyan', rim:2.6,
    body:'<path d="M58.4 5.2a2.2 2.2 0 0 1 2.9 2.8L45.8 57.4a2.4 2.4 0 0 1-4.2.7l-9.8-14.4-10.2 9.1a1.4 1.4 0 0 1-2.3-1.2l1.7-16.9Z"/>',
    top:`<path d="m21 34.7 33-24.4-22 33.4Z" fill="#0B5FA8" opacity=".38"/>
      <path d="m21 34.7 33-24.4" fill="none" stroke="#E4F9FF" stroke-width="1.6" opacity=".7"/>`
  }
};

export function icon3d(name, cls = '', tone) {
  const spec = SHAPES[name] || SHAPES.star;
  const t = TONES[tone] || TONES[spec.tone] || TONES.gold;
  const n = ++serial;
  const body = spec.body;
  const top = (spec.top || '').replace(/%N%/g, n);
  return `<svg class="i3d i3d-${name} ${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs>` +
    `<linearGradient id="f${n}" x1="12" y1="2" x2="52" y2="60" gradientUnits="userSpaceOnUse">` +
      `<stop stop-color="${t.l}"/><stop offset=".3" stop-color="${t.m}"/><stop offset=".74" stop-color="${t.d}"/><stop offset="1" stop-color="${t.s}"/></linearGradient>` +
    `<linearGradient id="e${n}" x1="32" y1="6" x2="32" y2="62" gradientUnits="userSpaceOnUse">` +
      `<stop stop-color="${t.d}"/><stop offset="1" stop-color="${t.s}"/></linearGradient>` +
    `<linearGradient id="r${n}" x1="14" y1="4" x2="50" y2="60" gradientUnits="userSpaceOnUse">` +
      `<stop stop-color="${t.rim}"/><stop offset=".55" stop-color="${t.d}"/><stop offset="1" stop-color="${t.s}"/></linearGradient>` +
    `<radialGradient id="a${n}" cx="32" cy="33" r="31" gradientUnits="userSpaceOnUse">` +
      `<stop stop-color="${t.g}" stop-opacity=".5"/><stop offset=".55" stop-color="${t.g}" stop-opacity=".14"/><stop offset="1" stop-color="${t.g}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="s${n}" x1="8" y1="0" x2="40" y2="44" gradientUnits="userSpaceOnUse">` +
      `<stop stop-color="#FFFFFF" stop-opacity=".78"/><stop offset=".6" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>` +
    `<filter id="bl${n}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2"/></filter>` +
    `<clipPath id="c${n}">${body}</clipPath></defs>` +
    `<circle cx="32" cy="33" r="31" fill="url(#a${n})"/>` +
    `<g transform="translate(0 3.2)" fill="url(#e${n})" opacity=".92">${body}</g>` +
    `<g fill="none" stroke="url(#r${n})" stroke-width="${spec.rim || 2.6}" stroke-linejoin="round">${body}</g>` +
    `<g fill="url(#f${n})">${body}</g>` +
    `<g clip-path="url(#c${n})"><path d="M-8-8h80v30L-8 48Z" fill="url(#s${n})"/>` +
      `<path d="M-8 44 72 30v42H-8Z" fill="${t.s}" opacity=".26"/></g>` +
    top +
    `</svg>`;
}

export const has3d = name => Object.prototype.hasOwnProperty.call(SHAPES, name);
