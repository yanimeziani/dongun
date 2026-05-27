# ASSETS.md — Dongun Image Prompt Pack

Prompts to paste into ChatGPT (Imagen / GPT-Image) to generate every sprite, VFX, icon, and UI element implied by [PRD.md](PRD.md). All outputs must be **PNG with transparent background** so they can be dropped straight into Phaser atlases.

**Camera lock:** every in-world sprite (player, enemies, loot, decor, projectiles, ground markers) is rendered in **angled top-down 3/4 perspective** — the camera looks down at roughly a 60° pitch, NOT straight overhead. Sprites should show a hint of their front face (eyes, weapon, chest) plus the top of the head/body, so they read at any motion direction without rotating. UI icons stay flat-emblem; only in-world art uses the 3/4 angle.

---

## 0. Global Style Anchor

Prepend this style anchor to **every** prompt if generations drift. It locks the visual language so the whole atlas feels like one game.

```text
STYLE ANCHOR — Dongun. Modern arcade roguelite. Angled top-down 3/4 perspective (camera pitched ~60° down, not pure top-down) — the sprite shows a hint of its front face plus the top of its body. Clean bold silhouettes with a subtle 1–2px dark outline. High contrast palette: deep arena navy/charcoal background world, sprites use saturated neon accents (magenta, cyan, lime, gold) over warm grey/dark base tones. Slightly weird cute-but-cursed monster vibe. Painterly-pixel hybrid — not pure pixel art, not realistic. No grain, no film noise, no shadows on the ground, no text, no UI chrome, no watermark. PNG transparent background, alpha cutout clean, no halos, no checkerboard, no white box. Sprite must be centered with ~6% padding to its bounding box.
```

### Universal negative prompt (append to any generation that needs it)

```text
no text, no letters, no numbers, no UI, no health bar, no logos, no watermark, no signature, no border, no frame, no background, no ground shadow, no checkerboard, no white box, no JPEG artifacts, no photo realism, no human hands holding the sprite.
```

### Naming convention

Save files as `{category}_{name}_{size}.png` — e.g. `enemy_swarmling_64.png`, `ui_button_start_256x80.png`. All listed below.

---

## 1. Player Sprites

### 1.1 Player — Default

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective sprite of the hero of Dongun: a tiny heroic survivor, scrappy posture, dark hooded outfit with one bright neon-magenta accent (scarf or visor glow), holding a strange compact arcane blaster pointed forward. Camera pitched ~60° down — you can see the top of the hood AND a hint of the face/chest. Readable head and shoulders silhouette. 128x128 sprite, transparent background, centered, alpha cutout clean.
{UNIVERSAL NEGATIVE}
```
Filename: `player_default_128.png`

### 1.2 Player — Hit flash variant (optional, P3)

```text
{STYLE ANCHOR}
Same hero as player_default but rendered as a full bright-white silhouette flash with magenta rim light, used as a 1-frame damage flash overlay. Same pose, same bounding box. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `player_hitflash_128.png`

### 1.3 Player — Death poof (P3)

```text
{STYLE ANCHOR}
A small explosive poof of dust and neon-magenta sparks at the moment the hero dies, no character visible, centered burst, 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_player_death_128.png`

---

## 2. Enemy Sprites

All enemies face downward toward the camera so they read at any motion angle. Keep distinct silhouettes — each enemy must be identifiable as a black blob.

### 2.1 Normal Mob — "Crawler"

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective enemy sprite (camera pitched ~60° down — show top of body AND a hint of face/front), a small cursed monster: round goopy body in deep purple, two glowing yellow eyes, four little claw legs, mouth showing tiny fangs. Average sized threat. Readable round silhouette. 64x64 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `enemy_crawler_64.png`

### 2.2 Small Fast Mob — "Swarmling"

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective enemy sprite (camera pitched ~60° down — show top of body AND a hint of face/front), a tiny fast swarm bug: insect-like silhouette, sharp spider legs, hostile aggressive shape, body in toxic lime green with a single red eye. Smaller than Crawler. 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `enemy_swarmling_48.png`

