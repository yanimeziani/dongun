# PRD.md — Dongun

## 1. Product Summary

**Working title:** Dongun  
**Genre:** Browser-based survival arena / roguelite bullet-heaven  
**Engine:** Phaser 3  
**Art pipeline:** ChatGPT Imagen-generated sprites, then manually curated/cleaned as transparent PNG atlases  
**Build style:** Vibe-coded MVP: fast playable prototype first, polish second, systems kept modular enough for AI-assisted iteration.

Dongun is a fast browser game where the player survives endless enemy waves, collects loot, upgrades weapons, and snowballs into absurd builds. The hook is simple: **kill mobs, find loot, choose upgrades, survive as long as possible, earn gold, unlock permanent power, repeat.**

The game should feel instantly readable, high-energy, and school-browser-friendly: low menus, fast restarts, big juice, clear power growth.

---

## 2. Core Vision

The game must deliver three feelings:

1. **Immediate control**
   - Player moves instantly.
   - Attacks are automatic or semi-automatic depending on weapon type.
   - First 15 seconds must already feel playable.

2. **Chaotic build discovery**
   - Weapons combine.
   - Buffs modify the main weapon and other active weapons.
   - New weapons added to the run reduce the odds of seeing additional new weapon types, making build direction feel meaningful.

3. **Greedy risk-reward**
   - Survive longer for more gold.
   - Pick up loot while dodging mobs.
   - Optional challenges spawn far from the player and tempt them away from safety.

---

## 3. Platform & Technical Constraints

### Target Platform

- Desktop browser first
- Mobile browser later
- Keyboard support required
- Gamepad support optional
- No account system for MVP
- LocalStorage for saves in MVP

### Tech Stack

- Phaser 3
- TypeScript preferred
- Vite or Next.js wrapper acceptable
- LocalStorage for progression
- ChatGPT Imagen for sprites
- No backend required for MVP

### Performance Goals

- Stable 60 FPS with 100+ enemies on screen
- Sprite batching where possible
- Object pooling for bullets, enemies, loot, particles, damage numbers
- Avoid expensive physics on every object
- Use arcade physics only where useful

---

## 4. Player Fantasy

“You are a tiny overpowered menace in a cursed arena, finding strange weapons and stacking ridiculous modifiers until the screen becomes a beautiful disaster.”

The player starts weak, but every minute should make them feel more dangerous. Runs should escalate from “I am surviving” to “I built a machine that erases monsters.”

---

## 5. MVP Game Loop

### Run Loop

1. Start run
2. Player spawns in arena
3. Enemy waves spawn around the player
4. Player kills mobs
5. Enemies drop XP, loot, and gold
6. Player levels up
7. Player chooses one of 3 upgrade options
8. Rare chance to show a 4th special option
9. Player survives as long as possible
10. Player dies
11. Earned gold is banked
12. Player spends gold on permanent upgrades
13. Start next run

### Moment-to-Moment Loop

```text
Move → dodge → auto-attack → kill mobs → collect drops → level up → choose buff → become stronger → survive harder wave
```

### Meta Loop

```text
Run → earn gold → buy permanent upgrades → unlock stronger starts → push deeper survival time
```

---

## 6. Priority System

Use this priority label on every feature:

| Priority | Meaning |
|---|---|
| P1 | Core gameplay, required for MVP |
| P2 | Useful addition, improves replayability |
| P3 | Fluff, juice, visual polish, nice addition |

---

## 7. MVP Feature Scope

### P1 Required

- Player movement
- One starting weapon
- Enemy spawning
- Enemy damage to player
- Player health
- XP drops
- Level-up screen with 3 choices
- Weapon/buff system
- Basic loot drops
- Gold collection
- Death screen
- Permanent upgrade shop
- Restart loop
- Basic generated sprites

### P2 Useful

