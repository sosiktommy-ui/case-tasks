const positions={capsule:0,rocket:1,ticket:2,compass:3,trophy:4,gem:5,users:6,satellite:7,ton:8,bolt:9,grid:10,check:11,crown:12,send:13,wheel:14,craft:15};
const aliases={gamepad:'gem',case:'capsule',gift:'ticket',star:'compass',sun:'bolt',shield:'check',menu:'grid',burst:'bolt'};
export function artifact(name, cls='') {
  const index=positions[aliases[name]||name]??0;
  return `<span class="i3d artifact artifact-${index} ${cls}" style="--sprite-x:${index%4*100/3}%;--sprite-y:${Math.floor(index/4)*100/3}%" aria-hidden="true"></span>`;
}