### 2.3 Big Slow Mob — "Brute"

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective enemy sprite (camera pitched ~60° down — show top of body AND a hint of face/front), a large slow brute monster: heavy rounded boulder-like body, thick stubby limbs, hunched intimidating shape, dark crimson hide with bone plates, two small glowing white eyes. Reads big at a glance. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `enemy_brute_128.png`

### 2.4 Shooter Mob — "Spitter"

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective enemy sprite (camera pitched ~60° down — show top of body AND a hint of face/front), a ranged caster monster: bulbous body with one giant glowing cyan eye, small cannon-mouth on top, hovering posture, dark teal skin with cyan glow. Looks like it shoots projectiles. 64x64 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `enemy_spitter_64.png`

### 2.5 Variable Spawn Mob — "Husk" (P2 variant bucket)

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective enemy sprite (camera pitched ~60° down — show top of body AND a hint of face/front), a wandering possessed husk: tall thin twisted figure, faceless except for a slit of orange light, robes that drape outward, neutral but unsettling silhouette, charcoal grey with orange glow accents. 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `enemy_husk_96.png`

### 2.6 Elite — "Crowned Crawler" (challenge enemy)

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective elite enemy sprite (camera pitched ~60° down), an elite version of the Crawler with a small jagged golden crown floating above it, deep purple body with golden trim, faint gold glow halo around it (still alpha-clean edges). Same silhouette as crawler but visibly fancier. 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `enemy_crawler_elite_96.png`

### 2.7 Boss — placeholder (P3)

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective boss enemy sprite (camera pitched ~60° down — show menacing top-of-body silhouette plus a hint of the front face/chest core), a massive horned demon-skull tank, four legs, glowing magenta core in the chest, dark obsidian armor, two glowing eye sockets. Reads instantly as a boss. 256x256 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `enemy_boss_demonking_256.png`

---

## 3. Projectiles & Weapon FX

### 3.1 Bullet Blaster bullet

```text
{STYLE ANCHOR}
Tiny top-down projectile orb: bright magenta glowing core, slight white-hot center, soft directional smear suggesting forward motion (right-pointing). 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `proj_bullet_32.png`

### 3.2 Gatling bullet (smaller, yellow)

```text
{STYLE ANCHOR}
Tiny top-down projectile, smaller than the standard bullet, yellow-orange glowing tracer, hot white center, slight motion smear right. 24x24 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `proj_gatling_24.png`

### 3.3 Laser beam segment

```text
{STYLE ANCHOR}
Thin piercing laser projectile, horizontal bright cyan energy streak, hot white core, soft cyan glow edges (alpha clean), looks like it could pass through enemies. 64x16 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `proj_laser_64x16.png`

### 3.4 Shotgun pellet

```text
{STYLE ANCHOR}
Tiny top-down projectile pellet, warm orange glow, blunt round, small motion smear right. 20x20 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `proj_pellet_20.png`

### 3.5 Wormie Blaster bullet

```text
{STYLE ANCHOR}
Top-down projectile shaped like a tiny coiled worm of light, lime green and white, looks playful and weird, motion smear right. 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `proj_wormie_32.png`

### 3.6 Shooter Mob enemy projectile

```text
{STYLE ANCHOR}
Top-down enemy projectile orb, sickly cyan with a darker corona, slightly cracked surface, slow-looking heavy ball. Visually distinct from player bullets. 28x28 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `proj_enemy_spit_28.png`

### 3.7 Slice arc VFX

```text
{STYLE ANCHOR}
Arc-shaped melee slash effect, bright white-cyan curved swipe, motion lines, used as a one-frame impact in front of the player. 96x96 transparent PNG, slash arcs from left to right inside the frame.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_slice_96.png`

### 3.8 Whirlwind orbit blade VFX

```text
{STYLE ANCHOR}
A single curved spinning wind-blade segment, used as one of multiple orbiting hitboxes around the player, bright cyan-white energy crescent, motion trail tail. 64x64 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_whirlwind_blade_64.png`

### 3.9 Muzzle flash (generic)

```text
{STYLE ANCHOR}
Small muzzle-flash burst, bright magenta-white starburst, no smoke, one-frame pop, centered, 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_muzzleflash_32.png`

### 3.10 Bullet impact spark

```text
{STYLE ANCHOR}
Tiny impact spark cluster for when a projectile hits an enemy, sharp white-yellow shards radiating outward, one-frame, 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_impact_spark_32.png`