- Rare 4th upgrade choice
- Multiple weapon archetypes
- Challenge events that spawn away from player
- Enemy type variety
- Better visual effects
- Damage numbers
- Basic audio
- Pause menu

### P3 Nice

- Fancy main menu
- Character skins
- Weapon evolutions
- Bosses
- Daily challenge
- Online leaderboard
- Mobile controls
- Cosmetics
- Unlockable arenas

---

## 8. Controls

### Desktop

| Action | Input |
|---|---|
| Move | WASD or Arrow Keys |
| Aim | Mouse position, optional |
| Confirm upgrade | Click / Enter |
| Pause | Esc |
| Restart after death | R / Button |

### Attack Model

For MVP, attacks should be automatic to keep gameplay accessible.

- Player moves.
- Weapons fire based on their own cooldowns.
- Direction can be nearest enemy, player facing direction, or mouse aim depending on weapon.
- Recommended MVP: **auto-target nearest enemy**.

---

## 9. Player Stats

| Stat | Description |
|---|---|
| HP | Current health |
| Max HP | Maximum health |
| Move Speed | Player movement speed |
| Fire Rate | Multiplier on weapon cooldown |
| Damage | Damage multiplier |
| Pickup Radius | Radius for collecting XP/gold |
| Luck | Increases rare upgrade chance |
| Armor | Reduces incoming damage |
| Magnet | Pulls loot toward player |

---

## 10. Enemy Types

### Normal Mob

- Baseline enemy
- Runs toward player
- Medium speed
- Medium HP
- Most common spawn

### Small Fast Mob

- Smaller sprite
- Faster than normal
- Lower HP
- Spawns in swarms
- Creates panic and movement pressure

### Big Slow Mob

- Large sprite
- Slow movement
- High HP
- Deals more contact damage
- Creates path blocking

### Shooter Mob

- Keeps distance if possible
- Shoots slow projectiles at player
- Lower HP than big mob
- Forces dodging

### Variable Spawn Mob

- Variant bucket for later enemies
- Can spawn in special patterns
- Used for challenges and experimental waves

---

## 11. Weapon System

Weapons are modular. Each weapon has:

```ts
type Weapon = {
  id: string;
  name: string;
  rarity: "common" | "rare" | "legendary";
  cooldownMs: number;
  baseDamage: number;
  projectileSpeed?: number;
  range?: number;
  area?: number;
  behavior: WeaponBehavior;
  modifiers: WeaponModifier[];
};
```

Weapons should combine with buffs. Buffs modify the weapon rather than replacing it.

Example:

```text
Gatling + Shotgun + Wave Trajectory = many inaccurate bullets moving in sine waves
```

This is the core toybox.

---

## 12. Weapon Types

### 12.1 Bullet Blaster

**Role:** Default weapon  
**Priority:** P1  
**Behavior:** Fires a bullet at nearest enemy.

Stats:

- Medium fire rate
- Medium damage
- Medium range
- Single projectile

Upgrade hooks:

- More damage
- Faster fire rate
- More projectiles
- Bigger bullets
- Better targeting

---

### 12.2 Gatling

**Role:** Fire-rate chaos weapon  
**Priority:** P1  
**Behavior:** Fires extremely fast with accuracy penalty.

Rules:

- +300% fire rate
- Adds ~10% accuracy offset/spread
- Lower per-shot damage optional for balance
- Best with on-hit effects and penetration

Feel:

- Messy bullet hose
- Great early dopamine
- Visually noisy but readable

---

### 12.3 Laser

**Role:** Piercing weapon  
**Priority:** P1  
**Behavior:** Projectile penetrates through enemies.

Rules:

- Bullets pass through multiple enemies
- Beam version can be added later
- Strong against lines and swarms
- Lower fire rate or damage if too strong

---

### 12.4 Wormie Blaster

**Role:** Strange trajectory weapon  
**Priority:** P2  
**Behavior:** Bullets move in a wave/sine pattern.

Rules:

