import {giftImage} from './gifts.js?v=15';
const reference={bear:0,duck:1,backpack:2,lamp:3,ghost:4,witch:5,champion:6,fighter:7};
const sets={
 bear:['ref:bear'],duck:['ref:duck'],backpack:['ref:backpack'],lamp:['ref:lamp'],ghost:['ref:ghost'],witch:['ref:witch'],fighters:['ref:champion','ref:fighter'],bunny:['jelly-bunny'],cat:['scared-cat'],helmet:['neko-helmet'],genie:['genie-lamp'],spooky:['scared-cat','ref:ghost'],golden:['swiss-watch','ref:backpack'],friends:['ref:bear','plush-pepe'],
 capsule:['plush-pepe'],compass:['astral-shard','durovs-cap','loot-bag'],satellite:['swiss-watch','plush-pepe','durovs-cap'],gem:['astral-shard'],ticket:['loot-bag','heart-locket','swiss-watch'],check:['heart-locket'],users:['durovs-cap','plush-pepe','loot-bag'],crown:['swiss-watch','heart-locket','love-potion'],send:['plush-pepe','love-potion','heart-locket'],trophy:['swiss-watch'],rocket:['light-sword'],bolt:['love-potion'],case:['loot-bag'],gift:['heart-locket'],star:['durovs-cap'],gamepad:['astral-shard']
};
export function nftArt(kind){
 const items=sets[kind]||sets.capsule;
 return `<span class="nft-art ${items.length>1?'nft-combo':'nft-single'} ${items.length===2?'nft-pair':''}" aria-hidden="true">${items.map((file,i)=>{
  if(file.startsWith('ref:')){const n=reference[file.slice(4)];return `<span class="nft-item nft-item-${i} reference-gift" style="--gift-x:${n%4*100/3}%;--gift-y:${Math.floor(n/4)*100}%"></span>`;}
  return `<img class="nft-item nft-item-${i}" src="${giftImage(file)}" alt="" width="128" height="128" decoding="async">`;
 }).join('')}</span>`;
}