### 3.11 Enemy death poof

```text
{STYLE ANCHOR}
Small puff of dark purple smoke with a few bright white shards, one-frame death cloud for a regular mob, 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_enemy_death_48.png`

### 3.12 Chain Reaction explosion (rare bonus)

```text
{STYLE ANCHOR}
Top-down small explosion ring, bright orange-yellow shockwave with a hot white core and a thin outer ring, one-frame burst, 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_explosion_96.png`

---

## 4. Loot Pickups

### 4.1 XP orb — small

```text
{STYLE ANCHOR}
Tiny glowing experience orb pickup, bright lime-green crystal shard floating, soft inner glow, no shadow, 24x24 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_xp_small_24.png`

### 4.2 XP orb — medium

```text
{STYLE ANCHOR}
Bigger XP gem, faceted lime-green crystal, brighter glow than the small orb, clearly more valuable. 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_xp_medium_32.png`

### 4.3 XP orb — large

```text
{STYLE ANCHOR}
Large XP gem, multi-faceted lime-green crystal cluster, glowing strongly, 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_xp_large_48.png`

### 4.4 Gold coin

```text
{STYLE ANCHOR}
Tiny gold coin pickup, top-down, shiny gold with a small star or skull glyph stamped on it, simple, readable, 24x24 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_gold_coin_24.png`

### 4.5 Gold bundle (large drop)

```text
{STYLE ANCHOR}
A small pile of gold coins with one larger coin on top, readable as "big gold", 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_gold_bundle_48.png`

### 4.6 HP heart pickup

```text
{STYLE ANCHOR}
Small healing pickup, glowing red heart with a soft white highlight, slightly chunky and game-ready, 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_heart_32.png`

### 4.7 Magnet pickup (rare)

```text
{STYLE ANCHOR}
Pickup item shaped like a small horseshoe magnet, red with grey tips, slight magenta glow, 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_magnet_32.png`

### 4.8 Big Loot Chest — closed

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective magical loot chest (camera pitched ~60° down — show the lid top AND the front face with the lock), wooden body with golden trim and a glowing magenta lock, slightly weird arcane look, compact silhouette, 64x64 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_chest_closed_64.png`

### 4.9 Big Loot Chest — open

```text
{STYLE ANCHOR}
Same chest as loot_chest_closed but lid flipped back, bright golden light bursting up out of it, same bounding box, 64x64 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `loot_chest_open_64.png`

### 4.10 Chest open burst VFX

```text
{STYLE ANCHOR}
Bright golden vertical burst with sparkles and rays, used as a one-frame effect over an opening chest, 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_chest_burst_128.png`

---

## 5. Weapon Icons (for upgrade cards + HUD)

All weapon icons must share the same icon frame style: **flat square emblem, no background**, designed to sit on a UI card. Render the weapon as a stylized object, not as an in-world sprite.

### 5.1 Icon — Bullet Blaster

```text
{STYLE ANCHOR}
Square flat game icon (no frame, no badge), a stylized compact arcane blaster pistol with a magenta muzzle glow, 3/4 emblem view, clean shapes, designed to sit on a UI card. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_weapon_bulletblaster_128.png`

### 5.2 Icon — Gatling

```text
{STYLE ANCHOR}
Square flat game icon, a stubby six-barrel gatling gun, yellow-orange accents, motion-blur hint on the barrels, 3/4 emblem view, transparent background, 128x128 PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_weapon_gatling_128.png`

### 5.3 Icon — Laser

```text
{STYLE ANCHOR}
Square flat game icon, a sleek laser emitter with a bright cyan beam slicing diagonally across the frame, 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_weapon_laser_128.png`

### 5.4 Icon — Wormie Blaster

```text
{STYLE ANCHOR}
Square flat game icon, a weird organic blaster shaped like a coiled worm with a glowing lime mouth, 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_weapon_wormie_128.png`

### 5.5 Icon — Shotgun

```text
{STYLE ANCHOR}
Square flat game icon, a chunky double-barrel shotgun with orange muzzle glow and a spread of three small pellet sparks, 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_weapon_shotgun_128.png`

### 5.6 Icon — Back Blast (rare modifier)