- Projectile follows sinusoidal path
- Harder to aim, stronger area coverage
- Looks weird and memorable
- Great for Imagen sprite identity

---

### 12.5 Shotgun

**Role:** Multi-projectile spread weapon  
**Priority:** P1  
**Behavior:** Fires multiple bullets, each with offset.

Rules:

- Fires several pellets per attack
- Each pellet gets small random angular offset
- Example: 5% offset per bullet
- Strong close range
- Weak at long range unless upgraded

---

### 12.6 Back Blast

**Role:** Rare mirrored-shot modifier  
**Priority:** P2  
**Behavior:** When firing forward, the same shot also fires from behind.

Rules:

- Rare upgrade
- Duplicates shot in opposite direction
- Works especially well with shotgun/gatling
- Should feel like a “wait, that’s broken” discovery

---

### 12.7 Slice

**Role:** Short-range melee swipe  
**Priority:** P1  
**Behavior:** Adds a short-range slash in front of player or toward nearest enemy.

Rules:

- Arc-shaped hitbox
- Short cooldown
- Good for enemies that get too close
- Should have clear slash VFX

---

### 12.8 Whirlwind

**Role:** Defensive orbit weapon  
**Priority:** P1  
**Behavior:** Constant sword/wind swirl around player.

Rules:

- Rotates around player
- Hits enemies in orbit radius
- Deals 50% of base damage
- Attacks 2x faster than current fire rate
- Strong defensive build option

---

## 13. Upgrade / Level-Up System

When the player levels up, pause the game and show upgrade choices.

### Default Choice Count

- Show 3 choices.
- Choices can be weapons, weapon modifiers, or stat bonuses.

### Rare 4th Choice

- 10% chance to show a 4th choice.
- If a 4th choice appears, it must be rare or special.
- Luck can increase this chance later.

### Choice Categories

| Category | Examples |
|---|---|
| Weapon | Add Shotgun, Add Whirlwind |
| Weapon Modifier | Penetrating bullets, Back Blast, Wave trajectory |
| Stat Buff | Fire rate up, Max HP up, damage up |
| Utility | Pickup radius, move speed, armor |
| Special Rare | Unique build-changing upgrade |

---

## 14. Loot Types

### Small Loot

Dropped often. Equivalent to basic level-up style rewards.

Can include:

- XP orb
- Gold coin
- Small HP heal
- Temporary mini buff
- Common stat bonus shard

Rules:

- Should not include special rare upgrades.
- Should feel frequent and satisfying.

### Big Loot

Dropped rarely from elite mobs, challenge rewards, or special chests.

Can include:

- New weapon
- Big buff
- Rare modifier
- Large gold bundle

Rules:

- Always meaningful.
- Must never feel like trash.
- Can trigger an immediate choice screen.

---

## 15. Upgrade Probability Rules

The sketch suggests that adding weapons affects the chance of receiving new weapon types. Use this simple rule:

```text
Every new weapon added makes the chance of getting another new weapon type lower.
```

### Design Purpose

- Prevents random bloated builds.
- Makes early choices important.
- Encourages commitment to a build.
- Keeps the run readable.

### MVP Formula

```ts
newWeaponChance = clamp(0.35 - ownedWeapons.length * 0.06, 0.08, 0.35)
```

Example:

| Owned Weapons | New Weapon Chance |
|---:|---:|
| 1 | 29% |
| 2 | 23% |
| 3 | 17% |
| 4+ | 8% |

The rest of the choices should be modifiers, stat buffs, or upgrades to owned weapons.

---

## 16. Bonus Types

### Level-Up Bonuses

Common level-up bonuses:

- Fire rate +
- Max HP +
- Damage +
- Move speed +
- Pickup radius +
- Armor +
- Projectile size +
- Projectile speed +

### Special Rare Bonuses

Rare bonuses should change how a run behaves.

Examples:

