import Phaser from "phaser";
import { ENEMY_TYPES } from "../data/enemies";
import { WEAPONS } from "../data/weapons";
import { MODIFIER_DEFAULTS } from "../data/upgrades";
import { Enemy } from "../entities/Enemy";
import { Loot } from "../entities/Loot";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import { AISeparationSystem } from "../systems/AISeparationSystem";
import { ChallengeSystem } from "../systems/ChallengeSystem";
import { EnemySpawnSystem } from "../systems/EnemySpawnSystem";
import { LootSystem } from "../systems/LootSystem";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { ProceduralArenaSystem } from "../systems/ProceduralArenaSystem";
import { SaveSystem } from "../systems/SaveSystem";
import { TouchControls } from "../systems/TouchControls";
import { UpgradeSystem } from "../systems/UpgradeSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import type { EnemyKind, UpgradeOption, WeaponId } from "../types";
import { COLORS, UI_DEPTH, UI_THEME } from "../utils/constants";
import { getMusicAnalyser, playMusic } from "../utils/music";
import { getVisibleGameArea } from "../utils/safeArea";
import { BloodVignette } from "../ui/BloodVignette";
import { Hud } from "../ui/Hud";
import { hitboxesOverlap, sweepCircleHitTime, type CircleHitbox, type SweepHitbox } from "../systems/HitboxSystem";