```text
{STYLE ANCHOR}
Square flat game icon, two opposing arrows of fire shooting forward and backward from a central glowing rune, magenta and orange, conveys "mirrored shot". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_mod_backblast_128.png`

### 5.7 Icon — Slice

```text
{STYLE ANCHOR}
Square flat game icon, a curved cyan-white slash arc with a small dagger handle, conveys "melee swipe". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_weapon_slice_128.png`

### 5.8 Icon — Whirlwind

```text
{STYLE ANCHOR}
Square flat game icon, two curved cyan-white wind blades spinning around a central point, conveys "orbit weapon". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_weapon_whirlwind_128.png`

---

## 6. Modifier / Stat Buff Icons (level-up cards)

Same square emblem style as weapons. Each icon must read at 64x64 too.

### 6.1 Fire Rate Up

```text
{STYLE ANCHOR}
Square flat game icon, a stopwatch with a lightning bolt slashed across it, yellow accents, conveys "faster attacks". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_firerate_128.png`

### 6.2 Damage Up

```text
{STYLE ANCHOR}
Square flat game icon, a clenched fist with a red impact star behind it, conveys "more damage". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_damage_128.png`

### 6.3 Max HP Up

```text
{STYLE ANCHOR}
Square flat game icon, a red heart with a small upward green arrow next to it, conveys "more max health". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_maxhp_128.png`

### 6.4 Heal (instant)

```text
{STYLE ANCHOR}
Square flat game icon, a red heart with a white plus sign inside, conveys "instant heal". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_heal_128.png`

### 6.5 Move Speed Up

```text
{STYLE ANCHOR}
Square flat game icon, a winged boot with a small motion trail behind it, conveys "more speed". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_movespeed_128.png`

### 6.6 Pickup Radius Up

```text
{STYLE ANCHOR}
Square flat game icon, a small magnet pulling three little dots toward it inside a dashed circle, conveys "bigger pickup radius". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_pickup_128.png`

### 6.7 Armor Up

```text
{STYLE ANCHOR}
Square flat game icon, a stylized shield with a metallic sheen and a small rivet pattern, conveys "armor". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_armor_128.png`

### 6.8 Projectile Size Up

```text
{STYLE ANCHOR}
Square flat game icon, a small projectile orb next to a larger one with an arrow between them, conveys "bigger bullets". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_projsize_128.png`

### 6.9 Projectile Speed Up

```text
{STYLE ANCHOR}
Square flat game icon, a bullet with a strong motion trail behind it and a chevron pointing forward, conveys "faster projectiles". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_projspeed_128.png`

### 6.10 Luck Up

```text
{STYLE ANCHOR}
Square flat game icon, a four-leaf clover with a small gold star behind it, conveys "luck". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_luck_128.png`

### 6.11 Magnet Up

```text
{STYLE ANCHOR}
Square flat game icon, a strong horseshoe magnet with curving force lines pulling toward it, red and grey, 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_stat_magnet_128.png`

### 6.12 Penetration (laser-style modifier)

```text
{STYLE ANCHOR}
Square flat game icon, an arrow piercing through three stacked targets, conveys "piercing", cyan accents. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_mod_penetration_128.png`

### 6.13 Multishot

```text
{STYLE ANCHOR}
Square flat game icon, three diverging arrows fanning forward from a single origin, conveys "more projectiles", magenta accents. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_mod_multishot_128.png`

### 6.14 Wave Trajectory

```text
{STYLE ANCHOR}
Square flat game icon, a sine-wave path with a small projectile on it, conveys "wave trajectory", lime green. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_mod_wave_128.png`

---

## 7. Rare / Special Bonus Icons

These appear as the rare 4th choice. Style them with a slight extra glow/legendary feel.

### 7.1 Chain Reaction

```text
{STYLE ANCHOR}
Square flat game icon, three small explosion orbs chained together with bright connecting arcs, hot orange and white, conveys "kills explode". Slight glow. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_rare_chainreaction_128.png`

### 7.2 Greedy Crown

```text
{STYLE ANCHOR}
Square flat game icon, a jagged golden crown with a red gem and tiny coins falling out of it, conveys "more gold, less HP". Slight glow. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_rare_greedycrown_128.png`

### 7.3 Glass Engine