- Back Blast: duplicate shots behind player
- Chain Reaction: killed enemies explode
- Greedy Crown: more gold, less max HP
- Glass Engine: huge fire rate, reduced armor
- Soul Magnet: every elite kill pulls all XP on screen
- Twin Orbit: Whirlwind gains a second orbiting blade

---

## 17. Challenges

### Purpose

Challenges create risk-reward decisions during a run.

### Spawn Rule

- Challenge marker spawns far from player.
- Player must travel to activate or complete it.
- This forces movement and breaks passive circling.

### Challenge Examples

#### Kill Circle

- A circle appears far away.
- Player must stand inside and kill enemies.
- Reward: big loot chest.

#### Gold Shrine

- Shrine spawns far from player.
- Player must survive near it for 20 seconds.
- Reward: large gold bundle.

#### Elite Hunt

- Special enemy spawns far away.
- Player must kill it before timer ends.
- Reward: rare upgrade choice.

#### No-Hit Burst

- Survive 15 seconds without damage.
- Reward: rare 4th upgrade choice or gold.

---

## 18. Permanent Upgrades

Gold earned during runs can be spent between runs.

### MVP Upgrade Shop

| Upgrade | Effect | Max Level |
|---|---|---:|
| Tough Skin | +Max HP | 10 |
| Faster Hands | +Fire Rate | 10 |
| Heavy Hits | +Damage | 10 |
| Runner Legs | +Move Speed | 5 |
| Greedy Pocket | +Gold Gain | 10 |
| Magnet Soul | +Pickup Radius | 5 |
| Lucky Tooth | +Rare Choice Chance | 5 |

### Save System

Use LocalStorage:

```ts
type SaveData = {
  totalGold: number;
  spentGold: number;
  upgrades: Record<string, number>;
  bestSurvivalTime: number;
  totalRuns: number;
};
```

---

## 19. UI / UX

### Main Menu

MVP should be minimal:

- Game title
- Start Run button
- Permanent Upgrades button
- Best Time
- Total Gold

No heavy menu system for MVP.

### In-Game HUD

Show:

- HP bar
- Level
- XP bar
- Gold count
- Timer
- Owned weapons icons
- Active buffs, max 3 prominent buffs at a time

### Level-Up Screen

Cards should show:

- Upgrade name
- Icon
- Short effect
- Rarity color
- A simple stat delta when relevant

### Death Screen

Show:

- Survival time
- Enemies killed
- Gold earned
- Level reached
- Restart button
- Upgrade shop button

---

## 20. Visual Direction

### Style

- Modern arcade roguelite
- Simple but sharp silhouettes
- High contrast sprites
- Readable top-down shapes
- Slightly weird monster designs
- Punchy VFX

### Camera

- Top-down or slight angled top-down
- Camera follows player
- Keep player centered with slight movement smoothing

### Arena

MVP arena can be simple:

- Dark floor texture
- Subtle grid/noise
- Decorative obstacles later
- Infinite or large bounded arena

### Sprite Requirements

For generated sprites:

- Transparent background
- Clean silhouette
- 64x64 or 128x128 PNG
- Top-down readable
- No text
- No UI
- Consistent lighting
- 3/4 top-down angle acceptable if readable

---

## 21. ChatGPT Imagen Sprite Prompt Pack

Use these prompts to generate first-pass assets.

### Player Sprite

```text
Top-down 2D game sprite of a tiny heroic survivor character, modern arcade roguelite style, clean readable silhouette, dark outfit with one bright accent, holding a strange compact weapon, 64x64 sprite, transparent background, no text, no UI, high contrast, simple shapes, game-ready asset.
```

### Normal Mob

```text
Top-down 2D game sprite of a small cursed monster enemy, simple round body, claw-like legs, readable silhouette, modern arcade roguelite style, 64x64 sprite, transparent background, no text, no UI, high contrast, game-ready asset.
```

### Small Fast Mob

