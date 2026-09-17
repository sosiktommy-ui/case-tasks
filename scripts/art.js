// Original vector collectibles. UI navigation uses the separate outline icon family.
let serial = 0;
export function collectible(kind, className = '') {
  const id = `case-art-${++serial}`;
  const shapes = {
    rocket:'<path d="M26 18C38 5 52 8 52 8s3 15-10 27L29 46 17 34Z"/><circle cx="38" cy="22" r="6" fill="#2f166c"/><circle cx="37" cy="21" r="4" fill="#72e9ff"/><path d="m23 25-12 3-6 13 14-3m17 0-3 16 14-7 1-14" fill="#814eff"/><path d="m19 41-9 15 15-9" fill="#ffce74"/>',
    gamepad:'<path d="M19 20h26c8 0 12 9 14 23 1 9-6 13-12 7l-8-7H25l-8 7C10 56 3 52 5 42c2-13 6-22 14-22Z"/><path d="M20 27v13m-6-6h13" stroke="#342060" stroke-width="5"/><circle cx="44" cy="29" r="3" fill="#8ef3ff"/><circle cx="50" cy="36" r="3" fill="#ffb5fa"/>',
    users:'<circle cx="23" cy="19" r="10"/><circle cx="46" cy="23" r="8"/><path d="M6 54V41c0-10 9-13 17-13s17 3 17 13v13Z"/><path d="M42 54V40c0-4-1-7-3-9 14-2 21 3 21 12v11Z"/>',
    case:'<rect x="7" y="22" width="50" height="34" rx="9"/><path d="M23 22v-5c0-9 18-9 18 0v5" fill="none" stroke="#d4b5ff" stroke-width="5"/><path d="M8 33c15 7 33 7 48 0" fill="none" stroke="#33176a" stroke-width="3"/><rect x="27" y="32" width="10" height="11" rx="3" fill="#b1f2ff"/>',
    gift:'<rect x="9" y="26" width="46" height="31" rx="5"/><rect x="6" y="19" width="52" height="13" rx="4"/><path d="M32 21v36" stroke="#dcc1ff" stroke-width="8"/><path d="M32 20C9 25 10 1 24 8c7 3 8 12 8 12Zm0 0C53 26 56 3 42 8c-8 3-10 12-10 12Z" fill="#bda4ff"/>',
    crown:'<path d="m8 19 12 10L32 9l12 20 12-10-5 33H13Z"/><rect x="12" y="48" width="40" height="9" rx="3" fill="#aa80ff"/><path d="m32 30 6 8-6 8-6-8Z" fill="#83eafa"/>',
    trophy:'<path d="M18 8h28v17c0 14-28 14-28 0Z"/><path d="M18 13H8v10c0 9 12 10 12 10m26-20h10v10c0 9-12 10-12 10" fill="none" stroke="#bda0ff" stroke-width="5"/><path d="M28 37h8v13H28Zm-8 13h24v7H20Z"/><path d="m32 14 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#fbe1a8"/>',
    star:'<path d="m32 5 8 17 19 3-14 14 3 19-16-9-16 9 3-19L5 25l19-3Z"/>',
    bolt:'<path d="M35 4 12 35h17l-2 25 26-36H35Z"/>',
    send:'<path d="m57 8-14 48-15-17-12 11 3-19L5 23Z"/><path d="m19 31 28-15-19 23" fill="none" stroke="#e5d3ff" stroke-width="3"/>',
    gem:'<path d="m16 10 31 1 14 18-28 31L4 28Z"/><path d="m16 10 4 18 13 32 9-31 5-18M4 28l57 1M20 28l13-17 9 18" fill="none" stroke="#b3f2ff" stroke-width="2"/>'
  };
  const colors = ({rocket:['#fff7ba','#ffd43d','#ff971c','#be4509'],gamepad:['#ffd0fc','#ed78ef','#b734e0','#671c9d'],users:['#c1fff3','#5ceccc','#19aaad','#116370'],case:['#d3eaff','#82beff','#4874f8','#26389f'],crown:['#fff0bc','#ffcc4e','#f58a21','#a8420b'],trophy:['#fff7cb','#ffda57','#ef9c27','#a2600c'],send:['#c3f6ff','#60d7ff','#2487eb','#164a9f'],star:['#ffe0ed','#ff97bd','#ec4389','#95155b'],gem:['#c0fff7','#5cf4eb','#1dbcd1','#126981']})[kind] || ['#ede0ff','#b38aff','#7742f6','#401cbc'];
  return `<svg class="collectible ${className}" viewBox="0 0 64 64" fill="url(#${id})" aria-hidden="true"><defs><linearGradient id="${id}" x1="8" y1="5" x2="55" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="${colors[0]}"/><stop offset=".3" stop-color="${colors[1]}"/><stop offset=".65" stop-color="${colors[2]}"/><stop offset="1" stop-color="${colors[3]}"/></linearGradient></defs><g stroke="#d4b5ff" stroke-opacity=".5" stroke-width=".6" stroke-linejoin="round">${shapes[kind] || shapes.star}</g></svg>`;
}