```text
{STYLE ANCHOR}
Square flat game icon, a cracked glass gear with steam coming off it, conveys "huge fire rate but fragile". Slight glow. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_rare_glassengine_128.png`

### 7.4 Soul Magnet

```text
{STYLE ANCHOR}
Square flat game icon, a magnet with ghostly green soul wisps spiraling into it, conveys "pulls all XP". Slight glow. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_rare_soulmagnet_128.png`

### 7.5 Twin Orbit

```text
{STYLE ANCHOR}
Square flat game icon, two cyan whirlwind blades orbiting a central rune, conveys "second orbit blade". Slight glow. 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_rare_twinorbit_128.png`

---

## 8. Challenge Markers

### 8.1 Kill Circle marker

```text
{STYLE ANCHOR}
Top-down ground marker: a glowing magenta ring with skull glyphs around the inner edge, slightly translucent. Used to mark a "kill in circle" challenge zone on the arena floor. 256x256 transparent PNG, ring is hollow center.
{UNIVERSAL NEGATIVE}
```
Filename: `marker_killcircle_256.png`

### 8.2 Gold Shrine marker

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective shrine object (camera pitched ~60° down — show pedestal top AND front face): a small ornate gold pedestal with a glowing coin floating above it, used as a world challenge marker. 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `marker_goldshrine_96.png`

### 8.3 Elite Hunt marker (icon above target)

```text
{STYLE ANCHOR}
Floating skull icon with a small crown above it, bright magenta glow, used as an indicator above an elite enemy. 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `marker_elitetarget_48.png`

### 8.4 Off-screen challenge arrow

```text
{STYLE ANCHOR}
A bright magenta-glowing chevron arrow pointing right, used as a directional indicator at the edge of the screen toward an off-screen objective. 64x64 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_offscreen_arrow_64.png`

---

## 9. Arena / Tile Assets

These can have **opaque backgrounds** because they're meant to tile a floor. Everything else stays transparent.

### 9.1 Floor tile A — base

```text
{STYLE ANCHOR}
A 256x256 seamless top-down dungeon arena floor tile, dark charcoal stone with subtle navy undertones, faint cracks and grit, no obvious repeating motif, tiles seamlessly on all four edges, no text, no UI, no objects. Opaque background, PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `tile_floor_a_256.png`

### 9.2 Floor tile B — accent

```text
{STYLE ANCHOR}
A 256x256 seamless top-down dungeon arena floor tile matching tile_floor_a in palette, with a faint magenta arcane glyph etched into the stone, very subtle, tiles seamlessly. Opaque PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `tile_floor_b_256.png`

### 9.3 Arena vignette overlay

```text
{STYLE ANCHOR}
A 1920x1080 dark vignette overlay, transparent center, soft black radial fade to the edges (about 35% opacity at corners), used as a screen-space overlay to focus attention. Transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_vignette_1920x1080.png`

### 9.4 Decorative obstacle — broken pillar

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective arena decoration (camera pitched ~60° down — show top surface AND a hint of front face): a broken stone pillar lying on its side, dark grey stone with cracks, slight magenta moss glow on one end. 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `decor_pillar_96.png`

### 9.5 Decorative obstacle — rune stone

```text
{STYLE ANCHOR}
Angled top-down 3/4 perspective arena decoration (camera pitched ~60° down — show top surface AND a hint of front face): a standing rune stone with a glowing cyan glyph carved into it, dark grey stone. 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `decor_runestone_96.png`

---

## 10. HUD Elements

### 10.1 HP bar — frame

```text
{STYLE ANCHOR}
A horizontal HUD frame for a health bar: a flat dark slate bar with a subtle metallic outline and small rivets at each corner, designed to contain a fill bar inside. 480x40 transparent PNG. Inside fill area must be cleanly empty (full transparent rectangle ~440x24 centered).
{UNIVERSAL NEGATIVE}
```
Filename: `hud_hpbar_frame_480x40.png`

### 10.2 HP bar — fill

```text
{STYLE ANCHOR}
A solid red gradient HP fill graphic, slightly glossy top-down sheen, no frame, sized to slot inside hud_hpbar_frame. 440x24 transparent PNG (the bar itself fills the frame; outside is transparent).
{UNIVERSAL NEGATIVE}
```
Filename: `hud_hpbar_fill_440x24.png`

