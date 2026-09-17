# CASE — промпты для 3D-иконок

Стиль задан молнией, которую ты уже сгенерировал (`assets/bolt-3d.webp`).
Все остальные иконки должны быть из одной с ней семьи: одинаковый угол,
одинаковый металлический кант, одинаковый глянец, одинаковый синий разряд
как акцент.

## Технические требования (добавлять к каждому промпту)

```
3D render, single centered object, 3/4 view tilted slightly to the right,
transparent background (PNG with alpha), no ground shadow, no floor,
no text, no logo, no watermark, no frame, soft studio lighting from the
upper left, sharp specular highlights, clean edges, square 1:1,
2048x2048, game asset quality, mobile app icon
```

**Negative prompt:**
```
flat, 2d, outline, line art, sketch, low poly, plastic toy, blurry,
noisy, text, letters, watermark, drop shadow on floor, background color,
gradient background, multiple objects, cropped edges
```

## Базовый стиль (STYLE BLOCK — вставлять в каждый промпт)

```
glossy polished gold body with a thick beveled metallic gold frame around
the silhouette, mirror-finish enamel face with deep amber-to-yellow
gradient, warm orange rim light along the lower edge, crisp white
specular streak across the upper left, a thin electric blue lightning arc
wrapping around the lower part of the object with a soft cyan glow,
premium collectible look, same material and lighting as a polished gold
lightning bolt icon
```

---

## 1. Логотип CASE (главное — в шапку)

```
[STYLE BLOCK] A 3D emblem for a crypto gaming app called CASE: a sealed
metallic case / vault cube standing on its corner, with a faceted
diamond-shaped gem embedded in the front face, glowing cyan from inside
through the seam. Polished gold frame, deep violet-blue gem, electric
blue energy arc around the base. Bold, readable at 40 pixels.
[ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

Альтернатива (если нужен чистый значок без кейса):

```
[STYLE BLOCK] A 3D faceted diamond gem, sharp crystal facets, deep
electric blue core with a bright cyan inner light, thick polished gold
bezel around the outline, blue lightning arc curling around the lower
tip. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

> Если у CASE есть официальный лого-файл — пришли его, поставлю оригинал.
> Тот `case-official-logo.jpg`, что скачался раньше, — это рекламный пост
> из канала (лягушка в костюме + VPN), а не логотип. Я его не публиковал.

## 2. Daily tasks — «Ежедневные»

```
[STYLE BLOCK] A 3D sun with eight thick tapered rays around a rounded
central disc, molten gold surface, bright warm core, rays slightly
rotated in 3D. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

Вариант с календарём:

```
[STYLE BLOCK] A 3D calendar page with rounded corners and two thick
rings on top, a glowing checkmark carved into the front face, polished
gold body with a warm amber face. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 3. Limited editions — «Лимитированные»

```
[STYLE BLOCK] A 3D royal crown with three tall pointed peaks and a thick
band at the base, but rendered in polished magenta-pink chrome with a
gold bezel instead of gold body, a cyan cut diamond set in the center
peak and two small amber gems on the side peaks, violet energy arc
around the base. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 4. Stay connected — «Сообщество»

```
[STYLE BLOCK] Two 3D rounded human silhouettes standing together, the
front one larger, rendered in polished emerald-green chrome with a gold
bezel instead of gold body, glossy mint highlights, a soft green energy
arc around their base. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 5. All tasks — «Все задания»

```
[STYLE BLOCK] Four 3D rounded cubes arranged in a 2x2 grid, slightly
separated, floating, rendered in polished violet-purple chrome with a
gold bezel instead of gold body, glossy lavender highlights, violet
energy arc weaving between the cubes. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 6. Achievements — «Достижения»

```
[STYLE BLOCK] A 3D trophy cup with two thick side handles and a wide
base, a five-pointed star carved into the front of the cup, molten gold
body, warm glow inside the cup. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 7. Points — «Очки»

```
[STYLE BLOCK] A 3D five-pointed star with thick rounded points and a
puffy volumetric body, molten gold, bright core glow. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 8. Reward — «Награда / подарок»

```
[STYLE BLOCK] A 3D gift box with a lid slightly lifted and cyan light
escaping from inside, rendered in polished magenta-pink chrome with a
gold ribbon and a large gold bow on top, blue lightning arc around the
box. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 9. Task complete — «Выполнено»

```
[STYLE BLOCK] A 3D circular badge with a thick bold checkmark raised
from the surface, rendered in polished emerald-green chrome with a gold
bezel, glossy dome surface, soft green glow behind the checkmark.
[ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

## 10. Empty state — «Пока ничего нет»

```
[STYLE BLOCK] A 3D open treasure chest, empty inside, lid open, rendered
in polished dark metal with a gold frame, a few tiny cyan sparks
floating above the opening, muted and calm. [ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ]
```

---

## Как отдавать файлы мне

Просто пришли пути к PNG. Я сам:
- обрежу прозрачные поля, отцентрую в квадрат,
- пережму в WebP (иконка 320 px ≈ 20–25 КБ),
- положу в `assets/` и подключу вместо соответствующей SVG-иконки.

Сейчас на странице работают мои векторные (SVG) 3D-иконки — они лёгкие и
чёткие на любом экране. Растровые рендеры заменят их там, где картинка
крупная: молния уже заменена, дальше по такому же принципу логотип,
короны и трофей.