```text
Top-down 2D game sprite of a tiny fast swarm monster, insect-like silhouette, sharp little legs, aggressive shape, modern arcade roguelite style, 64x64 sprite, transparent background, no text, no UI, high contrast, game-ready asset.
```

### Big Slow Mob

```text
Top-down 2D game sprite of a large slow brute monster, heavy rounded body, thick limbs, intimidating but simple silhouette, modern arcade roguelite style, 128x128 sprite, transparent background, no text, no UI, high contrast, game-ready asset.
```

### Shooter Mob

```text
Top-down 2D game sprite of a ranged monster that shoots projectiles, one glowing eye, small cannon-like mouth, simple readable silhouette, modern arcade roguelite style, 64x64 sprite, transparent background, no text, no UI, high contrast, game-ready asset.
```

### Bullet Projectile

```text
Small 2D projectile sprite for a top-down arcade roguelite, glowing bullet orb, clean silhouette, high contrast, 32x32 sprite, transparent background, no text, no UI.
```

### Laser Projectile

```text
Thin piercing laser projectile sprite for a top-down arcade roguelite, bright energy streak, clean readable shape, 64x16 sprite, transparent background, no text, no UI.
```

### Slice VFX

```text
Arc-shaped melee slash effect for a top-down 2D arcade roguelite, bright curved swipe, clean transparent background, no text, no UI, game-ready VFX sprite.
```

### Whirlwind VFX

```text
Circular spinning wind blade effect for a top-down 2D arcade roguelite, readable orbit slash, clean transparent background, no text, no UI, game-ready VFX sprite.
```

### Gold Coin

```text
Tiny gold coin pickup sprite for a top-down arcade game, shiny but simple, readable at 32x32, transparent background, no text, no UI.
```

### XP Orb

```text
Tiny glowing experience orb pickup sprite for a top-down arcade roguelite, readable at 32x32, transparent background, no text, no UI.
```

### Big Loot Chest

```text
Top-down 2D loot chest sprite, magical arcade roguelite style, compact readable silhouette, 64x64 sprite, transparent background, no text, no UI, high contrast.
```

---

## 22. Phaser 3 Architecture

Recommended folder structure:

```text
src/
  main.ts
  game/
    config.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      MainMenuScene.ts
      GameScene.ts
      UpgradeScene.ts
      DeathScene.ts
      ShopScene.ts
    entities/
      Player.ts
      Enemy.ts
      Projectile.ts
      Loot.ts
    systems/
      EnemySpawnSystem.ts
      WeaponSystem.ts
      UpgradeSystem.ts
      LootSystem.ts
      ProgressionSystem.ts
      ChallengeSystem.ts
      SaveSystem.ts
      PoolSystem.ts
    data/
      weapons.ts
      upgrades.ts
      enemies.ts
      permanentUpgrades.ts
    ui/
      Hud.ts
      UpgradeCard.ts
      ShopPanel.ts
    utils/
      math.ts
      weightedRandom.ts
      constants.ts
```

---

## 23. Core Systems

### Player System

Responsibilities:

- Movement
- HP
- Damage intake
- Current stats
- XP and level
- Owned weapons
- Active modifiers

### Weapon System

Responsibilities:

- Track owned weapons
- Fire weapons based on cooldown
- Apply modifiers
- Spawn projectiles or hitboxes
- Handle orbit weapons like Whirlwind

### Enemy Spawn System

Responsibilities:

- Spawn waves over time
- Increase difficulty every minute
- Mix enemy types
- Spawn elites and challenge enemies later

### Loot System

Responsibilities:

- Drop XP/gold
- Spawn big loot
- Magnet pickup behavior
- Apply rewards

### Upgrade System

Responsibilities:

- Generate level-up choices
- Apply rarity rules
- Apply owned weapon probability rule
- Handle rare 4th choice

### Challenge System

Responsibilities:

- Spawn optional challenge far from player
- Track timer and conditions
- Reward player with gold/big loot/rare choice

### Save System

Responsibilities:

- Load save data
- Save permanent upgrades
- Save best time and total runs
- Reset save during debugging

---

## 24. Data-Driven Weapon Example

```ts
export const weapons = {
  bulletBlaster: {
    id: "bulletBlaster",
    name: "Bullet Blaster",
    rarity: "common",
    cooldownMs: 700,
    baseDamage: 10,
    projectileSpeed: 420,
    behavior: "singleProjectile",
  },
  gatling: {
    id: "gatling",
    name: "Gatling",
    rarity: "common",
    cooldownMs: 180,
    baseDamage: 4,
    projectileSpeed: 460,
    behavior: "singleProjectile",
    modifiers: [{ type: "accuracyOffset", value: 0.10 }],
  },
  laser: {
    id: "laser",
    name: "Laser",
    rarity: "common",
    cooldownMs: 900,
    baseDamage: 8,
    projectileSpeed: 620,
    behavior: "piercingProjectile",
  },
  shotgun: {
    id: "shotgun",
    name: "Shotgun",
    rarity: "common",
    cooldownMs: 950,
    baseDamage: 5,
    projectileSpeed: 380,
    behavior: "spreadProjectile",
    pellets: 5,
    spread: 0.18,
  },
  whirlwind: {
    id: "whirlwind",
    name: "Whirlwind",
    rarity: "common",
    cooldownMs: 350,
    baseDamage: 5,
    behavior: "orbitHitbox",
  },
};
```

---

## 25. Game Balance First Pass

### Player

| Stat | Value |
|---|---:|
| Max HP | 100 |
| Move Speed | 220 |
| Starting Weapon | Bullet Blaster |
| XP to Level 2 | 10 |
| XP Scaling | `nextXp = 10 + level * 7` |

### Normal Enemy

| Stat | Value |
|---|---:|
| HP | 12 |
| Speed | 80 |
| Damage | 10 |
| XP Drop | 1 |
| Gold Drop Chance | 12% |

### Small Fast Enemy

| Stat | Value |
|---|---:|
| HP | 6 |
| Speed | 135 |
| Damage | 6 |
| XP Drop | 1 |
| Gold Drop Chance | 6% |

### Big Slow Enemy

| Stat | Value |
|---|---:|
| HP | 50 |
| Speed | 45 |
| Damage | 18 |
| XP Drop | 4 |
| Gold Drop Chance | 35% |

### Shooter Enemy

| Stat | Value |
|---|---:|
| HP | 18 |
| Speed | 65 |
| Damage | 8 projectile |
| XP Drop | 2 |
| Gold Drop Chance | 15% |

---

## 26. Difficulty Scaling

Every 30 seconds:

- Increase spawn rate
- Increase max enemies
- Slightly increase enemy HP
- Add more mixed enemy types

Example:

```ts
difficulty = 1 + survivalTimeSeconds / 120;
enemyHp = baseHp * difficulty;
spawnDelay = Math.max(220, 1000 - survivalTimeSeconds * 8);
```

At specific time milestones:

| Time | Change |
|---|---|
| 0:00 | Normal mobs only |
| 1:00 | Small fast mobs introduced |
| 2:00 | Big slow mobs introduced |
| 3:00 | Shooter mobs introduced |
| 4:00+ | Mixed waves and elites |

---

## 27. Acceptance Criteria

### MVP is acceptable when:

- Player can start a run from main menu.
- Player can move and survive.
- Enemies spawn and chase player.
- At least 4 enemy types exist.
- At least 5 weapon/attack types exist.
- XP drops and level-up choices work.
- Level-up offers 3 choices.
- Rare 4th choice can appear.
- Loot drops include XP, gold, and rare big loot.
- Player can die and restart.
- Gold persists between runs.
- Permanent upgrades can be purchased.
- Game runs at playable FPS in browser.
- All sprite assets are placeholder or Imagen-generated.
- Code is modular enough for AI-assisted edits.