### 10.3 XP bar — frame

```text
{STYLE ANCHOR}
A horizontal HUD frame for an XP bar, thinner and longer than the HP bar, dark slate with a faint cyan inner edge, designed to span across the top of the screen. 1600x16 transparent PNG, inner fill area cleanly empty.
{UNIVERSAL NEGATIVE}
```
Filename: `hud_xpbar_frame_1600x16.png`

### 10.4 XP bar — fill

```text
{STYLE ANCHOR}
A solid cyan-lime gradient XP fill graphic with a soft glow, sized to slot inside hud_xpbar_frame. 1560x10 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `hud_xpbar_fill_1560x10.png`

### 10.5 Weapon slot frame (HUD owned-weapons row)

```text
{STYLE ANCHOR}
Small square UI slot frame, dark slate background with thin magenta inner border, slightly inset look, designed to host a weapon icon at 64x64. 80x80 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `hud_weaponslot_80.png`

### 10.6 Buff slot frame (active buffs row)

```text
{STYLE ANCHOR}
Small rounded square UI slot, dark slate with a thin gold inner border, designed to host a buff icon at 48x48. 64x64 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `hud_buffslot_64.png`

### 10.7 Gold counter badge

```text
{STYLE ANCHOR}
A small rounded badge with a gold coin glyph on the left side and an empty space on the right reserved for a number rendered by the game, dark slate background with gold trim. 192x56 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `hud_goldbadge_192x56.png`

### 10.8 Timer badge

```text
{STYLE ANCHOR}
A small rounded badge with a stopwatch glyph on the left and reserved empty space on the right for a number, dark slate with cyan trim. 192x56 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `hud_timerbadge_192x56.png`

### 10.9 Level badge

```text
{STYLE ANCHOR}
A small circular badge with a star glyph on it, dark slate fill, cyan-lime outer ring, reserved empty center for a level number. 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `hud_levelbadge_96.png`

### 10.10 Damage number callout — neutral

```text
{STYLE ANCHOR}
A tiny floating callout shape for a damage number, soft white-glow halo, no text inside (game renders the number), 64x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_dmgnumber_neutral_64x32.png`

### 10.11 Damage number callout — crit

