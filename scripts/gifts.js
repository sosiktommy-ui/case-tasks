export const gifts = [
  {
    "file": "plush-pepe",
    "name": "Plush Pepe",
    "source": "https://fragment.com/gifts/plushpepe"
  },
  {
    "file": "swiss-watch",
    "name": "Swiss Watch",
    "source": "https://fragment.com/gifts/swisswatch"
  },
  {
    "file": "heart-locket",
    "name": "Heart Locket",
    "source": "https://fragment.com/gifts/heartlocket"
  },
  {
    "file": "loot-bag",
    "name": "Loot Bag",
    "source": "https://fragment.com/gifts/lootbag"
  },
  {
    "file": "durovs-cap",
    "name": "Durov’s Cap",
    "source": "https://fragment.com/gifts/durovscap"
  },
  {
    "file": "light-sword",
    "name": "Light Sword",
    "source": "https://fragment.com/gifts/lightsword"
  },
  {
    "file": "astral-shard",
    "name": "Astral Shard",
    "source": "https://fragment.com/gifts/astralshard"
  },
  {
    "file": "love-potion",
    "name": "Love Potion",
    "source": "https://fragment.com/gifts/lovepotion"
  }
];
export const giftImage = file => new URL('../assets/' + file + '.webp', import.meta.url).href;