---

## 28. Milestone Plan

### Milestone 1 — Graybox Combat

Goal: fun without art.

- Phaser project bootstrapped
- Player movement
- Camera follow
- One enemy type
- One weapon
- Projectile hits
- HP and death
- Restart

### Milestone 2 — Roguelite Loop

Goal: run progression works.

- XP drops
- Level-up screen
- 3 upgrade choices
- Stat upgrades
- Weapon additions
- Death rewards
- Gold saved locally

### Milestone 3 — Weapon Chaos

Goal: builds become fun.

- Gatling
- Laser
- Shotgun
- Slice
- Whirlwind
- Weapon modifiers
- Rare 4th choice
- New weapon probability rule

### Milestone 4 — Enemy Variety & Challenges

Goal: risk-reward emerges.

- Small fast mobs
- Big slow mobs
- Shooter mobs
- Challenge markers
- Big loot rewards
- Difficulty scaling

### Milestone 5 — Sprite Pass & Juice

Goal: make it feel real.

- Imagen sprite import
- Impact flashes
- Pickup effects
- Damage numbers
- Screen shake
- Basic sound
- HUD polish

---

## 29. Vibe-Coding Rules

Use this project style:

- Build playable first.
- Avoid over-abstracting early.
- Keep systems separated but simple.
- Prefer data files for weapons/upgrades/enemies.
- Every new feature must be testable in under 60 seconds.
- No huge menus before the core loop is fun.
- Every coding session should end with a playable build.
- Use placeholder shapes until mechanics work.
- Replace placeholders with Imagen sprites after mechanics are locked.

---

## 30. Coding Agent Handoff Prompt

Use this with Codex / Claude Code / Cursor:

```text
You are building a Phaser 3 TypeScript browser roguelite called Dongun.

Read PRD.md fully before coding.

Goal: implement the MVP in fast playable increments, prioritizing the core loop over polish.

Core requirements:
- Phaser 3 + TypeScript.
- Player movement with WASD/arrow keys.
- Auto-target nearest enemy.
- Enemy waves spawn around player.
- Weapons are data-driven.
- Implement Bullet Blaster, Gatling, Laser, Shotgun, Slice, and Whirlwind.
- XP drops, gold drops, level-up choices, and death/restart loop.
- Level-up shows 3 choices, with 10% chance for rare 4th choice.
- Gold persists in LocalStorage.
- Permanent upgrades persist in LocalStorage.
- Keep code modular: scenes, entities, systems, data files.
- Use simple colored shapes first if sprites are missing.
- Avoid backend, auth, accounts, or complex menus.

Work in milestones:
1. Graybox combat
2. Roguelite loop
3. Weapon chaos
4. Enemy variety
5. Sprite/juice pass

After each milestone, ensure `npm run dev` launches a playable version.
```

---

## 31. Risks

| Risk | Mitigation |
|---|---|
| Too many systems too early | Build graybox first |
| Generated sprites are inconsistent | Use strict Imagen prompt templates |
| Performance drops with many enemies | Object pooling and simple collision |
| Upgrade system becomes messy | Keep upgrades data-driven |
| Player does not feel powerful | Add fire rate, multi-shot, and orbit weapons early |
| Game becomes unreadable | Limit active VFX intensity and keep silhouettes clean |

---

## 32. Non-Goals for MVP

Do not build these yet:

- Online multiplayer
- Accounts
- Cloud saves
- NFT/cosmetics shop
- Complex story
- Multiple characters
- Boss cinematics
- Huge map generator
- Mobile-first controls
- Steam build
- Complex inventory

---

## 33. North Star

The MVP succeeds if a player can say:

> “I died, but I know exactly what upgrade I want next run.”

That is the roguelite spark. Everything else is decoration around that little electric tooth.