```text
{STYLE ANCHOR}
Same shape as vfx_dmgnumber_neutral but with a hot orange glow halo and small spike accents around it, conveys "crit". 64x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `vfx_dmgnumber_crit_64x32.png`

---

## 11. Level-Up & Card UI

### 11.1 Upgrade card — common rarity frame

```text
{STYLE ANCHOR}
A vertical UI card frame, rounded corners, dark slate body with a thin grey inner border, top section reserved for an icon (centered empty area ~200x200), middle reserved for a title strip (empty), bottom reserved for description (empty). 320x480 transparent PNG. Inside areas are cleanly empty so the game can overlay icon + text.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_card_common_320x480.png`

### 11.2 Upgrade card — rare rarity frame

```text
{STYLE ANCHOR}
Same layout as ui_card_common but with a glowing cyan inner border, faint cyan corner accents, conveys "rare". 320x480 transparent PNG, interior empty.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_card_rare_320x480.png`

### 11.3 Upgrade card — legendary rarity frame

```text
{STYLE ANCHOR}
Same layout as ui_card_common but with a glowing magenta-gold inner border, ornate corner flourishes, conveys "legendary". 320x480 transparent PNG, interior empty.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_card_legendary_320x480.png`

### 11.4 Card hover glow overlay

```text
{STYLE ANCHOR}
A vertical soft white-cyan glow halo shaped to fit around a 320x480 card, used as a hover state overlay, transparent center. 360x520 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_card_hoverglow_360x520.png`

### 11.5 "LEVEL UP" banner

```text
{STYLE ANCHOR}
A wide horizontal banner shape, dark slate with cyan-magenta glowing trim, ornate but clean, used as the level-up screen header. 800x140 transparent PNG. No text rendered — game will draw "LEVEL UP" on top.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_levelup_banner_800x140.png`

---

## 12. Buttons & Generic UI Widgets

### 12.1 Primary button — idle

```text
{STYLE ANCHOR}
A wide rectangular button, rounded corners, dark slate fill, magenta inner glow border, slight inner bevel, designed to host a text label rendered by the game. 320x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_button_primary_idle_320x96.png`

### 12.2 Primary button — hover

```text
{STYLE ANCHOR}
Same button as ui_button_primary_idle but with a brighter magenta glow, slightly lifted look. 320x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_button_primary_hover_320x96.png`

### 12.3 Primary button — pressed

```text
{STYLE ANCHOR}
Same button as ui_button_primary_idle but inset/darker, conveys "pressed". 320x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_button_primary_pressed_320x96.png`

### 12.4 Secondary button — idle (smaller)

```text
{STYLE ANCHOR}
A smaller rectangular button, rounded corners, dark slate fill, thin cyan inner border, more understated than primary. 256x72 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_button_secondary_idle_256x72.png`

### 12.5 Icon button — circular

```text
{STYLE ANCHOR}
A circular icon button, dark slate fill, thin cyan border, blank center so the game can overlay a glyph. 96x96 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_button_iconcircle_96.png`

### 12.6 Close (X) glyph

```text
{STYLE ANCHOR}
A clean white "X" glyph, bold strokes, no background, designed to sit centered on top of an icon button. 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_glyph_close_48.png`

### 12.7 Pause glyph

```text
{STYLE ANCHOR}
A clean white pause glyph (two vertical bars), bold strokes, no background. 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_glyph_pause_48.png`

### 12.8 Settings (gear) glyph

```text
{STYLE ANCHOR}
A clean white gear glyph, bold strokes, no background. 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_glyph_gear_48.png`

### 12.9 Restart (circular arrow) glyph

```text
{STYLE ANCHOR}
A clean white circular arrow restart glyph, bold strokes, no background. 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_glyph_restart_48.png`

### 12.10 Generic panel frame

```text
{STYLE ANCHOR}
A large rectangular panel frame, rounded corners, dark slate fill (~85% opacity), thin cyan inner border, used as a backdrop for menus and shop. Interior is a flat fill, no decorations inside. 1024x720 transparent PNG with the rectangle centered.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_panel_1024x720.png`

### 12.11 Tooltip frame (small)

```text
{STYLE ANCHOR}
A small rounded rectangle tooltip frame, dark slate with a subtle cyan glow border, blank interior. 320x140 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_tooltip_320x140.png`

---

## 13. Main Menu

### 13.1 Title logo — "Dongun"

```text
{STYLE ANCHOR}
A bold game title logotype "DONGUN" rendered as graphic art (not flat text): chunky angled letterforms with a magenta-to-cyan neon gradient, slight battle-worn dings, faint glow halo. Single-word horizontal lockup, centered. 1024x512 transparent PNG. This is the only place text is allowed.
{UNIVERSAL NEGATIVE EXCEPT TEXT}
```
Filename: `ui_logo_title_1024x512.png`

> Note: this is the **one exception** to "no text" — the title logo is allowed to contain stylized text. Generate it as graphic artwork, not as a font render.

### 13.2 Main menu background

```text
{STYLE ANCHOR}
A 1920x1080 background image of a dim arcane arena seen from a high angle, atmospheric mist, faint glowing magenta runes scattered on the dark stone floor, distant silhouettes of cursed creatures barely visible, dramatic but not busy, designed to sit behind the main menu UI. PNG (opaque).
{UNIVERSAL NEGATIVE}
```
Filename: `ui_mainmenu_bg_1920x1080.png`

### 13.3 Death screen background overlay

```text
{STYLE ANCHOR}
A 1920x1080 dark red-tinted vignette overlay, soft heavy darkening on the edges, faint blood-red flecks, used as a full-screen overlay behind the death screen panel. Transparent PNG (semi-transparent fill).
{UNIVERSAL NEGATIVE}
```
Filename: `ui_deathscreen_overlay_1920x1080.png`

### 13.4 Shop background

```text
{STYLE ANCHOR}
A 1920x1080 background image of a quiet stone forge/altar room with a faint magenta brazier glow, designed to sit behind the permanent upgrade shop UI, not busy. PNG (opaque).
{UNIVERSAL NEGATIVE}
```
Filename: `ui_shop_bg_1920x1080.png`

---

## 14. Permanent Upgrade Shop Icons

One icon per shop entry from PRD §18.

### 14.1 Tough Skin

```text
{STYLE ANCHOR}
Square flat game icon, a layered leather chestplate with iron studs, conveys "more max HP". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_perm_toughskin_128.png`

### 14.2 Faster Hands

```text
{STYLE ANCHOR}
Square flat game icon, a fingerless glove with motion-trail lines around the fingers, conveys "fire rate". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_perm_fasterhands_128.png`

### 14.3 Heavy Hits

```text
{STYLE ANCHOR}
Square flat game icon, a heavy iron knuckle with a red impact star, conveys "more damage". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_perm_heavyhits_128.png`

### 14.4 Runner Legs

```text
{STYLE ANCHOR}
Square flat game icon, a sleek running boot with a small green motion trail, conveys "more speed". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_perm_runnerlegs_128.png`

### 14.5 Greedy Pocket

```text
{STYLE ANCHOR}
Square flat game icon, a leather coin pouch overflowing with gold coins, conveys "more gold". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_perm_greedypocket_128.png`

### 14.6 Magnet Soul

```text
{STYLE ANCHOR}
Square flat game icon, a horseshoe magnet with a ghostly aura, conveys "bigger pickup radius". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_perm_magnetsoul_128.png`

### 14.7 Lucky Tooth

```text
{STYLE ANCHOR}
Square flat game icon, a single white fang with a four-leaf clover behind it, conveys "luck". 128x128 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `icon_perm_luckytooth_128.png`