const CAMERA_HEIGHT_MULTIPLIER = 1.25;
const BOSS_FIRST_SECONDS = 120;
const BOSS_INTERVAL_SECONDS = 150;
const TOUCH_AIM_RANGE = 1200;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  private loot!: Phaser.Physics.Arcade.Group;
  private spawner!: EnemySpawnSystem;
  private weapons!: WeaponSystem;
  private lootSystem!: LootSystem;
  private arena!: ProceduralArenaSystem;
  private separation = new AISeparationSystem();
  private aimGraphics?: Phaser.GameObjects.Graphics;
  private upgradeSystem = new UpgradeSystem();
  private challenge!: ChallengeSystem;
  private hud!: Hud;
  private bloodVignette!: BloodVignette;
  private touchControls?: TouchControls;
  private boss?: Enemy;
  private nextBossAt = BOSS_FIRST_SECONDS;
  private runStartedAt = 0;
  private lastUpdateAt = 0;
  private elapsedSeconds = 0;
  private deathHandled = false;
  private hitboxDebugVisible = false;
  private hitboxGraphics?: Phaser.GameObjects.Graphics;
  private musicPulseLow = 0;
  private musicPulseMid = 0;
  private musicPulseHigh = 0;

  constructor() {
    super("GameScene");
  }

  create() {
    const save = SaveSystem.load();
    const stats = ProgressionSystem.statsFromSave(save);
    this.runStartedAt = -1;
    this.lastUpdateAt = -1;
    this.elapsedSeconds = 0;
    this.deathHandled = false;
    this.boss = undefined;
    this.nextBossAt = BOSS_FIRST_SECONDS;

    this.cameras.main.setBackgroundColor("#65755a");
    this.arena = new ProceduralArenaSystem(this);
    this.arena.update(0, 0);

    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.projectiles = this.physics.add.group({ classType: Projectile, maxSize: 450, runChildUpdate: false });
    this.enemyProjectiles = this.physics.add.group({ classType: Projectile, maxSize: 160, runChildUpdate: false });
    this.loot = this.physics.add.group({ runChildUpdate: false });

    this.player = new Player(this, 0, 0, stats, MODIFIER_DEFAULTS);
    this.cameras.main.setZoom(1 / CAMERA_HEIGHT_MULTIPLIER);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.spawner = new EnemySpawnSystem(this, this.enemies);
    this.weapons = new WeaponSystem(this, this.projectiles, this.enemies);
    this.lootSystem = new LootSystem(this, this.loot);
    this.challenge = new ChallengeSystem(this, () => {
      this.player.runGold += Math.round(18 * this.player.stats.goldGain);
      this.lootSystem.spawn(this.player.x + 60, this.player.y, "chest", 1);
      this.flashText("Shrine cleared + gold chest", "#ffd15c");
    });
    this.hud = new Hud(this);
    this.bloodVignette = new BloodVignette(this);
    this.touchControls = new TouchControls(this);
    this.aimGraphics = this.add.graphics().setDepth(-50);
    this.createPauseButton();

    this.events.on("upgrade-picked", this.applyUpgrade, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.arena.destroy());
    this.input.keyboard?.on("keydown-ESC", this.pauseGame, this);
    this.input.keyboard?.on("keydown-P", this.pauseGame, this);
    this.input.keyboard?.on("keydown-H", this.toggleHitboxDebug, this);

    playMusic(this, "music-game", 0.4);
  }

  private createPauseButton() {
    const safe = getVisibleGameArea(this);
    const x = safe.right - 38;
    const y = safe.top + 38;
    const button = this.add
      .rectangle(x, y, 44, 44, UI_THEME.panelNum, 0.72)
      .setScrollFactor(0)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1)
      .setDepth(UI_DEPTH + 5)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, "II", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: "18px",
        color: UI_THEME.accentHex,
        fontStyle: "700",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 6);
    button.on("pointerdown", () => this.pauseGame());
  }

  update(time: number, delta: number) {
    if (this.deathHandled || this.scene.isPaused()) {
      return;
    }

    if (this.runStartedAt < 0) {
      this.runStartedAt = time;
    }
    if (this.lastUpdateAt < 0) {
      this.lastUpdateAt = time;
    }

    const deltaSeconds = Math.min(Math.max((time - this.lastUpdateAt) / 1000, delta / 1000), 0.08);
    this.lastUpdateAt = time;
    this.elapsedSeconds = (time - this.runStartedAt) / 1000;

    this.applyMovementInput();
    this.player.updateMovement(deltaSeconds);
    this.updateAim();
    this.player.syncFx();
    this.arena.update(this.player.x, this.player.y);
    this.syncArenaWithMusic(deltaSeconds);
    this.updateEnemies(time, this.elapsedSeconds, deltaSeconds);
    this.updateProjectiles(time, deltaSeconds);
    this.resolveCombatHitboxes();
    this.lootSystem.update(this.player, deltaSeconds);
    this.resolveLootPickups();
    if (this.scene.isPaused()) {
      this.renderHitboxDebug();
      this.finalizeProjectileSweeps(this.projectiles);
      this.finalizeProjectileSweeps(this.enemyProjectiles);
      return;
    }
    this.spawner.update(time, this.elapsedSeconds, this.player);
    this.updateBoss(this.elapsedSeconds);
    this.weapons.update(time, deltaSeconds, this.player);
    this.cleanupDeadEnemies();
    this.challenge.update(deltaSeconds, this.elapsedSeconds, this.player);
    this.hud.update(this.player, this.elapsedSeconds, this.enemies.countActive(true));
    this.renderHitboxDebug();
    this.finalizeProjectileSweeps(this.projectiles);
    this.finalizeProjectileSweeps(this.enemyProjectiles);

    if (this.player.hp <= 0) {
      this.finishRun(this.elapsedSeconds);
    }
  }

  private updateEnemies(time: number, elapsedSeconds: number, deltaSeconds: number) {
    const ctx = {
      player: { x: this.player.x, y: this.player.y },
      time,
      deltaSeconds,
      elapsedSeconds,
    };

    const aimRequests: Array<{ x: number; y: number; angle: number; length: number }> = [];
    const fireRequests: Array<{ enemy: Enemy; angle: number }> = [];
    const ringRequests: Array<{ enemy: Enemy; count: number }> = [];

    const enemyList = this.enemies.getChildren() as Enemy[];
    for (const enemy of enemyList) {
      if (!enemy.active) {
        continue;
      }

      const result = enemy.tickAI(ctx);
      enemy.setData("aiVx", result.vx);
      enemy.setData("aiVy", result.vy);
      enemy.setData("aiFacing", result.facingAngle);

      if (result.aimLine) {
        aimRequests.push({ x: enemy.x, y: enemy.y, angle: result.aimLine.angle, length: result.aimLine.length });
      }
      if (result.fireProjectile) {
        fireRequests.push({ enemy, angle: result.fireProjectile.angle });
      }
      if (result.fireRing) {
        ringRequests.push({ enemy, count: result.fireRing.count });
      }
    }

    this.separation.resolve(enemyList);

    for (const enemy of enemyList) {
      if (!enemy.active) {
        continue;
      }
      const vx = (enemy.getData("aiVx") as number) + enemy.separationVx;
      const vy = (enemy.getData("aiVy") as number) + enemy.separationVy;
      const facing = enemy.getData("aiFacing") as number;
      enemy.setPosition(enemy.x + vx * deltaSeconds, enemy.y + vy * deltaSeconds);
      enemy.faceMovement(facing);
      enemy.syncFx();
    }

    for (const fire of fireRequests) {
      if (fire.enemy.active) {
        this.fireEnemyProjectile(fire.enemy, fire.angle);
      }
    }

    for (const ring of ringRequests) {
      if (ring.enemy.active) {
        this.fireEnemyRing(ring.enemy, ring.count);
      }
    }

    this.renderAimLines(aimRequests);
  }

  private renderAimLines(requests: Array<{ x: number; y: number; angle: number; length: number }>) {
    if (!this.aimGraphics) {
      return;
    }
    this.aimGraphics.clear();
    if (requests.length === 0) {
      return;
    }
    this.aimGraphics.lineStyle(2, 0xff4d6d, 0.55);
    for (const r of requests) {
      const ex = r.x + Math.cos(r.angle) * r.length;
      const ey = r.y + Math.sin(r.angle) * r.length;
      this.aimGraphics.lineBetween(r.x, r.y, ex, ey);
    }
  }

  private applyMovementInput() {
    if (this.touchControls?.enabled) {
      const move = this.touchControls.getMoveVector();
      this.player.setExternalMove(move.x, move.y);
    }
  }

  private updateAim() {
    // On touch devices there is no hover cursor, so lock onto the nearest enemy.
    if (this.touchControls?.enabled) {
      const target = this.findNearestEnemy(this.player.x, this.player.y, TOUCH_AIM_RANGE);
      if (target) {
        this.player.aimAt(target.x, target.y);
        return;
      }
      const move = this.touchControls.getMoveVector();
      if (move.x !== 0 || move.y !== 0) {
        this.player.aimAt(this.player.x + move.x * 120, this.player.y + move.y * 120);
      }
      return;
    }

    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    this.player.aimAt(worldPoint.x, worldPoint.y);
  }

  private syncArenaWithMusic(deltaSeconds: number) {
    const analyser = getMusicAnalyser(this);
    let lowTarget = 0;
    let midTarget = 0;
    let highTarget = 0;
    if (analyser) {
      analyser.node.getByteFrequencyData(analyser.buffer);
      const bins = analyser.binCount;
      const lowEnd = Math.max(1, Math.floor(bins * 0.18));
      const midEnd = Math.max(lowEnd + 1, Math.floor(bins * 0.55));
      lowTarget = averageBand(analyser.buffer, 0, lowEnd);
      midTarget = averageBand(analyser.buffer, lowEnd, midEnd);
      highTarget = averageBand(analyser.buffer, midEnd, bins);
    }
    const ease = 1 - Math.exp(-deltaSeconds * 6);
    this.musicPulseLow += (lowTarget - this.musicPulseLow) * ease;
    this.musicPulseMid += (midTarget - this.musicPulseMid) * ease;
    this.musicPulseHigh += (highTarget - this.musicPulseHigh) * ease;
    this.arena.setMusicPulse(this.musicPulseLow, this.musicPulseMid, this.musicPulseHigh);
  }

  private updateProjectiles(time: number, deltaSeconds: number) {
    for (const child of this.projectiles.getChildren()) {
      const projectile = child as Projectile;
      if (projectile.active) {
        projectile.update(time, deltaSeconds);
        if (projectile.homing) {
          const target = this.findNearestEnemy(projectile.x, projectile.y, 520);
          if (target) {
            projectile.steerToward(target.x, target.y, deltaSeconds);
          }
        }
      }
    }

    for (const child of this.enemyProjectiles.getChildren()) {
      const projectile = child as Projectile;
      if (projectile.active) {
        projectile.update(time, deltaSeconds);
      }
    }
  }

  private resolveCombatHitboxes() {
    this.resolvePlayerProjectileHits();
    this.resolveEnemyProjectileHits();
    this.resolveEnemyContactHits();
  }

  private resolvePlayerProjectileHits() {
    const enemies = this.enemies.getChildren() as Enemy[];

    for (const child of this.projectiles.getChildren()) {
      const projectile = child as Projectile;
      if (!projectile.active) {
        continue;
      }

      const sweep = projectile.getSweepHitbox();
      const hits: Array<{ enemy: Enemy; impactTime: number }> = [];

      for (const enemy of enemies) {
        if (!enemy.active || projectile.hasHitTarget(enemy)) {
          continue;
        }

        const impactTime = sweepCircleHitTime(sweep, enemy.getHurtbox());
        if (impactTime !== null) {
          hits.push({ enemy, impactTime });
        }
      }

      hits.sort((a, b) => a.impactTime - b.impactTime);

      for (const { enemy } of hits) {
        if (!projectile.active || !enemy.active || projectile.hasHitTarget(enemy)) {
          continue;
        }

        projectile.markTargetHit(enemy);
        this.onProjectileHitEnemy(projectile, enemy);
        if (!projectile.piercing) {
          break;
        }
      }
    }
  }

  private resolveEnemyProjectileHits() {
    const playerHurtbox = this.player.getHurtbox();

    for (const child of this.enemyProjectiles.getChildren()) {
      const projectile = child as Projectile;
      if (!projectile.active) {
        continue;
      }

      if (sweepCircleHitTime(projectile.getSweepHitbox(), playerHurtbox) !== null) {
        this.onEnemyProjectileHitPlayer(this.player, projectile);
      }
    }
  }

  private resolveEnemyContactHits() {
    const playerHurtbox = this.player.getHurtbox();

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }

      if (hitboxesOverlap(playerHurtbox, enemy.getContactHitbox())) {
        this.onEnemyTouchPlayer(this.player, enemy);
      }
    }
  }

  private resolveLootPickups() {
    const playerPickup = this.player.getPickupHitbox();

    for (const child of this.loot.getChildren()) {
      const loot = child as Loot;
      if (!loot.active) {
        continue;
      }

      if (hitboxesOverlap(playerPickup, loot.getPickupHitbox())) {
        this.onLootPickup(this.player, loot);
        if (this.scene.isPaused() || this.deathHandled) {
          break;
        }
      }
    }
  }

  private finalizeProjectileSweeps(group: Phaser.Physics.Arcade.Group) {
    for (const child of group.getChildren()) {
      const projectile = child as Projectile;
      if (projectile.active) {
        projectile.markHitboxResolved();
      }
    }
  }

  private cleanupDeadEnemies() {
    const children = this.enemies.getChildren();
    for (let i = 0; i < children.length; i += 1) {
      const enemy = children[i] as Enemy;
      if (enemy.active && enemy.hp <= 0) {
        this.killEnemy(enemy);
      }
    }
  }

  private fireEnemyProjectile(enemy: Enemy, angle?: number) {
    let projectile = this.enemyProjectiles.getFirstDead(false) as Projectile | null;
    if (!projectile) {
      projectile = new Projectile(this, enemy.x, enemy.y);
      this.enemyProjectiles.add(projectile);
    }

    const shotAngle = angle ?? Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    projectile.launch({
      x: enemy.x,
      y: enemy.y,
      angle: shotAngle,
      speed: 260,
      damage: ENEMY_TYPES.shooter.damage,
      piercing: false,
      scale: 0.9,
      color: COLORS.red,
      lifespan: 2300,
      wave: false,
    });
  }

  private onProjectileHitEnemy(rawProjectile: unknown, rawEnemy: unknown) {
    const projectile = rawProjectile as Projectile;
    const enemy = rawEnemy as Enemy;
    const died = enemy.damage(projectile.damage);

    if (!projectile.piercing) {
      projectile.disableBody(true, true);
    } else {
      projectile.damage *= 0.72;
      if (projectile.damage < 2) {
        projectile.disableBody(true, true);
      }
    }

    if (died) {
      this.killEnemy(enemy);
    }
  }

  private onEnemyProjectileHitPlayer(rawPlayer: unknown, rawProjectile: unknown) {
    const projectile = rawProjectile as Projectile;
    const dealt = this.player.takeDamage(projectile.damage);
    projectile.disableBody(true, true);
    this.reactToHit(dealt);
  }

  private onEnemyTouchPlayer(rawPlayer: unknown, rawEnemy: unknown) {
    const enemy = rawEnemy as Enemy;
    if (this.time.now < enemy.lastContactAt + 540) {
      return;
    }

    enemy.lastContactAt = this.time.now;
    const dealt = this.player.takeDamage(enemy.enemyData.damage);
    this.reactToHit(dealt);
  }

  private reactToHit(damage: number) {
    const hpFraction = damage / Math.max(1, this.player.stats.maxHp);
    const intensity = Phaser.Math.Clamp(0.55 + hpFraction * 2.4, 0.55, 1.4);
    this.bloodVignette.pulse(intensity);
    const shakeDuration = Math.round(110 + hpFraction * 240);
    const shakeMagnitude = Phaser.Math.Clamp(0.006 + hpFraction * 0.022, 0.006, 0.022);
    this.cameras.main.shake(shakeDuration, shakeMagnitude);
  }

  private killEnemy(enemy: Enemy) {
    this.player.kills += 1;
    this.lootSystem.dropFromEnemy(enemy, this.player.stats.goldGain);

    if (this.player.modifiers.chainReaction && Math.random() < 0.22) {
      this.chainExplosion(enemy.x, enemy.y);
    }

    if (enemy.kind === "boss") {
      this.onBossDefeated(enemy);
    }

    enemy.destroy();
  }

  private onBossDefeated(boss: Enemy) {
    this.boss = undefined;
    this.hud.hideBoss();
    this.player.runGold += Math.round(120 * this.player.stats.goldGain);
    this.player.heal(40);
    this.cameras.main.flash(260, 255, 210, 130);
    this.cameras.main.shake(360, 0.014);
    this.flashText("BOSS DOWN — big loot!", "#ffd15c");
    // Guaranteed reward chest opens an upgrade choice.
    this.lootSystem.spawn(boss.x, boss.y, "chest", 1);
    this.lootSystem.spawn(boss.x + 36, boss.y, "chest", 1);
  }

  private chainExplosion(x: number, y: number) {
    const blast = this.add.circle(x, y, 8, COLORS.gold, 0.55).setDepth(44);
    this.tweens.add({
      targets: blast,
      radius: 96,
      alpha: 0,
      duration: 180,
      onComplete: () => blast.destroy(),
    });

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }
      if (hitboxesOverlap({ x, y, radius: 112 }, enemy.getHurtbox()) && enemy.damage(12 * this.player.stats.damage)) {
        this.killEnemy(enemy);
      }
    }
  }

  private onLootPickup(rawPlayer: unknown, rawLoot: unknown) {
    const loot = rawLoot as Loot;

    if (loot.kind === "xp") {
      const leveled = this.player.addXp(loot.value);
      if (leveled) {
        this.openUpgradeScreen();
      }
    } else if (loot.kind === "gold") {
      this.player.runGold += loot.value;
    } else if (loot.kind === "heal") {
      this.player.heal(loot.value);
      this.flashText("+HP", "#91ff5d");
    } else if (loot.kind === "chest") {
      this.player.runGold += Math.round(10 * this.player.stats.goldGain);
      this.openUpgradeScreen(true);
    }

    loot.destroy();
  }

  private openUpgradeScreen(forceRare = false) {
    const choices = this.upgradeSystem.generateChoices(
      {
        ownedWeapons: this.player.ownedWeapons,
        modifiers: this.player.modifiers,
        luck: this.player.stats.luck,
      },
      forceRare,
    );
    this.scene.pause();
    this.scene.launch("UpgradeScene", { choices });
  }

  private applyUpgrade(choice: UpgradeOption) {
    if (choice.type === "weapon" && choice.weaponId) {
      this.player.ownedWeapons.add(choice.weaponId);
      this.player.weaponLevels[choice.weaponId] = 1;
      this.weapons.ensureWeapon(choice.weaponId);
      this.flashText(`${WEAPONS[choice.weaponId].name} online`, "#4de6ff");
      return;
    }

    if (choice.type === "weaponBoost" && choice.weaponId) {
      this.player.weaponLevels[choice.weaponId] = (this.player.weaponLevels[choice.weaponId] ?? 1) + 1;
      this.flashText(`${WEAPONS[choice.weaponId].name} tuned`, "#4de6ff");
      return;
    }

    if (choice.type === "modifier" || choice.type === "special") {
      if (choice.modifier === "bonusProjectiles") {
        this.player.modifiers.bonusProjectiles += 1;
      } else if (choice.modifier) {
        this.player.modifiers[choice.modifier] = true as never;
      }
      this.flashText(choice.name, choice.rarity === "legendary" ? "#ffd15c" : "#a678ff");
      return;
    }

    if (choice.type === "stat" && choice.stat && typeof choice.statDelta === "number") {
      this.player.stats[choice.stat] += choice.statDelta;
      if (choice.stat === "maxHp") {
        this.player.heal(choice.statDelta);
      }
      this.flashText(choice.name, "#91ff5d");
    }
  }

  private finishRun(elapsedSeconds: number) {
    this.deathHandled = true;
    this.hud.hideBoss();
    const priorBest = SaveSystem.load().bestSurvivalTime;
    const results = {
      survivalSeconds: elapsedSeconds,
      kills: this.player.kills,
      goldEarned: this.player.runGold,
      level: this.player.level,
    };
    const save = SaveSystem.recordRun(results);
    this.scene.start("DeathScene", {
      ...results,
      isNewBest: elapsedSeconds > priorBest && elapsedSeconds > 0,
      bestSurvivalTime: save.bestSurvivalTime,
    });
  }

  private toggleHitboxDebug() {
    this.hitboxDebugVisible = !this.hitboxDebugVisible;
    if (!this.hitboxDebugVisible) {
      this.hitboxGraphics?.clear();
    }
  }

  private renderHitboxDebug() {
    if (!this.hitboxDebugVisible) {
      return;
    }

    if (!this.hitboxGraphics) {
      this.hitboxGraphics = this.add.graphics().setDepth(UI_DEPTH + 20);
    }

    this.hitboxGraphics.clear();
    this.drawHitbox(this.player.getPickupHitbox(), COLORS.lime, 0.62);
    this.drawHitbox(this.player.getHurtbox(), COLORS.cyan, 0.95);

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }
      this.drawHitbox(enemy.getHurtbox(), COLORS.red, 0.78);
      this.drawHitbox(enemy.getContactHitbox(), COLORS.orange, 0.95);
    }

    for (const child of this.projectiles.getChildren()) {
      const projectile = child as Projectile;
      if (projectile.active) {
        this.drawSweepHitbox(projectile.getSweepHitbox(), COLORS.gold, 0.72);
      }
    }

    for (const child of this.enemyProjectiles.getChildren()) {
      const projectile = child as Projectile;
      if (projectile.active) {
        this.drawSweepHitbox(projectile.getSweepHitbox(), COLORS.violet, 0.72);
      }
    }

    for (const child of this.loot.getChildren()) {
      const loot = child as Loot;
      if (loot.active) {
        this.drawHitbox(loot.getPickupHitbox(), COLORS.lime, 0.78);
      }
    }

    const challengeHitbox = this.challenge.getActiveHitbox();
    if (challengeHitbox) {
      this.drawHitbox(challengeHitbox, COLORS.gold, 0.82);
    }
  }

  private drawHitbox(hitbox: CircleHitbox, color: number, alpha: number) {
    this.hitboxGraphics?.lineStyle(2, color, alpha).strokeCircle(hitbox.x, hitbox.y, hitbox.radius);
  }

  private drawSweepHitbox(sweep: SweepHitbox, color: number, alpha: number) {
    if (!this.hitboxGraphics) {
      return;
    }

    this.hitboxGraphics.lineStyle(2, color, alpha);
    this.hitboxGraphics.lineBetween(sweep.fromX, sweep.fromY, sweep.toX, sweep.toY);
    this.hitboxGraphics.strokeCircle(sweep.toX, sweep.toY, sweep.radius);
  }

  private flashText(text: string, color: string) {
    const message = this.add
      .text(this.player.x, this.player.y - 72, text, {
        fontFamily: "Inter, Arial",
        fontSize: "18px",
        color,
        stroke: "#090b10",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.tweens.add({
      targets: message,
      y: message.y - 48,
      alpha: 0,
      duration: 820,
      onComplete: () => message.destroy(),
    });
  }

  private pauseGame() {
    if (this.scene.isPaused("GameScene") || this.deathHandled) {
      return;
    }
    this.scene.pause();
    this.scene.launch("PauseScene");
  }

  private findNearestEnemy(x: number, y: number, maxDistance: number): Enemy | null {
    let nearest: Enemy | null = null;
    let bestDistSq = maxDistance * maxDistance;
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        nearest = enemy;
      }
    }
    return nearest;
  }

  private updateBoss(elapsedSeconds: number) {
    if (this.boss && !this.boss.active) {
      this.boss = undefined;
    }

    if (!this.boss && elapsedSeconds >= this.nextBossAt) {
      this.spawnBoss(elapsedSeconds);
      this.nextBossAt = elapsedSeconds + BOSS_INTERVAL_SECONDS;
    }

    if (this.boss) {
      this.hud.updateBoss(this.boss.hp / this.boss.maxHp);
    }
  }

  private spawnBoss(elapsedSeconds: number) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 720;
    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;
    // Bosses scale up with each milestone reached.
    const tier = Math.max(1, Math.round((elapsedSeconds - BOSS_FIRST_SECONDS) / BOSS_INTERVAL_SECONDS) + 1);
    const difficulty = 1 + (elapsedSeconds / 130) + tier * 0.6;
    const boss = new Enemy(this, x, y, "boss", difficulty);
    this.enemies.add(boss);
    this.boss = boss;
    this.hud.showBoss(boss.enemyData.name);
    this.cameras.main.shake(420, 0.012);
    this.flashText("A BOSS APPROACHES", "#ff6b81");
  }

  private fireEnemyRing(enemy: Enemy, count: number) {
    for (let i = 0; i < count; i += 1) {
      this.fireEnemyProjectile(enemy, (i / count) * Math.PI * 2);
    }
  }
}

function averageBand(buffer: Uint8Array<ArrayBuffer>, start: number, end: number) {
  if (end <= start) {
    return 0;
  }
  let sum = 0;
  for (let i = start; i < end; i += 1) {
    sum += buffer[i];
  }
  return sum / ((end - start) * 255);
}