### 14.8 Shop slot frame

```text
{STYLE ANCHOR}
Wide horizontal slot frame for a shop entry, dark slate with thin gold trim, reserved left square area for an icon, large empty middle area for name+description, small right area for cost. 720x128 transparent PNG, interior cleanly empty.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_shopslot_720x128.png`

### 14.9 Shop level pip — filled

```text
{STYLE ANCHOR}
Small filled gold diamond pip used to show one filled level of a permanent upgrade. 24x24 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_pip_filled_24.png`

### 14.10 Shop level pip — empty

```text
{STYLE ANCHOR}
Small empty grey diamond pip used to show one unfilled level of a permanent upgrade. 24x24 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_pip_empty_24.png`

---

## 15. Cursor & Misc

### 15.1 Custom cursor

```text
{STYLE ANCHOR}
A small white-cyan crosshair cursor, four short tick marks around a central dot, slight glow, 32x32 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_cursor_32.png`

### 15.2 Aim reticle (when auto-target locked)

```text
{STYLE ANCHOR}
A small magenta diamond reticle with four tick marks at cardinal points, faint glow, used to mark the auto-targeted enemy. 48x48 transparent PNG.
{UNIVERSAL NEGATIVE}
```
Filename: `ui_reticle_48.png`

---

## 16. Generation Workflow

1. Open ChatGPT. Use GPT-Image / Imagen mode.
2. For each entry above, paste the prompt **including the global style anchor** (Section 0). Treat `{STYLE ANCHOR}` and `{UNIVERSAL NEGATIVE}` as substitution slots.
3. Ask for "transparent PNG, alpha cutout clean" on each request, even though it's already in the prompt — the model sometimes still adds a background.
4. Save with the exact filename listed. Drop into `games/dongun/public/assets/{category}/`.
5. If a generation has a white box or checkerboard background, regenerate or run it through a background remover before importing.
6. Keep one reference image (e.g. `player_default_128.png`) and feed it back as a style reference when generating same-family assets (other enemies, other VFX) to keep the palette consistent.

### Recommended generation order (for palette consistency)

1. `player_default_128.png` — sets the palette anchor.
2. All enemies (Section 2) — reuse player as style ref.
3. All projectiles + VFX (Section 3) — reuse player + enemies as refs.
4. Loot (Section 4) — independent of palette anchor but should still match.
5. Weapon icons (Section 5), stat icons (Section 6), rare icons (Section 7) — all share the same emblem frame style; generate together so they match.
6. HUD frames (Section 10), card frames (Section 11), buttons (Section 12), panels — generate as a cohesive UI set in one session.
7. Title logo + menu backgrounds (Section 13) last, after the visual identity is locked.
