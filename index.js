// ============================================================
// PlayRPG v2 — SINGLE-FILE BOT (everything in this one file)
// ============================================================
// HOW TO RUN
//   1. Create .env next to this file (template included in this pack)
//   2. npm install discord.js openai dotenv
//   3. node index.js
//
// Everything (zones, enemies, recipes, combat, quests, commands)
// is embedded below behind a tiny internal module loader — no other
// source files needed. Saves go to ./data/save.json next to this file.
// ============================================================

const __singleDir = __dirname;
const __mods = {};
function __def(name, fn) { __mods[name] = { fn: fn, loaded: false, exports: {} }; }
const __reqMap = {
  "src/commands/character": {
    "../config": "src/config",
    "../core/schema": "src/core/schema",
    "../core/progression": "src/core/progression",
    "../util": "src/util"
  },
  "src/commands/combat": {
    "../core/combat": "src/core/combat",
    "../world/quests": "src/world/quests",
    "../config": "src/config"
  },
  "src/commands/craft": {
    "../crafting/recipes": "src/crafting/recipes",
    "../util": "src/util"
  },
  "src/commands/economy": {
    "../core/schema": "src/core/schema",
    "../util": "src/util",
    "../world/loot": "src/world/loot",
    "../world/zones": "src/world/zones"
  },
  "src/commands/gather": {
    "../world/zones": "src/world/zones",
    "../world/enemies": "src/world/enemies",
    "../core/combat": "src/core/combat",
    "../core/statusEffects": "src/core/statusEffects",
    "../world/quests": "src/world/quests",
    "../util": "src/util"
  },
  "src/commands/index": {
    "./character": "src/commands/character",
    "./world": "src/commands/world",
    "./combat": "src/commands/combat",
    "./gather": "src/commands/gather",
    "./craft": "src/commands/craft",
    "./social": "src/commands/social",
    "./economy": "src/commands/economy",
    "./quests": "src/commands/quests",
    "./meta": "src/commands/meta",
    "./pvp": "src/commands/pvp"
  },
  "src/commands/meta": {
    "../core/schema": "src/core/schema",
    "../world/enemies": "src/world/enemies",
    "../util": "src/util",
    "../core/features": "src/core/features",
    "../core/progression": "src/core/progression",
    "../config": "src/config"
  },
  "src/commands/pvp": {
    "../core/schema": "src/core/schema",
    "../core/pvp": "src/core/pvp",
    "../core/combat": "src/core/combat"
  },
  "src/commands/quests": {
    "../world/quests": "src/world/quests",
    "../world/zones": "src/world/zones"
  },
  "src/commands/social": {
    "../core/schema": "src/core/schema",
    "../world/enemies": "src/world/enemies",
    "../util": "src/util"
  },
  "src/commands/world": {
    "../world/zones": "src/world/zones",
    "../world/enemies": "src/world/enemies",
    "../core/combat": "src/core/combat",
    "../crafting/recipes": "src/crafting/recipes",
    "../world/quests": "src/world/quests",
    "../config": "src/config"
  },
  "src/core/combat": {
    "../config": "src/config",
    "../util": "src/util",
    "./schema": "src/core/schema",
    "./statusEffects": "src/core/statusEffects",
    "../world/enemies": "src/world/enemies",
    "../world/loot": "src/world/loot",
    "../world/zones": "src/world/zones"
  },
  "src/core/features": {
    "../util": "src/util"
  },
  "src/core/progression": {
    "../config": "src/config",
    "../util": "src/util",
    "./schema": "src/core/schema",
    "./combat": "src/core/combat"
  },
  "src/core/pvp": {
    "../util": "src/util",
    "./statusEffects": "src/core/statusEffects",
    "./combat": "src/core/combat"
  },
  "src/core/schema": {
    "../config": "src/config",
    "../util": "src/util"
  },
  "src/core/statusEffects": {
    "../config": "src/config",
    "../util": "src/util"
  },
  "src/crafting/recipes": {
    "../core/schema": "src/core/schema",
    "../util": "src/util"
  },
  "src/world/enemies": {
    "../config": "src/config",
    "../util": "src/util",
    "./zones": "src/world/zones",
    "./loot": "src/world/loot"
  },
  "src/world/loot": {
    "../config": "src/config",
    "../util": "src/util"
  },
  "src/world/quests": {
    "../util": "src/util",
    "./zones": "src/world/zones",
    "./enemies": "src/world/enemies",
    "./loot": "src/world/loot",
    "../core/schema": "src/core/schema"
  },
  "src/world/zones": {
    "../config": "src/config",
    "../util": "src/util"
  },
  "__entry": {
    "./src/core/schema": "src/core/schema",
    "./src/commands": "src/commands/index",
    "./src/world/zones": "src/world/zones",
    "./src/util": "src/util",
    "./src/commands/world": "src/commands/world",
    "./src/core/combat": "src/core/combat"
  }
};
function __load(name) {
  const m = __mods[name];
  if (!m) throw new Error("Embedded module not found: " + name);
  if (!m.loaded) {
    m.loaded = true;
    m.fn(m, m.exports, function (spec) { return __requireFrom(name, spec); });
  }
  return m.exports;
}
function __requireFrom(mod, spec) {
  if (spec.charAt(0) !== ".") return require(spec); // node builtin / npm package
  const map = __reqMap[mod] || {};
  const target = map[spec];
  if (!target) throw new Error("Cannot resolve embedded require '" + spec + "' from " + mod);
  return __load(target);
}

// ---------------------- embedded module: src/commands/character ----------------------
__def("src/commands/character", function (module, exports, require) {
// ============================================================
// commands/character.js — creation, attributes, prestige,
// perks, talents, respec, hard mode, loadouts.
// ============================================================

const { RACES, CLASSES, SUBCLASSES, WORLD } = require("../config");
const { refreshStats } = require("../core/schema");
const { prestige, PERKS, applyPerk, getTalentTree, spendTalentPoint, respec, setHardMode, prestigeTitle } = require("../core/progression");
const { cap } = require("../util");

const handlers = {
  // ---- CHARACTER CREATION -----------------------------------
  create(message, args, player) {
    const raceId = (args[0] || "").toLowerCase();
    const classId = (args[1] || "").toLowerCase();
    if (!RACES[raceId]) {
      return `❌ Unknown race. Options: ${Object.keys(RACES).map(r => `\`${r}\``).join(", ")}`;
    }
    if (!CLASSES[classId]) {
      return `❌ Unknown class. Options: ${Object.keys(CLASSES).map(c => `\`${c}\``).join(", ")}`;
    }
    if (player.class !== "none") return "❌ You already have a character. Use `playrpg respec` or `playrpg resetchar`.";

    player.race = raceId;
    player.class = classId;
    const race = RACES[raceId];
    const cls = CLASSES[classId];
    for (const [k, v] of Object.entries(race.statMods)) player.attributes[k] += v;
    player.attributes[cls.primary] += 2;
    refreshStats(player);
    player.hp = player.maxHp; player.mp = player.maxMp; player.stamina = player.maxStamina;

    return `✨ **CHARACTER CREATED!**\n\n` +
      `**${player.name}** the **${race.name} ${cls.name}**\n` +
      `Role: ${cls.role} | Primary: ${cls.primary.toUpperCase()}\n` +
      `Racial Perk: ${race.perks.join(", ")}\n\n` +
      `You have **${player.unspentAttrPoints} attribute points** — spend with \`playrpg attrs <str|dex|con|int|wis|cha> <n>\`\n` +
      `Pick a subclass: \`playrpg subclass <name>\` (${SUBCLASSES[classId].join(" | ")})\n` +
      `Set appearance: \`playrpg look <hair|eyes|skin> <value>\``;
  },

  subclass(message, args, player) {
    const name = args.join(" ");
    if (!player.class || player.class === "none") return "❌ Create a character first: `playrpg create <race> <class>`";
    const options = SUBCLASSES[player.class] || [];
    const match = options.find(o => o.toLowerCase() === name.toLowerCase());
    if (!match) return `❌ Invalid subclass. Options: ${options.join(" | ")}`;
    player.subclass = match;
    return `🎓 Subclass chosen: **${match}**! Check \`playrpg talents\` for your class skill tree.`;
  },

  look(message, args, player) {
    const [field, ...rest] = args;
    const value = rest.join(" ").toLowerCase();
    if (!["hair", "eyes", "skin", "markings", "voice", "height", "build"].includes(field)) {
      return "❌ Options: hair, eyes, skin, markings, voice, height, build. Example: `playrpg look hair silver`";
    }
    if (!value) return "❌ Provide a value.";
    player.appearance[field] = value;
    return `🎨 Appearance updated: **${field} = ${value}**`;
  },

  profile(message, args, player) {
    const p = args[0] ? require("../core/schema").players.get(args[0].replace(/[<@!>]/g, "")) : player;
    if (!p) return "❌ Player not found.";
    const race = p.race ? RACES[p.race].name : "?";
    const cls = p.class && p.class !== "none" ? CLASSES[p.class].name : "?";
    const title = p.title ? `**${p.title}** ` : "";
    return `${title}**${p.name}** — ${race} ${cls}${p.subclass ? ` (${p.subclass})` : ""}\n` +
      `Lv ${p.level} ${p.prestige > 0 ? `⭐ Prestige ${p.prestige}` : ""} | ${p.zone ? `📍 Zone ${p.zone}` : ""}\n` +
      `❤️ ${p.hp}/${p.maxHp} 🔷 ${p.mp}/${p.maxMp} ⚡ ${p.stamina}/${p.maxStamina}\n` +
      `⚔️ ATK ${p.atk} | 🔮 MATK ${p.magAtk} | 🛡️ DEF ${p.def} | 💠 MDEF ${p.magDef} | 👟 SPD ${p.speed}\n` +
      `🎯 Crit ${(p.critChance * 100).toFixed(1)}% | 💨 Dodge ${(p.dodge * 100).toFixed(1)}% | 🪙 ${p.gold} gold\n` +
      `Appearance: ${Object.entries(p.appearance).map(([k, v]) => `${k}: ${v}`).join(", ")}`;
  },

  // ---- ATTRIBUTES --------------------------------------------
  attrs(message, args, player) {
    const [attr, nStr] = args;
    const n = parseInt(nStr);
    if (!["str", "dex", "con", "int", "wis", "cha"].includes(attr)) return "❌ Use: `playrpg attrs <str|dex|con|int|wis|cha> <n>`";
    if (!n || n < 1) return "❌ Provide a positive number.";
    if (n > player.unspentAttrPoints) return `❌ You only have ${player.unspentAttrPoints} points.`;
    player.attributes[attr] += n;
    player.unspentAttrPoints -= n;
    refreshStats(player);
    const bonus = attr === "str" ? "+atk" : attr === "dex" ? "+speed/crit/dodge" : attr === "con" ? "+hp/def" : attr === "int" ? "+matk" : attr === "wis" ? "+mdef/mp" : "+faction/prices";
    return `✅ **${attr.toUpperCase()} +${n}** (${bonus})\n` +
      `Now: ${Object.entries(player.attributes).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(" | ")} — ${player.unspentAttrPoints} pts left.`;
  },

  // ---- PRESTIGE ----------------------------------------------
  prestige(message, args, player) {
    const res = prestige(player);
    if (!res.ok) return `❌ ${res.reason}`;
    return `🌟 **PRESTIGE ${player.prestige}!** 🌟\n` +
      `${res.message}\n` +
      `Title: **${prestigeTitle(player.prestige)}** | XP bonus: +${Math.min(100, player.prestige * 5)}%`;
  },

  // ---- PERKS -------------------------------------------------
  perks(message, args, player) {
    if (args[0]) {
      const res = applyPerk(player, args[0].toLowerCase());
      return res.ok ? `✅ ${res.message}` : `❌ ${res.message}`;
    }
    let s = `💠 **PERKS** (${player.perkPoints} point${player.perkPoints === 1 ? "" : "s"} available — \`playrpg perks <id>\`)\n\n`;
    for (const perk of Object.values(PERKS)) {
      const rank = player.perks?.[perk.id] || 0;
      s += `• **${perk.name}** (\`${perk.id}\`)${rank > 0 ? ` [rank ${rank}/${perk.maxRanks}]` : ""} — ${perk.description}\n`;
    }
    return s;
  },

  // ---- TALENTS -----------------------------------------------
  talents(message, args, player) {
    if (args[0]) {
      const res = spendTalentPoint(player, player.class, args[0]);
      return res.ok ? `✅ ${res.message}` : `❌ ${res.message}`;
    }
    const tree = getTalentTree(player.class);
    if (!tree) return "❌ Create a character first.";
    let s = `🌳 **${tree.className} Talent Tree** (${player.talentPoints} point${player.talentPoints === 1 ? "" : "s"} — \`playrpg talents <node>\`)\n\n`;
    for (const node of tree.nodes) {
      const rank = player.talentTree?.[node.id] || 0;
      const req = node.prereq && !player.talentTree?.[node.prereq] ? " 🔒" : "";
      s += `• **${node.name}** (\`${node.id}\`)${rank > 0 ? ` [${rank}/${node.maxRanks}]` : ""}${req} — ${node.description}\n`;
    }
    return s;
  },

  respec(message, args, player) {
    const res = respec(player, { talentPoints: true });
    return res.ok ? `✅ ${res.message}` : `❌ ${res.message}`;
  },

  resetchar(message, args, player) {
    const res = respec(player, { attrPoints: true });
    if (!res.ok) return `❌ ${res.message}`;
    player.attributes = { str: 5, dex: 5, con: 5, int: 5, wis: 5, cha: 5 };
    player.unspentAttrPoints = 15;
    refreshStats(player);
    return `🔄 Character reset! Attributes restored to base, 15 points refunded.`;
  },

  hardmode(message, args, player) {
    const mode = (args[0] || "").toLowerCase();
    if (!["none", "hardcore", "ironman", "permadeath"].includes(mode)) {
      return "❌ Modes: none | hardcore (death wipes character, +25% XP) | ironman (no party/trade, +25% XP) | permadeath (+50% XP, strict)";
    }
    const res = setHardMode(player, mode);
    return res.ok ? `⚠️ ${res.message}` : `❌ ${res.message}`;
  },

  loadouts(message, args, player) {
    const name = args[0];
    if (!name) {
      const keys = Object.keys(player.loadouts || {});
      return `🎒 **LOADOUTS** (${keys.length}): ${keys.length ? keys.join(", ") : "none"} — save: \`playrpg loadouts save <name>\` | equip: \`playrpg loadouts equip <name>\``;
    }
    if (name === "save" && args[1]) {
      player.loadouts[args[1]] = JSON.parse(JSON.stringify(player.equipped));
      return `✅ Loadout **${args[1]}** saved.`;
    }
    if (name === "equip" && args[1]) {
      const load = player.loadouts[args[1]];
      if (!load) return "❌ Loadout not found.";
      player.equipped = JSON.parse(JSON.stringify(load));
      refreshStats(player);
      return `✅ Equipped loadout **${args[1]}**.`;
    }
    return "❌ Use: `playrpg loadouts save <name>` | `playrpg loadouts equip <name>`";
  },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/combat ----------------------
__def("src/commands/combat", function (module, exports, require) {
// ============================================================
// commands/combat.js — attack, skill, item, guard, flee, battle.
// ============================================================

const { getPlayerBattle, playerAction, battleStatusText, ABILITIES, STANCES } = require("../core/combat");
const { progressQuest } = require("../world/quests");
const { ELEMENT_EMOJI } = require("../config");

function _finish(battle, result) {
  let s = "";
  if (result.state === "active") {
    s = battleStatusText(battle);
  } else if (result.result === "victory") {
    s = `🎉 **VICTORY!**\n\n` +
      `✨ **${result.xp} XP** | 🪙 **${result.gold} gold**\n` +
      (result.leveled ? `⬆️ **LEVEL UP!** You are now level **${battle.players[0].level}**!\n` : "") +
      (result.items.length ? `🎁 Loot:\n${result.items.map(i => ` • ${i}`).join("\n")}\n` : "") +
      (result.hardcoreWipe ? "" : "") +
      `\n${result.log.slice(-6).join("\n")}`;
  } else if (result.result === "defeat") {
    s = `💀 **DEFEAT!**\n` +
      (result.goldPenalty ? `You lost **${result.goldPenalty} gold** (5% death penalty).\n` : "") +
      (result.hardcoreWipe ? `☠️ **HARDCORE WIPE** — your character has been reset to level 1!\n` : "") +
      `\n${result.log.slice(-5).join("\n")}`;
  } else {
    s = `💨 You fled the battle.\n\n${result.log.slice(-3).join("\n")}`;
  }
  return s;
}

function _afterPlayerAction(battle, result, player) {
  // quest progress hooks
  if (result.result === "victory") {
    const enemy = result.battle?.enemy || battle?.enemy;
    if (enemy) {
      const updates = progressQuest(player, { type: "kill", target: enemy.templateId, family: enemy.family, amount: 1 });
      if (enemy.boss) progressQuest(player, { type: "defeat_boss", target: String(enemy.zoneId), zoneId: enemy.zoneId, amount: 1 });
      // gather/loot quest progress
      for (const item of result.items || []) {
        const name = item.replace(/\*\*/g, "").split(" [")[0];
        progressQuest(player, { type: "collect", target: name, amount: 1 });
      }
    }
  }
  return _finish(battle, result);
}

const handlers = {
  attack(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No battle! Use `playrpg explore` to find enemies.";
    const result = playerAction(battle, player, "attack");
    if (result.ok === false) return `❌ ${result.reason}`;
    return _afterPlayerAction(battle, result, player);
  },

  skill(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No battle! Use `playrpg explore`.";
    const skillId = (args[0] || "").toLowerCase();
    if (!skillId) {
      const known = (player.abilities || []).map(id => ABILITIES[id]).filter(Boolean);
      if (!known.length) return "❌ You haven't learned any skills. Check `playrpg talents` for ability unlocks.";
      return `⚡ **YOUR SKILLS:**\n` + known.map(a => `• **${a.name}** (\`${a.id}\`) ${a.emoji} — ${a.desc}`).join("\n");
    }
    const result = playerAction(battle, player, "skill", { skillId });
    if (result.ok === false) {
      const reasons = { unknown_skill: "Unknown skill.", not_learned: "You haven't learned that skill.", insufficient_resource: "Not enough MP/stamina!", on_cooldown: "That skill is on cooldown!" };
      return `❌ ${reasons[result.reason] || result.reason}`;
    }
    return _afterPlayerAction(battle, result, player);
  },

  item(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No battle!";
    const name = args.join(" ");
    if (!name) return "❌ Use: `playrpg item <item name>` — e.g. `playrpg item Health Potion (S)`";
    const result = playerAction(battle, player, "item", { itemName: name });
    if (result.ok === false) {
      const reasons = { unknown_item: "That item can't be used in battle.", not_owned: "You don't have that item." };
      return `❌ ${reasons[result.reason] || result.reason}`;
    }
    return _afterPlayerAction(battle, result, player);
  },

  guard(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No battle!";
    const result = playerAction(battle, player, "guard");
    if (result.ok === false) return `❌ ${result.reason}`;
    return _finish(battle, result);
  },

  flee(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No battle!";
    const result = playerAction(battle, player, "flee");
    if (result.ok === false) return `❌ ${result.reason}`;
    return _finish(battle, result);
  },

  battle(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No active battle.";
    return battleStatusText(battle);
  },

  charge(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No battle! Use `playrpg explore`.";
    const power = parseInt(args[0]) || 100;
    const result = playerAction(battle, player, "charge", { power });
    if (result.ok === false) return result.reason === "already_charging" ? "❌ Already charging!" : `❌ ${result.reason}`;
    return _finish(battle, result);
  },

  combo(message, args, player) {
    const battle = getPlayerBattle(player.id);
    if (!battle) return "❌ No battle!";
    const result = playerAction(battle, player, "combo");
    if (result.ok === false) {
      if (result.reason === "need_combo") return `❌ Need at least **3 combo** to spend. Current: ${player.combo || 0}. Land attacks to build it.`;
      return `❌ ${result.reason}`;
    }
    return _finish(battle, result);
  },

  ultimate(message, args, player) {
    const battle = getPlayerBattle(player.id);
    const sub = (args[0] || "").toLowerCase();
    if (sub === "learn" || (!battle && sub !== "list")) {
      if (!player.class || player.class === "none") return "❌ Create a character first.";
      if (player.level < 50) return `❌ Ultimates unlock at **level 50** (you are ${player.level}).`;
      player.ultimate = `${player.class}_ult`;
      const ab = ABILITIES[player.ultimate];
      return `🌟 **ULTIMATE UNLOCKED: ${ab.name}!**\n${ab.emoji} ${ab.desc}\nUse it in battle: \`playrpg ultimate\``;
    }
    if (!battle) {
      if (!player.ultimate) return "❌ No ultimate learned. Reach level 50 and use `playrpg ultimate learn`.";
      const ab = ABILITIES[player.ultimate];
      return `🌟 **${ab.name}** ${ab.emoji} — ${ab.desc}\nIn battle: \`playrpg ultimate\` (cooldown ${ab.cooldown} turns)`;
    }
    const result = playerAction(battle, player, "ultimate");
    if (result.ok === false) {
      const reasons = { no_ultimate: "No ultimate learned. Reach level 50 + `playrpg ultimate learn`.", on_cooldown: "Ultimate is on cooldown!", insufficient_resource: "Not enough resources!" };
      return `❌ ${reasons[result.reason] || result.reason}`;
    }
    return _finish(battle, result);
  },

  stance(message, args, player) {
    const battle = getPlayerBattle(player.id);
    const stanceId = (args[0] || "").toLowerCase();
    if (!stanceId || !STANCES[stanceId]) {
      return `🧘 **STANCES:**\n` + Object.values(STANCES).map(s => `• ${s.emoji} **${s.name}** (\`${s.id}\`) — ${s.desc}`).join("\n");
    }
    if (battle) {
      const result = playerAction(battle, player, "stance", { stanceId });
      if (result.ok === false) return `❌ ${result.reason}`;
      return _finish(battle, result);
    }
    player.stance = stanceId;
    return `${STANCES[stanceId].emoji} Stance set to **${STANCES[stanceId].name}** (takes effect next battle).`;
  },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/craft ----------------------
__def("src/commands/craft", function (module, exports, require) {
// ============================================================
// commands/craft.js — recipes, craft, discover, enchant, refine.
// ============================================================

const {
  getRecipePage, findRecipe, craftItem, canCraft, searchRecipes,
  recipeDiscoveryText, ENCHANTMENTS, enchantItem, REFINING, refineItem,
  CRAFTING_STATIONS,
} = require("../crafting/recipes");
const { cap } = require("../util");

const handlers = {
  recipes(message, args, player) {
    const page = parseInt(args[0]) || 1;
    const { recipes, totalPages, page: p, total } = getRecipePage(page, 10);
    let s = `📜 **CRAFTING RECIPES (${total}) — Page ${p}/${totalPages}**\n\`playrpg recipes <page>\` | \`playrpg craft do <id>\` | \`playrpg recipes search <q>\`\n\n`;
    for (const r of recipes) {
      const mats = Object.entries(r.req).map(([k, v]) => `${v}x ${k}`).join(", ");
      const prof = r.profession && r.profession !== "none" ? ` [${r.profession}]` : "";
      s += `• **${r.name}** (\`${r.id}\`)${prof} T${r.tier} — ${mats}\n`;
    }
    return s;
  },

  craft(message, args, player) {
    const id = (args[0] || "").toLowerCase();
    if (id === "do") return handlers.craft(message, args.slice(1), player);
    if (id === "search") {
      const q = args.slice(1).join(" ");
      const found = searchRecipes(q).slice(0, 10);
      if (!found.length) return "🔍 No recipes match.";
      return `🔍 **SEARCH: "${q}"**\n` + found.map(r => `• **${r.name}** (\`${r.id}\`) — ${Object.entries(r.req).map(([k, v]) => `${v}x ${k}`).join(", ")}`).join("\n");
    }
    if (!id) return "❌ Usage: `playrpg craft do <recipe_id>`. Browse: `playrpg recipes`";
    const result = craftItem(player, id);
    if (!result.ok) {
      const reasons = {
        invalid_recipe: "Invalid recipe ID.",
        undiscovered: "You haven't discovered this recipe yet. Try `playrpg discover`!",
        missing_materials: "Missing materials. Check `playrpg recipes <page>` for requirements.",
      };
      if (result.reason?.startsWith("requires")) return `❌ ${cap(result.reason)}`;
      return `❌ ${reasons[result.reason] || result.reason}`;
    }
    return result.message + ` (cost: ${result.goldCost} gold)`;
  },

  discover(message, args, player) {
    const text = recipeDiscoveryText(player);
    return text;
  },

  enchant(message, args, player) {
    if (!args[0]) {
      let s = `✨ **ENCHANTMENTS**\n\`playrpg enchant <id> <item>\`\n\n`;
      for (const e of Object.values(ENCHANTMENTS)) {
        s += `• **${e.name}** (\`${e.id}\`) — ${e.stat} +${e.value} — ${Object.entries(e.req).map(([k, v]) => `${v}x ${k}`).join(", ")}\n`;
      }
      return s;
    }
    const encId = args[0].toLowerCase();
    const itemName = args.slice(1).join(" ");
    const item = player.inventory[itemName] ? { name: itemName, affixes: player.inventory[itemName] > 0 && (player._enchants || (player._enchants = {}))[itemName] } : null;
    if (!itemName) return "❌ Which item? `playrpg enchant <id> <item name>`";
    if (!(player.inventory[itemName] > 0)) return `❌ You don't have **${itemName}**.`;
    const result = enchantItem(player, { name: itemName, affixes: [], value: 50 }, encId);
    if (!result.ok) {
      const reasons = { unknown_enchant: "Unknown enchantment.", missing_materials: "Missing materials.", no_item: "No item." };
      return `❌ ${reasons[result.reason] || result.reason}`;
    }
    return result.message;
  },

  refine(message, args, player) {
    if (!args[0]) {
      let s = `⚒️ **REFINING**\n\`playrpg refine <id>\`\n\n`;
      for (const r of Object.values(REFINING)) {
        s += `• **${r.name}** (\`${r.id}\`) — ${Object.entries(r.input).map(([k, v]) => `${v}x ${k}`).join(", ")} → ${r.qty}x ${r.output}\n`;
      }
      return s;
    }
    const result = refineItem(player, args[0].toLowerCase());
    if (!result.ok) return `❌ ${result.reason === "missing_materials" ? "Missing materials." : result.reason}`;
    return result.message;
  },

  stations(message, args, player) {
    let s = `⚒️ **CRAFTING STATIONS**\n\n`;
    for (const st of CRAFTING_STATIONS) {
      s += `• ${st.name} — ${cap(st.profession)} (unlocks Lv ${st.unlockLevel})\n`;
    }
    return s;
  },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/economy ----------------------
__def("src/commands/economy", function (module, exports, require) {
// ============================================================
// commands/economy.js — inventory, equip, shop, buy, sell,
// bank, treasure, use items.
// ============================================================

const { players, refreshStats } = require("../core/schema");
const { pick, randInt, chance, seededRng, hashSeed } = require("../util");
const { generateItem, itemSummary, itemDetailed, generateTreasureMap } = require("../world/loot");
const { getZone } = require("../world/zones");

// ---- module-level market stores --------------------------------
const AUCTIONS = new Map(); // id -> { seller, item, price, listedAt }
let auctionSeq = 1;

const CURRENCY_NAMES = { gems: "💎 Gems", tokens: "🎫 Tokens", faction: "🚩 Faction Coins", guild: "🛡️ Guild Marks", dungeon: "🕳️ Dungeon Seals", raid: "⚔️ Raid Crests", event: "🎪 Event Tickets", crafting: "🛠️ Crafter's Chits", trade: "🪙 Trade Bars" };

function _addCurrency(player, key, amount) {
  if (!player.currencies) player.currencies = {};
  player.currencies[key] = (player.currencies[key] || 0) + amount;
}

// ---- local market (zone-scoped) -------------------------------
const SHOP_ITEMS = [
  { name: "Health Potion (S)", price: 25 },
  { name: "Mana Potion (S)", price: 30 },
  { name: "Stamina Potion", price: 35 },
  { name: "Bread", price: 8 },
  { name: "Torch Bundle", price: 10 },
  { name: "Campfire Kit", price: 20 },
  { name: "Water Flask", price: 5 },
];

const handlers = {
  inventory(message, args, player) {
    const entries = Object.entries(player.inventory).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return "🎒 **Inventory is empty.** Go gather or hunt!";
    const page = parseInt(args[0]) || 1;
    const perPage = 15;
    const pages = Math.max(1, Math.ceil(entries.length / perPage));
    const slice = entries.slice((page - 1) * perPage, page * perPage);
    let s = `🎒 **INVENTORY (page ${page}/${pages})** — ${entries.length} item types\n\n`;
    for (const [name, qty] of slice) s += `• **${name}** x${qty}\n`;
    s += `\n🪙 ${player.gold} gold | 📦 Storage: ${Object.keys(player.storageItems).length} items`;
    return s;
  },

  equip(message, args, player) {
    const name = args.join(" ");
    if (!name) return "❌ Equip what? `playrpg equip <item name>` (weapon/armor/ring/amulet...)";
    if ((player.inventory[name] || 0) <= 0) return `❌ You don't have **${name}**.`;
    // try to find an existing generated item in inventory meta
    if (!player._items) player._items = {};
    let item = player._items[name];
    if (!item) {
      // Heuristic slot from name
      const lower = name.toLowerCase();
      const slot = /sword|axe|hammer|dagger|staff|bow|spear|mace|wand|rapier/.test(lower) ? "weapon"
        : /helm|hood|cap|mask/.test(lower) ? "helm"
        : /boots|shoes|sandals/.test(lower) ? "boots"
        : /gloves|gauntlets|hand/.test(lower) ? "gloves"
        : /amulet|necklace|pendant/.test(lower) ? "amulet"
        : /ring/.test(lower) ? "ring1"
        : /shield|orb|tome|book/.test(lower) ? "offhand"
        : /armor|robe|plate|chest|mail|cloak|leather|tunic/.test(lower) ? "armor"
        : "relic";
      item = generateItem(name, { slot, tier: Math.max(1, Math.ceil(player.zone / 10)), level: player.level });
      item.name = name;
      player._items[name] = item;
    }
    const targetSlot = item.slot === "ring" ? (player.equipped.ring1 ? "ring2" : "ring1") : item.slot;
    // unequip old
    if (player.equipped[targetSlot]) {
      const old = player.equipped[targetSlot];
      player.inventory[old.name] = (player.inventory[old.name] || 0) + 1;
    }
    player.inventory[name] -= 1;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    player.equipped[targetSlot] = item;
    refreshStats(player);
    return `✅ Equipped **${name}** (${item.rarityName}).\n${itemSummary(item)}`;
  },

  shop(message, args, player) {
    const zone = getZone(player.zone);
    let s = `🏪 **${zone.region.name} General Store** (Zone ${player.zone})\n`;
    for (const it of SHOP_ITEMS) {
      s += `• **${it.name}** — ${it.price} gold (\`playrpg buy ${it.name}\`)\n`;
    }
    s += `\nSell items: \`playrpg sell <item> [qty]\` | Bank: \`playrpg bank\``;
    return s;
  },

  buy(message, args, player) {
    const name = args.join(" ");
    const it = SHOP_ITEMS.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!it) return `❌ Not sold here. \`playrpg shop\` for stock.`;
    if (player.gold < it.price) return `❌ Need **${it.price} gold** (you have ${player.gold}).`;
    player.gold -= it.price;
    player.inventory[it.name] = (player.inventory[it.name] || 0) + 1;
    return `🛒 Bought **${it.name}** for ${it.price} gold.`;
  },

  sell(message, args, player) {
    const name = args.join(" ");
    if (!name) return "❌ Sell what? `playrpg sell <item> [qty]`";
    const qty = parseInt(args[args.length - 1]) && isNaN(name) ? parseInt(args[args.length - 1]) : 1;
    const cleanName = args.slice(0, args.length - (qty > 1 ? 1 : 0)).join(" ") || name;
    const owned = player.inventory[cleanName] || 0;
    if (owned < qty) return `❌ You only have ${owned}x ${cleanName}.`;
    const basePrice = cleanName.toLowerCase().includes("ore") ? 8 : cleanName.toLowerCase().includes("log") ? 6 : cleanName.toLowerCase().includes("potion") ? 15 : 4;
    const earned = basePrice * qty;
    player.inventory[cleanName] -= qty;
    if (player.inventory[cleanName] <= 0) delete player.inventory[cleanName];
    player.gold += earned;
    return `💰 Sold **${qty}x ${cleanName}** for **${earned} gold**.`;
  },

  bank(message, args, player) {
    const action = (args[0] || "").toLowerCase();
    if (action === "deposit") {
      const n = parseInt(args[1]);
      if (!n || n < 1 || player.gold < n) return "❌ Invalid amount.";
      player.gold -= n;
      player.bankGold += n;
      return `🏦 Deposited **${n} gold**. Bank: ${player.bankGold}`;
    }
    if (action === "withdraw") {
      const n = parseInt(args[1]);
      if (!n || n < 1 || player.bankGold < n) return "❌ Invalid amount.";
      player.bankGold -= n;
      player.gold += n;
      return `🏦 Withdrew **${n} gold**. Bank: ${player.bankGold}`;
    }
    const interest = Math.floor(player.bankGold * (0.002 + (player.perkBonuses?.bankInterest || 0)));
    if (interest > 0) { player.bankGold += interest; }
    return `🏦 **BANK**\nBalance: **${player.bankGold} gold**\nInterest this check: +${interest}\n\n\`playrpg bank deposit <n>\` | \`playrpg bank withdraw <n>\``;
  },

  treasure(message, args, player) {
    const zone = getZone(player.zone);
    if (!player.treasureMap || player.treasureMap.zoneId !== player.zone) {
      player.treasureMap = generateTreasureMap(player.zone);
      return `🗺️ **TREASURE HUNT**\nYou found a map in ${zone.name}: **${player.treasureMap.name}**\nHint: ${player.treasureMap.hint}\nDig here with \`playrpg treasure dig\``;
    }
    return `🗺️ Your treasure map points somewhere in **${zone.name}**. Hint: ${player.treasureMap.hint}`;
  },

  dig(message, args, player) {
    if (!player.treasureMap || player.treasureMap.zoneId !== player.zone) {
      return "❌ No treasure map for this zone. `playrpg treasure` to find one.";
    }
    // 60% chance to find it
    if (Math.random() < 0.6) {
      const tier = Math.ceil(player.zone / 10);
      const loot = require("../world/loot").rollLoot({ tier, level: player.level, boss: false, playerLevel: player.level, lootMult: player.statMultipliers.loot + (player.perkBonuses?.treasureLuck || 0) });
      for (const it of loot.items) player.inventory[it.name] = (player.inventory[it.name] || 0) + 1;
      player.gold += loot.gold;
      delete player.treasureMap;
      return `💎 **TREASURE FOUND!**\n${loot.items.map(itemSummary).join("\n") || "Just gold this time."}\n+**${loot.gold} gold**`;
    }
    return "🕳️ You dig... nothing yet. Try again (`playrpg treasure dig`).";
  },

  use(message, args, player) {
    const name = args.join(" ");
    if (!name) return "❌ Use what?";
    if ((player.inventory[name] || 0) <= 0) return `❌ You don't have **${name}**.`;
    const consumableEffects = {
      "Health Potion (S)": { heal: 40 }, "Health Potion (M)": { heal: 100 }, "Health Potion (L)": { heal: 250 },
      "Mana Potion (S)": { mp: 40 }, "Mana Potion (M)": { mp: 100 }, "Stamina Potion": { stamina: 50 },
      "Grilled Salmon": { heal: 60, stamina: 20 }, "Hearty Stew": { heal: 80 }, "Bread": { heal: 25 },
      "Roast Boar": { heal: 120 }, "Honey Mead": { mp: 30, heal: 15 }, "Elven Waybread": { heal: 30, stamina: 30 },
      "Mushroom Soup": { heal: 45, mp: 20 }, "Campfire Kit": { camp: true },
    };
    const eff = consumableEffects[name];
    if (!eff) return `❌ **${name}** isn't consumable.`;
    player.inventory[name] -= 1;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    let s = `✅ Used **${name}**: `;
    const parts = [];
    const maxHp = player.maxHp || 100, maxMp = player.maxMp || 50, maxStamina = player.maxStamina || 60;
    if (eff.heal) { const h = Math.min(Math.max(0, maxHp - player.hp), eff.heal); player.hp += h; parts.push(`+${h} HP`); }
    if (eff.mp) { const m = Math.min(Math.max(0, maxMp - player.mp), eff.mp); player.mp += m; parts.push(`+${m} MP`); }
    if (eff.stamina) { const st = Math.min(Math.max(0, maxStamina - player.stamina), eff.stamina); player.stamina += st; parts.push(`+${st} stamina`); }
    if (eff.camp) { player.hp = player.maxHp; player.mp = player.maxMp; player.stamina = player.maxStamina; parts.push("fully rested!"); }
    return s + parts.join(", ") + ".";
  },

  // ---- CURRENCIES ---------------------------------------------
  currencies(message, args, player) {
    const c = player.currencies || {};
    const fmtCur = Object.entries(CURRENCY_NAMES).map(([k, label]) => `• ${label}: **${c[k] || 0}**`).join("\n");
    return `💠 **CURRENCIES**\n\n${fmtCur}\n\nEarn gems/tokens from loot, faction coins from faction quests, guild marks from guild deposits, event tickets from world events.`;
  },

  // ---- AUCTION HOUSE ------------------------------------------
  auction(message, args, player) {
    const action = (args[0] || "").toLowerCase();
    if (action === "list" || !action) {
      if (!AUCTIONS.size) return "🔨 **AUCTION HOUSE** — no listings. Sell: `playrpg auction sell <item> <price>`";
      let s = `🔨 **AUCTION HOUSE** (${AUCTIONS.size} listings)\n\n`;
      for (const [id, a] of AUCTIONS) {
        s += `• \`#${id}\` **${a.item}** — ${a.price} gold (by ${a.seller})\n`;
      }
      s += `\nBuy: \`playrpg auction buy <id>\` | Cancel: \`playrpg auction cancel <id>\``;
      return s;
    }
    if (action === "sell") {
      const price = parseInt(args[args.length - 1]);
      const name = args.slice(1, -1).join(" ");
      if (!name || !price || price < 1) return "❌ `playrpg auction sell <item> <price>`";
      if ((player.inventory[name] || 0) <= 0) return `❌ You don't have **${name}**.`;
      player.inventory[name] -= 1;
      if (player.inventory[name] <= 0) delete player.inventory[name];
      const id = `A${auctionSeq++}`;
      AUCTIONS.set(id, { seller: player.name, item: name, price, listedAt: Date.now() });
      return `🔨 Listed **${name}** for **${price} gold** (#${id}).`;
    }
    if (action === "buy") {
      const id = args[1]?.toUpperCase();
      const listing = AUCTIONS.get(id);
      if (!listing) return "❌ Listing not found.";
      if (player.gold < listing.price) return `❌ Need **${listing.price} gold**.`;
      player.gold -= listing.price;
      player.inventory[listing.item] = (player.inventory[listing.item] || 0) + 1;
      AUCTIONS.delete(id);
      return `🛒 Bought **${listing.item}** for **${listing.price} gold**.`;
    }
    if (action === "cancel") {
      const id = args[1]?.toUpperCase();
      const listing = AUCTIONS.get(id);
      if (!listing || listing.seller !== player.name) return "❌ Not your listing.";
      player.inventory[listing.item] = (player.inventory[listing.item] || 0) + 1;
      AUCTIONS.delete(id);
      return `↩️ Returned **${listing.item}** to your inventory.`;
    }
    return "❌ Actions: list | sell <item> <price> | buy <id> | cancel <id>";
  },

  // ---- ROTATING SHOP (daily + weekly rotation) -----------------
  rotatingshop(message, args, player) {
    const daySeed = new Date().toISOString().slice(0, 10);
    const rng = seededRng("shop_" + daySeed);
    const stock = [
      { name: "Arcane Dust", price: 40, currency: null },
      { name: "Cut Ruby", price: 120, currency: null },
      { name: "Rune of Power", price: 250, currency: null },
      { name: "Essence of Fire", price: 90, currency: null },
      { name: "Gold Bar", price: 300, currency: null },
      { name: "Large Backpack", price: 400, currency: "gems" },
      { name: "Baby Dragon", price: 5000, currency: "gems" },
    ];
    const today = stock.filter(() => rng() > 0.35).slice(0, 4);
    let s = `🔄 **ROTATING SHOP** (daily stock — resets at midnight)\n\n`;
    for (const it of today) {
      s += `• **${it.name}** — ${it.price} ${it.currency ? CURRENCY_NAMES[it.currency] : "gold"} (\`playrpg buyrot ${it.name}\`)\n`;
    }
    return s;
  },

  buyrot(message, args, player) {
    const name = args.join(" ");
    const prices = { "Arcane Dust": 40, "Cut Ruby": 120, "Rune of Power": 250, "Essence of Fire": 90, "Gold Bar": 300, "Large Backpack": 400, "Baby Dragon": 5000 };
    const gemsOnly = { "Large Backpack": 400, "Baby Dragon": 5000 };
    if (!(name in prices)) return "❌ Not in today's rotation. Check `playrpg rotatingshop`.";
    if (name in gemsOnly) {
      const c = player.currencies || {};
      if ((c.gems || 0) < gemsOnly[name]) return `❌ Need **${gemsOnly[name]} gems**.`;
      c.gems -= gemsOnly[name];
    } else {
      if (player.gold < prices[name]) return `❌ Need **${prices[name]} gold**.`;
      player.gold -= prices[name];
    }
    player.inventory[name] = (player.inventory[name] || 0) + 1;
    return `🛒 Bought **${name}** from the rotating shop!`;
  },

  // ---- SECRET SHOP (unlocked by zone secrets) ------------------
  secretshop(message, args, player) {
    const zone = getZone(player.zone);
    if (!zone.secrets.length) return "🔒 No secret shop here. Find a zone with 🔎 secrets (`playrpg zone`).";
    let s = `🤫 **SECRET SHOP** (${zone.name})\nYou found it among the ${zone.secrets[0].name.toLowerCase()}.\n\n`;
    const stock = [
      { name: "Soul Shard", price: 30, currency: "gems" },
      { name: "Treasure Compass", price: 200, currency: "tokens" },
      { name: "Mystery Crate", price: 150, currency: null, gold: 500 },
    ];
    for (const it of stock) {
      s += `• **${it.name}** — ${it.currency ? `${it.price} ${CURRENCY_NAMES[it.currency]}` : `${it.gold} gold`} (\`playrpg buysecret ${it.name}\`)\n`;
    }
    return s;
  },

  buysecret(message, args, player) {
    const name = args.join(" ");
    const stock = {
      "Soul Shard": { price: 30, currency: "gems" },
      "Treasure Compass": { price: 200, currency: "tokens" },
      "Mystery Crate": { price: 500, currency: null },
    };
    const it = stock[name];
    if (!it) return "❌ Not sold here.";
    const c = player.currencies || {};
    if (it.currency) {
      if ((c[it.currency] || 0) < it.price) return `❌ Need **${it.price} ${CURRENCY_NAMES[it.currency]}**.`;
      c[it.currency] -= it.price;
    } else {
      if (player.gold < it.price) return `❌ Need **${it.price} gold**.`;
      player.gold -= it.price;
    }
    player.inventory[name] = (player.inventory[name] || 0) + 1;
    return `🤫 Bought **${name}** from the secret shop!`;
  },

  // ---- TRAVELING MERCHANT (random zone each hour) --------------
  traveling(message, args, player) {
    const hourSeed = Math.floor(Date.now() / 3600000);
    const rng = seededRng("traveler_" + hourSeed);
    const zoneId = 1 + Math.floor(rng() * 1000);
    if (player.zone !== zoneId) {
      return `🧭 A **Traveling Merchant** was last seen near **Zone ${zoneId}** (${getZone(zoneId).name}). Find them before they move on!`;
    }
    const stock = [
      { name: "Reinforced Bow", price: 150 },
      { name: "Health Potion (L)", price: 90 },
      { name: "Mithril Dagger", price: 220 },
      { name: "Ancient Amber", price: 60 },
    ];
    let s = `🧭 **TRAVELING MERCHANT** (here, for now!)\n\n`;
    for (const it of stock) s += `• **${it.name}** — ${it.price} gold (\`playrpg buy ${it.name}\`)\n`;
    s += `\nThey'll move on next hour.`;
    return s;
  },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/gather ----------------------
__def("src/commands/gather", function (module, exports, require) {
// ============================================================
// commands/gather.js — mine, chop, fish, forage, farm, trap.
// hunt = track & FIGHT enemies (find-and-fight action).
// ============================================================

const { getZone, pickGatherable } = require("../world/zones");
const { getEnemyForZone, enemyIntro } = require("../world/enemies");
const { startEncounter, getPlayerBattle, battleStatusText } = require("../core/combat");
const { applyStatus } = require("../core/statusEffects");
const { progressQuest } = require("../world/quests");
const { randInt } = require("../util");
const { cap } = require("../util");

// chance of finding a rare bonus material scales with skill level
function _doGather(player, skillKey, zoneSkillKey, verbEmoji, verb) {
  const zone = getZone(player.zone);
  const mat = pickGatherable(zone, skillKey);
  const skillLvl = player.skills[skillKey] || 1;
  const yieldBonus = player.perkBonuses?.gatheringYield || 0;

  let amount = Math.floor(Math.random() * 3) + 1;
  if (Math.random() < 0.05 + skillLvl * 0.002 + yieldBonus) amount += randInt(1, 3);
  player.inventory[mat] = (player.inventory[mat] || 0) + amount;
  player.skills[skillKey] += 1;

  const rare = Math.random() < 0.08 + skillLvl * 0.001;
  let extra = "";
  if (rare) {
    const bonus = ["Glowing Slime", "Ancient Amber", "Arcane Dust", "Soul Shard"][randInt(0, 3)];
    player.inventory[bonus] = (player.inventory[bonus] || 0) + 1;
    extra = `\n✨ Bonus find: **1x ${bonus}**!`;
  }

  const updates = progressQuest(player, { type: skillKey === "fishing" ? "fish" : skillKey === "mining" ? "mine" : skillKey === "woodcutting" ? "chop" : "gather", target: mat, amount });
  const qProg = updates.length ? `\n📋 ${updates.map(u => `**${u.quest.title}** ${u.complete ? "✅" : ""}`).join(", ")}` : "";

  return `${verbEmoji} **${verb.toUpperCase()} SUCCESSFUL!** (${zone.name})\n` +
    `You gathered **${amount}x ${mat}**.\n` +
    `Skill: ${cap(skillKey)} Lvl ${skillLvl} → **${skillLvl + 1}**${extra}${qProg}`;
}

const handlers = {
  mine(message, args, player) { return _doGather(player, "mining", "mine", "⛏️", "mine"); },
  chop(message, args, player) { return _doGather(player, "woodcutting", "chop", "🪓", "chop"); },
  fish(message, args, player) { return _doGather(player, "fishing", "fish", "🎣", "fish"); },
  forage(message, args, player) { return _doGather(player, "foraging", "forage", "🌿", "forage"); },
  farm(message, args, player) {
    const crops = ["Wheat", "Carrot", "Honey", "Sugar"];
    const crop = crops[Math.floor(Math.random() * crops.length)];
    const amount = randInt(1, 4);
    player.inventory[crop] = (player.inventory[crop] || 0) + amount;
    player.skills.farming = (player.skills.farming || 1) + 1;
    progressQuest(player, { type: "farm", target: crop, amount });
    return `🌾 **FARMING!** You harvested **${amount}x ${crop}**. Farming Lvl ${player.skills.farming}`;
  },

  // trap: the old pelt-gathering action
  trap(message, args, player) { return _doGather(player, "hunting", "hunt", "🪤", "trap"); },

  // hunt: TRACK enemies and FIGHT them (find-and-fight action)
  hunt(message, args, player) {
    const zone = getZone(player.zone);
    const elite = (args[0] || "").toLowerCase() === "elite";
    const existing = getPlayerBattle(player.id);
    if (existing) return `⚔️ You're already fighting!\n\n${battleStatusText(existing)}`;
    const enemy = getEnemyForZone(zone, player.level);
    const res = startEncounter(player, { zoneId: player.zone, elite: elite || enemy.elite });
    if (!res.ok) return `❌ ${res.reason}`;
    // tracking bonus: first-strike focus + jump on the enemy
    applyStatus(player, "focus", { potency: 1, duration: 2 });
    applyStatus(player, "haste", { potency: 1, duration: 2 });
    const e = res.battle.enemy;
    let s = `🏹 **HUNT!** You tracked a **${e.name}** through ${zone.name} and ambushed it.\n\n`;
    s += `${enemyIntro(e)}\n\n`;
    s += `⚡ Ambush bonus: **focus + haste** for 2 turns.\n`;
    if (e.elite) s += `💀 This is an **elite** — higher rewards, higher risk!\n`;
    s += `\nActions: \`playrpg attack\` | \`playrpg skill <name>\` | \`playrpg item <name>\` | \`playrpg guard\` | \`playrpg flee\``;
    return s;
  },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/index ----------------------
__def("src/commands/index", function (module, exports, require) {
// ============================================================
// commands/index.js — command registry/router.
// Every module exports { commandName: (message, args, player) => string }
// ============================================================

const character = require("./character");
const world = require("./world");
const combat = require("./combat");
const gather = require("./gather");
const craft = require("./craft");
const social = require("./social");
const economy = require("./economy");
const quests = require("./quests");
const meta = require("./meta");
const pvp = require("./pvp");

const MODULES = [character, world, combat, gather, craft, social, economy, quests, meta, pvp];

// Flatten into one command map with aliases
const COMMANDS = {};
const ALIASES = {
  map: ["zones"], travel: ["tp"], explore: ["hunt_battle", "fight"], attack: ["atk"],
  skill: ["cast"], guard: ["defend"], flee: ["run"], inventory: ["inv"],
  profile: ["whoami", "char"], stats: ["stat"], mine: ["dig"], fish: ["fish", "fishing"],
  chop: ["woodcutting"], recipes: ["recipe"], craft: ["crafting"], discover: ["learn"],
  shop: ["store"], quests: ["quests", "qlog"], help: ["commands", "?"], party: ["p"],
  guild: ["g"], bank: ["vault"], top: ["leaderboard", "lb"], bestiary: ["codex2"],
  stance: ["st"], auction: ["ah"], rotatingshop: ["rot"], traveling: ["merchant", "traveler"],
  currencies: ["cur"], features: ["catalog"], ranks: ["rank"], pvp: ["duel"],
};

for (const mod of MODULES) {
  for (const [name, handler] of Object.entries(mod)) {
    COMMANDS[name] = handler;
  }
}
for (const [name, aliases] of Object.entries(ALIASES)) {
  if (!COMMANDS[name]) continue;
  for (const a of aliases) if (!COMMANDS[a]) COMMANDS[a] = COMMANDS[name];
}

function runCommand(message, args, player) {
  const cmd = (args[0] || "").toLowerCase();
  const rest = args.slice(1);
  const handler = COMMANDS[cmd];
  if (!handler) return null;
  return handler(message, rest, player);
}

module.exports = { COMMANDS, runCommand };
});

// ---------------------- embedded module: src/commands/meta ----------------------
__def("src/commands/meta", function (module, exports, require) {
// ============================================================
// commands/meta.js — help, stats, achievements, bestiary,
// codex, settings, leaderboards.
// ============================================================

const { players } = require("../core/schema");
const { ENEMY_REGISTRY } = require("../world/enemies");
const { fmt } = require("../util");
const { featuresText, featureDetail, searchFeatures, categories, featureCounts, getFeature } = require("../core/features");
const { ranksText } = require("../core/progression");

const ACHIEVEMENTS = [
  { id: "first_kill",    name: "First Blood",        desc: "Slay your first enemy",         check: p => p.kills >= 1 },
  { id: "killer_10",     name: "Slayer",             desc: "Slay 10 enemies",               check: p => p.kills >= 10 },
  { id: "killer_100",    name: "Butcher",            desc: "Slay 100 enemies",              check: p => p.kills >= 100 },
  { id: "killer_1000",   name: "Reaper",             desc: "Slay 1000 enemies",             check: p => p.kills >= 1000 },
  { id: "level_10",      name: "Rising Star",        desc: "Reach level 10",                check: p => p.level >= 10 },
  { id: "level_50",      name: "Champion",           desc: "Reach level 50",                check: p => p.level >= 50 },
  { id: "level_100",     name: "Legend",             desc: "Reach level 100",               check: p => p.level >= 100 },
  { id: "prestige_1",    name: "Reborn",             desc: "Prestige once",                 check: p => p.prestige >= 1 },
  { id: "prestige_10",   name: "Ascended",           desc: "Prestige 10 times",             check: p => p.prestige >= 10 },
  { id: "gold_1000",     name: "Well-Off",           desc: "Hold 1,000 gold",               check: p => p.gold >= 1000 },
  { id: "gold_100000",   name: "Tycoon",             desc: "Hold 100,000 gold",             check: p => p.gold >= 100000 },
  { id: "explorer_10",   name: "Wanderer",           desc: "Explore 10 zones",              check: p => p.explored.size >= 10 },
  { id: "explorer_100",  name: "Pathfinder",         desc: "Explore 100 zones",             check: p => p.explored.size >= 100 },
  { id: "explorer_1000", name: "World Traveler",     desc: "Explore all 1000 zones",        check: p => p.explored.size >= 1000 },
  { id: "bestiary_10",   name: "Naturalist",         desc: "Catalog 10 enemies",            check: p => p.bestiary.size >= 10 },
  { id: "bestiary_100",  name: "Codex Master",       desc: "Catalog 100 enemies",           check: p => p.bestiary.size >= 100 },
  { id: "crafter_10",    name: "Artisan",            desc: "Craft 10 items",                check: p => (p.craftsMade || 0) >= 10 },
  { id: "crafter_100",   name: "Master Artisan",     desc: "Craft 100 items",               check: p => (p.craftsMade || 0) >= 100 },
  { id: "quest_10",      name: "Errand Runner",      desc: "Complete 10 quests",            check: p => (p.quests.totalCompleted || 0) >= 10 },
  { id: "quest_100",     name: "Hero of the Realm",  desc: "Complete 100 quests",           check: p => (p.quests.totalCompleted || 0) >= 100 },
  { id: "boss_killer",   name: "Boss Slayer",        desc: "Defeat a world boss",           check: p => (p.bossKills || 0) >= 1 },
  { id: "hardcore_10",   name: "Hardened",           desc: "Reach level 10 in hardcore",    check: p => p.mode !== "none" && p.level >= 10 },
  { id: "millionaire",   name: "Millionaire",        desc: "Hold 1,000,000 gold",           check: p => p.gold + p.bankGold >= 1000000 },
  { id: "collector_10",  name: "Collector",          desc: "Own 10 item types",             check: p => Object.keys(p.inventory).length >= 10 },
];

const handlers = {
  help(message, args, player) {
    return `📜 **PLAYRPG COMMAND SYSTEM** (prefix: \`playrpg\`)\n\n` +
      `**Character**\n` +
      `\`playrpg create <race> <class>\` — create your hero (14 races, 14 classes)\n` +
      `\`playrpg subclass <name>\` — pick a subclass | \`playrpg look <field> <val>\` — appearance\n` +
      `\`playrpg attrs <stat> <n>\` — spend attribute points | \`playrpg talents\` — skill tree\n` +
      `\`playrpg perks\` — prestige perks | \`playrpg prestige\` — rebirth (Lv 100)\n` +
      `\`playrpg respec\` / \`playrpg hardmode <mode>\`\n\n` +
      `**World**\n` +
      `\`playrpg map <page>\` — 100 pages / 1000 zones | \`playrpg travel <zone>\`\n` +
      `\`playrpg zone\` — zone details | \`playrpg explore\` — start a battle\n` +
      `\`playrpg dungeon\` — enter the zone dungeon\n\n` +
      `**Combat**\n` +
      `\`playrpg attack\` | \`playrpg skill <id>\` | \`playrpg item <name>\` | \`playrpg guard\` | \`playrpg flee\` | \`playrpg battle\`\n` +
      `\`playrpg charge [pct]\` — charged attacks | \`playrpg combo\` — spend combo | \`playrpg ultimate\` — class ultimate (Lv 50) | \`playrpg stance <id>\` — combat stances\n\n` +
      `**Gathering & Hunt** — \`playrpg mine\` \`chop\` \`fish\` \`forage\` \`farm\` \`trap\` | \`playrpg hunt\` — track and FIGHT enemies\n` +
      `**Crafting** — \`playrpg recipes <page>\` | \`playrpg recipes food <page>\` | \`playrpg recipes craft <page>\` | \`playrpg craft do <id>\` | \`playrpg discover\` | \`playrpg enchant\` | \`playrpg refine\`\n` +
      `**Quests** — \`playrpg quests\` | \`quests daily\` | \`weekly\` | \`monthly\` | \`bounty\` | \`main\` | \`quest accept <id>\` | \`quest answer <text>\` | \`quest choose <a|b>\`\n` +
      `**Economy** — \`playrpg inventory\` | \`equip <item>\` | \`shop\` | \`buy <item>\` | \`sell <item>\` | \`bank\` | \`currencies\` | \`auction\` | \`rotatingshop\` | \`secretshop\` | \`traveling\` | \`treasure\` | \`dig\` | \`use <item>\`\n` +
      `**Social** — \`playrpg party\` | \`guild\` | \`faction\` | \`friend\` | \`playrpg pvp @user [wager]\` — player duels\n` +
      `**Meta** — \`playrpg profile\` | \`stats\` | \`ranks\` | \`features\` | \`feature <name>\` | \`achievements\` | \`bestiary\` | \`codex\` | \`settings\` | \`top\``;
  },

  stats(message, args, player) {
    return `📊 **${player.name}'s STATISTICS**\n` +
      `Level ${player.level}${player.prestige ? ` (Prestige ${player.prestige})` : ""} | ${fmt(player.exp)}/${fmt(player.nextExp || 0)} XP\n` +
      `⚔️ Kills: ${player.kills} | 💀 Deaths: ${player.deaths} | 🧭 Zones explored: ${player.explored.size}/1000\n` +
      `📖 Bestiary: ${player.bestiary.size}/${ENEMY_REGISTRY.length} | ✅ Quests completed: ${player.quests.totalCompleted || 0}\n` +
      `🪙 Gold: ${fmt(player.gold)} | 🏦 Bank: ${fmt(player.bankGold)} | 📦 Item types: ${Object.keys(player.inventory).length}\n` +
      `🛠️ Crafts: ${player.craftsMade || 0} | 💠 Prestige: ${player.prestige} | Mode: ${player.mode}`;
  },

  achievements(message, args, player) {
    if (!player.achievements) player.achievements = new Set();
    let newly = [];
    for (const a of ACHIEVEMENTS) {
      if (!player.achievements.has(a.id) && a.check(player)) {
        player.achievements.add(a.id);
        newly.push(a);
      }
    }
    let s = `🏆 **ACHIEVEMENTS** (${player.achievements.size}/${ACHIEVEMENTS.length})\n`;
    if (newly.length) s += `\n🎉 **NEW:** ${newly.map(a => `**${a.name}** — ${a.desc}`).join("\n")}\n\n`;
    s += `\n${ACHIEVEMENTS.map(a => `${player.achievements.has(a.id) ? "✅" : "⬜"} **${a.name}** — ${a.desc}`).join("\n")}`;
    return s;
  },

  bestiary(message, args, player) {
    const page = parseInt(args[0]) || 1;
    const perPage = 20;
    const total = ENEMY_REGISTRY.length;
    const pages = Math.ceil(total / perPage);
    let s = `📖 **BESTIARY** (${player.bestiary.size}/${total} catalogued — page ${page}/${pages})\n\n`;
    const slice = ENEMY_REGISTRY.slice((page - 1) * perPage, page * perPage);
    for (const e of slice) {
      s += `${player.bestiary.has(e.id) ? "📗" : "📕"} **${e.name}** (${e.id}) — band ${e.band}${player.bestiary.has(e.id) ? ` | ⚔️ ${e.baseStats.hp}hp/${e.baseStats.atk}atk | loot: ${e.lootTable.slice(0, 2).join(", ")}` : " — ???"}\n`;
    }
    return s;
  },

  codex(message, args, player) {
    let s = `📚 **CODEX**\n\n**Races:** ${Object.keys(require("../config").RACES).length} | **Classes:** ${Object.keys(require("../config").CLASSES).length}\n**Zones:** 1000 | **Enemies:** ${ENEMY_REGISTRY.length} | **Factions:** 6\n\n`;
    const rarities = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "artifact"];
    s += `**Loot Rarities:** ${rarities.map(r => `\`${r}\``).join(" ")}\n`;
    s += `**Elements:** ${Object.keys(require("../config").ELEMENT_EMOJI).join(", ")}\n`;
    s += `\nTip: defeat enemies to catalogue them in your bestiary.`;
    return s;
  },

  settings(message, args, player) {
    const [key, val] = args;
    if (key && val) {
      const v = val.toLowerCase() === "true" || val === "1" || val.toLowerCase() === "on";
      if (!(key in player.settings)) return "❌ Unknown setting. Options: colorblind, reducedMotion, damageNumbers, compactMode";
      player.settings[key] = v;
      return `⚙️ Setting **${key}** = ${v}`;
    }
    return `⚙️ **SETTINGS**\n` + Object.entries(player.settings).map(([k, v]) => `• ${k}: ${v} — \`playrpg settings ${k} <true|false>\``).join("\n");
  },

  top(message, args, player) {
    const by = (args[0] || "level").toLowerCase();
    const list = [...players.values()].filter(p => p.class !== "none").sort((a, b) => by === "gold" ? b.gold - a.gold : by === "kills" ? b.kills - a.kills : b.level - a.level).slice(0, 10);
    if (!list.length) return "📊 No ranked players yet.";
    return `🏆 **LEADERBOARD (${by})**\n` + list.map((p, i) => `${i + 1}. **${p.name}** — ${by === "gold" ? `${fmt(p.gold)} gold` : by === "kills" ? `${p.kills} kills` : `Lv ${p.level}${p.prestige ? ` ⭐${p.prestige}` : ""}`}`).join("\n");
  },

  reset(message, args, player) {
    if (args[0] !== "confirm") return "⚠️ This erases your character. Type `playrpg reset confirm` to confirm.";
    const { createPlayer } = require("../core/schema");
    const fresh = createPlayer(player.id, player.name);
    fresh.friends = player.friends;
    players.set(player.id, fresh);
    return "🔄 Character erased. Start fresh with `playrpg create <race> <class>`";
  },

  // ---- FEATURE CATALOG ---------------------------------------
  features(message, args, player) {
    const sub = (args[0] || "").toLowerCase();
    if (!sub) return featuresText(1);
    if (sub === "prefix" && args[1]) return featuresText(1, { prefix: args[1].toLowerCase() });
    if (sub === "search") {
      const q = args.slice(1).join(" ");
      if (!q) return "❌ `playrpg features search <query>`";
      const found = searchFeatures(q).slice(0, 15);
      if (!found.length) return "🔍 No features match.";
      const counts = featureCounts();
      return `🔍 **FEATURE SEARCH: "${q}"** (${counts.total} total in catalog)\n\n` +
        found.map(f => `• **${f.name}** ${f.status === "implemented" ? "✅" : f.status === "partial" ? "🔄" : "📄"}`).join("\n") +
        `\n\nDetail: \`playrpg feature <name>\``;
    }
    if (sub === "stats") {
      const counts = featureCounts();
      return `📊 **FEATURE CATALOG STATS**\n\nTotal entries: **${counts.total}**\n` +
        `✅ Implemented: ${counts.byStatus.implemented || 0}\n🔄 Partial hooks: ${counts.byStatus.partial || 0}\n📄 Catalog-only: ${counts.byStatus.catalog || 0}\n\n` +
        Object.entries(counts.byCategory).map(([c, n]) => `• ${c}: ${n}`).join("\n");
    }
    const page = parseInt(sub);
    if (!isNaN(page)) return featuresText(page);
    if (categories().some(c => c.toLowerCase() === sub)) return featuresText(1, { category: sub });
    return `❌ Unknown filter. Try a category: ${categories().join(", ")} | \`features search <q>\` | \`features prefix <id>\` | \`features stats\``;
  },

  feature(message, args, player) {
    const name = args.join(" ");
    if (!name) return "❌ `playrpg feature <feature name>` — e.g. `playrpg feature legendary charged attack`";
    const exact = searchFeatures(name);
    const f = getFeature(exact[0]?.id) || null;
    if (!f) return "❌ Feature not found.";
    return featureDetail(f.id);
  },

  ranks(message, args, player) {
    return ranksText(player);
  },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/pvp ----------------------
__def("src/commands/pvp", function (module, exports, require) {
// ============================================================
// commands/pvp.js — player-vs-player duels.
//   playrpg pvp @user [wager]      -> challenge
//   playrpg pvp accept [@user]     -> accept a pending challenge
//   playrpg pvp decline            -> decline
//   playrpg pvp status             -> current duel
//   playrpg pvp attack|skill <id>|item <name>|guard|flee
// ============================================================

const { players } = require("../core/schema");
const { challenge, accept, decline, listChallenges, getPvpBattle, pvpAction, pvpStatusText } = require("../core/pvp");
const { ABILITIES } = require("../core/combat");

const handlers = {
  pvp(message, args, player) {
    const action = (args[0] || "").toLowerCase();
    const target = message.mentions.users.first();

    // no args: show pending challenges
    if (!args.length) {
      const pending = listChallenges().filter(c => c.targetId === player.id);
      const mine = getPvpBattle(player.id);
      let s = `⚔️ **PVP**\n\n`;
      if (mine) s += `You're in a duel! \`playrpg pvp status\`\n`;
      if (pending.length) s += `**Pending challenges:**\n` + pending.map(c => `• ${c.challenger} wagered **${c.wager} gold** — \`playrpg pvp accept\``).join("\n") + `\n`;
      s += `\nChallenge someone: \`playrpg pvp @user [wager]\` (default 50)\nActions: \`pvp attack\` \`pvp skill <id>\` \`pvp item <name>\` \`pvp guard\` \`pvp flee\``;
      return s;
    }

    if (action === "accept") {
      const pending = listChallenges().filter(x => x.targetId === player.id);
      const c = target ? pending.find(x => x.challenger === target.username) || pending[0] : pending[0];
      if (!c) return "❌ No pending challenge for you.";
      const challengerPlayer = [...players.values()].find(p => p.name === c.challenger);
      if (!challengerPlayer) return "❌ Challenger not found (restart bot?).";
      const res = accept(player, challengerPlayer.id);
      if (!res.ok) {
        const reasons = { no_challenge: "No pending challenge.", not_for_you: "That challenge isn't for you.", no_gold: "You can't cover the wager!" };
        return `❌ ${reasons[res.reason] || res.reason}`;
      }
      return `⚔️ **DUEL STARTED!**\n\n${pvpStatusText(res.battle)}`;
    }

    if (action === "decline") {
      const challenger = target ? [...players.values()].find(p => p.id === target.id) : null;
      if (!challenger) return "❌ Mention your challenger: `playrpg pvp decline @user`";
      const res = decline(player, challenger.id);
      return res.ok ? "🚫 Challenge declined." : "❌ No challenge from them.";
    }

    if (action === "status") {
      const battle = getPvpBattle(player.id);
      if (!battle) return "❌ You're not in a duel.";
      return pvpStatusText(battle);
    }

    if (["attack", "skill", "item", "guard", "flee"].includes(action)) {
      const battle = getPvpBattle(player.id);
      if (!battle) return "❌ You're not in a duel. `playrpg pvp @user` to challenge someone.";
      const res = pvpAction(player, action, { skillId: args[1], itemName: args.slice(1).join(" ") });
      if (res.ok === false) {
        const reasons = {
          not_your_turn: "Not your turn!",
          no_duel: "No duel.",
          duel_over: "The duel is over.",
          unknown_skill: "Unknown skill.",
          not_learned: "You haven't learned that skill.",
          on_cooldown: "That skill is on cooldown!",
          insufficient_resource: "Not enough MP/stamina!",
          unknown_item: "Can't use that in a duel.",
          not_owned: "You don't have that item.",
        };
        return `❌ ${reasons[res.reason] || res.reason}`;
      }
      if (res.result === "over") {
        return `🏆 **DUEL OVER**\n\n${res.log.slice(-8).join("\n")}`;
      }
      return pvpStatusText(res.battle);
    }

    // default: challenge
    if (!target) return "❌ Mention someone: `playrpg pvp @user [wager]`";
    const targetPlayer = players.get(target.id);
    if (!targetPlayer) return "❌ That player hasn't played yet.";
    const maybeWager = parseInt(args[args.length - 1]);
    const wager = Number.isInteger(maybeWager) && maybeWager >= 10 ? maybeWager : 50;
    const res = challenge(player, targetPlayer, wager);
    if (!res.ok) {
      const reasons = { self: "You can't duel yourself.", ironman_no_pvp: "Ironman players can't duel.", already_dueling: "You're already in a duel!", target_busy: "They're already in a duel.", wager_min: "Minimum wager is 10 gold.", no_gold: "You can't afford that wager." };
      return `❌ ${reasons[res.reason] || res.reason}`;
    }
    return `⚔️ **${targetPlayer.name}** has been challenged by **${player.name}** for **${res.wager} gold**!\nAccept: \`playrpg pvp accept\` | Decline: \`playrpg pvp decline @${player.name.replace(/\s+/g, "")}\``;
  },

  // convenience alias: duel
  duel(message, args, player) { return handlers.pvp(message, args, player); },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/quests ----------------------
__def("src/commands/quests", function (module, exports, require) {
// ============================================================
// commands/quests.js — quest log, accept, daily, weekly,
// bounty, puzzle answers.
// ============================================================

const {
  generateQuest, acceptQuest, getDailyQuests, getWeeklyQuests,
  checkQuestReset, generateBounty, generatePuzzleQuest,
  questListText, questSummary, RIDDLES,
} = require("../world/quests");
const { getZone } = require("../world/zones");

const handlers = {
  quests(message, args, player) {
    const sub = (args[0] || "").toLowerCase();
    checkQuestReset(player);
    if (sub === "daily") {
      if (player.quests.daily?.length) {
        return `📅 **DAILY CONTRACTS** (new ones each day)\n` + player.quests.daily.map(q => `• ${questSummary(q)} — \`playrpg quest accept ${q.id}\``).join("\n");
      }
      const quests = getDailyQuests(player);
      return `📅 **DAILY CONTRACTS**\n` + quests.map(q => `• ${questSummary(q)} — \`playrpg quest accept ${q.id}\``).join("\n");
    }
    if (sub === "weekly") {
      if (player.quests.weekly?.length) {
        return `📅 **WEEKLY CONTRACTS**\n` + player.quests.weekly.map(q => `• ${questSummary(q)} — \`playrpg quest accept ${q.id}\``).join("\n");
      }
      const quests = getWeeklyQuests(player);
      return `📅 **WEEKLY CONTRACTS**\n` + quests.map(q => `• ${questSummary(q)} — \`playrpg quest accept ${q.id}\``).join("\n");
    }
    if (sub === "monthly") {
      const q = generateQuest(player, { type: "monthly", zoneId: player.zone });
      return `📅 **MONTHLY CONTRACT**\n${q.title}\n${q.objectives.map(o => `• ${o.label}`).join("\n")}\nRewards: ${q.reward.xp} XP, ${q.reward.gold} gold, ${q.reward.items.map(i => `${i.qty}x ${i.name}`).join(", ")}\nAccept: \`playrpg quest accept ${q.id}\``;
    }
    if (sub === "raid" || sub === "boss" || sub === "faction" || sub === "guild" || sub === "world" || sub === "chain" || sub === "choice" || sub === "investigation" || sub === "delivery") {
      const q = generateQuest(player, { type: sub, zoneId: player.zone });
      return `📋 **${sub.toUpperCase()} QUEST**\n${q.title}\n${q.description}\n\n${q.objectives.map(o => `• ${o.label}`).join("\n")}\nAccept: \`playrpg quest accept ${q.id}\``;
    }
    if (sub === "bounty") {
      const q = generateBounty(player);
      return `🏴 **BOUNTY BOARD**\n${questSummary(q)}\nAccept: \`playrpg quest accept ${q.id}\` (bounty chain: ${player.bountyChain})`;
    }
    if (sub === "main") {
      const q = generateQuest(player, { type: "main", zoneId: player.zone });
      return `📖 **MAIN QUEST**\n${q.title}\n${q.description}\n\n${q.objectives.map(o => `• ${o.label}`).join("\n")}\nAccept: \`playrpg quest accept ${q.id}\``;
    }
    if (sub === "puzzle") {
      const q = generatePuzzleQuest(player);
      player.quests.active = player.quests.active || [];
      player.quests.active.push(q);
      return `🧩 **${q.title}**\n${q.description}`;
    }
    return questListText(player);
  },

  quest(message, args, player) {
    const action = (args[0] || "").toLowerCase();
    checkQuestReset(player);
    if (action === "accept") {
      const qid = args[1];
      // search active offers first
      const offers = [...(player.quests.daily || []), ...(player.quests.weekly || [])];
      let quest = offers.find(q => q.id === qid);
      if (!quest) return "❌ Quest not found. Browse: `playrpg quests daily` / `weekly` / `bounty` / `main`";
      const res = acceptQuest(player, quest);
      if (!res.ok) return `❌ ${res.reason === "quest_log_full" ? "Quest log full (10 max). Complete some first!" : res.reason}`;
      return `✅ **QUEST ACCEPTED:** ${quest.title}\n\n${quest.description}\n\n${quest.objectives.map(o => `• ${o.label}`).join("\n")}`;
    }
    if (action === "abandon") {
      const qid = args[1];
      const idx = (player.quests.active || []).findIndex(q => q.id === qid);
      if (idx === -1) return "❌ Quest not found in your log.";
      player.quests.active.splice(idx, 1);
      return "🗑️ Quest abandoned.";
    }
    if (action === "answer") {
      const answer = args.slice(1).join(" ").toLowerCase();
      if (!answer) return "❌ `playrpg quest answer <your answer>`";
      const { progressQuest } = require("../world/quests");
      const updates = progressQuest(player, { type: "puzzle", target: answer, amount: 1 });
      if (!updates.length) return "❌ That's not the answer to any active riddle.";
      const done = updates.filter(u => u.complete);
      if (done.length) return `🧩 **CORRECT!** The way opens.\n✅ **${done[0].quest.title} COMPLETE!** +${done[0].quest.reward.xp} XP, +${done[0].quest.reward.gold} gold.`;
      return "🧩 Correct!";
    }
    if (action === "choose") {
      const option = (args[1] || "").toLowerCase();
      if (!["a", "b"].includes(option)) return "❌ `playrpg quest choose <a|b>`";
      const { progressQuest } = require("../world/quests");
      const updates = progressQuest(player, { type: "choice", target: option, amount: 1 });
      if (!updates.length) return "❌ No choice quest in your log.";
      const done = updates.filter(u => u.complete);
      if (done.length) {
        const q = done[0].quest;
        const bonus = option === "a" ? `+${Math.floor(q.reward.gold * 0.5)} bonus gold` : `+${Math.floor(q.reward.xp * 0.5)} bonus XP`;
        return `🧭 You chose **option ${option.toUpperCase()}**: ${bonus}.\n✅ **${q.title} COMPLETE!** +${q.reward.xp} XP, +${q.reward.gold} gold.`;
      }
      return "🧭 Choice recorded.";
    }
    if (action === "info") {
      const qid = args[1];
      const q = (player.quests.active || []).find(x => x.id === qid);
      if (!q) return "❌ Quest not in your log.";
      return `📋 **${q.title}** [${q.type}]\n${q.description}\n\n` +
        q.objectives.map(o => `• ${o.label}: ${o.current}/${o.count}${o.current >= o.count ? " ✅" : ""}`).join("\n") +
        `\n\nRewards: ${q.reward.xp} XP, ${q.reward.gold} gold${q.reward.items.length ? `, ${q.reward.items.map(i => `${i.qty}x ${i.name}`).join(", ")}` : ""}`;
    }
    return "❌ Actions: `quest accept <id>` | `quest abandon <id>` | `quest info <id>` | `quest answer <text>`";
  },

  // alias
  q(message, args, player) { return handlers.quest(message, args, player); },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/social ----------------------
__def("src/commands/social", function (module, exports, require) {
// ============================================================
// commands/social.js — party, guild, faction, friends.
// ============================================================

const { createParty, getParty, createGuild, getGuild, players } = require("../core/schema");
const { getEnemyFactions } = require("../world/enemies");
const { cap } = require("../util");

const handlers = {
  party(message, args, player) {
    const action = (args[0] || "").toLowerCase();
    if (player.mode === "ironman") return "❌ Ironman mode forbids parties.";

    if (action === "create") {
      if (player.partyId) return "❌ You're already in a party.";
      const party = createParty(player);
      return `👥 **Party created!** Invite: \`playrpg party invite @user\` (max 4).`;
    }
    if (action === "invite") {
      const target = message.mentions.users.first();
      if (!target) return "❌ Mention someone: `playrpg party invite @user`";
      if (!player.partyId) return "❌ Create a party first.";
      const party = getParty(player);
      if (party.members.length >= 4) return "❌ Party is full (4 max).";
      const targetPlayer = players.get(target.id);
      if (targetPlayer?.partyId) return `❌ ${target.username} is already in a party.`;
      return `📩 Invited **${target.username}** to **${party.members[0].name}'s** party.\n(They accept by typing \`playrpg party join @${player.name.replace(/\s+/g, "")}\` — mention the leader.)`;
    }
    if (action === "join") {
      const leader = message.mentions.users.first();
      const lp = leader ? players.get(leader.id) : null;
      if (!lp?.partyId) return "❌ That player has no party.";
      const party = getParty(lp);
      if (party.members.length >= 4) return "❌ Party is full.";
      if (party.members.some(m => m.id === player.id)) return "❌ You're already in that party.";
      party.members.push(player);
      player.partyId = party.id;
      return `🤝 **${player.name} joined ${party.members[0].name}'s party!** (${party.members.length}/4)`;
    }
    if (action === "leave") {
      if (!player.partyId) return "❌ You're not in a party.";
      const party = getParty(player);
      party.members = party.members.filter(m => m.id !== player.id);
      player.partyId = null;
      if (party.members.length === 0) {
        require("../core/schema").parties.delete(party.id);
        return "👋 You left (and disbanded) the party.";
      }
      return `👋 You left the party. (${party.members.length} members remain)`;
    }
    if (action === "status" || !action) {
      if (!player.partyId) return "👥 Not in a party. `playrpg party create` to start one.";
      const party = getParty(player);
      return `👥 **${party.members[0].name}'s Party** (${party.members.length}/4)\n` +
        party.members.map(m => `• ${m.id === party.leader ? "👑 " : ""}**${m.name}** Lv ${m.level} ${m.class !== "none" ? cap(m.class) : ""}`).join("\n") +
        `\n\nLoot mode: ${party.lootMode} | \`playrpg party leave\``;
    }
    return "❌ Actions: create | invite @user | join @leader | leave | status";
  },

  guild(message, args, player) {
    const action = (args[0] || "").toLowerCase();
    if (action === "create") {
      if (player.guildId) return "❌ You're already in a guild.";
      if (player.gold < 500) return "❌ Guild creation costs **500 gold**.";
      const name = args.slice(1).join(" ");
      if (!name) return "❌ Provide a name: `playrpg guild create <name>`";
      player.gold -= 500;
      const g = createGuild(name, player);
      return `🛡️ **Guild "${name}" founded!** You are its leader.\nGuild systems: bank, territory, wars, raids.`;
    }
    if (action === "join") {
      const leader = message.mentions.users.first();
      const lp = leader ? players.get(leader.id) : null;
      const g = lp?.guildId ? getGuild(lp) : null;
      if (!g) return "❌ That player leads no guild.";
      if (g.members.some(m => m.id === player.id)) return "❌ Already a member.";
      g.members.push(player);
      player.guildId = g.id;
      return `🛡️ You joined **${g.name}**!`;
    }
    if (action === "leave") {
      if (!player.guildId) return "❌ Not in a guild.";
      const g = getGuild(player);
      if (g.leader === player.id) return "❌ Leaders can't leave — disband with `playrpg guild disband`.";
      g.members = g.members.filter(m => m.id !== player.id);
      player.guildId = null;
      return `👋 Left **${g.name}**.`;
    }
    if (action === "disband") {
      const g = getGuild(player);
      if (!g) return "❌ Not in a guild.";
      if (g.leader !== player.id) return "❌ Only the leader can disband.";
      for (const m of g.members) m.guildId = null;
      require("../core/schema").guilds.delete(g.id);
      return `💥 **${g.name} has been disbanded.**`;
    }
    if (action === "status" || !action) {
      const g = getGuild(player);
      if (!g) return "🛡️ Not in a guild. `playrpg guild create <name>` (500 gold) or join via `playrpg guild join @leader`";
      return `🛡️ **${g.name}** (Rank ${g.rank})\n` +
        `Leader: ${g.members[0].name} | Members: ${g.members.length}\n` +
        `Banner: ${g.banner.emoji} ${g.banner.color} | Guild XP: ${g.xp}\n` +
        `Territory: ${g.territory.length ? g.territory.join(", ") : "none"} | Wars: ${g.wars.length}`;
    }
    if (action === "deposit") {
      const g = getGuild(player);
      if (!g) return "❌ Not in a guild.";
      const n = parseInt(args[1]);
      if (!n || n < 1) return "❌ `playrpg guild deposit <amount>`";
      if (player.gold < n) return "❌ Not enough gold.";
      player.gold -= n;
      g.gold += n;
      g.xp += Math.floor(n / 10);
      return `💰 Deposited **${n} gold** into the guild vault. (Vault: ${g.gold})`;
    }
    return "❌ Actions: create <name> | join @leader | leave | disband | status | deposit <amount>";
  },

  faction(message, args, player) {
    const factions = getEnemyFactions();
    if (args[0] === "list") {
      let s = `🚩 **ENEMY FACTIONS**\n`;
      for (const f of factions) {
        const rep = player.reputation?.[f.id] || 0;
        s += `• **${f.name}** — rep ${rep} | members: ${f.members.join(", ")}\n`;
      }
      return s;
    }
    const f = factions.find(x => x.id === (args[0] || "").toLowerCase());
    if (!f) return `❌ Unknown faction. List: ${factions.map(x => x.id).join(", ")}`;
    const rep = player.reputation?.[f.id] || 0;
    const tier = rep >= 1000 ? "Ally" : rep >= 500 ? "Friend" : rep >= 100 ? "Known" : rep >= -100 ? "Neutral" : rep >= -500 ? "Disliked" : "Hated";
    return `🚩 **${f.name}**\nReputation: **${rep}** (${tier})\nGain rep by defeating their enemies, lose it by attacking them.\nMembers: ${f.members.join(", ")}`;
  },

  friend(message, args, player) {
    const action = (args[0] || "").toLowerCase();
    const target = message.mentions.users.first();
    if (action === "add" && target) {
      if (player.friends.includes(target.id)) return "❌ Already friends.";
      player.friends.push(target.id);
      return `🤝 You and **${target.username}** are now friends!`;
    }
    if (action === "list" || !action) {
      const names = player.friends.map(id => players.get(id)?.name || id);
      return `👋 **Friends (${names.length}):** ${names.length ? names.join(", ") : "none — add with `playrpg friend add @user`"}`;
    }
    return "❌ Actions: add @user | list";
  },
};

module.exports = handlers;
});

// ---------------------- embedded module: src/commands/world ----------------------
__def("src/commands/world", function (module, exports, require) {
// ============================================================
// commands/world.js — map, travel, zones, explore, dungeon.
// ============================================================

const { getZone, getZonePage, travelCost, isWaypointZone, ZONE_PAGES } = require("../world/zones");
const { getEnemyForZone, enemyIntro } = require("../world/enemies");
const { startEncounter } = require("../core/combat");
const { discoverRecipes, recipeDiscoveryText } = require("../crafting/recipes");
const { checkQuestReset } = require("../world/quests");
const { ELEMENT_EMOJI } = require("../config");

const handlers = {
  map(message, args, player) {
    const page = parseInt(args[0]) || Math.max(1, Math.ceil((player.zone || 1) / 10));
    const { zones, totalPages } = (() => {
      const start = (page - 1) * 10 + 1;
      return { zones: getZonePage(page), totalPages: ZONE_PAGES };
    })();
    let s = `🗺️ **WORLD MAP — Page ${page}/${totalPages}** (1000 zones)\n\n`;
    for (const z of zones) {
      const here = player.zone === z.id ? " 📍" : "";
      const boss = z.worldBoss ? " 🐲" : "";
      const town = z.hasTown ? " 🏘️" : "";
      const realm = z.isRealm ? " ⚡" : "";
      s += `**Zone ${z.id}:** ${z.typeInfo.emoji} ${z.name} (Lvl ${z.recommendedLevel}+)${here}${boss}${town}${realm}\n`;
    }
    s += `\nType \`playrpg travel <zone>\` (1-1000). Waypoints: towns (every 5th zone) — free travel. ⚡ = special realm.`;
    return s;
  },

  travel(message, args, player) {
    const target = parseInt(args[0]);
    if (!target || target < 1 || target > 1000) return "❌ Choose a zone 1-1000. Example: `playrpg travel 42`";
    if (player.zone === target) return "❌ You're already there!";
    const cost = travelCost(player.zone, target);
    const discounted = Math.floor(cost * (1 - (player.perkBonuses?.travelDiscount || 0)));
    if (player.gold < discounted) return `❌ Travel costs **${discounted} gold** (you have ${player.gold}).`;
    const battle = require("../core/combat").getPlayerBattle(player.id);
    if (battle) return "❌ You're in combat! Flee or finish it first.";
    player.gold -= discounted;
    const oldZone = player.zone;
    player.zone = target;
    player.explored.add(target);
    if (isWaypointZone(target)) player.waypoints.add(target);
    const z = getZone(target);
    const discovery = recipeDiscoveryText(player);
    const questProg = progressTravel(player, target);
    let s = `🚗 Traveled ${oldZone} → **${target}** for **${discounted} gold**.\n`;
    s += `📍 **${z.region.emoji} ${z.name}** — Recommended Lv ${z.recommendedLevel} | Weather: ${z.weather}\n`;
    if (z.hasTown) s += `🏘️ This is a town — waypoint unlocked (free travel here).\n`;
    if (z.hasDungeon) s += `⚔️ A dungeon lurks here: **${z.dungeon.name}** — \`playrpg dungeon\`\n`;
    if (z.worldBoss) s += `🐲 **A WORLD BOSS stirs in this zone!** \`playrpg explore\`\n`;
    if (questProg) s += questProg;
    if (discovery.startsWith("🔍")) s += `\n${discovery}`;
    return s;
  },

  zone(message, args, player) {
    const id = parseInt(args[0]) || player.zone;
    const z = getZone(id);
    const g = z.gatherables;
    let s = `${z.typeInfo.emoji} **${z.name}** (Tier ${z.tier}) — Lv ${z.recommendedLevel}+\n`;
    s += `📍 Type: **${z.typeInfo.name}**${z.isRealm ? " (⚡ REALM)" : ""}\n\n`;
    s += `⛏️ Mine: ${g.mine} | 🪓 Chop: ${g.chop} | 🎣 Fish: ${g.fish}\n`;
    s += `🌿 Forage: ${g.forage} | 🪤 Trap: ${g.hunt}\n\n`;
    s += `⚠️ Dangers: ${z.dangers.join(", ")}\n`;
    s += `🌦️ Weather: ${z.weather}${z.isPvpZone ? " | ⚔️ **PVP ZONE**" : ""}${z.isSafeZone ? " | 🕊️ Safe zone" : ""}\n`;
    if (z.npcs.length) s += `👥 NPCs: ${z.npcs.map(n => `${n.name} (${n.role})`).join(", ")}\n`;
    if (z.secrets.length) s += `🔎 Secrets: ${z.secrets.map(se => se.name).join(", ")}\n`;
    if (z.worldBoss) s += `🐲 World Boss: **${z.worldBoss.name}**\n`;
    return s;
  },

  explore(message, args, player) {
    const elite = (args[0] || "").toLowerCase() === "elite";
    const zone = getZone(player.zone);
    const res = startEncounter(player, { zoneId: player.zone, elite });
    if (!res.ok) {
      if (res.reason === "already_in_battle") {
        const b = require("../core/combat").getPlayerBattle(player.id);
        return `⚔️ You're already fighting! Battle status:\n\n${require("../core/combat").battleStatusText(b)}`;
      }
      return `❌ ${res.reason}`;
    }
    const enemy = res.battle.enemy;
    let s = `⚔️ **ENCOUNTER!**\n\n${enemyIntro(enemy)}\n\n`;
    if (enemy.elite) s += `💀 This is an **elite** — higher rewards, higher risk!\n`;
    s += `\nActions: \`playrpg attack\` | \`playrpg skill <name>\` | \`playrpg item <name>\` | \`playrpg guard\` | \`playrpg flee\``;
    return s;
  },

  dungeon(message, args, player) {
    const zone = getZone(player.zone);
    if (!zone.hasDungeon) return "❌ No dungeon in this zone. Find one with `playrpg map` (🕳️ markers).";
    const { generateQuest } = require("../world/quests");
    const res = startEncounter(player, { zoneId: player.zone, elite: true });
    if (!res.ok) return res.reason === "already_in_battle" ? "❌ Finish your current battle first." : `❌ ${res.reason}`;
    // auto-accept dungeon quest if none active
    if (!player.quests.active.some(q => q.type === "dungeon" && q.zoneId === player.zone)) {
      const q = generateQuest(player, { type: "dungeon", zoneId: player.zone });
      player.quests.active.push(q);
    }
    return `🏰 **DUNGEON: ${zone.dungeon.name}**\nDeep beneath ${zone.name}, something waits...\n\n` +
      `${enemyIntro(res.battle.enemy)}\n\nUse \`playrpg attack\` to fight!`;
  },
};

function progressTravel(player, targetZone) {
  const { progressQuest } = require("../world/quests");
  const updates = progressQuest(player, { type: "travel", target: String(targetZone), amount: 1 });
  if (updates.length) return `\n📋 Quest progress: ${updates.map(u => `**${u.quest.title}** ${u.complete ? "COMPLETE!" : ""}`).join(", ")}`;
  return "";
}

module.exports = handlers;
});

// ---------------------- embedded module: src/config ----------------------
__def("src/config", function (module, exports, require) {
// ============================================================
// config.js — CANONICAL ENUMS & CONSTANTS
// Single source of truth for every module. Do not inline these
// anywhere else: import from here.
// ============================================================

const WORLD = Object.freeze({
  ZONE_COUNT: 1000,        // 100 pages x 10 zones
  ZONES_PER_PAGE: 10,
  MAX_LEVEL: 100,
  MAX_PRESTIGE: 50,
  MAX_TALENT_POINTS_PER_LEVEL: 1,
  MAX_PERK_POINTS_PER_PRESTIGE: 2,
  STARTING_GOLD: 100,
  STARTING_ZONE: 1,
});

// Rarity tiers (weight = drop weight at "fair" tables)
const RARITIES = Object.freeze([
  { id: "common",    name: "Common",    color: 0x9e9e9e, weight: 100, mult: 1.0,  sockets: 0 },
  { id: "uncommon",  name: "Uncommon",  color: 0x4caf50, weight: 45,  mult: 1.25, sockets: 1 },
  { id: "rare",      name: "Rare",      color: 0x2196f3, weight: 18,  mult: 1.6,  sockets: 1 },
  { id: "epic",      name: "Epic",      color: 0x9c27b0, weight: 6,   mult: 2.1,  sockets: 2 },
  { id: "legendary", name: "Legendary", color: 0xff9800, weight: 1.8, mult: 2.8,  sockets: 2 },
  { id: "mythic",    name: "Mythic",    color: 0xf44336, weight: 0.5, mult: 3.8,  sockets: 3 },
  { id: "artifact",  name: "Artifact",  color: 0xffd700, weight: 0.12,mult: 5.0,  sockets: 3 },
]);

const RARITY_MAP = Object.fromEntries(RARITIES.map(r => [r.id, r]));

// Damage/defense elements
const ELEMENTS = Object.freeze([
  "physical", "fire", "ice", "lightning", "earth", "wind",
  "water", "light", "shadow", "poison", "arcane",
]);

const ELEMENT_EMOJI = Object.freeze({
  physical: "🗡️", fire: "🔥", ice: "❄️", lightning: "⚡", earth: "⛰️",
  wind: "🌪️", water: "💧", light: "✨", shadow: "🌑", poison: "☠️", arcane: "🔮",
});

// ---- RACES ---------------------------------------------------
const RACES = Object.freeze({
  human:      { name: "Human",      statMods: { str: 1, cha: 1 },          perks: ["Versatile"],      desc: "Adaptable and ambitious." },
  elf:        { name: "Elf",        statMods: { dex: 2, int: 1 },          perks: ["Keen Senses"],    desc: "Graceful forest dwellers." },
  high_elf:   { name: "High Elf",   statMods: { int: 2, wis: 1 },          perks: ["Arcane Blood"],   desc: "Masters of ancient magic." },
  dwarf:      { name: "Dwarf",      statMods: { con: 2, str: 1 },          perks: ["Stoneborn"],      desc: "Stubborn, sturdy mountain folk." },
  orc:        { name: "Orc",        statMods: { str: 2, con: 1 },          perks: ["Blood Fury"],     desc: "Fierce warriors of the wastes." },
  halfling:   { name: "Halfling",   statMods: { dex: 1, cha: 1, con: 1 },  perks: ["Lucky"],          desc: "Small, cheerful, surprisingly deadly." },
  dragonborn: { name: "Dragonborn", statMods: { str: 2, cha: 1 },          perks: ["Draconic Might"], desc: "Scales shimmer with elemental power." },
  tiefling:   { name: "Tiefling",   statMods: { cha: 2, int: 1 },          perks: ["Infernal Wit"],   desc: "Horned heirs of a cursed bloodline." },
  gnome:      { name: "Gnome",      statMods: { int: 2, dex: 1 },          perks: ["Tinkerer"],       desc: "Inventive and quick-minded." },
  half_orc:   { name: "Half-Orc",   statMods: { str: 2, con: 1 },          perks: ["Relentless"],     desc: "The fury of two worlds." },
  beastkin:   { name: "Beastkin",   statMods: { dex: 2, wis: 1 },          perks: ["Predator's Instinct"], desc: "Animal traits, human heart." },
  automaton:  { name: "Automaton",  statMods: { con: 2, int: 1 },          perks: ["Construct Mind"], desc: "Ancient machine with a soul." },
  spiritborn: { name: "Spiritborn", statMods: { wis: 2, cha: 1 },          perks: ["Ghostwalk"],      desc: "Born between the veils." },
  voidborn:   { name: "Voidborn",   statMods: { int: 1, cha: 1, wis: 1 },  perks: ["Void-touched"],   desc: "Reality bends around them." },
});

// ---- CLASSES -------------------------------------------------
const CLASSES = Object.freeze({
  warrior:     { name: "Warrior",     role: "Tank/Melee",  hp: 1.35, mp: 0.6,  stam: 1.3, atk: 1.3,  mag: 0.7,  primary: "str", weapons: ["sword", "axe", "hammer", "shield"],  armor: ["plate"] },
  mage:        { name: "Mage",        role: "Ranged Caster", hp: 0.8, mp: 1.5, stam: 0.7, atk: 0.7, mag: 1.4, primary: "int", weapons: ["staff", "wand", "orb"],             armor: ["cloth"] },
  rogue:       { name: "Rogue",       role: "Assassin",    hp: 0.95, mp: 0.8, stam: 1.4, atk: 1.15, mag: 0.8, primary: "dex", weapons: ["dagger", "sword", "bow"],            armor: ["leather"] },
  ranger:      { name: "Ranger",      role: "Ranged DPS",  hp: 0.9,  mp: 0.8, stam: 1.35, atk: 1.1, mag: 0.8, primary: "dex", weapons: ["bow", "crossbow", "dagger"],         armor: ["leather"] },
  cleric:      { name: "Cleric",      role: "Healer",      hp: 1.0,  mp: 1.4, stam: 0.9, atk: 0.8, mag: 1.1, primary: "wis", weapons: ["mace", "staff", "shield"],           armor: ["chain", "cloth"] },
  paladin:     { name: "Paladin",     role: "Tank/Support", hp: 1.2,  mp: 1.1, stam: 1.1, atk: 1.05, mag: 0.9, primary: "str", weapons: ["sword", "mace", "hammer", "shield"], armor: ["plate", "chain"] },
  druid:       { name: "Druid",       role: "Shapeshifter", hp: 1.05, mp: 1.3, stam: 1.0, atk: 0.9, mag: 1.1, primary: "wis", weapons: ["staff", "dagger", "mace"],          armor: ["leather"] },
  bard:        { name: "Bard",        role: "Support",     hp: 0.9,  mp: 1.2, stam: 1.1, atk: 0.85, mag: 1.0, primary: "cha", weapons: ["rapier", "bow", "instrument"],       armor: ["leather"] },
  monk:        { name: "Monk",        role: "Melee DPS",   hp: 1.0,  mp: 0.9, stam: 1.5, atk: 1.1, mag: 0.8, primary: "dex", weapons: ["fist", "staff"],                    armor: ["cloth"] },
  necromancer: { name: "Necromancer", role: "Summoner",    hp: 0.85, mp: 1.45, stam: 0.7, atk: 0.7, mag: 1.3, primary: "int", weapons: ["staff", "wand", "orb"],            armor: ["cloth"] },
  sorcerer:    { name: "Sorcerer",    role: "Burst Caster", hp: 0.85, mp: 1.5, stam: 0.8, atk: 0.7, mag: 1.35, primary: "cha", weapons: ["staff", "wand", "orb"],           armor: ["cloth"] },
  warden:      { name: "Warden",      role: "Defender",    hp: 1.2,  mp: 1.0, stam: 1.2, atk: 0.95, mag: 1.0, primary: "wis", weapons: ["spear", "sword", "shield"],          armor: ["chain", "plate"] },
  alchemist:   { name: "Alchemist",   role: "Hybrid",      hp: 0.9,  mp: 1.2, stam: 1.0, atk: 0.85, mag: 1.15, primary: "int", weapons: ["wand", "dagger", "flask"],          armor: ["cloth", "leather"] },
  shaman:      { name: "Shaman",      role: "Hybrid",      hp: 1.05, mp: 1.2, stam: 1.0, atk: 0.9, mag: 1.15, primary: "wis", weapons: ["staff", "axe", "shield"],           armor: ["leather", "chain"] },
});

// 2 subclasses per class
const SUBCLASSES = Object.freeze({
  warrior:     ["Berserker", "Guardian"],
  mage:        ["Pyromancer", "Cryomancer"],
  rogue:       ["Assassin", "Shadowdancer"],
  ranger:      ["Beastmaster", "Sharpshooter"],
  cleric:      ["Lightbringer", "Warden of Life"],
  paladin:     ["Avenger", "Holy Guardian"],
  druid:       ["Mooncaller", "Feralheart"],
  bard:        ["Skald", "Concertmaster"],
  monk:        ["Fist of Storm", "Way of Silence"],
  necromancer: ["Bonelord", "Specterweaver"],
  sorcerer:    ["Stormcaller", "Voidspeaker"],
  warden:      ["Runeguardian", "Tidekeeper"],
  alchemist:   ["Mutagenist", "Bombardier"],
  shaman:      ["Spiritwalker", "Stormtotem"],
});

// ---- PROFESSIONS ---------------------------------------------
const PROFESSIONS = Object.freeze({
  gathering:  ["mining", "woodcutting", "fishing", "hunting", "farming", "foraging"],
  crafting:   ["blacksmithing", "alchemy", "cooking", "enchanting", "tailoring", "jewelcrafting", "inscription", "carpentry"],
});

// ---- BIOMES (region flavor for zone gen) ----------------------
const REGIONS = Object.freeze([
  { id: "plains",    name: "Whispering Plains",    emoji: "🌾" },
  { id: "caverns",   name: "Ironforge Caverns",    emoji: "⛏️" },
  { id: "forest",    name: "Blighted Forest",      emoji: "🌲" },
  { id: "void",      name: "Eldritch Void",        emoji: "🌀" },
  { id: "tundra",    name: "Frostbite Tundra",     emoji: "❄️" },
  { id: "trench",    name: "Abyssal Trench",       emoji: "🌊" },
  { id: "desert",    name: "Sunscorch Desert",     emoji: "🏜️" },
  { id: "mountains", name: "Skyreach Mountains",   emoji: "🏔️" },
  { id: "swamp",     name: "Murkfen Swamp",        emoji: "🐸" },
  { id: "ruins",     name: "Ashen Ruins",          emoji: "🏚️" },
]);

const HARD_MODE = Object.freeze({
  NONE: "none",
  HARDCORE: "hardcore",       // death = character wiped
  IRONMAN: "ironman",         // no trading, no party
  PERMADEATH: "permadeath",   // same as hardcore but stricter item loss
});

const DIFFICULTY_MULT = Object.freeze({
  easy: 0.8, normal: 1.0, hard: 1.25, nightmare: 1.6, apocalypse: 2.0,
});

const COLORS = Object.freeze({
  good: 0x57f287, bad: 0xed4245, info: 0x5865f2, gold: 0xffd700,
  loot: 0xff9800, combat: 0xe67e22, craft: 0x9b59b6, world: 0x1abc9c,
});

const CURRENCY = Object.freeze({ gold: "🪙", silver: "🪙", token: "🎫", soul: "💠" });

module.exports = {
  WORLD, RARITIES, RARITY_MAP, ELEMENTS, ELEMENT_EMOJI,
  RACES, CLASSES, SUBCLASSES, PROFESSIONS, REGIONS,
  HARD_MODE, DIFFICULTY_MULT, COLORS, CURRENCY,
};
});

// ---------------------- embedded module: src/core/combat ----------------------
__def("src/core/combat", function (module, exports, require) {
// ============================================================
// combat.js — turn-based combat engine: abilities, ultimates,
// stances, charge/combo/chain/counter/perfect-block/execute,
// dual wielding, piercing, enemy AI, status ticks, rewards.
// Pure Node.
// ============================================================

const { ELEMENT_EMOJI, DIFFICULTY_MULT } = require("../config");
const { randInt, chance, clamp, pick, fmt, d } = require("../util");
const { activeBattles, addExp } = require("./schema");
const { applyStatus, tickStatuses, hasStatus, removeStatus, getEffectiveStats } = require("./statusEffects");
const { createEnemyInstance, getBossForZone, enemyIntro } = require("../world/enemies");
const { rollLoot, itemSummary } = require("../world/loot");

// ---- player abilities (2 per class + 1 ultimate each) ----------
const ABILITIES = {
  // warrior
  whirlwind:      { id: "whirlwind",      name: "Whirlwind",        cls: "warrior", cost: { stamina: 20 }, power: 1.2, element: "physical", kind: "damage", area: true, cooldown: 3, emoji: "🌀", desc: "Sweep all nearby foes with a spinning slash." },
  shield_bash:    { id: "shield_bash",    name: "Shield Bash",      cls: "warrior", cost: { stamina: 15 }, power: 0.8, element: "physical", kind: "damage", statusId: "stun", statusChance: 0.8, cooldown: 4, emoji: "🛡️", desc: "Bash with your shield, stunning the target." },
  // mage
  fireball:       { id: "fireball",       name: "Fireball",         cls: "mage", cost: { mp: 25 }, power: 1.4, element: "fire", kind: "damage", area: true, statusId: "burn", statusChance: 0.7, cooldown: 2, emoji: "🔥", desc: "Hurl a ball of fire that burns the target." },
  frost_nova:     { id: "frost_nova",     name: "Frost Nova",       cls: "mage", cost: { mp: 20 }, power: 0.9, element: "ice", kind: "damage", area: true, statusId: "freeze", statusChance: 0.6, cooldown: 3, emoji: "❄️", desc: "A ring of ice freezes enemies in place." },
  // rogue
  backstab:       { id: "backstab",       name: "Backstab",         cls: "rogue", cost: { stamina: 15 }, power: 1.5, element: "physical", kind: "damage", critBonus: 0.3, cooldown: 2, emoji: "🗡️", desc: "Strike from behind for bonus critical chance." },
  smoke_bomb:     { id: "smoke_bomb",     name: "Smoke Bomb",       cls: "rogue", cost: { stamina: 12 }, power: 0, element: "physical", kind: "utility", statusId: "blind", statusChance: 1.0, cooldown: 4, emoji: "💨", desc: "Blind the enemy and raise your dodge." },
  // ranger
  aimed_shot:     { id: "aimed_shot",     name: "Aimed Shot",       cls: "ranger", cost: { stamina: 18 }, power: 1.6, element: "physical", kind: "damage", piercing: 0.3, critBonus: 0.4, cooldown: 3, emoji: "🎯", desc: "Take careful aim for a devastating shot." },
  caltrops:       { id: "caltrops",       name: "Caltrops",         cls: "ranger", cost: { stamina: 10 }, power: 0.5, element: "physical", kind: "debuff", statusId: "slow", statusChance: 1.0, cooldown: 3, emoji: "🪤", desc: "Scatter caltrops that slow the enemy." },
  // cleric
  heal:           { id: "heal",           name: "Heal",             cls: "cleric", cost: { mp: 18 }, power: 1.2, element: "light", kind: "heal", cooldown: 2, emoji: "💚", desc: "Restore a large amount of HP." },
  holy_smite:     { id: "holy_smite",     name: "Holy Smite",       cls: "cleric", cost: { mp: 20 }, power: 1.1, element: "light", kind: "damage", statusId: "vulnerability", statusChance: 0.5, cooldown: 3, emoji: "✨", desc: "Radiant light burns the enemy." },
  // paladin
  divine_shield:  { id: "divine_shield",  name: "Divine Shield",    cls: "paladin", cost: { mp: 25 }, power: 0, element: "light", kind: "buff", statusId: "invincibility", statusChance: 1.0, cooldown: 5, emoji: "☀️", desc: "Become invincible for one turn." },
  smite:          { id: "smite",          name: "Smite",            cls: "paladin", cost: { mp: 18 }, power: 1.2, element: "light", kind: "damage", statusId: "mark", statusChance: 1.0, cooldown: 3, emoji: "⚡", desc: "Smite the enemy and mark them." },
  // druid
  moonfire:       { id: "moonfire",       name: "Moonfire",         cls: "druid", cost: { mp: 15 }, power: 1.0, element: "arcane", kind: "damage", statusId: "burn", statusChance: 0.5, cooldown: 2, emoji: "🌙", desc: "Silver fire that lingers and burns." },
  rejuvenate:     { id: "rejuvenate",     name: "Rejuvenate",       cls: "druid", cost: { mp: 15 }, power: 0.7, element: "nature", kind: "buff", statusId: "regeneration", statusChance: 1.0, cooldown: 3, emoji: "🌿", desc: "Grow vines of life that heal over time." },
  // bard
  war_song:       { id: "war_song",       name: "War Song",         cls: "bard", cost: { mp: 15 }, power: 0, element: "wind", kind: "buff", statusId: "attack_aura", statusChance: 1.0, cooldown: 4, emoji: "🎵", desc: "Inspire allies with +ATK." },
  healing_melody: { id: "healing_melody", name: "Healing Melody",   cls: "bard", cost: { mp: 15 }, power: 0.6, element: "wind", kind: "heal", cooldown: 3, emoji: "🎶", desc: "A gentle tune that restores HP." },
  // monk
  flurry:         { id: "flurry",         name: "Flurry of Blows",  cls: "monk", cost: { stamina: 18 }, power: 0.6, element: "physical", kind: "damage", hits: 3, cooldown: 2, emoji: "👊", desc: "Three rapid strikes." },
  meditate:       { id: "meditate",       name: "Meditate",         cls: "monk", cost: { stamina: 10 }, power: 0.5, element: "none", kind: "buff", statusId: "focus", statusChance: 1.0, cooldown: 4, emoji: "🧘", desc: "Clear your mind, boosting crit and regen." },
  // necromancer
  bone_spear:     { id: "bone_spear",     name: "Bone Spear",       cls: "necromancer", cost: { mp: 18 }, power: 1.3, element: "shadow", kind: "damage", piercing: 0.25, statusId: "bleed", statusChance: 0.5, cooldown: 2, emoji: "🦴", desc: "Lance of bone that pierces and bleeds." },
  raise_minion:   { id: "raise_minion",   name: "Raise Minion",     cls: "necromancer", cost: { mp: 25 }, power: 0.4, element: "shadow", kind: "utility", statusId: "summon", statusChance: 1.0, cooldown: 5, emoji: "💀", desc: "Summon a minion that attacks each turn." },
  // sorcerer
  chain_lightning:{ id: "chain_lightning", name: "Chain Lightning", cls: "sorcerer", cost: { mp: 22 }, power: 1.2, element: "lightning", kind: "damage", statusId: "shock", statusChance: 0.6, cooldown: 3, emoji: "⚡", desc: "Lightning that shocks the enemy." },
  arcane_surge:   { id: "arcane_surge",   name: "Arcane Surge",     cls: "sorcerer", cost: { mp: 20 }, power: 1.8, element: "arcane", kind: "damage", cooldown: 4, emoji: "🔮", desc: "Unleash a surge of raw arcane power." },
  // warden
  taunting_roar:  { id: "taunting_roar",  name: "Taunting Roar",    cls: "warden", cost: { stamina: 15 }, power: 0, element: "physical", kind: "debuff", statusId: "taunt", statusChance: 1.0, cooldown: 3, emoji: "🗣️", desc: "Force the enemy to focus on you." },
  fortress_wall:  { id: "fortress_wall",  name: "Fortress Wall",    cls: "warden", cost: { stamina: 20 }, power: 0, element: "earth", kind: "buff", statusId: "shield", statusChance: 1.0, cooldown: 4, emoji: "🧱", desc: "Raise a stone wall that absorbs damage." },
  // alchemist
  acid_flask:     { id: "acid_flask",     name: "Acid Flask",       cls: "alchemist", cost: { stamina: 12 }, power: 0.8, element: "poison", kind: "damage", statusId: "armor_break", statusChance: 0.8, cooldown: 2, emoji: "🧪", desc: "Corrosive acid breaks armor and poisons." },
  stimulant:      { id: "stimulant",      name: "Stimulant",        cls: "alchemist", cost: { stamina: 10 }, power: 0, element: "none", kind: "buff", statusId: "haste", statusChance: 1.0, cooldown: 4, emoji: "⚗️", desc: "A chemical rush that grants haste." },
  // shaman
  lightning_bolt: { id: "lightning_bolt", name: "Lightning Bolt",   cls: "shaman", cost: { mp: 15 }, power: 1.2, element: "lightning", kind: "damage", statusId: "shock", statusChance: 0.5, cooldown: 2, emoji: "🌩️", desc: "Call a bolt from the sky." },
  chain_heal:     { id: "chain_heal",     name: "Chain Heal",       cls: "shaman", cost: { mp: 20 }, power: 0.9, element: "water", kind: "heal", cooldown: 3, emoji: "💧", desc: "Healing water that restores a good amount of HP." },
};

// ---- ultimate abilities (one per class) ------------------------
const ULTIMATES = {
  warrior_ult:     { id: "warrior_ult",     name: "Titan's Wrath",     cls: "warrior",     cost: { rage: 100 }, power: 3.0, element: "physical", kind: "damage", area: true, ultimate: true, cooldown: 8, emoji: "🌋", desc: "Unleash an earth-shaking blow." },
  mage_ult:        { id: "mage_ult",        name: "Meteor Storm",      cls: "mage",        cost: { mp: 60 }, power: 3.2, element: "fire", kind: "damage", area: true, ultimate: true, statusId: "burn", statusChance: 1.0, cooldown: 8, emoji: "☄️", desc: "Call meteors that rain fire." },
  rogue_ult:       { id: "rogue_ult",       name: "Shadow Dance",      cls: "rogue",       cost: { stamina: 60 }, power: 2.4, element: "shadow", kind: "damage", hits: 4, ultimate: true, critBonus: 0.5, cooldown: 8, emoji: "🌑", desc: "Strike from everywhere at once." },
  ranger_ult:      { id: "ranger_ult",      name: "Piercing Barrage",  cls: "ranger",      cost: { stamina: 55 }, power: 2.6, element: "physical", kind: "damage", piercing: 0.6, ultimate: true, cooldown: 8, emoji: "🏹", desc: "A volley that ignores armor." },
  cleric_ult:      { id: "cleric_ult",      name: "Divine Intervention", cls: "cleric",    cost: { mp: 55 }, power: 2.0, element: "light", kind: "heal", ultimate: true, statusId: "invincibility", statusChance: 1.0, cooldown: 8, emoji: "👼", desc: "Massive healing and a divine shield." },
  paladin_ult:     { id: "paladin_ult",     name: "Judgment",          cls: "paladin",     cost: { mp: 50 }, power: 2.8, element: "light", kind: "damage", ultimate: true, execute: true, statusId: "vulnerability", statusChance: 1.0, cooldown: 8, emoji: "⚖️", desc: "Smite the wicked; bonus vs low HP foes." },
  druid_ult:       { id: "druid_ult",       name: "Nature's Wrath",    cls: "druid",       cost: { mp: 50 }, power: 2.6, element: "earth", kind: "damage", area: true, ultimate: true, statusId: "root", statusChance: 0.8, cooldown: 8, emoji: "🌪️", desc: "The wild itself rises against your foe." },
  bard_ult:        { id: "bard_ult",        name: "Final Encore",      cls: "bard",        cost: { mp: 45 }, power: 1.6, element: "wind", kind: "buff", ultimate: true, statusId: "attack_aura", statusChance: 1.0, cooldown: 8, emoji: "🎼", desc: "An anthem that empowers and heals." },
  monk_ult:        { id: "monk_ult",        name: "Seven-Star Strike", cls: "monk",        cost: { stamina: 60 }, power: 3.4, element: "physical", kind: "damage", ultimate: true, execute: true, cooldown: 8, emoji: "🌟", desc: "Seven precise strikes. The last one is the truth." },
  necro_ult:       { id: "necro_ult",       name: "Army of the Dead",  cls: "necromancer", cost: { mp: 60 }, power: 1.2, element: "shadow", kind: "damage", ultimate: true, statusId: "summon", statusChance: 1.0, statusPotency: 3, cooldown: 8, emoji: "⚰️", desc: "Raise a legion of minions." },
  sorc_ult:        { id: "sorc_ult",        name: "Arcane Singularity", cls: "sorcerer",   cost: { mp: 55 }, power: 3.4, element: "arcane", kind: "damage", ultimate: true, statusId: "knockback", statusChance: 1.0, cooldown: 8, emoji: "🕳️", desc: "Collapse reality into a point of force." },
  warden_ult:      { id: "warden_ult",      name: "Bulwark of Ages",   cls: "warden",      cost: { stamina: 60 }, power: 0, element: "earth", kind: "buff", ultimate: true, statusId: "invincibility", statusChance: 1.0, statusPotency: 2, cooldown: 8, emoji: "🏰", desc: "Become an unbreakable fortress." },
  alch_ult:        { id: "alch_ult",        name: "Panacea Bomb",      cls: "alchemist",   cost: { stamina: 50 }, power: 1.4, element: "poison", kind: "damage", area: true, ultimate: true, statusId: "armor_break", statusChance: 1.0, cooldown: 8, emoji: "💣", desc: "A concoction that corrodes and cures." },
  shaman_ult:      { id: "shaman_ult",      name: "Storm Totem",       cls: "shaman",      cost: { mp: 50 }, power: 2.8, element: "lightning", kind: "damage", ultimate: true, statusId: "shock", statusChance: 1.0, cooldown: 8, emoji: "🪔", desc: "Plant a totem that calls lightning." },
};
Object.assign(ABILITIES, ULTIMATES);

// ---- stances ----------------------------------------------------
const STANCES = {
  balanced:  { id: "balanced",  name: "Balanced",  emoji: "⚖️", mod: { atk: 1.0, def: 1.0 }, desc: "No modifiers." },
  offensive: { id: "offensive", name: "Offensive", emoji: "⚔️", mod: { atk: 1.15, def: 0.85, critChance: 1.2 }, desc: "+15% ATK, -15% DEF, +20% crit." },
  defensive: { id: "defensive", name: "Defensive", emoji: "🛡️", mod: { def: 1.25, atk: 0.85, block: 1.5 }, desc: "+25% DEF, -15% ATK, +block." },
  swift:     { id: "swift",     name: "Swift",     emoji: "💨", mod: { speed: 1.4, dodge: 1.3, atk: 0.9 }, desc: "+40% speed, +30% dodge, -10% ATK." },
  berserk:   { id: "berserk",   name: "Berserk",   emoji: "😡", mod: { atk: 1.3, def: 0.7 }, lifesteal: 0.1, desc: "+30% ATK, -30% DEF, +10% lifesteal." },
  focus:     { id: "focus",     name: "Focus",     emoji: "🧘", mod: { magAtk: 1.2, magDef: 1.1, speed: 0.85 }, desc: "+20% MATK, +10% MDEF, -15% speed." },
};

// ---- consumables usable in battle ----------------------------
const ITEM_EFFECTS = {
  "Health Potion (S)": { heal: 40, emoji: "🧪" },
  "Health Potion (M)": { heal: 100, emoji: "🧪" },
  "Health Potion (L)": { heal: 250, emoji: "🧪" },
  "Mana Potion (S)":   { mp: 40, emoji: "🔵" },
  "Mana Potion (M)":   { mp: 100, emoji: "🔵" },
  "Stamina Potion":    { stamina: 50, emoji: "🟢" },
  "Grilled Salmon":    { heal: 60, emoji: "🍣" },
  "Hearty Stew":       { heal: 80, emoji: "🍲" },
  "Bread":             { heal: 25, emoji: "🍞" },
  "Roast Boar":        { heal: 120, emoji: "🍖" },
  "Elixir of Strength":{ buff: "tempAtk", power: 10, emoji: "💪" },
};

const WEAPON_TYPES = new Set(["sword", "axe", "hammer", "dagger", "staff", "wand", "bow", "crossbow", "spear", "mace", "fist", "rapier"]);

// ---- stats with stance applied --------------------------------
function _statsFor(e) {
  const s = getEffectiveStats(e);
  const stance = STANCES[e.stance] || STANCES.balanced;
  for (const [k, v] of Object.entries(stance.mod)) {
    if (typeof s[k] === "number") s[k] *= v;
  }
  return s;
}

// ---- damage pipeline ------------------------------------------
function computeHit(attacker, defender, { power = 1, element = "physical", isMagical = false, critBonus = 0, piercing = 0, skill = null }) {
  const a = _statsFor(attacker);
  const def = _statsFor(defender);

  // evasion chain: dodge -> parry -> block
  if (chance(def.dodge)) return { damage: 0, crit: false, dodged: true, parried: false, blocked: false, logLine: `${defender.name} **dodged** the attack!` };
  let parried = false, blocked = false, mult = 1;
  if (chance(def.parry)) { parried = true; mult = 0.5; }
  else if (chance(def.block)) { blocked = true; mult = 0.6; }

  const base = (isMagical ? a.magAtk : a.atk) * power;
  const mitigation = (isMagical ? def.magDef : def.def) * (1 - clamp(piercing, 0, 0.9));
  const resist = clamp(defender.resistances?.[element] || 0, 0, 0.9);
  const crit = chance(a.critChance + (critBonus || 0));
  const critMult = crit ? a.critDamage || 1.5 : 1;
  const diffMult = defender.difficultyMult || 1;
  const raw = base * (100 / (100 + mitigation)) * (1 - resist) * critMult * mult * diffMult;
  const damage = Math.max(1, Math.round(raw));
  const critStr = crit ? " **CRITICAL!**" : "";
  const pierceStr = piercing > 0 ? ` (ignores ${Math.round(piercing * 100)}% DEF)` : "";
  return { damage, crit, dodged: false, parried, blocked, resisted: resist > 0,
    logLine: `${attacker.name} hits ${defender.name} for **${fmt(damage)}**${critStr}${parried ? " (parried!)" : ""}${blocked ? " (blocked!)" : ""}${pierceStr} ${ELEMENT_EMOJI[element] || ""}` };
}

// ---- battle lifecycle ------------------------------------------
function startEncounter(player, { zoneId, elite = false, aiEnemy = null }) {
  if (activeBattles.has(`player_${player.id}`)) return { ok: false, reason: "already_in_battle" };
  const zone = require("../world/zones").getZone(zoneId);
  const enemy = aiEnemy || (zone.worldBoss ? getBossForZone(zone, player.level) : createEnemyInstance({ zoneId, playerLevel: player.level, elite }));
  enemy.difficultyMult = DIFFICULTY_MULT[player.difficulty] || 1;
  const battle = {
    id: `battle_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    zoneId,
    enemy,
    players: [player],
    round: 1,
    state: "active",
    charging: null,       // { playerId, power }
    log: [enemyIntro(enemy)],
    startedAt: Date.now(),
    difficultyMult: enemy.difficultyMult,
  };
  activeBattles.set(battle.id, battle);
  activeBattles.set(`player_${player.id}`, battle);
  return { ok: true, battle };
}

function getPlayerBattle(playerId) {
  return activeBattles.get(`player_${playerId}`) || null;
}

function _log(battle, line) { battle.log.push(line); }

function _afterTurn(battle, player) {
  const pTick = tickStatuses(player, { isPlayer: true });
  const eTick = tickStatuses(battle.enemy, { isPlayer: false });
  for (const l of [...pTick.log, ...eTick.log]) _log(battle, l);
  player.guarding = false;
  if (battle.enemy.currentHp <= 0) return endBattle(battle, "victory");
  if (player.hp <= 0) return endBattle(battle, "defeat");
  for (const k of Object.keys(player.cooldowns || {})) {
    if (player.cooldowns[k] > 0) player.cooldowns[k] -= 1;
  }
  for (const s of battle.enemy.skills) { s.cd = (s.cd || 0) > 0 ? s.cd - 1 : 0; }
  if (battle.state === "active") enemyTurn(battle, player);
  return battle;
}

function _useSkill(battle, player, ab, opts = {}) {
  const enemy = battle.enemy;
  _log(battle, `${ab.emoji} **${player.name}** uses **${ab.name}**!`);

  if (ab.kind === "heal") {
    const maxHp = player.maxHp || 100, maxMp = player.maxMp || 50;
    const healAmt = Math.min(Math.max(0, maxHp - player.hp), Math.round(maxHp * 0.15) + Math.round(player.magAtk * 0.4) + Math.round(player.level * 2));
    player.hp += healAmt;
    _log(battle, `💚 ${player.name} heals for **${fmt(healAmt)}** HP.`);
  } else if (ab.kind === "buff") {
    const potency = ab.statusPotency || (ab.power > 0 ? ab.power * player.level : 1);
    applyStatus(player, ab.statusId, { potency, duration: 3 });
    _log(battle, `🛡️ ${player.name} gains **${ab.statusId.replace(/_/g, " ")}**!`);
  } else if (ab.kind === "debuff" || ab.kind === "utility") {
    if (ab.statusId) {
      applyStatus(enemy, ab.statusId, { potency: Math.max(1, Math.round(player.magAtk * 0.1)), duration: 2 });
      _log(battle, `👁️ ${enemy.name} is afflicted by **${ab.statusId.replace(/_/g, " ")}**!`);
    }
  } else if (ab.kind === "damage") {
    // execute: bonus vs low-HP foes
    let power = ab.power;
    if (ab.execute && enemy.currentHp <= enemy.maxHp * 0.2) {
      power *= 1.8;
      _log(battle, `⚡ **EXECUTE!** ${enemy.name} is below 20% HP!`);
    }
    const hits = ab.hits || 1;
    for (let i = 0; i < hits; i++) {
      const hit = computeHit(player, enemy, { power: power / hits, element: ab.element, isMagical: /mp/.test(JSON.stringify(ab.cost)), critBonus: ab.critBonus || 0, piercing: ab.piercing || 0 });
      if (!hit.dodged) enemy.currentHp = Math.max(0, enemy.currentHp - hit.damage);
      _log(battle, `🎯 ${hit.logLine}`);
    }
    if (ab.statusId && chance(ab.statusChance || 1)) {
      applyStatus(enemy, ab.statusId, { potency: Math.max(1, Math.round(player.magAtk * 0.08)), duration: 3 });
      _log(battle, `☄️ ${enemy.name} is afflicted by **${ab.statusId.replace(/_/g, " ")}**!`);
    }
  }
  return true;
}

function playerAction(battle, player, action, { skillId = null, itemName = null, stanceId = null, power = 100 } = {}) {
  if (battle.state !== "active") return { ok: false, reason: "battle_over" };
  const enemy = battle.enemy;

  if (action === "attack") {
    let powerMult = 1;
    // charged attack: consume stored charge
    if (battle.charging && battle.charging.playerId === player.id) {
      powerMult = 1 + (battle.charging.power / 100) * 1.2;
      _log(battle, `⚡ **CHARGED ATTACK!** Power x${powerMult.toFixed(2)}`);
      battle.charging = null;
    }
    // counterattack window from successful parry
    let counter = false;
    if (player.counterWindow) {
      powerMult *= 1.5;
      counter = true;
      player.counterWindow = false;
    }
    const hit = computeHit(player, enemy, { power: powerMult, element: "physical", piercing: player.stance === "berserk" ? 0.15 : 0 });
    if (!hit.dodged) {
      enemy.currentHp = Math.max(0, enemy.currentHp - hit.damage);
      if (player.combo !== undefined) player.combo += 1;
    }
    _log(battle, `${counter ? "🔁 **COUNTERATTACK!** " : "🎯 "}${hit.logLine}`);
    if (!hit.dodged && player.combo > 0) _log(battle, `🔗 Combo x${player.combo}`);
    // thorns reflection
    if (!hit.dodged && enemy.thorns > 0) {
      const thornsDmg = Math.max(1, Math.round(hit.damage * enemy.thorns));
      player.hp = Math.max(0, player.hp - thornsDmg);
      _log(battle, `🌵 ${enemy.name}'s thorns deal **${thornsDmg}** back!`);
    }
    // chain attack on crit
    if (hit.crit && !hit.dodged && chance(0.3)) {
      const chain = computeHit(player, enemy, { power: 0.5, element: "physical", critBonus: -0.5 });
      if (!chain.dodged) enemy.currentHp = Math.max(0, enemy.currentHp - chain.damage);
      _log(battle, `⛓️ **CHAIN ATTACK!** ${chain.logLine}`);
    }
    // dual wield: off-hand weapon proc
    const oh = player.equipped?.offhand;
    if (oh && WEAPON_TYPES.has(oh.type) && chance(0.25) && enemy.currentHp > 0) {
      const ohHit = computeHit(player, enemy, { power: 0.55, element: oh.element || "physical", critBonus: -0.2 });
      if (!ohHit.dodged) enemy.currentHp = Math.max(0, enemy.currentHp - ohHit.damage);
      _log(battle, `⚔️ **OFF-HAND** ${ohHit.logLine}`);
    }
    if (player.hp <= 0) return endBattle(battle, "defeat");
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "charge") {
    if (battle.charging) return { ok: false, reason: "already_charging" };
    battle.charging = { playerId: player.id, power: clamp(power, 10, 200) };
    applyStatus(player, "focus", { potency: 1, duration: 2 });
    _log(battle, `🔋 ${player.name} begins charging an attack (power ${battle.charging.power}%)...`);
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "combo") {
    if (!player.combo || player.combo < 3) return { ok: false, reason: "need_combo" };
    const powerMult = 1 + player.combo * 0.15;
    const hit = computeHit(player, enemy, { power: powerMult, element: "physical", critBonus: 0.1 });
    if (!hit.dodged) enemy.currentHp = Math.max(0, enemy.currentHp - hit.damage);
    _log(battle, `💥 **COMBO ATTACK!** Spending ${player.combo} combo for x${powerMult.toFixed(2)}! ${hit.logLine}`);
    player.combo = 0;
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "stance") {
    const st = STANCES[stanceId];
    if (!st) return { ok: false, reason: "unknown_stance" };
    player.stance = stanceId;
    _log(battle, `${st.emoji} ${player.name} switches to **${st.name}** stance — ${st.desc}`);
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "ultimate") {
    if (!player.ultimate) return { ok: false, reason: "no_ultimate" };
    const ab = ABILITIES[player.ultimate];
    if (!ab) return { ok: false, reason: "unknown_ultimate" };
    if ((player.cooldowns[ab.id] || 0) > 0) return { ok: false, reason: "on_cooldown" };
    if (!_payCost(player, ab.cost)) return { ok: false, reason: "insufficient_resource" };
    player.cooldowns[ab.id] = ab.cooldown;
    _useSkill(battle, player, ab);
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "skill") {
    const ab = ABILITIES[skillId];
    if (!ab) return { ok: false, reason: "unknown_skill" };
    if (!(player.abilities || []).includes(ab.id)) return { ok: false, reason: "not_learned" };
    if ((player.cooldowns[ab.id] || 0) > 0) return { ok: false, reason: "on_cooldown" };
    if (!_payCost(player, ab.cost)) return { ok: false, reason: "insufficient_resource" };
    player.cooldowns[ab.id] = ab.cooldown;
    _useSkill(battle, player, ab);
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "item") {
    const eff = ITEM_EFFECTS[itemName];
    if (!eff) return { ok: false, reason: "unknown_item" };
    if ((player.inventory[itemName] || 0) <= 0) return { ok: false, reason: "not_owned" };
    player.inventory[itemName] -= 1;
    const maxHp = player.maxHp || 100, maxMp = player.maxMp || 50, maxStamina = player.maxStamina || 60;
    if (eff.heal) { const h = Math.min(Math.max(0, maxHp - player.hp), eff.heal); player.hp += h; _log(battle, `${eff.emoji} ${player.name} uses **${itemName}**, healing **${h}** HP.`); }
    if (eff.mp) { const m = Math.min(Math.max(0, maxMp - player.mp), eff.mp); player.mp += m; _log(battle, `${eff.emoji} ${player.name} restores **${m}** MP.`); }
    if (eff.stamina) { player.stamina = Math.min(maxStamina, player.stamina + eff.stamina); _log(battle, `${eff.emoji} ${player.name} restores **${eff.stamina}** stamina.`); }
    if (eff.buff) applyStatus(player, eff.buff, { potency: eff.power, duration: 3 });
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "guard") {
    player.guarding = true;
    applyStatus(player, "shield", { potency: Math.round(player.maxHp * 0.15), duration: 2 });
    applyStatus(player, "block_boost", { potency: 1, duration: 2 });
    _log(battle, `🛡️ ${player.name} braces for impact (shield + perfect-block chance).`);
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  if (action === "flee") {
    const chanceToFlee = clamp(0.5 + (player.speed - enemy.speed) / 40, 0.2, 0.9);
    if (chance(chanceToFlee)) {
      _log(battle, `💨 ${player.name} flees from ${enemy.name}!`);
      return endBattle(battle, "fled");
    }
    _log(battle, `🚫 ${player.name} tries to flee but is blocked!`);
    return { ok: true, battle, ..._afterTurn(battle, player) };
  }

  return { ok: false, reason: "unknown_action" };
}

function _payCost(player, cost) {
  if (!cost) return true;
  if (cost.mp !== undefined) { if (player.mp < cost.mp) return false; player.mp -= cost.mp; }
  if (cost.stamina !== undefined) { if (player.stamina < cost.stamina) return false; player.stamina -= cost.stamina; }
  if (cost.rage !== undefined) { if (player.rage < cost.rage) return false; player.rage -= cost.rage; }
  if (cost.energy !== undefined) { if (player.energy < cost.energy) return false; player.energy -= cost.energy; }
  return true;
}

function enemyTurn(battle, player) {
  if (battle.state !== "active") return;
  const enemy = battle.enemy;
  const skill = enemy.skills.filter(s => !(s.cd > 0)).sort(() => Math.random() - 0.5)[0];
  let usedSkill = false;
  if (skill && chance(0.4)) {
    skill.cd = skill.cooldown;
    const hit = computeHit(enemy, player, { power: skill.power, element: skill.element, isMagical: true });
    _log(battle, `${ELEMENT_EMOJI[skill.element] || ""} **${enemy.name}** uses **${skill.name}**!`);
    if (!hit.dodged) {
      if (player.guarding && chance(0.4)) {
        _log(battle, `🛡️ **PERFECT BLOCK!** ${player.name} negates the attack entirely!`);
        player.counterWindow = true;
      } else {
        const absorbed = _absorbShield(player, hit.damage);
        player.hp = Math.max(0, player.hp - absorbed.remaining);
        if (absorbed.blocked > 0) _log(battle, `🧱 Shield absorbs **${absorbed.blocked}** damage!`);
        _log(battle, hit.logLine);
        if (hit.parried) player.counterWindow = true;
        if (skill.statusId && chance(skill.statusChance || 1)) {
          applyStatus(player, skill.statusId, { potency: Math.max(1, Math.round(enemy.magAtk * 0.08)), duration: 2 });
          _log(battle, `😵 ${player.name} is afflicted by **${skill.statusId.replace(/_/g, " ")}**!`);
        }
      }
    }
    usedSkill = true;
  }
  if (!usedSkill) {
    const hit = computeHit(enemy, player, { power: 1, element: "physical" });
    if (!hit.dodged) {
      if (player.guarding && chance(0.4)) {
        _log(battle, `🛡️ **PERFECT BLOCK!** ${player.name} negates the attack entirely!`);
        player.counterWindow = true;
      } else {
        const absorbed = _absorbShield(player, hit.damage);
        player.hp = Math.max(0, player.hp - absorbed.remaining);
        if (absorbed.blocked > 0) _log(battle, `🧱 Shield absorbs **${absorbed.blocked}** damage!`);
        _log(battle, hit.logLine);
        if (hit.parried) player.counterWindow = true;
      }
    }
  }
  if (enemy.lifesteal > 0 && !usedSkill) {
    const healed = Math.min(enemy.maxHp - enemy.currentHp, Math.round(hit.damage * enemy.lifesteal));
    enemy.currentHp += healed;
  }
  battle.round += 1;
  if (player.hp <= 0) endBattle(battle, "defeat");
}

function _absorbShield(player, damage) {
  const shield = player.statusEffects.find(s => s.id === "shield");
  if (!shield || shield.potency <= 0) return { blocked: 0, remaining: damage };
  const blocked = Math.min(shield.potency, damage);
  shield.potency -= blocked;
  if (shield.potency <= 0) removeStatus(player, "shield");
  return { blocked, remaining: damage - blocked };
}

function endBattle(battle, result) {
  battle.state = result;
  const player = battle.players[0];
  const enemy = battle.enemy;
  const outcome = { result, xp: 0, gold: 0, items: [], log: battle.log, battle };

  if (result === "victory") {
    enemy.currentHp = 0;
    const xpGain = Math.max(1, Math.round(enemy.xpReward * battle.difficultyMult));
    const lvl = addExp(player, xpGain);
    const gold = Math.max(1, Math.round(enemy.goldReward * battle.difficultyMult));
    player.gold += gold;
    player.kills += 1;
    if (player.bestiary) player.bestiary.add(enemy.templateId);
    // pet / mount / companion xp
    gainPetXp(player, xpGain);
    // weapon mastery
    const wpn = player.equipped?.weapon;
    if (wpn?.type) gainMastery(player, wpn.type, 1);
    const loot = rollLoot({ tier: enemy.tier, level: enemy.level, boss: enemy.boss, playerLevel: player.level, lootMult: player.statMultipliers.loot });
    for (const item of loot.items) {
      player.inventory[item.name] = (player.inventory[item.name] || 0) + 1;
      outcome.items.push(itemSummary(item));
    }
    player.gold += loot.gold;
    // currencies from loot
    if (loot.currencies) {
      if (!player.currencies) player.currencies = {};
      for (const [k, v] of Object.entries(loot.currencies)) player.currencies[k] = (player.currencies[k] || 0) + v;
      outcome.currencies = loot.currencies;
    }
    // season xp + guild xp on kills
    player.seasonXp = (player.seasonXp || 0) + Math.floor(xpGain / 10);
    if (player.guildId) {
      const g = require("./schema").guilds.get(player.guildId);
      if (g) g.xp = (g.xp || 0) + Math.floor(xpGain / 20);
    }
    outcome.xp = xpGain;
    outcome.gold = gold + loot.gold;
    outcome.leveled = lvl.leveled;
    outcome.loot = loot.items;
    outcome.victory = true;
  } else if (result === "defeat") {
    player.deaths += 1;
    const penalty = Math.floor(player.gold * 0.05);
    player.gold -= penalty;
    outcome.goldPenalty = penalty;
    if (player.mode === "hardcore" || player.mode === "permadeath") {
      player.level = 1; player.exp = 0; player.inventory = {}; player.gold = 0;
      outcome.hardcoreWipe = true;
    }
    player.hp = 1;
    player.statusEffects = [];
  }

  activeBattles.delete(battle.id);
  activeBattles.delete(`player_${player.id}`);
  return { ...outcome };
}

// ---- pet / mastery progression hooks (defined in progression.js) -
let _gainPetXp = null, _gainMastery = null;
function bindProgressionHooks(hooks) {
  if (hooks.gainPetXp) _gainPetXp = hooks.gainPetXp;
  if (hooks.gainMastery) _gainMastery = hooks.gainMastery;
}
function gainPetXp(player, xp) { if (_gainPetXp) _gainPetXp(player, xp); }
function gainMastery(player, type, amt) { if (_gainMastery) _gainMastery(player, type, amt); }

function battleStatusText(battle) {
  const enemy = battle.enemy;
  const p = battle.players[0];
  const effs = p.statusEffects.map(s => s.id).join(", ") || "none";
  const stance = STANCES[p.stance] || STANCES.balanced;
  let s = `**Round ${battle.round}** — ${battle.state === "active" ? "⚔️ In combat" : `Over (${battle.state})`}\n\n`;
  s += `${enemyIntro(enemy)}\n\n`;
  s += `**${p.name}** ❤️ ${p.hp}/${p.maxHp} 🔷 ${p.mp}/${p.maxMp} ⚡ ${p.stamina}/${p.maxStamina}\n`;
  s += `${stance.emoji} Stance: ${stance.name} | 🔗 Combo: ${p.combo || 0}${battle.charging ? " | 🔋 Charging!" : ""}\n`;
  s += `Status: ${effs}`;
  return s;
}

module.exports = {
  ABILITIES, ULTIMATES, STANCES, ITEM_EFFECTS, computeHit,
  startEncounter, getPlayerBattle, playerAction, enemyTurn, endBattle,
  battleStatusText, bindProgressionHooks,
};
});

// ---------------------- embedded module: src/core/features ----------------------
__def("src/core/features", function (module, exports, require) {
// ============================================================
// features.js — THE FEATURE CATALOG (data-driven grid).
// Every entry in the player's feature list is a real, searchable
// catalog record: 15 prefixes x ~136 feature types = ~2040 entries.
// Pure Node.
// ============================================================

const { slug, cap } = require("../util");

const PREFIXES = [
  { id: "basic",       name: "Basic",       flavor: "The standard version, available from the start." },
  { id: "advanced",    name: "Advanced",    flavor: "A refined version with improved efficiency." },
  { id: "elite",       name: "Elite",       flavor: "An elite-grade variant with superior output." },
  { id: "master",      name: "Master",      flavor: "Master-tier: requires heavy investment to unlock." },
  { id: "legendary",   name: "Legendary",   flavor: "A legendary variant of exceptional power." },
  { id: "mythic",      name: "Mythic",      flavor: "Mythic-grade: among the rarest in the game." },
  { id: "hidden",      name: "Hidden",      flavor: "A secret variant discovered through exploration." },
  { id: "rare",        name: "Rare",        flavor: "A rare variant with uncommon power." },
  { id: "randomized",  name: "Randomized",  flavor: "Procedurally randomized stats and behavior." },
  { id: "dynamic",     name: "Dynamic",     flavor: "Scales dynamically with level and world state." },
  { id: "seasonal",    name: "Seasonal",    flavor: "Available only during seasonal events." },
  { id: "daily",       name: "Daily",       flavor: "Rotates into availability on a daily cycle." },
  { id: "weekly",      name: "Weekly",      flavor: "Rotates into availability on a weekly cycle." },
  { id: "cooperative", name: "Cooperative", flavor: "Designed for party / cooperative play." },
  { id: "competitive", name: "Competitive", flavor: "Designed for PvP / competitive play." },
];

// category -> [feature names]
const FEATURE_GROUPS = [
  { category: "Combat Action",  kind: "combat",  features: ["Attack", "Charged Attack", "Combo Attack", "Chain Attack", "Counterattack", "Parry", "Perfect Block", "Dodge", "Dash Strike", "Backstab", "Finisher Skill", "Ultimate Skill", "Area Attack", "Piercing Attack", "Ricochet Attack", "Homing Attack", "Summoned Attack"] },
  { category: "Combat Mode",    kind: "combat",  features: ["Stance Switching", "Weapon Swapping", "Dual Wielding"] },
  { category: "Skill Tree",     kind: "progression", features: ["Skill Tree", "Talent Tree", "Passive Tree", "Mastery Tree"] },
  { category: "Skill Type",     kind: "skills",  features: ["Class Skill", "Racial Skill", "Guild Skill", "Weapon Skill", "Element Skill", "Utility Skill", "Support Skill", "Movement Skill", "Survival Skill", "Crafting Skill", "Social Skill", "Secret Skill", "Evolving Skill", "Combo Skill", "Charge Skill", "Reaction Skill"] },
  { category: "Progression",    kind: "progression", features: ["Character Level", "Prestige Level", "Ascension Rank", "Awakening Rank", "Mastery Rank", "Class Rank", "Weapon Level", "Skill Level", "Pet Level", "Mount Level", "Companion Level", "Guild Level", "Reputation Rank", "Faction Rank", "Adventure Rank", "Crafting Rank", "Collection Rank", "Season Rank", "Challenge Rank", "Legacy Rank"] },
  { category: "Quest Type",     kind: "quests",  features: ["Main Quest", "Side Quest", "Daily Quest", "Weekly Quest", "Monthly Quest", "Bounty Quest", "Escort Quest", "Delivery Quest", "Puzzle Quest", "Investigation Quest", "Boss Quest", "Dungeon Quest", "Raid Quest", "Faction Quest", "Guild Quest", "Companion Quest", "Hidden Quest", "World Quest", "Chain Quest", "Choice Quest"] },
  { category: "World Region",   kind: "world",   features: ["Open Region", "Forest Zone", "Desert Zone", "Mountain Zone", "Swamp Zone", "Ocean Zone", "Island Zone", "Cave Zone", "Volcanic Zone", "Snow Zone", "Sky Zone", "Underground Zone", "Ruined City", "Ancient Temple", "Floating Island", "Secret Realm", "Dream Realm", "Time Realm", "Elemental Realm", "Endgame Realm"] },
  { category: "Item Type",      kind: "items",   features: ["Common Item", "Rare Item", "Epic Item", "Legendary Item", "Mythic Item", "Cursed Item", "Set Item", "Artifact Item", "Relic Item", "Quest Item", "Collectible Item", "Cosmetic Item", "Upgrade Item", "Crafting Material", "Food Item", "Potion Item", "Treasure Item", "Event Item", "Limited Item", "Account Item"] },
  { category: "Currency",       kind: "economy", features: ["Gold", "Gem", "Token", "Faction Currency", "Guild Currency", "Dungeon Currency", "Raid Currency", "Event Currency", "Crafting Currency", "Trade Currency"] },
  { category: "Market",         kind: "economy", features: ["Auction Market", "Player Shop", "NPC Shop", "Rotating Shop", "Secret Shop", "Traveling Shop"] },
];

// short base descriptions per feature (used with prefix flavor)
const FEATURE_DESC = {
  "Attack": "A standard offensive strike.", "Charged Attack": "Hold a turn to unleash a heavier strike.", "Combo Attack": "Chain hits to build and spend a combo meter.", "Chain Attack": "Critical hits have a chance to trigger a follow-up.", "Counterattack": "Strike back after a successful parry.", "Parry": "Deflect an incoming blow, halving damage and enabling counters.", "Perfect Block": "Time a guard to fully negate an attack.", "Dodge": "Evade attacks entirely.", "Dash Strike": "Close distance and open with bonus damage.", "Backstab": "Strike from advantage for critical bonus.", "Finisher Skill": "Execute skills that deal bonus damage to low-HP foes.", "Ultimate Skill": "A class-defining super ability on a long cooldown.", "Area Attack": "Strike all targets in an area.", "Piercing Attack": "Ignore a portion of the target's defense.", "Ricochet Attack": "Projectiles bounce to additional targets.", "Homing Attack": "Projectiles track the target.", "Summoned Attack": "Minions/summons deal damage each turn.",
  "Stance Switching": "Swap combat stances for different stat profiles.", "Weapon Swapping": "Swap between saved weapon loadouts mid-battle.", "Dual Wielding": "Fight with a weapon in each hand; off-hand attacks proc.", 
  "Skill Tree": "Spend points to learn class skills.", "Talent Tree": "Specialized class talent nodes.", "Passive Tree": "Passive modifiers that always apply.", "Mastery Tree": "Weapon-family mastery with stacking ranks.",
  "Class Skill": "Skills unique to your class.", "Racial Skill": "Skills granted by your race.", "Guild Skill": "Skills unlocked through your guild.", "Weapon Skill": "Skills tied to your equipped weapon family.", "Element Skill": "Skills dealing a specific element.", "Utility Skill": "Non-damaging situational tools.", "Support Skill": "Buffs and healing for allies.", "Movement Skill": "Mobility tools: dashes, blinks, leaps.", "Survival Skill": "Rest, campfire, and recovery tools.", "Crafting Skill": "Profession abilities for making items.", "Social Skill": "Emotes, titles, and interaction tools.", "Secret Skill": "Hidden abilities discovered in the world.", "Evolving Skill": "Abilities that grow stronger as you rank them.", "Combo Skill": "Abilities empowered by the combo meter.", "Charge Skill": "Skills with a charge-up turn.", "Reaction Skill": "Triggered by enemy actions (parry, counter, block).",
  "Character Level": "Core leveling through experience.", "Prestige Level": "Rebirth progression after max level.", "Ascension Rank": "Post-prestige ascending tiers.", "Awakening Rank": "Awakened power unlocked at level 100.", "Mastery Rank": "Rank per weapon family from use.", "Class Rank": "Class progression tiers.", "Weapon Level": "Level of your equipped weapon.", "Skill Level": "Individual skill proficiency.", "Pet Level": "Level of your active pet.", "Mount Level": "Level of your mount.", "Companion Level": "Level of your companion.", "Guild Level": "Guild-wide progression.", "Reputation Rank": "Standing with a faction.", "Faction Rank": "Ranks inside a faction.", "Adventure Rank": "Overall adventuring progress.", "Crafting Rank": "Aggregate profession progress.", "Collection Rank": "Achievements, bestiary, and codex progress.", "Season Rank": "Seasonal event progression.", "Challenge Rank": "Challenge-mode completion rank.", "Legacy Rank": "Permanent cross-prestige legacy progress.",
  "Main Quest": "The central storyline.", "Side Quest": "Optional standalone requests.", "Daily Quest": "Rotating daily contracts.", "Weekly Quest": "Rotating weekly contracts.", "Monthly Quest": "Monthly challenge contracts.", "Bounty Quest": "Hunt specific elite targets.", "Escort Quest": "Guard an NPC to a destination.", "Delivery Quest": "Carry goods to another zone.", "Puzzle Quest": "Solve riddles and brain-teasers.", "Investigation Quest": "Gather clues and solve a mystery.", "Boss Quest": "Defeat a named boss.", "Dungeon Quest": "Clear a dungeon.", "Raid Quest": "Defeat multiple bosses in sequence.", "Faction Quest": "Contracts for a faction.", "Guild Quest": "Contracts for your guild.", "Companion Quest": "Personal quests for companions.", "Hidden Quest": "Secret objectives found in the world.", "World Quest": "Regional world-state objectives.", "Chain Quest": "A linked series of quests.", "Choice Quest": "Decisions that change rewards and outcomes.",
  "Open Region": "Freely explorable contiguous territory.", "Forest Zone": "Dense woodland biomes.", "Desert Zone": "Sun-scorched sand seas.", "Mountain Zone": "High-altitude peaks.", "Swamp Zone": "Murkfen wetlands.", "Ocean Zone": "Open-water expanses.", "Island Zone": "Isolated landmasses.", "Cave Zone": "Subterranean cavern networks.", "Volcanic Zone": "Molten, fire-tinged terrain.", "Snow Zone": "Permafrost tundra.", "Sky Zone": "Floating heights above the clouds.", "Underground Zone": "Deep-earth tunnels and cities.", "Ruined City": "The fallen cities of old empires.", "Ancient Temple": "Sealed shrines of forgotten gods.", "Floating Island": "Levitated isles held by magic.", "Secret Realm": "Concealed pockets of the world.", "Dream Realm": "Realities shaped by sleep and memory.", "Time Realm": "Chronologically unstable domains.", "Elemental Realm": "Planes of pure element.", "Endgame Realm": "Endgame-only zones at world tier 80+.",
  "Common Item": "Everyday drops.", "Rare Item": "Blue-rarity finds.", "Epic Item": "Purple-rarity power items.", "Legendary Item": "Orange-rarity signature items.", "Mythic Item": "Red-rarity apex items.", "Cursed Item": "Powerful items with a drawback.", "Set Item": "Items that grant set bonuses.", "Artifact Item": "Gold-rarity unique artifacts.", "Relic Item": "Faction-flavored collector relics.", "Quest Item": "Items needed for quest objectives.", "Collectible Item": "Cards, trophies, and codex pieces.", "Cosmetic Item": "Dyes, skins, and transmogs.", "Upgrade Item": "Refinement stones and upgrade parts.", "Crafting Material": "Raw resources and refined parts.", "Food Item": "Consumable meals with effects.", "Potion Item": "Consumable alchemical draughts.", "Treasure Item": "Treasure maps and sealed chests.", "Event Item": "Seasonal event drops.", "Limited Item": "Rotating limited-stock goods.", "Account Item": "Shared account-wide unlocks.",
  "Gold": "The universal currency.", "Gem": "Premium-style currency earned in-game.", "Token": "Event and seasonal tokens.", "Faction Currency": "Earned and spent per faction.", "Guild Currency": "Guild vault currency.", "Dungeon Currency": "Earned from dungeon clears.", "Raid Currency": "Earned from raid victories.", "Event Currency": "Earned from world events.", "Crafting Currency": "Bartered between crafters.", "Trade Currency": "Used in player-to-player trade.",
  "Auction Market": "List and bid on items.", "Player Shop": "Sell goods from your own stall.", "NPC Shop": "Static merchant inventories.", "Rotating Shop": "Stock rotates daily and weekly.", "Secret Shop": "Unlocked by discovering zone secrets.", "Traveling Shop": "A wandering merchant at random zones.",
};

// build the catalog: prefix x group x feature
const CATALOG = [];
const CATALOG_MAP = {};
for (const prefix of PREFIXES) {
  for (const group of FEATURE_GROUPS) {
    for (const feature of group.features) {
      const id = `${prefix.id}_${slug(feature)}`;
      const entry = {
        id,
        name: `${prefix.name} ${feature}`,
        feature,
        category: group.category,
        kind: group.kind,
        prefix: prefix.id,
        prefixName: prefix.name,
        description: `${FEATURE_DESC[feature] || ""} ${prefix.flavor}`,
        status: statusFor(prefix.id, feature, group.kind),
      };
      CATALOG.push(entry);
      CATALOG_MAP[id] = entry;
    }
  }
}

// honest status: 'implemented' = wired into engine, 'partial' = data/hook exists, 'catalog' = catalog entry
function statusFor(prefixId, feature, kind) {
  const IMPLEMENTED_FEATURES = new Set([
    "Attack", "Charged Attack", "Combo Attack", "Chain Attack", "Counterattack", "Parry",
    "Perfect Block", "Dodge", "Dash Strike", "Backstab", "Finisher Skill", "Ultimate Skill",
    "Area Attack", "Piercing Attack", "Summoned Attack", "Stance Switching", "Dual Wielding",
    "Weapon Swapping", "Skill Tree", "Talent Tree", "Passive Tree", "Mastery Tree",
    "Class Skill", "Racial Skill", "Guild Skill", "Weapon Skill", "Element Skill", "Utility Skill",
    "Support Skill", "Movement Skill", "Survival Skill", "Crafting Skill", "Social Skill",
    "Secret Skill", "Evolving Skill", "Combo Skill", "Charge Skill", "Reaction Skill",
    "Character Level", "Prestige Level", "Ascension Rank", "Awakening Rank", "Mastery Rank",
    "Class Rank", "Weapon Level", "Skill Level", "Pet Level", "Mount Level", "Companion Level",
    "Guild Level", "Reputation Rank", "Faction Rank", "Adventure Rank", "Crafting Rank",
    "Collection Rank", "Season Rank", "Challenge Rank", "Legacy Rank",
    "Main Quest", "Side Quest", "Daily Quest", "Weekly Quest", "Monthly Quest", "Bounty Quest",
    "Escort Quest", "Delivery Quest", "Puzzle Quest", "Investigation Quest", "Boss Quest",
    "Dungeon Quest", "Raid Quest", "Faction Quest", "Guild Quest", "Companion Quest",
    "Hidden Quest", "World Quest", "Chain Quest", "Choice Quest",
    "Open Region", "Forest Zone", "Desert Zone", "Mountain Zone", "Swamp Zone", "Ocean Zone",
    "Island Zone", "Cave Zone", "Volcanic Zone", "Snow Zone", "Sky Zone", "Underground Zone",
    "Ruined City", "Ancient Temple", "Floating Island", "Secret Realm", "Dream Realm",
    "Time Realm", "Elemental Realm", "Endgame Realm",
    "Common Item", "Rare Item", "Epic Item", "Legendary Item", "Mythic Item", "Cursed Item",
    "Set Item", "Artifact Item", "Relic Item", "Quest Item", "Collectible Item", "Cosmetic Item",
    "Upgrade Item", "Crafting Material", "Food Item", "Potion Item", "Treasure Item",
    "Event Item", "Limited Item", "Account Item",
    "Gold", "Gem", "Token", "Faction Currency", "Guild Currency", "Dungeon Currency",
    "Raid Currency", "Event Currency", "Crafting Currency", "Trade Currency",
    "Auction Market", "Player Shop", "NPC Shop", "Rotating Shop", "Secret Shop", "Traveling Shop",
  ]);
  if (!IMPLEMENTED_FEATURES.has(feature)) return "catalog";
  if (["Ricochet Attack", "Homing Attack"].includes(feature)) return "partial"; // ability tags
  if (prefixId === "randomized" || prefixId === "dynamic" || prefixId === "seasonal" || prefixId === "daily" || prefixId === "weekly") return "partial"; // rotation/dynamic hooks exist
  return "implemented";
}

// ---- queries ----
function getFeature(id) { return CATALOG_MAP[id] || null; }
function searchFeatures(q) {
  const s = q.toLowerCase();
  return CATALOG.filter(f => f.name.toLowerCase().includes(s) || f.feature.toLowerCase().includes(s) || f.category.toLowerCase().includes(s) || f.id.includes(s));
}
function getFeaturesByCategory(category) { return CATALOG.filter(f => f.category.toLowerCase() === category.toLowerCase()); }
function getFeaturesByPrefix(prefixId) { return CATALOG.filter(f => f.prefix === prefixId); }
function featureCounts() {
  const counts = { total: CATALOG.length, byStatus: {}, byCategory: {} };
  for (const f of CATALOG) {
    counts.byStatus[f.status] = (counts.byStatus[f.status] || 0) + 1;
    counts.byCategory[f.category] = (counts.byCategory[f.category] || 0) + 1;
  }
  return counts;
}
function categories() { return FEATURE_GROUPS.map(g => g.category); }
function prefixes() { return PREFIXES; }

function featuresText(page = 1, { category = null, prefix = null, perPage = 15 } = {}) {
  let list = CATALOG;
  if (category) list = getFeaturesByCategory(category);
  if (prefix) list = getFeaturesByPrefix(prefix);
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const p = Math.min(Math.max(1, page), pages);
  const slice = list.slice((p - 1) * perPage, p * perPage);
  let s = `📚 **FEATURE CATALOG** — ${list.length} entries (page ${p}/${pages})\n`;
  if (category) s = `📚 **${cap(category)} FEATURES** — ${list.length} (page ${p}/${pages})\n`;
  if (prefix) s = `📚 **${cap(prefix)} TIER FEATURES** — ${list.length} (page ${p}/${pages})\n`;
  s += slice.map(f => `• **${f.name}** ${f.status === "implemented" ? "✅" : f.status === "partial" ? "🔄" : "📄"} — ${f.description}`).join("\n");
  s += `\n\nFilters: \`playrpg features <category>\` | \`playrpg features prefix <id>\` | \`playrpg feature <name>\``;
  return s;
}

function featureDetail(id) {
  const f = getFeature(id);
  if (!f) return null;
  const statusEmoji = f.status === "implemented" ? "✅ Implemented" : f.status === "partial" ? "🔄 Partial (hook exists)" : "📄 Catalog entry";
  return `**${f.name}**\n\n${f.description}\n\nCategory: ${f.category} | Kind: ${f.kind} | Prefix: ${f.prefixName}\nStatus: ${statusEmoji}\nID: \`${f.id}\``;
}

module.exports = {
  PREFIXES, FEATURE_GROUPS, CATALOG, CATALOG_MAP, featureCounts,
  getFeature, searchFeatures, getFeaturesByCategory, getFeaturesByPrefix,
  categories, prefixes, featuresText, featureDetail,
};
});

// ---------------------- embedded module: src/core/progression ----------------------
__def("src/core/progression", function (module, exports, require) {
// ============================================================
// progression.js — XP / PRESTIGE / PERKS / TALENT TREES / HARD MODES
// Pure Node (no discord.js). Mutates player objects from schema.
// ============================================================

const { WORLD, CLASSES, SUBCLASSES } = require("../config");
const { clamp, fmtShort } = require("../util");
const { refreshStats, addExp, players } = require("./schema");

// ------------------------------------------------------------
// SMALL HELPERS
// ------------------------------------------------------------
const round3 = (n) => Math.round(n * 1000) / 1000;

/** Total effect of a perk at a rank: rank 1 = value, +perRank per rank after. */
function perkValue(perk, rank) {
  return perk.effect.value + perk.effect.perRank * (rank - 1);
}

/** XP multiplier granted by the player's hard mode. */
function modeXpMult(p) {
  if (p.mode === "hardcore") return 1.25;
  if (p.mode === "permadeath") return 1.5;
  return 1;
}

/** Title tier granted at a given prestige count (null at 0). */
function prestigeTitle(prestige) {
  if (!prestige || prestige <= 0) return null;
  const TIERS = [
    "Risen", "Twice-Born", "Thrice-Crowned", "Eternal", "Ascended",
    "Celestial", "Transcendent", "Radiant", "Mythic", "Immortal",
  ];
  const i = clamp(prestige - 1, 0, TIERS.length - 1);
  const base = TIERS[i];
  return prestige > TIERS.length ? `${base} ${prestige}` : base;
}

// ------------------------------------------------------------
// PERKS — global registry (~40), bought with perk points from prestige.
// effect.stat is consumed by recomputePerkEffects / other modules.
// % stats are stored as percentage points (2 = +2%); fractions as decimals.
// ------------------------------------------------------------
const PERKS = {
  scholar:            { id: "scholar",            name: "Scholar",            description: "+2% bonus XP per rank.",                            maxRanks: 5, effect: { stat: "xpBonus",               value: 0.02, perRank: 0.02 } },
  overachiever:       { id: "overachiever",       name: "Overachiever",       description: "+5% bonus XP per rank.",                            maxRanks: 3, effect: { stat: "xpBonus",               value: 0.05, perRank: 0.05 } },
  "gold-finder":      { id: "gold-finder",        name: "Gold Finder",        description: "+3% gold from kills per rank.",                      maxRanks: 5, effect: { stat: "goldBonus",             value: 0.03, perRank: 0.03 } },
  "lucky-pennies":    { id: "lucky-pennies",      name: "Lucky Pennies",      description: "+5% gold, +2% more per additional rank.",             maxRanks: 3, effect: { stat: "goldBonus",             value: 0.05, perRank: 0.02 } },
  "treasure-hunter":  { id: "treasure-hunter",    name: "Treasure Hunter",    description: "+2% loot find per rank.",                             maxRanks: 5, effect: { stat: "lootBonus",             value: 0.02, perRank: 0.02 } },
  "keen-edge":        { id: "keen-edge",          name: "Keen Edge",          description: "+0.5% crit chance per rank.",                        maxRanks: 5, effect: { stat: "critChance",           value: 0.005, perRank: 0.005 } },
  "deadly-aim":       { id: "deadly-aim",         name: "Deadly Aim",         description: "+5% crit damage per rank.",                          maxRanks: 5, effect: { stat: "critDamage",           value: 0.05, perRank: 0.05 } },
  "shadow-dancer":    { id: "shadow-dancer",      name: "Shadow Dancer",      description: "+0.5% dodge chance per rank.",                        maxRanks: 5, effect: { stat: "dodge",                 value: 0.005, perRank: 0.005 } },
  "blade-catcher":    { id: "blade-catcher",      name: "Blade Catcher",      description: "+0.5% parry chance per rank.",                        maxRanks: 5, effect: { stat: "parry",                 value: 0.005, perRank: 0.005 } },
  "tower-shield":     { id: "tower-shield",       name: "Tower Shield",       description: "+0.5% block chance per rank.",                        maxRanks: 5, effect: { stat: "block",                 value: 0.005, perRank: 0.005 } },
  "vampire-touch":    { id: "vampire-touch",      name: "Vampire Touch",      description: "+1% lifesteal per rank.",                             maxRanks: 3, effect: { stat: "lifestealPct",         value: 0.01, perRank: 0.01 } },
  "arcane-well":      { id: "arcane-well",        name: "Arcane Well",        description: "+1 mana regen per rank.",                             maxRanks: 5, effect: { stat: "manaRegen",             value: 1, perRank: 1 } },
  "second-wind":      { id: "second-wind",        name: "Second Wind",        description: "+1 stamina regen per rank.",                          maxRanks: 5, effect: { stat: "staminaRegen",         value: 1, perRank: 1 } },
  vitality:           { id: "vitality",           name: "Vitality",           description: "+2% max HP per rank.",                                maxRanks: 5, effect: { stat: "hpBonusPct",            value: 2, perRank: 2 } },
  "deep-mind":        { id: "deep-mind",          name: "Deep Mind",          description: "+2% max MP per rank.",                                maxRanks: 5, effect: { stat: "mpBonusPct",            value: 2, perRank: 2 } },
  marathoner:         { id: "marathoner",         name: "Marathoner",         description: "+2% max stamina per rank.",                           maxRanks: 5, effect: { stat: "staminaBonusPct",      value: 2, perRank: 2 } },
  "pack-mule":        { id: "pack-mule",          name: "Pack Mule",          description: "+5 inventory slots per rank.",                         maxRanks: 5, effect: { stat: "inventorySize",         value: 5, perRank: 5 } },
  banker:             { id: "banker",             name: "Banker",             description: "+0.5% daily bank interest per rank.",                  maxRanks: 5, effect: { stat: "bankInterest",          value: 0.005, perRank: 0.005 } },
  wanderer:           { id: "wanderer",           name: "Wanderer",           description: "-5% travel costs per rank.",                           maxRanks: 5, effect: { stat: "travelDiscount",        value: 0.05, perRank: 0.05 } },
  haggler:            { id: "haggler",            name: "Haggler",            description: "-3% merchant prices per rank.",                        maxRanks: 5, effect: { stat: "merchantDiscount",      value: 0.03, perRank: 0.03 } },
  "fast-hands":       { id: "fast-hands",         name: "Fast Hands",         description: "+5% gathering speed per rank.",                        maxRanks: 5, effect: { stat: "gatheringSpeed",        value: 0.05, perRank: 0.05 } },
  "bountiful-harvest":{ id: "bountiful-harvest",  name: "Bountiful Harvest",  description: "+5% gathering yield per rank.",                         maxRanks: 5, effect: { stat: "gatheringYield",        value: 0.05, perRank: 0.05 } },
  "master-crafter":   { id: "master-crafter",     name: "Master Crafter",     description: "+5% crafting quality per rank.",                        maxRanks: 5, effect: { stat: "craftingQuality",       value: 0.05, perRank: 0.05 } },
  gourmet:            { id: "gourmet",            name: "Gourmet",            description: "+10% cooking buff duration per rank.",                 maxRanks: 3, effect: { stat: "cookingBuffDuration",   value: 0.1, perRank: 0.1 } },
  "beast-friend":     { id: "beast-friend",       name: "Beast Friend",       description: "+5% pet effectiveness per rank.",                       maxRanks: 5, effect: { stat: "petBonus",              value: 0.05, perRank: 0.05 } },
  "swift-saddle":     { id: "swift-saddle",       name: "Swift Saddle",       description: "+5% mount speed per rank.",                            maxRanks: 5, effect: { stat: "mountSpeed",            value: 0.05, perRank: 0.05 } },
  "team-player":      { id: "team-player",        name: "Team Player",        description: "+3% party XP/gold bonus per rank.",                     maxRanks: 5, effect: { stat: "partyBonus",            value: 0.03, perRank: 0.03 } },
  "guild-hero":       { id: "guild-hero",         name: "Guild Hero",         description: "+5% guild contribution per rank.",                      maxRanks: 5, effect: { stat: "guildContributionBonus", value: 0.05, perRank: 0.05 } },
  "hero-of-the-realm":{ id: "hero-of-the-realm",  name: "Hero of the Realm",  description: "+5% quest rewards per rank.",                           maxRanks: 5, effect: { stat: "questRewardBonus",      value: 0.05, perRank: 0.05 } },
  "fortune-favors":   { id: "fortune-favors",     name: "Fortune Favors",     description: "+5% treasure luck per rank.",                           maxRanks: 5, effect: { stat: "treasureLuck",          value: 0.05, perRank: 0.05 } },
  "cheap-rebirth":    { id: "cheap-rebirth",      name: "Cheap Rebirth",      description: "-10% respec costs per rank.",                           maxRanks: 3, effect: { stat: "respecDiscount",        value: 0.1, perRank: 0.1 } },
  "unbreakable-spirit":{ id: "unbreakable-spirit",name: "Unbreakable Spirit", description: "-20% death penalty per rank.",                          maxRanks: 3, effect: { stat: "deathPenaltyReduction",  value: 0.2, perRank: 0.2 } },
  "bounty-hunter":    { id: "bounty-hunter",      name: "Bounty Hunter",      description: "+5% bounty rewards per rank.",                           maxRanks: 5, effect: { stat: "bountyBonus",           value: 0.05, perRank: 0.05 } },
  angler:             { id: "angler",             name: "Angler",             description: "+5% fishing luck per rank.",                            maxRanks: 5, effect: { stat: "fishingLuck",           value: 0.05, perRank: 0.05 } },
  "deep-miner":       { id: "deep-miner",         name: "Deep Miner",         description: "+5% mining yield per rank.",                            maxRanks: 5, effect: { stat: "miningYield",           value: 0.05, perRank: 0.05 } },
  lumberjack:         { id: "lumberjack",         name: "Lumberjack",         description: "+5% woodcutting yield per rank.",                       maxRanks: 5, effect: { stat: "woodcuttingYield",      value: 0.05, perRank: 0.05 } },
  "green-thumb":      { id: "green-thumb",        name: "Green Thumb",        description: "+5% farming yield per rank.",                           maxRanks: 5, effect: { stat: "farmingYield",          value: 0.05, perRank: 0.05 } },
  tracker:            { id: "tracker",            name: "Tracker",            description: "+5% hunting yield per rank.",                           maxRanks: 5, effect: { stat: "huntingYield",          value: 0.05, perRank: 0.05 } },
  runecarver:         { id: "runecarver",         name: "Runecarver",         description: "+5% enchanting luck per rank.",                         maxRanks: 5, effect: { stat: "enchantLuck",           value: 0.05, perRank: 0.05 } },
  "gem-eyes":         { id: "gem-eyes",           name: "Gem Eyes",           description: "+5% gem luck per rank.",                                maxRanks: 5, effect: { stat: "gemLuck",               value: 0.05, perRank: 0.05 } },
  "eternal-novice":   { id: "eternal-novice",     name: "Eternal Novice",     description: "Grants the title 'Eternal Novice'.",                     maxRanks: 1, effect: { stat: "title",                 value: "Eternal Novice", perRank: 0 } },
};

// ------------------------------------------------------------
// TALENT TREES — per-class nodes bought with talent points.
// effect: { stat, perRank } — total = perRank * rank.
// 'ability' nodes unlock effect.perRank as an ability at rank 1.
// Row format: [id, name, desc, maxRanks, prereq, stat, perRank]; cost = 1.
// ------------------------------------------------------------
function tree(classId, name, rows) {
  return {
    classId,
    name,
    nodes: rows.map((r) => ({ id: r[0], name: r[1], description: r[2], maxRanks: r[3], cost: 1, prereq: r[4], effect: { stat: r[5], perRank: r[6] } })),
  };
}

const TALENT_TREES = {
  warrior:     tree("warrior", "Warrior", [["war_brawn", "Brawn", "+2 ATK per rank.", 3, null, "atk", 2], ["war_ironhide", "Ironhide", "+3% max HP per rank.", 3, null, "hp", 3], ["war_fortify", "Fortify", "+2 DEF per rank.", 3, "war_ironhide", "def", 2], ["war_whirlwind", "Whirlwind", "Unlock the Whirlwind ability.", 1, "war_brawn", "ability", "whirlwind"], ["war_shieldbash", "Shield Bash", "Unlock the Shield Bash ability.", 1, "war_fortify", "ability", "shield-bash"], ["war_bloodthirst", "Bloodthirst", "+1% lifesteal per rank.", 3, "war_brawn", "lifestealPct", 0.01], ["war_warmaster", "War Master", "+1% crit chance per rank.", 3, "war_whirlwind", "critChance", 0.01],]),
  mage:        tree("mage", "Mage", [["mag_ember", "Ember", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["mag_manaflow", "Mana Flow", "+3% max MP per rank.", 3, null, "mp", 3], ["mag_fireball", "Fireball", "Unlock the Fireball ability.", 1, "mag_ember", "ability", "fireball"], ["mag_frostnova", "Frost Nova", "Unlock the Frost Nova ability.", 1, "mag_manaflow", "ability", "frost-nova"], ["mag_quickcast", "Quick Cast", "+1 speed per rank.", 3, "mag_ember", "speed", 1], ["mag_arcanerecovery", "Arcane Recovery", "+1 mana regen per rank.", 3, "mag_manaflow", "manaRegen", 1], ["mag_archmage", "Archmage", "+1% crit chance per rank.", 3, "mag_fireball", "critChance", 0.01],]),
  rogue:       tree("rogue", "Rogue", [["rog_daggerwork", "Daggerwork", "+2 ATK per rank.", 3, null, "atk", 2], ["rog_shadowstep", "Shadowstep", "Unlock the Shadowstep ability.", 1, "rog_daggerwork", "ability", "shadowstep"], ["rog_backstab", "Backstab", "Unlock the Backstab ability.", 1, "rog_daggerwork", "ability", "backstab"], ["rog_agility", "Agility", "+1 speed per rank.", 3, null, "speed", 1], ["rog_evasion", "Evasion", "+0.5% dodge per rank.", 3, "rog_agility", "dodge", 0.005], ["rog_lethality", "Lethality", "+0.5% crit chance per rank.", 3, "rog_backstab", "critChance", 0.005], ["rog_silentkiller", "Silent Killer", "+5% crit damage per rank.", 3, "rog_lethality", "critDamage", 0.05],]),
  ranger:      tree("ranger", "Ranger", [["ran_marksmanship", "Marksmanship", "+2 ATK per rank.", 3, null, "atk", 2], ["ran_aimedshot", "Aimed Shot", "Unlock the Aimed Shot ability.", 1, "ran_marksmanship", "ability", "aimed-shot"], ["ran_companion", "Animal Companion", "Unlock the Animal Companion ability.", 1, "ran_marksmanship", "ability", "animal-companion"], ["ran_swiftness", "Swiftness", "+1 speed per rank.", 3, null, "speed", 1], ["ran_keeneye", "Keen Eye", "+0.5% crit chance per rank.", 3, "ran_aimedshot", "critChance", 0.005], ["ran_toughness", "Toughness", "+2% max HP per rank.", 3, "ran_swiftness", "hp", 2], ["ran_sniper", "Sniper", "+5% crit damage per rank.", 3, "ran_keeneye", "critDamage", 0.05],]),
  cleric:      tree("cleric", "Cleric", [["cle_faith", "Faith", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["cle_heal", "Heal", "Unlock the Heal ability.", 1, "cle_faith", "ability", "heal"], ["cle_smite", "Smite", "Unlock the Smite ability.", 1, "cle_faith", "ability", "smite"], ["cle_devotion", "Devotion", "+3% max HP per rank.", 3, null, "hp", 3], ["cle_prayer", "Prayer", "+1 mana regen per rank.", 3, "cle_devotion", "manaRegen", 1], ["cle_guardianangel", "Guardian Angel", "+1% block chance per rank.", 3, "cle_devotion", "block", 0.01], ["cle_lightbringer", "Lightbringer", "+1% crit chance per rank.", 3, "cle_smite", "critChance", 0.01],]),
  paladin:     tree("paladin", "Paladin", [["pal_conviction", "Conviction", "+2 ATK per rank.", 3, null, "atk", 2], ["pal_holyorders", "Holy Orders", "+3% max HP per rank.", 3, null, "hp", 3], ["pal_holy_shield", "Holy Shield", "Unlock the Holy Shield ability.", 1, "pal_holyorders", "ability", "holy-shield"], ["pal_consecration", "Consecration", "Unlock the Consecration ability.", 1, "pal_conviction", "ability", "consecration"], ["pal_auraofprotection", "Aura of Protection", "+1% block chance per rank.", 3, "pal_holyorders", "block", 0.01], ["pal_zeal", "Zeal", "+1% lifesteal per rank.", 3, "pal_conviction", "lifestealPct", 0.01], ["pal_avenger", "Avenger", "+1% crit chance per rank.", 3, "pal_consecration", "critChance", 0.01],]),
  druid:       tree("druid", "Druid", [["dru_natureswrath", "Nature's Wrath", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["dru_moonfire", "Moonfire", "Unlock the Moonfire ability.", 1, "dru_natureswrath", "ability", "moonfire"], ["dru_bearform", "Bear Form", "Unlock the Bear Form ability.", 1, "dru_natureswrath", "ability", "bear-form"], ["dru_wildvigor", "Wild Vigor", "+3% max HP per rank.", 3, null, "hp", 3], ["dru_regrowth", "Regrowth", "+1 mana regen per rank.", 3, "dru_wildvigor", "manaRegen", 1], ["dru_feralinstinct", "Feral Instinct", "+1 speed per rank.", 3, "dru_bearform", "speed", 1], ["dru_mooncaller", "Mooncaller", "+1% crit chance per rank.", 3, "dru_moonfire", "critChance", 0.01],]),
  bard:        tree("bard", "Bard", [["bar_melody", "Melody", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["bar_war_ballad", "War Ballad", "Unlock the War Ballad ability.", 1, "bar_melody", "ability", "war-ballad"], ["bar_battle_chant", "Battle Chant", "Unlock the Battle Chant ability.", 1, "bar_melody", "ability", "battle-chant"], ["bar_agile_fingers", "Agile Fingers", "+1 speed per rank.", 3, null, "speed", 1], ["bar_inspiration", "Inspiration", "+1 mana regen per rank.", 3, "bar_war_ballad", "manaRegen", 1], ["bar_soothing_voice", "Soothing Voice", "+2% max HP per rank.", 3, "bar_battle_chant", "hp", 2], ["bar_virtuoso", "Virtuoso", "+1% crit chance per rank.", 3, "bar_inspiration", "critChance", 0.01],]),
  monk:        tree("monk", "Monk", [["mon_flurry", "Flurry", "+2 ATK per rank.", 3, null, "atk", 2], ["mon_storm_fist", "Storm Fist", "Unlock the Storm Fist ability.", 1, "mon_flurry", "ability", "storm-fist"], ["mon_meditate", "Meditate", "+1 stamina regen per rank.", 3, null, "staminaRegen", 1], ["mon_iron_body", "Iron Body", "+3% max HP per rank.", 3, "mon_meditate", "hp", 3], ["mon_swift_step", "Swift Step", "+1 speed per rank.", 3, "mon_flurry", "speed", 1], ["mon_still_mind", "Still Mind", "+0.5% dodge per rank.", 3, "mon_iron_body", "dodge", 0.005], ["mon_way_of_silence", "Way of Silence", "+1% crit chance per rank.", 3, "mon_storm_fist", "critChance", 0.01],]),
  necromancer: tree("necromancer", "Necromancer", [["nec_death_mastery", "Death Mastery", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["nec_raise_skeleton", "Raise Skeleton", "Unlock the Raise Skeleton ability.", 1, "nec_death_mastery", "ability", "raise-skeleton"], ["nec_bone_shield", "Bone Shield", "Unlock the Bone Shield ability.", 1, "nec_death_mastery", "ability", "bone-shield"], ["nec_lifetap", "Lifetap", "+1% lifesteal per rank.", 3, null, "lifestealPct", 0.01], ["nec_dark_ritual", "Dark Ritual", "+1 mana regen per rank.", 3, "nec_lifetap", "manaRegen", 1], ["nec_death_ward", "Death Ward", "+2% max HP per rank.", 3, "nec_bone_shield", "hp", 2], ["nec_specterweaver", "Specterweaver", "+1% crit chance per rank.", 3, "nec_raise_skeleton", "critChance", 0.01],]),
  sorcerer:    tree("sorcerer", "Sorcerer", [["sor_overload", "Overload", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["sor_chain_lightning", "Chain Lightning", "Unlock the Chain Lightning ability.", 1, "sor_overload", "ability", "chain-lightning"], ["sor_void_bolt", "Void Bolt", "Unlock the Void Bolt ability.", 1, "sor_overload", "ability", "void-bolt"], ["sor_celerity", "Celerity", "+1 speed per rank.", 3, null, "speed", 1], ["sor_manaflame", "Manaflame", "+1 mana regen per rank.", 3, "sor_chain_lightning", "manaRegen", 1], ["sor_wild_magic", "Wild Magic", "+0.5% crit chance per rank.", 3, "sor_void_bolt", "critChance", 0.005], ["sor_spellstorm", "Spellstorm", "+5% crit damage per rank.", 3, "sor_wild_magic", "critDamage", 0.05],]),
  warden:      tree("warden", "Warden", [["wrd_warding", "Warding", "+2 DEF per rank.", 3, null, "def", 2], ["wrd_spear_wall", "Spear Wall", "Unlock the Spear Wall ability.", 1, "wrd_warding", "ability", "spear-wall"], ["wrd_tide_ward", "Tide Ward", "Unlock the Tide Ward ability.", 1, "wrd_warding", "ability", "tide-ward"], ["wrd_vitality", "Vitality", "+3% max HP per rank.", 3, null, "hp", 3], ["wrd_stand_fast", "Stand Fast", "+1% block chance per rank.", 3, "wrd_vitality", "block", 0.01], ["wrd_counter", "Counter", "+0.5% parry per rank.", 3, "wrd_spear_wall", "parry", 0.005], ["wrd_runeguardian", "Runeguardian", "+1% crit chance per rank.", 3, "wrd_tide_ward", "critChance", 0.01],]),
  alchemist:   tree("alchemist", "Alchemist", [["alc_mutagen", "Mutagen", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["alc_explosive_flask", "Explosive Flask", "Unlock the Explosive Flask ability.", 1, "alc_mutagen", "ability", "explosive-flask"], ["alc_transmute", "Transmute", "+1 mana regen per rank.", 3, null, "manaRegen", 1], ["alc_chemical_body", "Chemical Body", "+2% max HP per rank.", 3, "alc_transmute", "hp", 2], ["alc_swift_mixing", "Swift Mixing", "+1 speed per rank.", 3, "alc_mutagen", "speed", 1], ["alc_acidic_brew", "Acidic Brew", "+0.5% crit chance per rank.", 3, "alc_explosive_flask", "critChance", 0.005], ["alc_bombardier", "Bombardier", "+5% crit damage per rank.", 3, "alc_acidic_brew", "critDamage", 0.05],]),
  shaman:      tree("shaman", "Shaman", [["sha_lightning_call", "Lightning Call", "+2 magic ATK per rank.", 3, null, "magAtk", 2], ["sha_lightning_bolt", "Lightning Bolt", "Unlock the Lightning Bolt ability.", 1, "sha_lightning_call", "ability", "lightning-bolt"], ["sha_spirit_wolf", "Spirit Wolf", "Unlock the Spirit Wolf ability.", 1, "sha_lightning_call", "ability", "spirit-wolf"], ["sha_totemic_focus", "Totemic Focus", "+1 mana regen per rank.", 3, null, "manaRegen", 1], ["sha_earthward", "Earthward", "+2% max HP per rank.", 3, "sha_totemic_focus", "hp", 2], ["sha_hex", "Hex", "+1% crit chance per rank.", 3, "sha_lightning_bolt", "critChance", 0.01], ["sha_storm_totem", "Storm Totem", "+5% crit damage per rank.", 3, "sha_hex", "critDamage", 0.05],]),
};

/** Tree object for a class: { classId, name, className, subclasses, nodes }. */
function getTalentTree(classId) {
  const t = TALENT_TREES[classId];
  if (!t) return null;
  return { ...t, className: (CLASSES[classId] && CLASSES[classId].name) || t.name, subclasses: SUBCLASSES[classId] || [] };
}

// ------------------------------------------------------------
// PERK / TALENT EFFECT RECOMPUTATION (idempotent, rebuild from scratch)
// ------------------------------------------------------------
const STAT_FIELD = {
  atk: "atk", magAtk: "magAtk", def: "def", speed: "speed",
  critChance: "critChance", critDamage: "critDamage",
  dodge: "dodge", parry: "parry", block: "block",
  lifestealPct: "lifestealPct", manaRegen: "manaRegen", staminaRegen: "staminaRegen",
};

/** Rebuild statMultipliers + perkBonuses from all owned perk ranks. */
function recomputePerkEffects(p) {
  p.perks = p.perks || {};
  p.perkBonuses = {};
  const bonus = { xp: 0, gold: 0, loot: 0 };
  for (const [id, rank] of Object.entries(p.perks)) {
    const perk = PERKS[id];
    if (!perk || rank <= 0) continue;
    if (perk.effect.stat === "title") {
      if (rank >= 1) p.title = perk.effect.value;
      continue;
    }
    const amt = perkValue(perk, rank);
    if (perk.effect.stat === "xpBonus") bonus.xp += amt;
    else if (perk.effect.stat === "goldBonus") bonus.gold += amt;
    else if (perk.effect.stat === "lootBonus") bonus.loot += amt;
    else p.perkBonuses[perk.effect.stat] = (p.perkBonuses[perk.effect.stat] || 0) + amt;
  }
  p.statMultipliers = p.statMultipliers || {};
  // Prestige: +5% xp per prestige, capped at +100% (20 prestiges).
  const prestigeMult = 1 + Math.min(p.prestige || 0, 20) * 0.05;
  p.statMultipliers.xp = clamp(round3(modeXpMult(p) * prestigeMult + bonus.xp), 0.5, 10);
  p.statMultipliers.gold = round3(1 + bonus.gold);
  p.statMultipliers.loot = round3(1 + bonus.loot);
}

/** Rebuild talentBonuses (stat totals) from talentTree ranks. */
function recomputeTalentBonuses(p) {
  p.talentBonuses = {};
  const t = TALENT_TREES[p.class];
  if (!t) return;
  for (const [nodeId, rank] of Object.entries(p.talentTree || {})) {
    const node = t.nodes.find((x) => x.id === nodeId);
    if (!node || rank <= 0 || node.effect.stat === "ability") continue;
    p.talentBonuses[node.effect.stat] = (p.talentBonuses[node.effect.stat] || 0) + node.effect.perRank * rank;
  }
}

/** Lay perk + talent bonuses on top of freshly-refreshed base stats. */
function overlayBonuses(p) {
  const flat = {};
  for (const map of [p.perkBonuses, p.talentBonuses]) {
    if (!map) continue;
    for (const [k, v] of Object.entries(map)) {
      if (k === "ability" || k === "title") continue;
      flat[k] = (flat[k] || 0) + v;
    }
  }
  const hpPct = (flat.hp || 0) + (flat.hpBonusPct || 0);
  const mpPct = (flat.mp || 0) + (flat.mpBonusPct || 0);
  const stamPct = (flat.stamina || 0) + (flat.staminaBonusPct || 0);
  if (hpPct) p.maxHp = Math.floor(p.maxHp * (1 + hpPct / 100));
  if (mpPct) p.maxMp = Math.floor(p.maxMp * (1 + mpPct / 100));
  if (stamPct) p.maxStamina = Math.floor(p.maxStamina * (1 + stamPct / 100));
  for (const [stat, value] of Object.entries(flat)) {
    if (stat === "hp" || stat === "hpBonusPct" || stat === "mp" || stat === "mpBonusPct" ||
        stat === "stamina" || stat === "staminaBonusPct") continue;
    const field = STAT_FIELD[stat];
    if (field) p[field] = round3(p[field] + value);
  }
}

/** refreshStats + apply perk/talent bonuses, then clamp vitals to max. */
function syncCombatStats(p) {
  refreshStats(p);
  overlayBonuses(p);
  p.hp = Math.min(p.hp, p.maxHp);
  p.mp = Math.min(p.mp, p.maxMp);
  p.stamina = Math.min(p.stamina, p.maxStamina);
  return p;
}

// ------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------

/** Prestige (rebirth): requires level 100. Resets level, keeps meta-progress. */
function prestige(p) {
  if (p.level < WORLD.MAX_LEVEL) {
    return { ok: false, reason: `Prestige requires level ${WORLD.MAX_LEVEL}. You are level ${p.level}.` };
  }
  p.prestige += 1;
  p.level = 1;
  p.exp = 0;
  p.nextExp = Math.floor(100 * Math.pow(p.level, 1.7));
  p.talentPoints = 1;
  p.skillPoints = 1;
  p.talentTree = {};
  p.abilities = [];
  p.passives = [];
  p.ultimate = null;
  for (const k of Object.keys(p.attributes)) p.attributes[k] = 5;
  p.unspentAttrPoints = 15;
  p.perkPoints += WORLD.MAX_PERK_POINTS_PER_PRESTIGE;
  p.title = prestigeTitle(p.prestige);
  p.statusEffects = [];
  p.activeBuffs = {};
  p.cooldowns = {};
  p.combo = 0; p.momentum = 0; p.killStreak = 0;
  p.zone = WORLD.STARTING_ZONE;
  p.explored = new Set([WORLD.STARTING_ZONE]);
  p.waypoints = new Set([WORLD.STARTING_ZONE]);
  p.fastTravelPoints = [];
  p.quests = { ...p.quests, active: [] };
  recomputePerkEffects(p);
  recomputeTalentBonuses(p);
  syncCombatStats(p);
  p.hp = p.maxHp; p.mp = p.maxMp; p.stamina = p.maxStamina;
  players.set(p.id, p);
  return {
    ok: true,
    level: p.level, exp: p.exp, prestige: p.prestige,
    perkPoints: p.perkPoints,
    xpMult: p.statMultipliers.xp,
    title: p.title,
    message: `Prestige ${p.prestige}! ${p.title ? `New title: ${p.title}. ` : ""}+${WORLD.MAX_PERK_POINTS_PER_PRESTIGE} perk points, +5% XP per prestige.`,
  };
}

/** Spend 1 perk point to buy/rank-up a global perk. */
function applyPerk(p, perkId) {
  const perk = PERKS[perkId];
  if (!perk) return { ok: false, reason: `Unknown perk "${perkId}".` };
  p.perks = p.perks || {};
  const rank = p.perks[perkId] || 0;
  if (rank >= perk.maxRanks) {
    return { ok: false, reason: `${perk.name} is already max rank (${perk.maxRanks}).` };
  }
  if (p.perkPoints < 1) return { ok: false, reason: "You have no perk points." };
  p.perks[perkId] = rank + 1;
  p.perkPoints -= 1;
  recomputePerkEffects(p);
  syncCombatStats(p);
  players.set(p.id, p);
  return { ok: true, message: `Applied ${perk.name} (rank ${rank + 1}/${perk.maxRanks}).`, perkId, rank: rank + 1 };
}

/** Spend 1 talent point in the player's class tree. */
function spendTalentPoint(p, classId, nodeId) {
  const t = TALENT_TREES[classId];
  if (!t) return { ok: false, reason: `Unknown class "${classId}".` };
  if (p.class !== classId) return { ok: false, reason: `You must be a ${t.name} to train this tree.` };
  const node = t.nodes.find((x) => x.id === nodeId);
  if (!node) return { ok: false, reason: `Unknown talent node "${nodeId}".` };
  const rank = p.talentTree[nodeId] || 0;
  if (rank >= node.maxRanks) return { ok: false, reason: `${node.name} is already max rank.` };
  const prereqs = node.prereq ? (Array.isArray(node.prereq) ? node.prereq : [node.prereq]) : [];
  for (const pre of prereqs) {
    if (!(p.talentTree[pre] > 0)) {
      const preNode = t.nodes.find((x) => x.id === pre);
      return { ok: false, reason: `Requires ${preNode ? preNode.name : pre} first.` };
    }
  }
  const cost = node.cost || 1;
  if (p.talentPoints < cost) {
    return { ok: false, reason: `Not enough talent points (need ${cost}, have ${p.talentPoints}).` };
  }
  p.talentPoints -= cost;
  p.talentTree[nodeId] = rank + 1;
  if (node.effect.stat === "ability" && !p.abilities.includes(node.effect.perRank)) {
    p.abilities.push(node.effect.perRank);
  }
  recomputeTalentBonuses(p);
  syncCombatStats(p);
  players.set(p.id, p);
  return { ok: true, message: `Learned ${node.name} (rank ${rank + 1}/${node.maxRanks}).`, nodeId, rank: rank + 1 };
}

/**
 * Respec. opts: { talentPoints: bool, attrPoints: bool }.
 * Talent respec: level*50 gold. Attr respec: level*100 gold.
 * RespecDiscount perk reduces the cost.
 */
function respec(p, opts = {}) {
  const doTalent = !!opts.talentPoints;
  const doAttr = !!opts.attrPoints;
  if (!doTalent && !doAttr) {
    return { ok: false, reason: "Specify what to respec: talentPoints and/or attrPoints." };
  }
  let goldCost = (doTalent ? p.level * 50 : 0) + (doAttr ? p.level * 100 : 0);
  const discount = (p.perkBonuses && p.perkBonuses.respecDiscount) || 0;
  goldCost = Math.max(1, Math.floor(goldCost * (1 - discount)));
  if (p.gold < goldCost) {
    return { ok: false, reason: `Respec costs ${fmtShort(goldCost)} gold; you have ${fmtShort(p.gold)}.` };
  }
  const refunded = {};
  if (doTalent) {
    const t = TALENT_TREES[p.class];
    let spent = 0;
    for (const [nodeId, rank] of Object.entries(p.talentTree || {})) {
      const node = t ? t.nodes.find((x) => x.id === nodeId) : null;
      spent += (node ? (node.cost || 1) : 1) * rank;
    }
    refunded.talentPoints = spent;
    p.talentPoints += spent;
    const granted = new Set();
    if (t) for (const node of t.nodes) {
      if (node.effect.stat === "ability") granted.add(node.effect.perRank);
    }
    p.abilities = p.abilities.filter((a) => !granted.has(a));
    p.talentTree = {};
    recomputeTalentBonuses(p);
  }
  if (doAttr) {
    let spent = 0;
    for (const k of Object.keys(p.attributes)) spent += p.attributes[k] - 5;
    refunded.attrPoints = spent;
    for (const k of Object.keys(p.attributes)) p.attributes[k] = 5;
    p.unspentAttrPoints += spent;
  }
  p.gold -= goldCost;
  syncCombatStats(p);
  players.set(p.id, p);
  return {
    ok: true,
    goldCost,
    refunded,
    message: `Respec complete for ${fmtShort(goldCost)} gold. Refunded ${refunded.talentPoints || 0} talent point(s), ${refunded.attrPoints || 0} attribute point(s).`,
  };
}

const HARD_MODE_VALUES = ["none", "hardcore", "ironman", "permadeath"];

/** Set a hard mode: none | hardcore | ironman | permadeath. */
function setHardMode(p, mode) {
  if (!HARD_MODE_VALUES.includes(mode)) {
    return { ok: false, reason: `Unknown hard mode "${mode}". Valid modes: ${HARD_MODE_VALUES.join(", ")}.` };
  }
  p.mode = mode;
  p.ironman = mode === "ironman";
  p.permadeath = mode === "permadeath";
  p.difficulty = mode === "permadeath" ? "nightmare" : (mode === "none" ? "normal" : "hard");
  recomputePerkEffects(p); // folds mode XP mult (+ prestige/perk) into statMultipliers.xp
  players.set(p.id, p);
  return {
    ok: true,
    mode: p.mode,
    difficulty: p.difficulty,
    ironman: !!p.ironman,
    permadeath: !!p.permadeath,
    xpMult: p.statMultipliers.xp,
    message: `Hard mode set to ${p.mode}.${p.ironman ? " Trading and parties are disabled." : ""}`,
  };
}

/** Thin wrapper over schema's addExp (which handles leveling). */
function addExpAndMaybeLevel(p, amount) {
  if (p.nextExp == null) p.nextExp = Math.floor(100 * Math.pow(p.level, 1.7));
  const result = addExp(p, amount);
  players.set(p.id, p);
  return result;
}

// ============================================================
// RANKS, MASTERY, PET/MOUNT/COMPANION LEVELS, SEASON XP
// ============================================================

function ensureMap(player, key) { if (!player[key]) player[key] = {}; return player[key]; }

// ---- weapon mastery ----
function getMastery(player, type) { return ensureMap(player, "mastery")[type] || 0; }
function gainMastery(player, type, amount) {
  ensureMap(player, "mastery")[type] = Math.min(100, getMastery(player, type) + (amount || 1));
  return getMastery(player, type);
}
function masteryRank(player, type) { return Math.floor(getMastery(player, type) / 10) + 1; }
function masteryBonusAtk(player, type) { return getMastery(player, type) * 0.002; }

// ---- pet / mount / companion levels ----
function gainPetXp(player, xp) {
  if (!player.activePet) return 0;
  const map = ensureMap(player, "petXp");
  map[player.activePet] = (map[player.activePet] || 0) + Math.round(xp);
  return petLevel(player, player.activePet);
}
function petLevel(player, name) { return Math.floor((player.petXp?.[name] || 0) / 200) + 1; }
function mountLevel(player, name) { return Math.floor((player.mountXp?.[name] || 0) / 300) + 1; }
function companionLevel(player, name) { return Math.floor((player.companionXp?.[name] || 0) / 250) + 1; }

// ---- rank computations ----
function getAscensionRank(player) { return Math.floor((player.prestige || 0) / 3); }
function getAwakeningRank(player) { return player.level >= 100 ? 1 + Math.floor((player.prestige || 0) / 5) : 0; }
function getClassRank(player) { return Math.floor((player.level || 1) / 20) + 1; }
function getAdventureRank(player) { return 1 + Math.floor((player.kills || 0) / 50) + Math.floor((player.quests?.totalCompleted || 0) / 10); }
function getCraftingRank(player) { const tot = Object.values(player.professions || {}).reduce((s, v) => s + v, 0); return Math.floor(tot / 20) + 1; }
function getCollectionRank(player) { const c = (player.achievements?.size || 0) + (player.bestiary?.size || 0) + (player.codex?.size || 0); return Math.floor(c / 25) + 1; }
function getSeasonRank(player) { return Math.floor((player.seasonXp || 0) / 500) + 1; }
function gainSeasonXp(player, xp) { player.seasonXp = (player.seasonXp || 0) + xp; return getSeasonRank(player); }
function getChallengeRank(player) { return Math.floor((player.challengesCompleted || 0) / 3) + 1; }
function getLegacyRank(player) { return 1 + (player.prestige || 0); }
function getReputationRank(player, factionId) {
  const r = player.reputation?.[factionId] || 0;
  return r >= 1000 ? "Ally" : r >= 500 ? "Friend" : r >= 100 ? "Known" : r >= -100 ? "Neutral" : r >= -500 ? "Disliked" : "Hated";
}
function getFactionRank(player) { return Math.max(1, Math.floor(getAdventureRank(player) / 2)); }
function getGuildLevel(guild) { return Math.floor(Math.sqrt((guild?.xp || 0) / 100)) + 1; }
function getWeaponLevel(player) { return player.equipped?.weapon?.level || 1; }
function getSkillLevelFor(player, skillId) { return player.skills?.[skillId] || 1; }

function ranksText(player) {
  const p = player;
  let s = `🏅 **${p.name}'s RANKS & LEVELS**\n\n`;
  s += `Character Level: **${p.level}**${p.prestige ? ` | Prestige: **${p.prestige}**` : ""}\n`;
  s += `Ascension Rank: **${getAscensionRank(p)}** | Awakening Rank: **${getAwakeningRank(p)}** | Legacy Rank: **${getLegacyRank(p)}**\n`;
  s += `Class Rank: **${getClassRank(p)}** | Adventure Rank: **${getAdventureRank(p)}**\n`;
  s += `Mastery Rank: **${masteryRank(p, p.equipped?.weapon?.type || "sword")}** (${p.equipped?.weapon?.type || "sword"}) | Weapon Level: **${getWeaponLevel(p)}**\n`;
  s += `Crafting Rank: **${getCraftingRank(p)}** | Collection Rank: **${getCollectionRank(p)}**\n`;
  s += `Season Rank: **${getSeasonRank(p)}** (${p.seasonXp || 0} season XP) | Challenge Rank: **${getChallengeRank(p)}**\n`;
  if (p.activePet) s += `Pet: **${p.activePet}** Lv ${petLevel(p, p.activePet)}\n`;
  if (p.activeMount) s += `Mount: **${p.activeMount}** Lv ${mountLevel(p, p.activeMount)}\n`;
  if (p.quests?.totalCompleted) s += `Faction Rank: **${getFactionRank(p)}**\n`;
  return s;
}

// wire combat rewards into progression
const { bindProgressionHooks } = require("./combat");
bindProgressionHooks({ gainPetXp, gainMastery });

module.exports = {
  PERKS,
  TALENT_TREES,
  getTalentTree,
  prestige,
  applyPerk,
  spendTalentPoint,
  respec,
  setHardMode,
  addExpAndMaybeLevel,
  recomputePerkEffects,
  recomputeTalentBonuses,
  syncCombatStats,
  prestigeTitle,
  perkValue,
  getMastery, gainMastery, masteryRank, masteryBonusAtk,
  gainPetXp, petLevel, mountLevel, companionLevel,
  getAscensionRank, getAwakeningRank, getClassRank, getAdventureRank,
  getCraftingRank, getCollectionRank, getSeasonRank, gainSeasonXp,
  getChallengeRank, getLegacyRank, getReputationRank, getFactionRank,
  getGuildLevel, getWeaponLevel, getSkillLevelFor, ranksText,
};
});

// ---------------------- embedded module: src/core/pvp ----------------------
__def("src/core/pvp", function (module, exports, require) {
// ============================================================
// pvp.js — player-vs-player duels. Challenge, wager, turn-based
// combat between two players using the shared damage pipeline.
// Pure Node.
// ============================================================

const { chance, clamp, pick, fmt } = require("../util");
const { applyStatus, tickStatuses, removeStatus } = require("./statusEffects");
const { ABILITIES, ITEM_EFFECTS, computeHit } = require("./combat");

const PVP_BATTLES = new Map();      // battleId -> battle
const PVP_CHALLENGES = new Map();   // challengerId -> { challenger, target, wager, at }

// ---- challenge lifecycle --------------------------------------
function challenge(player, target, wager = 50) {
  if (!target) return { ok: false, reason: "no_target" };
  if (player.id === target.id) return { ok: false, reason: "self" };
  if (player.mode === "ironman" || target.mode === "ironman") return { ok: false, reason: "ironman_no_pvp" };
  if (getPvpBattle(player.id)) return { ok: false, reason: "already_dueling" };
  if (getPvpBattle(target.id)) return { ok: false, reason: "target_busy" };
  if (wager < 10) return { ok: false, reason: "wager_min" };
  if (player.gold < wager) return { ok: false, reason: "no_gold" };
  PVP_CHALLENGES.set(player.id, { challenger: player, target, wager, at: Date.now() });
  return { ok: true, wager };
}

function accept(player, challengerId) {
  const c = PVP_CHALLENGES.get(challengerId);
  if (!c) return { ok: false, reason: "no_challenge" };
  if (c.target.id !== player.id) return { ok: false, reason: "not_for_you" };
  if (player.gold < c.wager) {
    PVP_CHALLENGES.delete(challengerId);
    return { ok: false, reason: "no_gold" };
  }
  PVP_CHALLENGES.delete(challengerId);
  return startDuel(c.challenger, player, c.wager);
}

function decline(player, challengerId) {
  const c = PVP_CHALLENGES.get(challengerId);
  if (!c) return { ok: false, reason: "no_challenge" };
  if (c.target.id !== player.id) return { ok: false, reason: "not_for_you" };
  PVP_CHALLENGES.delete(challengerId);
  return { ok: true, declined: true };
}

function listChallenges() {
  return [...PVP_CHALLENGES.values()].map(c => ({
    challenger: c.challenger.name,
    target: c.target.name,
    wager: c.wager,
    targetId: c.target.id,
  }));
}

function startDuel(p1, p2, wager) {
  // speed decides who acts first
  const p1First = p1.speed + Math.random() * 10 > p2.speed + Math.random() * 10;
  const battle = {
    id: `pvp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    p1, p2,
    turn: p1First ? p1.id : p2.id,
    round: 1,
    state: "active",
    wager,
    log: [`⚔️ **DUEL!** ${p1.name} vs ${p2.name} — wager **${wager} gold** each.`, `${p1First ? p1.name : p2.name} moves first.`],
    startedAt: Date.now(),
  };
  PVP_BATTLES.set(battle.id, battle);
  PVP_BATTLES.set(`p_${p1.id}`, battle);
  PVP_BATTLES.set(`p_${p2.id}`, battle);
  return { ok: true, battle };
}

function getPvpBattle(playerId) {
  return PVP_BATTLES.get(`p_${playerId}`) || null;
}

// ---- turn handling ---------------------------------------------
function _opponent(battle, player) {
  return battle.p1.id === player.id ? battle.p2 : battle.p1;
}

function _afterAction(battle, player) {
  const opp = _opponent(battle, player);
  // status ticks for both
  const a = tickStatuses(player, { isPlayer: true });
  const b = tickStatuses(opp, { isPlayer: true });
  battle.log.push(...a.log, ...b.log);
  player.guarding = false;
  if (opp.hp <= 0) return endDuel(battle, player);
  if (player.hp <= 0) return endDuel(battle, opp);
  battle.turn = opp.id;
  battle.round += 1;
  return { ok: true, battle };
}

function _pay(player, cost) {
  if (!cost) return true;
  if (cost.mp !== undefined) { if (player.mp < cost.mp) return false; player.mp -= cost.mp; }
  if (cost.stamina !== undefined) { if (player.stamina < cost.stamina) return false; player.stamina -= cost.stamina; }
  if (cost.rage !== undefined) { if (player.rage < cost.rage) return false; player.rage -= cost.rage; }
  if (cost.energy !== undefined) { if (player.energy < cost.energy) return false; player.energy -= cost.energy; }
  return true;
}

function pvpAction(player, action, { skillId = null, itemName = null } = {}) {
  const battle = getPvpBattle(player.id);
  if (!battle) return { ok: false, reason: "no_duel" };
  if (battle.state !== "active") return { ok: false, reason: "duel_over" };
  if (battle.turn !== player.id) return { ok: false, reason: "not_your_turn" };
  const opp = _opponent(battle, player);

  if (action === "attack") {
    const hit = computeHit(player, opp, { power: 1, element: "physical" });
    if (!hit.dodged) opp.hp = Math.max(0, opp.hp - hit.damage);
    battle.log.push(`🎯 ${hit.logLine}`);
    return { ok: true, ..._afterAction(battle, player) };
  }

  if (action === "skill") {
    const ab = ABILITIES[skillId];
    if (!ab) return { ok: false, reason: "unknown_skill" };
    if (!(player.abilities || []).includes(ab.id)) return { ok: false, reason: "not_learned" };
    if ((player.cooldowns?.[ab.id] || 0) > 0) return { ok: false, reason: "on_cooldown" };
    if (!_pay(player, ab.cost)) return { ok: false, reason: "insufficient_resource" };
    player.cooldowns[ab.id] = ab.cooldown;
    battle.log.push(`${ab.emoji} **${player.name}** uses **${ab.name}**!`);
    if (ab.kind === "heal") {
      const maxHp = player.maxHp || 100;
      const healAmt = Math.min(Math.max(0, maxHp - player.hp), Math.round(maxHp * 0.15) + Math.round(player.magAtk * 0.4) + Math.round(player.level * 2));
      player.hp += healAmt;
      battle.log.push(`💚 ${player.name} heals for **${fmt(healAmt)}** HP.`);
    } else if (ab.kind === "buff") {
      const potency = ab.statusPotency || (ab.power > 0 ? ab.power * player.level : 1);
      applyStatus(player, ab.statusId, { potency, duration: 3 });
      battle.log.push(`🛡️ ${player.name} gains **${ab.statusId.replace(/_/g, " ")}**!`);
    } else if (ab.kind === "debuff" || ab.kind === "utility") {
      if (ab.statusId) {
        applyStatus(opp, ab.statusId, { potency: Math.max(1, Math.round(player.magAtk * 0.1)), duration: 2 });
        battle.log.push(`👁️ ${opp.name} is afflicted by **${ab.statusId.replace(/_/g, " ")}**!`);
      }
    } else if (ab.kind === "damage") {
      let power = ab.power;
      if (ab.execute && opp.hp <= (opp.maxHp || 100) * 0.2) {
        power *= 1.8;
        battle.log.push(`⚡ **EXECUTE!** ${opp.name} is below 20% HP!`);
      }
      const hits = ab.hits || 1;
      for (let i = 0; i < hits; i++) {
        const hit = computeHit(player, opp, { power: power / hits, element: ab.element, isMagical: /mp/.test(JSON.stringify(ab.cost)), critBonus: ab.critBonus || 0, piercing: ab.piercing || 0 });
        if (!hit.dodged) opp.hp = Math.max(0, opp.hp - hit.damage);
        battle.log.push(`🎯 ${hit.logLine}`);
      }
      if (ab.statusId && chance(ab.statusChance || 1)) {
        applyStatus(opp, ab.statusId, { potency: Math.max(1, Math.round(player.magAtk * 0.08)), duration: 3 });
        battle.log.push(`☄️ ${opp.name} is afflicted by **${ab.statusId.replace(/_/g, " ")}**!`);
      }
    }
    return { ok: true, ..._afterAction(battle, player) };
  }

  if (action === "item") {
    const eff = ITEM_EFFECTS[itemName];
    if (!eff) return { ok: false, reason: "unknown_item" };
    if ((player.inventory[itemName] || 0) <= 0) return { ok: false, reason: "not_owned" };
    player.inventory[itemName] -= 1;
    const maxHp = player.maxHp || 100, maxMp = player.maxMp || 50;
    if (eff.heal) { const h = Math.min(Math.max(0, maxHp - player.hp), eff.heal); player.hp += h; battle.log.push(`${eff.emoji} ${player.name} uses **${itemName}**, healing **${h}** HP.`); }
    if (eff.mp) { const m = Math.min(Math.max(0, maxMp - player.mp), eff.mp); player.mp += m; battle.log.push(`${eff.emoji} ${player.name} restores **${m}** MP.`); }
    return { ok: true, ..._afterAction(battle, player) };
  }

  if (action === "guard") {
    player.guarding = true;
    applyStatus(player, "shield", { potency: Math.round((player.maxHp || 100) * 0.15), duration: 2 });
    battle.log.push(`🛡️ ${player.name} braces (shield + perfect-block chance).`);
    return { ok: true, ..._afterAction(battle, player) };
  }

  if (action === "flee") {
    if (chance(0.5)) {
      battle.log.push(`💨 ${player.name} flees the duel!`);
      return endDuel(battle, opp, { forfeit: true });
    }
    battle.log.push(`🚫 ${player.name} tries to flee but is cornered!`);
    return { ok: true, ..._afterAction(battle, player) };
  }

  return { ok: false, reason: "unknown_action" };
}

function endDuel(battle, winner, opts = {}) {
  const loser = battle.p1.id === winner.id ? battle.p2 : battle.p1;
  battle.state = "over";
  battle.winner = winner.id;
  // wager: winner takes both
  const pot = battle.wager * 2;
  winner.gold += pot;
  loser.gold = Math.max(0, loser.gold - battle.wager);
  winner.pvpWins = (winner.pvpWins || 0) + 1;
  loser.pvpLosses = (loser.pvpLosses || 0) + 1;
  battle.log.push(`🏆 **${winner.name} WINS THE DUEL!** (+${pot} gold)`);
  if (opts.forfeit) battle.log.push(`(${loser.name} forfeited.)`);
  const battleRef = battle;
  PVP_BATTLES.delete(battle.id);
  PVP_BATTLES.delete(`p_${battle.p1.id}`);
  PVP_BATTLES.delete(`p_${battle.p2.id}`);
  return { ok: true, result: "over", winner: winner.id, pot, log: battleRef.log, battle: battleRef };
}

function pvpStatusText(battle) {
  const { p1, p2 } = battle;
  const turn = battle.turn === p1.id ? p1.name : p2.name;
  return `⚔️ **DUEL STATUS** — Round ${battle.round}\n\n` +
    `**${p1.name}** ❤️ ${p1.hp}/${p1.maxHp} 🔷 ${p1.mp}/${p1.maxMp} ⚡ ${p1.stamina}/${p1.maxStamina}\n` +
    `**${p2.name}** ❤️ ${p2.hp}/${p2.maxHp} 🔷 ${p2.mp}/${p2.maxMp} ⚡ ${p2.stamina}/${p2.maxStamina}\n\n` +
    `💰 Wager: ${battle.wager} gold each | Turn: **${turn}**\n` +
    `\n${battle.log.slice(-4).join("\n")}`;
}

module.exports = {
  PVP_BATTLES, PVP_CHALLENGES,
  challenge, accept, decline, listChallenges,
  getPvpBattle, pvpAction, endDuel, pvpStatusText,
};
});

// ---------------------- embedded module: src/core/schema ----------------------
__def("src/core/schema", function (module, exports, require) {
  var __dirname = __singleDir;
// ============================================================
// schema.js — ENTITY FACTORIES & CORE MUTATIONS
// The canonical player/party/guild shapes. Pure Node (no discord).
// Stores are in-memory Maps with optional JSON persistence.
// ============================================================

const fs = require("fs");
const path = require("path");
const { WORLD, RACES, CLASSES } = require("../config");
const { clamp, randInt } = require("../util");

const players = new Map();
const parties = new Map();
const guilds = new Map();
const activeBattles = new Map();

const SAVE_FILE = path.join(__dirname, "data", "save.json");

// ---------- attribute -> derived stat math ----------
function computeDerived(p) {
  const a = p.attributes;             // str, dex, con, int, wis, cha
  const cls = CLASSES[p.class] || CLASSES.warrior;
  const lvl = p.level || 1;

  // Base vitals are FIXED: 100 HP / 50 MP / 60 stamina at level 1.
  // Each level adds stats: +6 HP, +3 MP, +2 stamina, +ATK/MATK/DEF/MDEF/speed.
  // Attributes give offsets on top (con above 5 = +2 HP each, etc.).
  const weaponAtk = p.equipped.weapon?.statBonus?.atk || 0;
  const weaponMag = p.equipped.weapon?.statBonus?.magAtk || 0;
  const armorDef = (p.equipped.armor?.statBonus?.def || 0) +
                   (p.equipped.offhand?.statBonus?.def || 0);

  return {
    maxHp: Math.floor(100 + (lvl - 1) * 6 + (a.con - 5) * 2),
    maxMp: Math.floor(50 + (lvl - 1) * 3 + (a.int - 5) + (a.wis - 5)),
    maxStamina: Math.floor(60 + (lvl - 1) * 2 + (a.dex - 5)),
    maxRage: 100,
    maxEnergy: 100,
    atk: Math.floor((10 + a.str * 2 + (lvl - 1) * 1.5 + weaponAtk) * (cls.atk || 1)),
    magAtk: Math.floor((8 + a.int * 2 + a.wis + (lvl - 1) * 1.2 + weaponMag) * (cls.mag || 1)),
    def: Math.floor(2 + a.con * 1.5 + (lvl - 1) * 0.8 + armorDef),
    magDef: Math.floor(2 + a.wis * 1.5 + (lvl - 1) * 0.6),
    speed: Math.floor(10 + a.dex + (lvl - 1) * 0.5),
    critChance: 0.05 + a.dex * 0.001,
    critDamage: 1.5,
    dodge: 0.02 + a.dex * 0.001,
    parry: 0.02 + (a.str + a.dex) * 0.0008,
    block: 0.02 + a.con * 0.001,
    // base elemental resistances 0..0.5
    resistances: {
      physical: 0, fire: 0, ice: 0, lightning: 0, earth: 0, wind: 0,
      water: 0, light: 0, shadow: 0, poison: 0.05, arcane: 0,
    },
    weight: 0, // encumbrance handled by inventory helpers
  };
}

function applyClassBonuses(p) {
  // racial perks get applied at creation; class gives attribute bonus
  const cls = CLASSES[p.class];
  if (!cls) return;
  p.attributes[cls.primary] += 2;
  // subclass passive hooks live in skills.js
}

// ---------- PLAYER FACTORY ----------
function createPlayer(userId, username) {
  const p = {
    id: userId,
    name: username,
    // character
    race: null,            // set at creation via /char create
    class: "none",
    subclass: null,
    appearance: { hair: "brown", hairStyle: "short", skin: "fair", eyes: "brown", height: "average", build: "average", markings: "none", voice: "default" },
    title: null,
    // attributes (start 5 each, 10 free points to spend)
    attributes: { str: 5, dex: 5, con: 5, int: 5, wis: 5, cha: 5 },
    unspentAttrPoints: 10,
    // vitals — fixed base: 100 HP / 50 MP / 60 stamina (max* = the caps)
    hp: 100, mp: 50, stamina: 60,
    maxHp: 100, maxMp: 50, maxStamina: 60,
    rage: 0, energy: 100,
    // progression
    level: 1, exp: 0, prestige: 0,
    nextExp: xpForLevel(1),
    talentPoints: 1, perkPoints: 0, skillPoints: 0,
    // combat stats (recomputed via computeDerived)
    atk: 10, magAtk: 8, def: 2, magDef: 2, speed: 15,
    critChance: 0.05, critDamage: 1.5, dodge: 0.02, parry: 0.02, block: 0.02,
    resistances: { physical: 0, fire: 0, ice: 0, lightning: 0, earth: 0, wind: 0, water: 0, light: 0, shadow: 0, poison: 0.05, arcane: 0 },
    // combat state
    statusEffects: [],        // [{id, stacks, duration, potency, source}]
    activeBuffs: {},
    cooldowns: {},            // abilityId -> remaining turns
    combo: 0,
    momentum: 0,
    killStreak: 0,
    stance: "balanced",       // STANCES id
    counterWindow: false,     // parried -> next attack buffed
    guarding: false,
    mastery: {},              // weapon type -> mastery points
    petXp: {},                // pet name -> xp
    mountXp: {},
    companionXp: {},
    seasonXp: 0,
    challengesCompleted: 0,
    // resources & economy
    gold: WORLD.STARTING_GOLD,
    bankGold: 0,
    currencies: {},           // gems, tokens, faction/guild/dungeon/raid/event/crafting/trade
    inventory: { "Health Potion (S)": 3, "Iron Ore": 2, "Oak Log": 5 },
    bankItems: {},
    storageItems: {},         // housing storage
    equipped: { weapon: null, offhand: null, armor: null, helm: null, boots: null, gloves: null, amulet: null, ring1: null, ring2: null, relic: null },
    loadouts: {},             // name -> {equipped}
    // world state
    zone: 1,
    explored: new Set([1]),
    waypoints: new Set([1]),
    fastTravelPoints: [],
    // gathering & professions
    skills: { mining: 1, woodcutting: 1, fishing: 1, foraging: 1, hunting: 1, farming: 1 },
    professions: { blacksmithing: 1, alchemy: 1, cooking: 1, enchanting: 1, tailoring: 1, jewelcrafting: 1, inscription: 1, carpentry: 1 },
    // skill trees: class abilities learned; talent tree spent points
    abilities: [],            // learned ability ids
    passives: [],             // learned passive ids
    ultimate: null,
    talentTree: {},           // nodeId -> rank
    // social
    partyId: null,
    guildId: null,
    factionId: null,
    reputation: {},           // factionId -> rep
    karma: 0, morality: 0,    // -100..100
    friends: [],
    // quests & collection
    quests: { active: [], completed: [], dailyDone: 0, weeklyDone: 0 },
    achievements: new Set(),
    bestiary: new Set(),      // enemy ids killed
    codex: new Set(),
    collections: { cards: new Set(), trophies: new Set(), relics: new Set() },
    // pets / mounts / companions
    pets: [], mounts: [], companions: [], activePet: null, activeMount: null,
    // housing
    house: null, furniture: {},
    // misc meta
    mode: "none",             // HARD_MODE value
    difficulty: "normal",
    deaths: 0, kills: 0, pvpWins: 0, pvpLosses: 0, playtimeMin: 0,
    lastDaily: 0, lastWeekly: 0,
    createdAt: Date.now(),
    settings: { colorblind: false, reducedMotion: false, damageNumbers: true, compactMode: false },
    // generated display
    statMultipliers: { xp: 1, gold: 1, loot: 1 },
  };
  return p;
}

/** Get or create a player record (discord id -> player). */
function getOrCreatePlayer(userId, username) {
  if (!players.has(userId)) {
    players.set(userId, createPlayer(userId, username));
  }
  return players.get(userId);
}

function savePlayer(p) {
  players.set(p.id, p);
}

// ---------- INVENTORY HELPERS ----------
function countItem(p, item) { return p.inventory[item] || 0; }
function hasItems(p, req) { return Object.entries(req).every(([k, v]) => countItem(p, k) >= v); }
function addItem(p, item, n = 1) { p.inventory[item] = (p.inventory[item] || 0) + n; }
function removeItem(p, item, n = 1) {
  const cur = p.inventory[item] || 0;
  if (cur <= n) delete p.inventory[item];
  else p.inventory[item] = cur - n;
}
function consumeItems(p, req) {
  for (const [k, v] of Object.entries(req)) removeItem(p, k, v);
}

// ---------- XP / LEVEL HELPERS (curve in util.xpForLevel) ----------
function addExp(p, amount, { xpMult = 1 } = {}) {
  const gained = Math.floor(amount * xpMult * p.statMultipliers.xp);
  p.exp += gained;
  let leveled = false;
  while (p.level < WORLD.MAX_LEVEL && p.exp >= p.nextExp) {
    p.exp -= p.nextExp;
    p.level += 1;
    p.talentPoints += 1;
    p.skillPoints += 1;
    p.unspentAttrPoints += 1;
    p.nextExp = xpForLevel(p.level);
    leveled = true;
    onLevelUp(p);
  }
  return { gained, leveled, level: p.level };
}

function xpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.7));
}

function onLevelUp(p) {
  const d = computeDerived(p);
  p.maxHp = d.maxHp; p.maxMp = d.maxMp; p.maxStamina = d.maxStamina;
  p.hp = d.maxHp; p.mp = d.maxMp; p.stamina = d.maxStamina;
  p.atk = d.atk; p.magAtk = d.magAtk; p.def = d.def; p.magDef = d.magDef;
  p.speed = d.speed; p.critChance = d.critChance; p.critDamage = d.critDamage;
  p.dodge = d.dodge; p.parry = d.parry; p.block = d.block;
  p.resistances = { ...p.resistances, ...d.resistances };
}

/** Recompute derived stats (after attribute spend / equip). */
function refreshStats(p) {
  const d = computeDerived(p);
  p.maxHp = d.maxHp; p.maxMp = d.maxMp; p.maxStamina = d.maxStamina;
  p.atk = d.atk; p.magAtk = d.magAtk; p.def = d.def; p.magDef = d.magDef;
  p.speed = d.speed; p.critChance = d.critChance; p.critDamage = d.critDamage;
  p.dodge = d.dodge; p.parry = d.parry; p.block = d.block;
  p.hp = clamp(p.hp, 1, p.maxHp);
  p.mp = clamp(p.mp, 0, p.maxMp);
  p.stamina = clamp(p.stamina, 0, p.maxStamina);
  return d;
}

// ---------- PARTY ----------
function createParty(leaderPlayer) {
  const id = `party_${leaderPlayer.id}`;
  const party = { id, leader: leaderPlayer.id, members: [leaderPlayer], maxSize: 4, lootMode: "round_robin", createdAt: Date.now() };
  parties.set(id, party);
  leaderPlayer.partyId = id;
  return party;
}

function getParty(p) { return p.partyId ? parties.get(p.partyId) : null; }

// ---------- GUILD ----------
function createGuild(name, founderPlayer) {
  const id = `guild_${founderPlayer.id}`;
  const guild = {
    id, name, leader: founderPlayer.id, members: [founderPlayer],
    rank: 1, xp: 0, gold: 0, bank: {}, territory: [], hall: null,
    banner: { color: "#5865f2", emblem: "🛡️" }, createdAt: Date.now(),
    allies: [], enemies: [], wars: [],
  };
  guilds.set(id, guild);
  founderPlayer.guildId = id;
  return guild;
}

function getGuild(p) { return p.guildId ? guilds.get(p.guildId) : null; }

// ---------- PERSISTENCE ----------
function serializeEntity(e) {
  if (e instanceof Set) return { __set: true, values: [...e] };
  if (e instanceof Map) return { __map: true, values: [...e.entries()] };
  if (Array.isArray(e)) return e.map(serializeEntity);
  if (e && typeof e === "object") {
    const out = {};
    for (const [k, v] of Object.entries(e)) out[k] = serializeEntity(v);
    return out;
  }
  return e;
}

function serializeAll() {
  return {
    players: [...players.entries()].map(([id, p]) => [id, serializeEntity(p)]),
  };
}

function deserializeEntity(o) {
  if (o && typeof o === "object" && o.__set) return new Set(o.values);
  if (o && typeof o === "object" && o.__map) return new Map(o.values);
  if (Array.isArray(o)) return o.map(deserializeEntity);
  if (o && typeof o === "object") {
    const out = {};
    for (const [k, v] of Object.entries(o)) out[k] = deserializeEntity(v);
    return out;
  }
  return o;
}

function saveAll() {
  try {
    fs.mkdirSync(path.dirname(SAVE_FILE), { recursive: true });
    fs.writeFileSync(SAVE_FILE, JSON.stringify(serializeAll(), null, 2));
    return true;
  } catch (e) { console.error("save failed:", e.message); return false; }
}

function loadAll() {
  try {
    if (!fs.existsSync(SAVE_FILE)) return false;
    const data = JSON.parse(fs.readFileSync(SAVE_FILE, "utf8"));
    for (const [id, p] of data.players || []) {
      const player = deserializeEntity(p);
      player.nextExp = xpForLevel(player.level);
      players.set(id, player);
    }
    return players.size > 0;
  } catch (e) { console.error("load failed:", e.message); return false; }
}

module.exports = {
  players, parties, guilds, activeBattles,
  createPlayer, getOrCreatePlayer, savePlayer,
  computeDerived, refreshStats, addExp, xpForLevel, onLevelUp,
  countItem, hasItems, addItem, removeItem, consumeItems,
  createParty, getParty, createGuild, getGuild,
  saveAll, loadAll,
};
});

// ---------------------- embedded module: src/core/statusEffects ----------------------
__def("src/core/statusEffects", function (module, exports, require) {
// ============================================================
// statusEffects.js — DATA-DRIVEN STATUS EFFECT ENGINE
// Pure Node (no discord.js, no openai). Imports only config.js
// (ELEMENTS) and util.js (clamp).
//
// Design:
//  - STATUS_EFFECTS is a static catalog keyed by snake_case id.
//    Every effect carries: id, name, type, element, duration,
//    maxStacks, stacking, cleanseable, dispellable, power,
//    description, emoji — plus optional extras (stat/stats for
//    stat modifiers, trigger for special effects, heal/dmg for
//    tick effects, reflectFlat/reflectPct, damageTakenMult, ...).
//  - Runtime statuses are plain objects on entity.statusEffects:
//    { id, stacks, duration, potency, source }.
//  - duration semantics: N = active for N ticks (decremented in
//    tickStatuses), 0 = instant (consumed by combat, never ticks),
//    -1 = persistent (never expires on its own).
// ============================================================

const { ELEMENTS } = require("../config");
const { clamp } = require("../util");

// ---- constants & validation helpers --------------------------

const VALID_TYPES = new Set(["dot", "cc", "buff", "debuff", "resource", "aura", "movement", "special"]);
const VALID_STACKING = new Set(["none", "stack", "intensify"]);
const VALID_ELEMENTS = new Set([...ELEMENTS, "none"]);
const REQUIRED_FIELDS = ["id", "name", "type", "element", "duration", "maxStacks", "stacking", "cleanseable", "dispellable", "power", "description", "emoji"];

// The spec mandates exactly this many effect ids. A load-time
// mismatch means someone added/removed an entry without updating
// the catalog — better to fail loudly at boot than mid-combat.
const EXPECTED_EFFECT_COUNT = 109;

/**
 * Compact factory for catalog entries. All fields are positional;
 * optional extras (stat/stats/trigger/heal/dmg/...) spread last.
 * Entries are frozen so the catalog is immutable at runtime.
 */
function eff(id, name, type, element, duration, maxStacks, stacking, cleanseable, dispellable, power, description, emoji, extra = {}) {
  return Object.freeze({
    id, name, type, element, duration, maxStacks, stacking,
    cleanseable, dispellable, power, description, emoji,
    ...extra,
  });
}

// ============================================================
// STATUS_EFFECTS — the catalog (109 effects)
// ============================================================
const STATUS_EFFECTS = {
  // ---------- DoTs (damage over time) ----------
  burn:             eff("burn",             "Burn",             "dot",       "fire",     3, 5,  "intensify", true,  false, 12,  "Fire damage each turn; stacks intensify the flames.",     "🔥", { dmg: 12 }),
  poison:           eff("poison",           "Poison",           "dot",       "poison",   4, 5,  "stack",     true,  false, 10,  "Poison damage each turn; stacks up to 5.",                "☠️", { dmg: 10 }),
  bleed:            eff("bleed",            "Bleed",            "dot",       "physical", 3, 3,  "stack",     true,  false, 8,   "Physical damage each turn; stacks up to 3.",              "🩸", { dmg: 8 }),
  frostbite:        eff("frostbite",        "Frostbite",        "dot",       "ice",      3, 3,  "intensify", true,  false, 12,  "Ice damage each turn; also chills the target.",           "🧊", { dmg: 12 }),
  shock:            eff("shock",            "Shock",            "dot",       "lightning",2, 4,  "stack",     true,  false, 10,  "Lightning damage; high stacks may stun.",                 "⚡", { dmg: 10 }),
  damage_over_time: eff("damage_over_time", "Damage Over Time", "dot",       "none",     3, 5,  "stack",     true,  false, 10,  "Generic damage over time.",                               "⏳", { dmg: 10 }),

  // ---------- CC (crowd control) ----------
  freeze:     eff("freeze",     "Freeze",     "cc",     "ice",      2, 1, "none", true,  false, 0,   "Frozen solid: cannot act; shatters on damage.",              "❄️", { trigger: "on hit: shatters" }),
  stun:       eff("stun",       "Stun",       "cc",     "none",     1, 1, "none", true,  false, 0,   "Stunned: cannot act.",                                       "💫"),
  root:       eff("root",       "Root",       "cc",     "earth",    2, 1, "none", true,  false, 0,   "Rooted: cannot move.",                                      "🌿"),
  silence:    eff("silence",    "Silence",    "cc",     "arcane",   2, 1, "none", true,  false, 0,   "Silenced: cannot cast spells.",                             "🔇"),
  blind:      eff("blind",      "Blind",      "cc",     "shadow",   2, 1, "none", true,  false, 50,  "Blinded: attacks have a 50% miss chance.",                  "🕶️"),
  fear:       eff("fear",       "Fear",       "cc",     "shadow",   2, 1, "none", true,  false, 0,   "Feared: flees and cannot act.",                             "😱"),
  confuse:    eff("confuse",    "Confuse",    "cc",     "arcane",   2, 1, "none", true,  false, 0,   "Confused: attacks random targets.",                         "🥴"),
  sleep:      eff("sleep",      "Sleep",      "cc",     "arcane",   3, 1, "none", true,  false, 0,   "Asleep: cannot act until damaged.",                         "💤"),
  taunt:      eff("taunt",      "Taunt",      "cc",     "none",     2, 1, "none", true,  false, 0,   "Taunted: forced to attack the taunter.",                    "😤"),
  disarm:     eff("disarm",     "Disarm",     "cc",     "physical", 2, 1, "none", true,  false, 40,  "Disarmed: weapon attacks disabled (-40% atk).",             "🗡️", { stat: { stat: "atk", mult: 0.6 } }),
  knockback:  eff("knockback",  "Knockback",  "cc",     "physical", 1, 1, "none", true,  false, 2,   "Knocked back 2 tiles.",                                     "🏏", { trigger: "on hit: knock target back 2 tiles" }),
  pull:       eff("pull",       "Pull",       "cc",     "physical", 1, 1, "none", true,  false, 2,   "Pulled 2 tiles toward the caster.",                         "🪝", { trigger: "on hit: pull target 2 tiles closer" }),
  push:       eff("push",       "Push",       "cc",     "physical", 1, 1, "none", true,  false, 1,   "Pushed 1 tile.",                                            "🫸", { trigger: "on hit: push target 1 tile" }),
  launch:     eff("launch",     "Launch",     "cc",     "wind",     1, 1, "none", true,  false, 1,   "Launched airborne for 1 turn.",                             "🚀", { trigger: "on hit: launch target airborne" }),
  slam:       eff("slam",       "Slam",       "cc",     "earth",    1, 1, "none", true,  false, 50,  "Slammed: 1-turn stun + 50% splash to neighbors.",           "🔨", { trigger: "on hit: slam target with splash" }),

  // ---------- Buffs ----------
  regeneration:       eff("regeneration",       "Regeneration",       "buff",    "none",     5, 1,  "none", false, true,  20,  "Restores 20 HP each turn.",                                       "💚", { heal: true }),
  heal_over_time:     eff("heal_over_time",     "Heal Over Time",     "buff",    "none",     3, 1,  "none", false, true,  15,  "Restores HP each turn.",                                           "💖", { heal: true, dmg: 15 }),
  lifesteal:          eff("lifesteal",          "Lifesteal",          "buff",    "none",     3, 1,  "none", false, true,  15,  "Heal 15% of damage you deal.",                                     "🧛", { trigger: "on dealing damage: heal % of damage dealt" }),
  mana_steal:         eff("mana_steal",         "Mana Steal",         "buff",    "none",     3, 1,  "none", false, true,  10,  "Restore 10% of damage dealt as mana.",                             "💙", { trigger: "on dealing damage: restore mana" }),
  haste:              eff("haste",              "Haste",              "buff",    "none",     3, 1,  "none", false, true,  50,  "+50% movement speed.",                                             "💨", { stat: { stat: "speed", mult: 1.5 } }),
  berserk:            eff("berserk",            "Berserk",            "buff",    "none",     3, 1,  "none", false, true,  30,  "+30% attack, -15% defense.",                                      "😡", { stats: [{ stat: "atk", mult: 1.3 }, { stat: "def", mult: 0.85 }] }),
  rage:               eff("rage",               "Rage",               "buff",    "none",     4, 1,  "none", false, true,  15,  "+15% attack; builds the rage resource.",                           "🤬", { stat: { stat: "atk", mult: 1.15 } }),
  focus:              eff("focus",              "Focus",              "buff",    "none",     3, 1,  "none", false, true,  15,  "+15% magic attack, +5% crit chance.",                              "🧘", { stats: [{ stat: "magAtk", mult: 1.15 }, { stat: "critChance", flat: 0.05 }] }),
  precision:          eff("precision",          "Precision",          "buff",    "none",     3, 1,  "none", false, true,  10,  "+10% crit chance.",                                                "🎯", { stat: { stat: "critChance", flat: 0.1 } }),
  crit_boost:         eff("crit_boost",         "Crit Boost",         "buff",    "none",     3, 1,  "none", false, true,  15,  "+15% crit chance.",                                                "💥", { stat: { stat: "critChance", flat: 0.15 } }),
  dodge_boost:        eff("dodge_boost",        "Dodge Boost",        "buff",    "none",     3, 1,  "none", false, true,  10,  "+10% dodge chance.",                                               "💃", { stat: { stat: "dodge", flat: 0.1 } }),
  parry_boost:        eff("parry_boost",        "Parry Boost",        "buff",    "none",     3, 1,  "none", false, true,  10,  "+10% parry chance.",                                               "🤺", { stat: { stat: "parry", flat: 0.1 } }),
  block_boost:        eff("block_boost",        "Block Boost",        "buff",    "none",     3, 1,  "none", false, true,  10,  "+10% block chance.",                                               "🪨", { stat: { stat: "block", flat: 0.1 } }),
  invisibility:       eff("invisibility",       "Invisibility",       "buff",    "none",     2, 1,  "none", false, true,  50,  "Invisible: immune to single-target attacks.",                      "👻", { stat: { stat: "dodge", flat: 0.5 } }),
  camouflage:         eff("camouflage",         "Camouflage",         "buff",    "none",     3, 1,  "none", false, true,  10,  "Camouflaged: harder to hit.",                                      "🦎", { stat: { stat: "dodge", flat: 0.1 } }),
  stealth:            eff("stealth",            "Stealth",            "buff",    "none",     3, 1,  "none", false, true,  20,  "Stealthed: +20% dodge; next attack crits.",                        "🌫️", { stat: { stat: "dodge", flat: 0.2 } }),
  thorns:             eff("thorns",             "Thorns",             "buff",    "none",     4, 1,  "none", false, true,  15,  "Reflects 15 damage to melee attackers.",                           "🌵", { reflectFlat: 15 }),
  reflection:         eff("reflection",         "Reflection",         "buff",    "none",     3, 1,  "none", false, true,  30,  "Reflects 30% of incoming damage.",                                 "🪞", { reflectPct: 0.3 }),
  immunity:           eff("immunity",           "Immunity",           "buff",    "none",     2, 1,  "none", false, false, 0,   "Immune to all status effects.",                                    "🚫"),
  invincibility:      eff("invincibility",      "Invincibility",      "buff",    "none",     1, 1,  "none", false, false, 0,   "Invincible: takes no damage.",                                     "💠"),
  weapon_enchant:     eff("weapon_enchant",     "Weapon Enchant",     "buff",    "none",     4, 1,  "none", false, true,  15,  "Weapon attacks deal +15 bonus damage.",                            "⚒️", { trigger: "on attack: +bonus damage", onHitBonus: 15 }),
  elemental_infusion: eff("elemental_infusion", "Elemental Infusion", "buff",    "none",     4, 1,  "none", false, true,  15,  "Attacks gain +15 elemental damage.",                               "🎆", { trigger: "on attack: attacks gain an element", onHitBonus: 15 }),
  combo_boost:        eff("combo_boost",        "Combo Boost",        "buff",    "none",     3, 1,  "none", false, true,  25,  "Combo attacks deal +25% damage.",                                  "🔗", { trigger: "on combo hit", comboMult: 1.25 }),
  cooldown_reduction: eff("cooldown_reduction", "Cooldown Reduction", "buff",    "none",     4, 1,  "none", false, true,  20,  "Ability cooldowns tick 20% faster.",                               "⏱️", { cdrPct: 0.2 }),
  mana_reduction:     eff("mana_reduction",     "Mana Reduction",     "buff",    "none",     4, 1,  "none", false, true,  30,  "Spell mana costs reduced 30%.",                                    "🧪", { manaCostMult: 0.7 }),
  stamina_recovery:   eff("stamina_recovery",   "Stamina Recovery",   "buff",    "none",     4, 1,  "none", false, true,  5,   "Restores 5 stamina per turn.",                                     "🍗", { trigger: "each turn: restore stamina" }),
  low_health_boost:   eff("low_health_boost",   "Low Health Boost",   "buff",    "none",     2, 1,  "none", false, true,  20,  "+20% attack while below 25% HP.",                                  "💓", { trigger: "when HP ≤ 25%", stat: { stat: "atk", mult: 1.2 } }),
  full_health_bonus:  eff("full_health_bonus",  "Full Health Bonus",  "buff",    "none",     2, 1,  "none", false, true,  10,  "+10% attack and defense at full HP.",                              "💯", { trigger: "at full HP", stats: [{ stat: "atk", mult: 1.1 }, { stat: "def", mult: 1.1 }] }),
  first_hit_bonus:    eff("first_hit_bonus",    "First Hit Bonus",    "buff",    "none",     1, 1,  "none", false, true,  25,  "+25% attack on the first hit of combat.",                          "🏁", { trigger: "first attack of combat", stat: { stat: "atk", mult: 1.25 } }),
  backstab_bonus:     eff("backstab_bonus",     "Backstab Bonus",     "buff",    "none",     1, 1,  "none", false, true,  25,  "+25% crit chance when attacking from behind.",                     "🔪", { trigger: "on attack from behind", stats: [{ stat: "critChance", flat: 0.25 }, { stat: "atk", mult: 1.2 }] }),
  headshot_bonus:     eff("headshot_bonus",     "Headshot Bonus",     "buff",    "none",     1, 1,  "none", false, true,  30,  "+30% crit chance on ranged headshots.",                            "🧠", { trigger: "on ranged headshot", stat: { stat: "critChance", flat: 0.3 } }),
  charge_attack_bonus:eff("charge_attack_bonus","Charge Attack Bonus","buff",   "none",     1, 1,  "none", false, true,  50,  "+50% attack on fully charged attacks.",                            "🏋️", { trigger: "on fully charged attack", stat: { stat: "atk", mult: 1.5 } }),
  kill_streak_boost:  eff("kill_streak_boost",  "Kill Streak Boost",  "buff",    "none",     3, 10, "stack", false, true,  10,  "+10% attack per stack; gained on kills.",                          "🎇", { trigger: "after each kill: +1 stack", stat: { stat: "atk", mult: 1.1 } }),
  revenge_damage:     eff("revenge_damage",     "Revenge Damage",     "buff",    "none",     2, 1,  "none", false, true,  20,  "+20% attack after taking damage.",                                 "💢", { trigger: "on taking damage", stat: { stat: "atk", mult: 1.2 } }),
  counterattack:      eff("counterattack",      "Counterattack",      "buff",    "none",     2, 1,  "none", false, true,  50,  "Retaliate 50% of incoming damage.",                                "🥊", { trigger: "on taking damage: retaliate" }),
  perfect_dodge_reward: eff("perfect_dodge_reward", "Perfect Dodge Reward", "buff", "none", 2, 1, "none", false, true, 10,  "+5% dodge and +10% attack after a perfect dodge.",                 "🌠", { trigger: "on perfect dodge", stats: [{ stat: "dodge", flat: 0.05 }, { stat: "atk", mult: 1.1 }] }),
  perfect_block_reward: eff("perfect_block_reward", "Perfect Block Reward", "buff", "none", 2, 1, "none", false, true, 15,  "+15% defense after a perfect block.",                              "🏅", { trigger: "on perfect block", stat: { stat: "def", mult: 1.15 } }),
  last_stand:         eff("last_stand",         "Last Stand",         "buff",    "none",     3, 1,  "none", false, false, 50,  "+50% defense and +20% attack below 20% HP.",                       "🗿", { trigger: "when HP ≤ 20%", stats: [{ stat: "def", mult: 1.5 }, { stat: "atk", mult: 1.2 }] }),
  cheat_death:        eff("cheat_death",        "Cheat Death",        "buff",    "none",     -1, 1,  "none", false, false, 1,   "Survive a lethal hit at 1 HP (once).",                             "🃏", { trigger: "on lethal hit: survive at 1 HP" }),
  momentum:           eff("momentum",           "Momentum",           "buff",    "none",     5, 10, "stack", false, true,  1,   "+1 speed per stack; gains a stack each turn.",                     "🎢", { trigger: "each turn: +1 stack", stat: { stat: "speed", flat: 1 } }),
  stacking_damage:    eff("stacking_damage",    "Stacking Damage",    "buff",    "none",     5, 10, "stack", false, true,  5,   "+5% attack per stack on hit.",                                     "📈", { trigger: "on hit: +1 stack", stat: { stat: "atk", mult: 1.05 } }),
  stacking_defense:   eff("stacking_defense",   "Stacking Defense",   "buff",    "none",     5, 10, "stack", false, true,  5,   "+5% defense per stack when hit.",                                  "⛰️", { trigger: "on being hit: +1 stack", stat: { stat: "def", mult: 1.05 } }),
  escalating_speed:   eff("escalating_speed",   "Escalating Speed",   "buff",    "none",     5, 10, "stack", false, true,  5,   "+5% speed per stack each turn.",                                   "🚄", { trigger: "each turn: +1 stack", stat: { stat: "speed", mult: 1.05 } }),
  adaptive_resistance:eff("adaptive_resistance","Adaptive Resistance","buff",   "none",     4, 3,  "stack", false, true,  10,  "Gain +10% resistance to the last element hit.",                    "🧬", { trigger: "on taking damage: adapt to element", adaptResist: 0.1 }),

  // ---------- Debuffs ----------
  weaken:           eff("weaken",           "Weaken",           "debuff", "none",     3, 1, "none", true, false, 15, "-15% attack.",                         "📉", { stat: { stat: "atk", mult: 0.85 } }),
  armor_break:      eff("armor_break",      "Armor Break",      "debuff", "physical", 3, 3, "stack", true, false, 20, "-20% defense; stacks.",               "💔", { stat: { stat: "def", mult: 0.8 } }),
  resistance_break: eff("resistance_break", "Resistance Break", "debuff", "arcane",   3, 3, "stack", true, false, 20, "-20% magic defense; stacks.",         "🧿", { stat: { stat: "magDef", mult: 0.8 } }),
  vulnerability:    eff("vulnerability",    "Vulnerability",    "debuff", "none",     3, 1, "none", true, false, 25, "Takes 25% more damage.",              "📛", { damageTakenMult: 1.25 }),
  mark:             eff("mark",             "Mark",             "debuff", "none",     3, 1, "none", true, false, 15, "Marked: takes 15% more damage.",       "📍", { damageTakenMult: 1.15 }),
  curse:            eff("curse",            "Curse",            "debuff", "shadow",   4, 3, "stack", true, false, 10, "-10% to all stats; stacks.",           "🪬", { stats: [{ stat: "atk", mult: 0.9 }, { stat: "magAtk", mult: 0.9 }, { stat: "def", mult: 0.9 }, { stat: "magDef", mult: 0.9 }, { stat: "speed", mult: 0.9 }] }),
  slow:             eff("slow",             "Slow",             "debuff", "none",     3, 3, "stack", true, false, 50, "-50% movement speed; stacks.",        "🐢", { stat: { stat: "speed", mult: 0.5 } }),
  chill:            eff("chill",            "Chill",            "debuff", "ice",      2, 3, "stack", true, false, 30, "-30% speed; 3 stacks may freeze.",     "🌬️", { stat: { stat: "speed", mult: 0.7 } }),

  // ---------- Resource (damage-absorbing pools) ----------
  shield:          eff("shield",          "Shield",          "resource", "none", 5, 1, "none", false, true, 50,  "Absorbs up to 50 damage before breaking.",           "🛡️"),
  barrier:         eff("barrier",         "Barrier",         "resource", "none", 1, 1, "none", false, true, 500, "Absorbs all damage for 1 turn.",                      "🧱"),
  overheal_shield: eff("overheal_shield", "Overheal Shield", "resource", "none", 3, 1, "none", false, true, 30,  "Excess healing becomes a shield (up to 30).",         "💗"),
  absorption:      eff("absorption",      "Absorption",      "resource", "none", 4, 1, "none", false, true, 50,  "Absorbs up to 50 damage.",                            "🧽"),

  // ---------- Auras (affect allies/enemies in radius; combat layer applies radius logic) ----------
  area_aura:       eff("area_aura",       "Area Aura",       "aura", "none",     5, 1, "none", false, true, 2,  "Radiates an aura in a 2-tile radius.",               "🔅"),
  healing_aura:    eff("healing_aura",    "Healing Aura",    "aura", "none",     5, 1, "none", false, true, 12, "Heals carrier and nearby allies 12 HP per turn.",     "🩹", { heal: true }),
  damage_aura:     eff("damage_aura",     "Damage Aura",     "aura", "none",     5, 1, "none", false, true, 12, "Deals 12 damage per turn to enemies in radius.",      "☄️"),
  speed_aura:      eff("speed_aura",      "Speed Aura",      "aura", "none",     5, 1, "none", false, true, 15, "Allies in radius gain +15% speed.",                   "🌪️", { stat: { stat: "speed", mult: 1.15 } }),
  defense_aura:    eff("defense_aura",    "Defense Aura",    "aura", "none",     5, 1, "none", false, true, 15, "Allies in radius gain +15% defense.",                 "🏰", { stat: { stat: "def", mult: 1.15 } }),
  attack_aura:     eff("attack_aura",     "Attack Aura",     "aura", "none",     5, 1, "none", false, true, 15, "Allies in radius gain +15% attack.",                  "⚔️", { stat: { stat: "atk", mult: 1.15 } }),
  mana_regen_aura: eff("mana_regen_aura", "Mana Regen Aura", "aura", "none",     5, 1, "none", false, true, 5,  "Allies in radius regain 5 mana per turn.",            "💧"),
  stealth_aura:    eff("stealth_aura",    "Stealth Aura",    "aura", "none",     5, 1, "none", false, true, 2,  "Allies in radius gain stealth.",                      "🌒"),

  // ---------- Movement (instant repositioning; duration 0) ----------
  teleport: eff("teleport", "Teleport", "movement", "arcane",   0, 1, "none", false, false, 999, "Teleport anywhere in the zone.",        "🌀", { trigger: "on use: teleport to any tile" }),
  dash:     eff("dash",     "Dash",     "movement", "none",     0, 1, "none", false, false, 3,   "Dash 3 tiles instantly.",                "🏃", { trigger: "on use: dash 3 tiles" }),
  blink:    eff("blink",    "Blink",    "movement", "arcane",   0, 1, "none", false, false, 5,   "Blink 5 tiles, ignoring obstacles.",     "🫥", { trigger: "on use: blink 5 tiles" }),
  leap:     eff("leap",     "Leap",     "movement", "physical", 0, 1, "none", false, false, 2,   "Leap 2 tiles onto a target.",            "🦘", { trigger: "on use: leap 2 tiles" }),

  // ---------- Special / trigger effects (duration 0 = instant, -1 = persists until consumed) ----------
  cleanse:          eff("cleanse",          "Cleanse",          "special", "light",     0, 1, "none", false, false, 0,  "Remove all cleanseable debuffs.",                 "🧼", { trigger: "on use: cleanse self/target" }),
  dispel:           eff("dispel",           "Dispel",           "special", "arcane",   0, 1, "none", false, false, 0,  "Remove all dispellable buffs.",                   "🧹", { trigger: "on use: dispel target" }),
  revival:          eff("revival",          "Revival",          "special", "light",     -1, 1, "none", false, false, 50, "On death: revive with 50% HP (once).",            "🌟", { trigger: "on death: revive at 50% HP" }),
  resurrection:     eff("resurrection",     "Resurrection",     "special", "light",     -1, 1, "none", false, false, 100,"On death: revive with 100% HP (once).",           "✨", { trigger: "on death: revive at full HP" }),
  summon:           eff("summon",           "Summon",           "special", "arcane",   4, 1, "none", false, false, 1,  "Summon a minion ally for 4 turns.",                "🪄", { trigger: "on use: spawn a minion" }),
  clone:            eff("clone",            "Clone",            "special", "arcane",   3, 1, "none", false, false, 50, "Create a clone with 50% of your stats.",           "👥", { trigger: "on use: spawn a clone" }),
  decoy:            eff("decoy",            "Decoy",            "special", "none",     2, 1, "none", false, false, 0,  "Create a decoy that draws enemy attacks.",         "🪆", { trigger: "on use: spawn a decoy" }),
  transformation:   eff("transformation",   "Transformation",   "special", "arcane",   5, 1, "none", false, false, 25, "Transform: +25% attack, +10% defense.",            "🐉", { trigger: "on use: transform", stats: [{ stat: "atk", mult: 1.25 }, { stat: "def", mult: 1.1 }] }),
  shapeshift:       eff("shapeshift",       "Shapeshift",       "special", "physical", 5, 1, "none", false, false, 30, "Bestial form: +30% attack, +20% speed.",           "🐺", { trigger: "on use: shapeshift", stats: [{ stat: "atk", mult: 1.3 }, { stat: "speed", mult: 1.2 }] }),
  combo_reset:      eff("combo_reset",      "Combo Reset",      "special", "none",     0, 1, "none", false, false, 0,  "Reset combo count to 0.",                         "♻️", { trigger: "on use: reset combo" }),
  cooldown_refresh: eff("cooldown_refresh", "Cooldown Refresh", "special", "none",     0, 1, "none", false, false, 0,  "Refresh all ability cooldowns.",                  "🔄", { trigger: "on use: reset all cooldowns" }),
  execute:          eff("execute",          "Execute",          "special", "physical", 0, 1, "none", false, false, 30, "Deal massive damage to targets below 30% HP.",    "⚰️", { trigger: "on attack: if target HP < 30%" }),
  instant_kill:     eff("instant_kill",     "Instant Kill",     "special", "shadow",   0, 1, "none", false, false, 5,  "5% chance to instantly kill on hit.",             "💀", { trigger: "on hit: chance to kill instantly" }),
  crit_heal:        eff("crit_heal",        "Crit Heal",        "special", "light",    0, 1, "none", false, false, 15, "Heal 15 HP on critical hits.",                    "💉", { trigger: "on crit: heal" }),
  chain_lightning:  eff("chain_lightning",  "Chain Lightning",  "special", "lightning",0, 1, "none", false, false, 3,  "Arc to 3 additional targets.",                    "🌩️", { trigger: "on cast: jump to nearby targets" }),
  splash:           eff("splash",           "Splash",           "special", "water",    0, 1, "none", false, false, 50, "Deal 50% splash damage to adjacent targets.",     "💦", { trigger: "on hit: splash adjacent targets" }),
  piercing:         eff("piercing",         "Piercing",         "special", "physical", 0, 1, "none", false, false, 50, "Pierce through targets, ignoring 50% defense.",   "🏹", { trigger: "on hit: ignore 50% defense" }),
  ricochet:         eff("ricochet",         "Ricochet",         "special", "physical", 0, 1, "none", false, false, 1,  "Ricochet to 1 additional target.",                "🏓", { trigger: "on hit: bounce to another target" }),
  homing:           eff("homing",           "Homing",           "special", "arcane",   0, 1, "none", false, false, 100,"Projectile cannot miss.",                         "🧲", { trigger: "on attack: guaranteed hit" }),
  explosion:        eff("explosion",        "Explosion",        "special", "fire",     0, 1, "none", false, false, 30, "Explode for 30 AoE damage.",                      "🧨", { trigger: "on impact: AoE damage" }),
};

const STATUS_IDS = Object.freeze(Object.keys(STATUS_EFFECTS));

// ---- load-time catalog validation ----------------------------

/** Throw if any catalog entry is malformed. Runs once at require(). */
function assertValidEffects() {
  for (const id of STATUS_IDS) {
    const e = STATUS_EFFECTS[id];
    for (const field of REQUIRED_FIELDS) {
      if (!(field in e)) throw new Error(`[statusEffects] "${id}" is missing required field "${field}"`);
    }
    if (e.id !== id) throw new Error(`[statusEffects] key "${id}" does not match entry.id "${e.id}"`);
    if (!VALID_TYPES.has(e.type)) throw new Error(`[statusEffects] "${id}" has invalid type "${e.type}"`);
    if (!VALID_ELEMENTS.has(e.element)) throw new Error(`[statusEffects] "${id}" has invalid element "${e.element}"`);
    if (!VALID_STACKING.has(e.stacking)) throw new Error(`[statusEffects] "${id}" has invalid stacking "${e.stacking}"`);
    if (typeof e.duration !== "number") throw new Error(`[statusEffects] "${id}" duration must be a number`);
    if (typeof e.maxStacks !== "number" || e.maxStacks < 1) throw new Error(`[statusEffects] "${id}" maxStacks must be >= 1`);
    if (typeof e.power !== "number") throw new Error(`[statusEffects] "${id}" power must be a number`);
  }
  if (STATUS_IDS.length !== EXPECTED_EFFECT_COUNT) {
    throw new Error(`[statusEffects] expected ${EXPECTED_EFFECT_COUNT} effects, found ${STATUS_IDS.length}`);
  }
}
assertValidEffects();

// ============================================================
// Internal classification helpers
// ============================================================

/** Harmful effect categories (removable by cleanse). */
function isHarmful(effect) {
  return effect.type === "dot" || effect.type === "cc" || effect.type === "debuff";
}

/** Beneficial effect categories (removable by dispel). */
function isBeneficial(effect) {
  return effect.type === "buff" || effect.type === "aura" || effect.type === "resource";
}

/** True if the effect ticks (damage or heal over time). */
function isTickEffect(effect) {
  return effect.type === "dot" || effect.heal === true;
}

// ============================================================
// immunityCheck(entity, effectId) -> boolean
// True when the effect is blocked: entity.immunities covers the
// id (array / Set / {id:true} / blanket true), the id sits in
// entity.resistStatuses, or the entity is under an active
// immunity/invincibility status (which blocks everything).
// ============================================================
function immunityCheck(entity, effectId) {
  if (!entity || typeof entity !== "object") return false;

  const imm = entity.immunities;
  if (imm === true) return true;
  if (Array.isArray(imm) && imm.includes(effectId)) return true;
  if (imm instanceof Set && imm.has(effectId)) return true;
  if (imm && typeof imm === "object" && !Array.isArray(imm) && !(imm instanceof Set) && imm[effectId]) return true;

  const rs = entity.resistStatuses;
  if (Array.isArray(rs) && rs.includes(effectId)) return true;
  if (rs instanceof Set && rs.has(effectId)) return true;
  if (rs && typeof rs === "object" && !Array.isArray(rs) && !(rs instanceof Set) && rs[effectId]) return true;

  if (Array.isArray(entity.statusEffects) &&
      entity.statusEffects.some(s => s.id === "immunity" || s.id === "invincibility")) {
    return true;
  }
  return false;
}

// ============================================================
// applyStatus(target, effectId, opts) -> status | null
// opts: { potency=1, duration (defaults to effect.duration),
//         stacks=1, source=null }
// Refreshes duration / stacks on an existing copy of the effect,
// otherwise appends a new status object to target.statusEffects.
// Returns null when the effect is unknown or blocked by immunity.
// ============================================================
function applyStatus(target, effectId, { potency = 1, duration, stacks = 1, source = null } = {}) {
  if (!target || typeof target !== "object") return null;
  const effect = STATUS_EFFECTS[effectId];
  if (!effect) return null;
  if (immunityCheck(target, effectId)) return null;
  if (!Array.isArray(target.statusEffects)) target.statusEffects = [];

  const dur = duration === undefined || duration === null
    ? effect.duration
    : Math.max(0, Math.floor(duration));
  const capped = clamp(Math.floor(stacks) || 1, 1, Math.max(1, effect.maxStacks || 1));

  const existing = target.statusEffects.find(s => s.id === effectId);
  if (existing) {
    // Refresh: keep the longer duration, grow stacks up to maxStacks,
    // and keep the strongest potency seen so far.
    existing.duration = Math.max(existing.duration, dur);
    if (effect.stacking !== "none") {
      existing.stacks = Math.min(effect.maxStacks || 1, existing.stacks + capped);
    }
    existing.potency = Math.max(existing.potency, potency);
    return existing;
  }

  const status = { id: effect.id, stacks: capped, duration: dur, potency, source: source || null };
  target.statusEffects.push(status);
  return status;
}

// ============================================================
// tickStatuses(entity, {isPlayer}) -> { damage, healing, removed, log }
// Advances every active status by one turn:
//   - DoTs deal element damage scaled by potency * stacks, reduced
//     by entity.resistances[element] (0..0.9 cap).
//   - HoTs / regeneration heal, capped at maxHp.
//   - Expired / instant statuses are removed (reported in removed).
// Iterates a COPY so mutation during iteration is safe. isPlayer is
// reserved for future player/enemy asymmetries (e.g. difficulty
// scaling); behavior is identical today.
// ============================================================
function tickStatuses(entity, { isPlayer = false } = {}) {
  const result = { damage: 0, healing: 0, removed: [], log: [] };
  if (!entity || !Array.isArray(entity.statusEffects) || entity.statusEffects.length === 0) {
    return result;
  }

  const maxHp = entity.maxHp != null ? entity.maxHp : entity.hp;
  const snapshot = entity.statusEffects.slice();

  for (const status of snapshot) {
    const effect = STATUS_EFFECTS[status.id];
    if (!effect) {
      // Stale entry from an older catalog — drop it quietly.
      removeStatus(entity, status.id);
      result.removed.push(status.id);
      continue;
    }

    // Instant effects (duration 0) are consumed by the combat layer
    // via their trigger; they never tick. Persistent effects
    // (duration -1) tick but never expire on their own.
    const active = status.duration !== 0;
    if (active && status.duration > 0) status.duration -= 1;

    if (active && isTickEffect(effect)) {
      const stacks = status.stacks || 1;

      // --- damage over time ---
      if (effect.type === "dot") {
        const base = effect.dmg !== undefined ? effect.dmg : effect.power;
        let dmg = Math.max(1, Math.round(base * status.potency * stacks));
        const res = (effect.element !== "none" && entity.resistances)
          ? (entity.resistances[effect.element] || 0)
          : 0;
        dmg = Math.max(1, Math.round(dmg * (1 - clamp(res, 0, 0.9))));
        entity.hp = Math.max(0, (entity.hp || 0) - dmg);
        result.damage += dmg;
        result.log.push(`${effect.emoji} ${effect.name} dealt ${dmg} dmg`);
      }

      // --- heal over time (regeneration, heal_over_time, healing_aura) ---
      if (effect.heal === true) {
        const base = effect.dmg !== undefined ? effect.dmg : effect.power;
        const amount = Math.max(1, Math.round(base * status.potency * stacks));
        const before = entity.hp || 0;
        entity.hp = clamp(before + amount, 0, maxHp != null ? maxHp : Infinity);
        const healed = (entity.hp || 0) - before;
        if (healed > 0) {
          result.healing += healed;
          result.log.push(`${effect.emoji} ${effect.name} healed ${healed} HP`);
        }
      }
    }

    if (status.duration === 0) {
      removeStatus(entity, status.id);
      result.removed.push(status.id);
    }
  }
  return result;
}

// ============================================================
// Status queries & mutation
// ============================================================

/** True if the entity currently has the effect. */
function hasStatus(entity, id) {
  return Array.isArray(entity && entity.statusEffects) &&
    entity.statusEffects.some(s => s.id === id);
}

/** The live status object for the effect, or null. */
function getStatus(entity, id) {
  if (!entity || !Array.isArray(entity.statusEffects)) return null;
  return entity.statusEffects.find(s => s.id === id) || null;
}

/** Remove every copy of the effect. Returns true if anything was removed. */
function removeStatus(entity, id) {
  if (!entity || !Array.isArray(entity.statusEffects)) return false;
  const before = entity.statusEffects.length;
  entity.statusEffects = entity.statusEffects.filter(s => s.id !== id);
  return entity.statusEffects.length < before;
}

/** Strip all status effects from the entity. */
function clearStatuses(entity) {
  if (entity && Array.isArray(entity.statusEffects)) entity.statusEffects = [];
}

// ============================================================
// cleanseTarget(entity) / dispelTarget(entity)
// Cleanse removes harmful effects (dots/cc/debuffs) flagged
// cleanseable. Dispel removes beneficial effects (buffs/auras/
// resources) flagged dispellable. Both return the removed ids.
// ============================================================
function cleanseTarget(entity) {
  const removed = [];
  if (!entity || !Array.isArray(entity.statusEffects)) return removed;
  entity.statusEffects = entity.statusEffects.filter(s => {
    const e = STATUS_EFFECTS[s.id];
    if (e && e.cleanseable && isHarmful(e)) {
      removed.push(s.id);
      return false;
    }
    return true;
  });
  return removed;
}

function dispelTarget(entity) {
  const removed = [];
  if (!entity || !Array.isArray(entity.statusEffects)) return removed;
  entity.statusEffects = entity.statusEffects.filter(s => {
    const e = STATUS_EFFECTS[s.id];
    if (e && e.dispellable && isBeneficial(e)) {
      removed.push(s.id);
      return false;
    }
    return true;
  });
  return removed;
}

// ============================================================
// getEffectiveStats(entity) -> stats copy
// Returns the entity's combat stats modified by every active
// buff/debuff stat modifier. Each modifier is { stat, mult?, flat? }:
// mult multiplies (compounded per stack for 'stack' stacking),
// flat adds (scaled per stack). Returns a fresh object; the entity
// itself is untouched.
// ============================================================
const STAT_KEYS = ["atk", "magAtk", "def", "magDef", "speed", "critChance", "dodge", "parry", "block"];

function getEffectiveStats(entity) {
  const src = entity || {};
  const stats = {};
  for (const key of STAT_KEYS) stats[key] = src[key] || 0;
  if (typeof src.critDamage === "number") stats.critDamage = src.critDamage;

  if (Array.isArray(src.statusEffects)) {
    for (const status of src.statusEffects) {
      const effect = STATUS_EFFECTS[status.id];
      if (!effect) continue;
      const mods = effect.stats || (effect.stat ? [effect.stat] : []);
      if (mods.length === 0) continue;
      // 'stack' stacking compounds mult and scales flat per stack;
      // 'intensify'/'none' apply the modifier once (intensity is
      // already reflected in the tick damage, not the stat).
      const multStacks = effect.stacking === "stack" ? (status.stacks || 1) : 1;
      for (const mod of mods) {
        if (!mod || !Object.prototype.hasOwnProperty.call(stats, mod.stat)) continue;
        if (typeof mod.mult === "number") stats[mod.stat] *= Math.pow(mod.mult, multStacks);
        if (typeof mod.flat === "number") stats[mod.stat] += mod.flat * multStacks;
      }
    }
  }
  return stats;
}

// ============================================================
// describeEffect(id) -> one-line human description
// ============================================================
function describeEffect(id) {
  const e = STATUS_EFFECTS[id];
  if (!e) return `Unknown status effect: ${id}`;
  return `${e.emoji} ${e.name} — ${e.description}`;
}

module.exports = {
  STATUS_EFFECTS,
  STATUS_IDS,
  applyStatus,
  tickStatuses,
  hasStatus,
  getStatus,
  removeStatus,
  clearStatuses,
  cleanseTarget,
  dispelTarget,
  immunityCheck,
  getEffectiveStats,
  describeEffect,
};
});

// ---------------------- embedded module: src/crafting/recipes ----------------------
__def("src/crafting/recipes", function (module, exports, require) {
// ============================================================
// recipes.js — crafting registry: ~70 handcrafted core recipes
// + procedural expansion to 1000+; crafting, discovery,
// enchanting, refining. Pure Node.
// ============================================================

const { hasItems, consumeItems, addItem, countItem } = require("../core/schema");
const { pick, randInt, chance, cap } = require("../util");

// ---- handcrafted core recipes ----------------------------------
const CORE_RECIPES = {
  // weapons & tools
  iron_sword: { id: "iron_sword", name: "Iron Sword", category: "weapon", tier: 2, profession: "blacksmithing", professionXp: 8, req: { "Iron Ore": 5, "Oak Log": 2 }, result: { name: "Iron Sword", qty: 1, statBonus: { atk: 12 } }, discoverable: true, flavor: "A reliable blade of folded iron." },
  steel_pickaxe: { id: "steel_pickaxe", name: "Steel Pickaxe", category: "tool", tier: 3, profession: "blacksmithing", professionXp: 10, req: { "Iron Ore": 10, "Pine Wood": 5 }, result: { name: "Steel Pickaxe", qty: 1, statBonus: { gatheringBonus: 1.5 } }, discoverable: true, flavor: "A pickaxe that sings on stone." },
  reinforced_bow: { id: "reinforced_bow", name: "Reinforced Bow", category: "weapon", tier: 3, profession: "carpentry", professionXp: 9, req: { "Pine Wood": 8, "Spider Silk": 4 }, result: { name: "Reinforced Bow", qty: 1, statBonus: { atk: 15 } }, discoverable: true, flavor: "Sinew-backed and deadly." },
  mithril_dagger: { id: "mithril_dagger", name: "Mithril Dagger", category: "weapon", tier: 5, profession: "blacksmithing", professionXp: 14, req: { "Mithril Ore": 6, "Leather": 2 }, result: { name: "Mithril Dagger", qty: 1, statBonus: { atk: 22, speed: 3 } }, discoverable: true, flavor: "Light as a whisper, sharp as regret." },
  runed_staff: { id: "runed_staff", name: "Runed Staff", category: "weapon", tier: 5, profession: "enchanting", professionXp: 14, req: { "Ancient Wood": 6, "Arcane Dust": 4 }, result: { name: "Runed Staff", qty: 1, statBonus: { magAtk: 25 } }, discoverable: true, flavor: "Runes crawl along its length." },
  war_hammer: { id: "war_hammer", name: "War Hammer", category: "weapon", tier: 6, profession: "blacksmithing", professionXp: 16, req: { "Iron Ore": 12, "Oak Log": 6 }, result: { name: "War Hammer", qty: 1, statBonus: { atk: 30, def: 4 } }, discoverable: true, flavor: "The answer to most questions." },
  // consumables
  health_potion_s: { id: "health_potion_s", name: "Health Potion (S)", category: "consumable", tier: 1, profession: "alchemy", professionXp: 4, req: { "Herbs": 2, "Water Flask": 1 }, result: { name: "Health Potion (S)", qty: 1, effect: { heal: 40 } }, discoverable: true, flavor: "Tastes like iron and hope." },
  health_potion_m: { id: "health_potion_m", name: "Health Potion (M)", category: "consumable", tier: 3, profession: "alchemy", professionXp: 8, req: { "Health Potion (S)": 2, "Glowing Kelp": 1 }, result: { name: "Health Potion (M)", qty: 1, effect: { heal: 100 } }, discoverable: true, flavor: "A warm glow in a glass." },
  health_potion_l: { id: "health_potion_l", name: "Health Potion (L)", category: "consumable", tier: 5, profession: "alchemy", professionXp: 14, req: { "Health Potion (M)": 2, "Bloodroot": 1 }, result: { name: "Health Potion (L)", qty: 1, effect: { heal: 250 } }, discoverable: true, flavor: "The color of a heartbeat." },
  mana_potion_s: { id: "mana_potion_s", name: "Mana Potion (S)", category: "consumable", tier: 1, profession: "alchemy", professionXp: 4, req: { "Moonpetal": 2, "Water Flask": 1 }, result: { name: "Mana Potion (S)", qty: 1, effect: { mp: 40 } }, discoverable: true, flavor: "Blue fire in a bottle." },
  mana_potion_m: { id: "mana_potion_m", name: "Mana Potion (M)", category: "consumable", tier: 3, profession: "alchemy", professionXp: 8, req: { "Mana Potion (S)": 2, "Starbloom": 1 }, result: { name: "Mana Potion (M)", qty: 1, effect: { mp: 100 } }, discoverable: true, flavor: "It hums when you hold it." },
  stamina_potion: { id: "stamina_potion", name: "Stamina Potion", category: "consumable", tier: 2, profession: "alchemy", professionXp: 6, req: { "Herbs": 3, "Sugar": 1 }, result: { name: "Stamina Potion", qty: 1, effect: { stamina: 50 } }, discoverable: true, flavor: "Legs of lightning." },
  // buffs
  elixir_of_strength: { id: "elixir_of_strength", name: "Elixir of Strength", category: "buff", tier: 4, profession: "alchemy", professionXp: 12, req: { "Venom Sac": 2, "Ancient Amber": 1 }, result: { name: "Elixir of Strength", qty: 1, effect: { tempAtk: 10 } }, discoverable: true, flavor: "Your muscles remember being younger." },
  elixir_of_warding: { id: "elixir_of_warding", name: "Elixir of Warding", category: "buff", tier: 4, profession: "alchemy", professionXp: 12, req: { "Moonpetal": 3, "Turtle Shell": 1 }, result: { name: "Elixir of Warding", qty: 1, effect: { tempDef: 8 } }, discoverable: true, flavor: "Skin like stone." },
  elixir_of_swiftness: { id: "elixir_of_swiftness", name: "Elixir of Swiftness", category: "buff", tier: 4, profession: "alchemy", professionXp: 12, req: { "Wind Petal": 2, "Wolf Pelt": 1 }, result: { name: "Elixir of Swiftness", qty: 1, effect: { tempSpeed: 6 } }, discoverable: true, flavor: "The wind gets jealous." },
  rage_brew: { id: "rage_brew", name: "Rage Brew", category: "buff", tier: 3, profession: "alchemy", professionXp: 9, req: { "Bloodroot": 2, "Honey": 1 }, result: { name: "Rage Brew", qty: 1, effect: { tempAtk: 6, tempDef: -2 } }, discoverable: true, flavor: "Anger, distilled." },
  focus_tonic: { id: "focus_tonic", name: "Focus Tonic", category: "buff", tier: 3, profession: "alchemy", professionXp: 9, req: { "Starbloom": 2, "Herbs": 1 }, result: { name: "Focus Tonic", qty: 1, effect: { tempCrit: 0.05 } }, discoverable: true, flavor: "Clarity in a cup." },
  invisibility_potion: { id: "invisibility_potion", name: "Invisibility Potion", category: "buff", tier: 6, profession: "alchemy", professionXp: 18, req: { "Void Lotus": 2, "Ectoplasm": 1 }, result: { name: "Invisibility Potion", qty: 1, effect: { status: "invisibility" } }, discoverable: true, flavor: "See yourself out." },
  // food
  bread: { id: "bread", name: "Bread", category: "food", tier: 1, profession: "cooking", professionXp: 3, req: { "Wheat": 2 }, result: { name: "Bread", qty: 2, effect: { heal: 25 } }, discoverable: true, flavor: "Warm, simple, good." },
  grilled_salmon: { id: "grilled_salmon", name: "Grilled Salmon", category: "food", tier: 2, profession: "cooking", professionXp: 5, req: { "Raw Salmon": 1, "Pine Wood": 1 }, result: { name: "Grilled Salmon", qty: 1, effect: { heal: 60, stamina: 20 } }, discoverable: true, flavor: "Smoky and perfect." },
  hearty_stew: { id: "hearty_stew", name: "Hearty Stew", category: "food", tier: 3, profession: "cooking", professionXp: 8, req: { "Raw Meat": 2, "Carrot": 1, "Water Flask": 1 }, result: { name: "Hearty Stew", qty: 2, effect: { heal: 80 } }, discoverable: true, flavor: "A meal that hugs back." },
  mushroom_soup: { id: "mushroom_soup", name: "Mushroom Soup", category: "food", tier: 2, profession: "cooking", professionXp: 5, req: { "Glowing Mushroom": 2, "Herbs": 1 }, result: { name: "Mushroom Soup", qty: 1, effect: { heal: 45, mp: 20 } }, discoverable: true, flavor: "Earthy, with a faint glow." },
  roast_boar: { id: "roast_boar", name: "Roast Boar", category: "food", tier: 4, profession: "cooking", professionXp: 11, req: { "Boar Hide": 1, "Raw Meat": 3, "Herbs": 2 }, result: { name: "Roast Boar", qty: 2, effect: { heal: 120 } }, discoverable: true, flavor: "Crackling skin, tender heart." },
  elven_waybread: { id: "elven_waybread", name: "Elven Waybread", category: "food", tier: 5, profession: "cooking", professionXp: 14, req: { "Wheat": 4, "Honey": 2, "Moonpetal": 1 }, result: { name: "Elven Waybread", qty: 3, effect: { heal: 30, stamina: 30 } }, discoverable: true, flavor: "One bite lasts a march." },
  honey_mead: { id: "honey_mead", name: "Honey Mead", category: "food", tier: 3, profession: "cooking", professionXp: 7, req: { "Honey": 3, "Water Flask": 1 }, result: { name: "Honey Mead", qty: 2, effect: { mp: 30, heal: 15 } }, discoverable: true, flavor: "Sings on the way down." },
  royal_feast: { id: "royal_feast", name: "Royal Feast", category: "food", tier: 8, profession: "cooking", professionXp: 22, req: { "Roast Boar": 1, "Grilled Salmon": 1, "Elven Waybread": 2, "Honey Mead": 1 }, result: { name: "Royal Feast", qty: 1, effect: { heal: 400, stamina: 50, mp: 50 } }, discoverable: false, flavor: "Fit for a crown." },
  // armor
  leather_armor: { id: "leather_armor", name: "Leather Armor", category: "armor", tier: 2, profession: "tailoring", professionXp: 7, req: { "Leather": 4, "Spider Silk": 2 }, result: { name: "Leather Armor", qty: 1, statBonus: { def: 8, dodge: 1 } }, discoverable: true, flavor: "Tanned, tough, trusted." },
  chainmail: { id: "chainmail", name: "Chainmail", category: "armor", tier: 4, profession: "blacksmithing", professionXp: 13, req: { "Iron Ore": 8, "Copper Ore": 4 }, result: { name: "Chainmail", qty: 1, statBonus: { def: 18 } }, discoverable: true, flavor: "Ten thousand tiny rings of no." },
  iron_plate: { id: "iron_plate", name: "Iron Plate", category: "armor", tier: 5, profession: "blacksmithing", professionXp: 15, req: { "Iron Ore": 14, "Pine Wood": 2 }, result: { name: "Iron Plate", qty: 1, statBonus: { def: 26, hp: 20 } }, discoverable: true, flavor: "A walking wall." },
  mage_robes: { id: "mage_robes", name: "Mage Robes", category: "armor", tier: 4, profession: "tailoring", professionXp: 12, req: { "Moonpetal": 4, "Spider Silk": 4 }, result: { name: "Mage Robes", qty: 1, statBonus: { magAtk: 12, mp: 30 } }, discoverable: true, flavor: "Threads woven with intent." },
  ranger_cloak: { id: "ranger_cloak", name: "Ranger Cloak", category: "armor", tier: 4, profession: "tailoring", professionXp: 12, req: { "Wolf Pelt": 3, "Leather": 2 }, result: { name: "Ranger Cloak", qty: 1, statBonus: { def: 10, speed: 3 } }, discoverable: true, flavor: "The forest's own colors." },
  dragon_scale_armor: { id: "dragon_scale_armor", name: "Dragon Scale Armor", category: "armor", tier: 9, profession: "tailoring", professionXp: 30, req: { "Dragon Scale": 5, "Mithril Ore": 4, "Leviathan Scale": 2 }, result: { name: "Dragon Scale Armor", qty: 1, statBonus: { def: 60, resist: 0.15 } }, discoverable: false, flavor: "Worn by the ones who won." },
  shadow_leather: { id: "shadow_leather", name: "Shadow Leather", category: "armor", tier: 6, profession: "tailoring", professionXp: 18, req: { "Shadow Pelt": 3, "Spider Silk": 4 }, result: { name: "Shadow Leather", qty: 1, statBonus: { def: 24, dodge: 5 } }, discoverable: true, flavor: "It doesn't catch the light. Ever." },
  // gems
  cut_ruby: { id: "cut_ruby", name: "Cut Ruby", category: "gem", tier: 3, profession: "jewelcrafting", professionXp: 8, req: { "Ruby": 2 }, result: { name: "Ruby", qty: 1, gem: "ruby" }, discoverable: true, flavor: "Fire, frozen." },
  cut_sapphire: { id: "cut_sapphire", name: "Cut Sapphire", category: "gem", tier: 3, profession: "jewelcrafting", professionXp: 8, req: { "Sapphire": 2 }, result: { name: "Sapphire", qty: 1, gem: "sapphire" }, discoverable: true, flavor: "A drop of the deep sea." },
  cut_emerald: { id: "cut_emerald", name: "Cut Emerald", category: "gem", tier: 3, profession: "jewelcrafting", professionXp: 8, req: { "Emerald": 2 }, result: { name: "Emerald", qty: 1, gem: "emerald" }, discoverable: true, flavor: "Green as spring itself." },
  cut_diamond: { id: "cut_diamond", name: "Cut Diamond", category: "gem", tier: 5, profession: "jewelcrafting", professionXp: 14, req: { "Diamond": 2 }, result: { name: "Diamond", qty: 1, gem: "diamond" }, discoverable: true, flavor: "Unbreakable clarity." },
  // runes
  rune_of_fire: { id: "rune_of_fire", name: "Rune of Fire", category: "rune", tier: 2, profession: "inscription", professionXp: 6, req: { "Cinder": 2, "Arcane Dust": 1 }, result: { name: "Rune of Fire", qty: 1, rune: { element: "fire" } }, discoverable: true, flavor: "It is warm to the touch." },
  rune_of_ice: { id: "rune_of_ice", name: "Rune of Ice", category: "rune", tier: 2, profession: "inscription", professionXp: 6, req: { "Frost Crystal": 2, "Arcane Dust": 1 }, result: { name: "Rune of Ice", qty: 1, rune: { element: "ice" } }, discoverable: true, flavor: "Breath fogs near it." },
  rune_of_lightning: { id: "rune_of_lightning", name: "Rune of Lightning", category: "rune", tier: 3, profession: "inscription", professionXp: 8, req: { "Storm Fragment": 2, "Arcane Dust": 1 }, result: { name: "Rune of Lightning", qty: 1, rune: { element: "lightning" } }, discoverable: true, flavor: "It crackles faintly." },
  rune_of_warding: { id: "rune_of_warding", name: "Rune of Warding", category: "rune", tier: 4, profession: "inscription", professionXp: 10, req: { "Turtle Shell": 1, "Arcane Dust": 3 }, result: { name: "Rune of Warding", qty: 1, rune: { stat: "def" } }, discoverable: true, flavor: "Things bounce off it." },
  rune_of_power: { id: "rune_of_power", name: "Rune of Power", category: "rune", tier: 5, profession: "inscription", professionXp: 13, req: { "Elemental Core": 1, "Arcane Dust": 4 }, result: { name: "Rune of Power", qty: 1, rune: { stat: "atk" } }, discoverable: true, flavor: "Hums with potential." },
  // furniture
  oak_table: { id: "oak_table", name: "Oak Table", category: "furniture", tier: 1, profession: "carpentry", professionXp: 4, req: { "Oak Log": 4 }, result: { name: "Oak Table", qty: 1, furniture: { comfort: 2 } }, discoverable: true, flavor: "Sturdy enough for feasts." },
  pine_bed: { id: "pine_bed", name: "Pine Bed", category: "furniture", tier: 2, profession: "carpentry", professionXp: 6, req: { "Pine Wood": 5, "Wool": 2 }, result: { name: "Pine Bed", qty: 1, furniture: { comfort: 5 } }, discoverable: true, flavor: "Sleep like royalty." },
  bookshelf: { id: "bookshelf", name: "Bookshelf", category: "furniture", tier: 2, profession: "carpentry", professionXp: 6, req: { "Pine Wood": 4, "Iron Ore": 2 }, result: { name: "Bookshelf", qty: 1, furniture: { comfort: 3, storage: 10 } }, discoverable: true, flavor: "Smells of knowledge." },
  armor_stand: { id: "armor_stand", name: "Armor Stand", category: "furniture", tier: 3, profession: "carpentry", professionXp: 8, req: { "Oak Log": 3, "Iron Ore": 3 }, result: { name: "Armor Stand", qty: 1, furniture: { storage: 6 } }, discoverable: true, flavor: "Shows off your trophies." },
  // mounts & pets
  riding_horse: { id: "riding_horse", name: "Riding Horse", category: "mount", tier: 2, profession: "none", professionXp: 0, req: { "Gold": 100, "Apple": 5 }, result: { name: "Riding Horse", qty: 1, mount: { speed: 1.2 } }, discoverable: true, flavor: "A loyal chestnut mare." },
  war_stallion: { id: "war_stallion", name: "War Stallion", category: "mount", tier: 5, profession: "none", professionXp: 0, req: { "Gold": 500, "Iron Ore": 10, "Boar Hide": 4 }, result: { name: "War Stallion", qty: 1, mount: { speed: 1.5, atk: 5 } }, discoverable: true, flavor: "Bred for battle." },
  dire_wolf_mount: { id: "dire_wolf_mount", name: "Dire Wolf Mount", category: "mount", tier: 7, profession: "none", professionXp: 0, req: { "Gold": 1200, "Wolf Pelt": 10, "Fang": 5 }, result: { name: "Dire Wolf Mount", qty: 1, mount: { speed: 1.8 } }, discoverable: false, flavor: "It chose you. Probably." },
  wolf_cub: { id: "wolf_cub", name: "Wolf Cub", category: "pet", tier: 2, profession: "none", professionXp: 0, req: { "Raw Meat": 5, "Gold": 50 }, result: { name: "Wolf Cub", qty: 1, pet: { bonus: "loot" } }, discoverable: true, flavor: "Tiny, loud, loyal." },
  baby_dragon: { id: "baby_dragon", name: "Baby Dragon", category: "pet", tier: 8, profession: "none", professionXp: 0, req: { "Gold": 5000, "Dragon Scale": 3, "Raw Meat": 10 }, result: { name: "Baby Dragon", qty: 1, pet: { bonus: "atk" } }, discoverable: false, flavor: "It sneezes sparks." },
  fox_kitten: { id: "fox_kitten", name: "Fox Kitten", category: "pet", tier: 3, profession: "none", professionXp: 0, req: { "Raw Salmon": 3, "Gold": 75 }, result: { name: "Fox Kitten", qty: 1, pet: { bonus: "luck" } }, discoverable: true, flavor: "Yips at everything." },
  // misc
  campfire_kit: { id: "campfire_kit", name: "Campfire Kit", category: "misc", tier: 1, profession: "carpentry", professionXp: 3, req: { "Oak Log": 2, "Flint": 1 }, result: { name: "Campfire Kit", qty: 1, effect: { camp: true } }, discoverable: true, flavor: "Warmth in a sack." },
  fishing_rod_plus: { id: "fishing_rod_plus", name: "Reinforced Fishing Rod", category: "tool", tier: 3, profession: "carpentry", professionXp: 7, req: { "Pine Wood": 4, "Spider Silk": 3 }, result: { name: "Reinforced Fishing Rod", qty: 1, statBonus: { fishingBonus: 1.3 } }, discoverable: true, flavor: "The fish are worried." },
  torch_bundle: { id: "torch_bundle", name: "Torch Bundle", category: "misc", tier: 1, profession: "none", professionXp: 0, req: { "Oak Log": 2, "Pine Wood": 1 }, result: { name: "Torch Bundle", qty: 3, effect: { light: true } }, discoverable: true, flavor: "Darkness, solved." },
  backpack_large: { id: "backpack_large", name: "Large Backpack", category: "misc", tier: 4, profession: "tailoring", professionXp: 12, req: { "Leather": 6, "Spider Silk": 4 }, result: { name: "Large Backpack", qty: 1, statBonus: { inventorySize: 20 } }, discoverable: true, flavor: "Carries your life." },
  treasure_compass: { id: "treasure_compass", name: "Treasure Compass", category: "misc", tier: 5, profession: "enchanting", professionXp: 15, req: { "Gold": 200, "Arcane Dust": 4, "Mithril Ore": 2 }, result: { name: "Treasure Compass", qty: 1, effect: { treasure: true } }, discoverable: true, flavor: "Points at the shiny." },
  // enchanting materials
  arcane_dust: { id: "arcane_dust", name: "Arcane Dust", category: "enchant", tier: 2, profession: "enchanting", professionXp: 5, req: { "Glowing Slime": 2, "Moonpetal": 1 }, result: { name: "Arcane Dust", qty: 2 }, discoverable: true, flavor: "Ground-up magic." },
  essence_of_fire: { id: "essence_of_fire", name: "Essence of Fire", category: "enchant", tier: 3, profession: "enchanting", professionXp: 8, req: { "Cinder": 3, "Arcane Dust": 1 }, result: { name: "Essence of Fire", qty: 1 }, discoverable: true, flavor: "Bottled warmth." },
  essence_of_water: { id: "essence_of_water", name: "Essence of Water", category: "enchant", tier: 3, profession: "enchanting", professionXp: 8, req: { "Pearl": 2, "Arcane Dust": 1 }, result: { name: "Essence of Water", qty: 1 }, discoverable: true, flavor: "The sea, distilled." },
  soul_shard: { id: "soul_shard", name: "Soul Shard", category: "enchant", tier: 6, profession: "enchanting", professionXp: 16, req: { "Ectoplasm": 2, "Arcane Dust": 3 }, result: { name: "Soul Shard", qty: 1 }, discoverable: true, flavor: "It whispers your name." },
};

// ---- procedural expansion --------------------------------------
const TIER_MATERIALS = [
  { band: 1, mine: ["Copper Ore", "Iron Ore", "Tin Ore"], chop: ["Oak Log", "Pine Wood", "Maple Log"], fish: ["Raw Salmon", "Trout", "Pike"], forage: ["Herbs", "Moonpetal", "Ginseng"], hunt: ["Rabbit Pelt", "Boar Hide", "Fox Pelt"] },
  { band: 2, mine: ["Silver Ore", "Gold Ore", "Tungsten Ore"], chop: ["Pine Wood", "Ancient Wood", "Yew Wood"], fish: ["Catfish", "Glowing Kelp", "Bass"], forage: ["Bloodroot", "Starbloom", "Foxglove"], hunt: ["Wolf Pelt", "Bear Pelt", "Stag Hide"] },
  { band: 3, mine: ["Mithril Ore", "Adamantite Ore", "Cobalt Ore"], chop: ["Ancient Wood", "Ironbark", "Ebony Wood"], fish: ["Void Fish", "Abyss Eel", "Moonfish"], forage: ["Void Lotus", "Emberleaf", "Nightshade"], hunt: ["Wyvern Scale", "Drake Hide", "Basilisk Scale"] },
  { band: 4, mine: ["Orichalcum Ore", "Celestial Ore", "Runite Ore"], chop: ["Shadowwood", "Frostwood", "Bloodwood"], fish: ["Skyfin", "Leviathan Scale", "King Salmon"], forage: ["Starbloom", "Primal Root", "Dreamleaf"], hunt: ["Shadow Pelt", "Griffin Feather", "Chimera Hide"] },
  { band: 5, mine: ["Eternium Ore", "Celestial Ore", "Titanium Ore"], chop: ["Celestial Wood", "Worldwood", "Aetherwood"], fish: ["Leviathan Scale", "Void Fish", "Moonfish"], forage: ["Void Lotus", "Emberleaf", "Firespore"], hunt: ["Drake Hide", "Dragon Scale", "Thunderbird Feather"] },
  { band: 6, mine: ["Cinnabar Ore", "Jade Ore", "Kryll Ore"], chop: ["Rosewood", "Driftwood", "Petrified Log"], fish: ["Eel", "Carp", "Lantern Fish"], forage: ["Sage", "Wormroot", "Lumebloom"], hunt: ["Mink Pelt", "Roc Feather", "Kraken Ink"] },
  { band: 7, mine: ["Astralite Ore", "Quartzite Ore", "Voidstone"], chop: ["Astral Wood", "Quartzwood", "Umbral Log"], fish: ["Astral Fish", "Quartz Eel", "Abyss Carp"], forage: ["Starfall Petal", "Moonvine", "Umbral Bloom"], hunt: ["Astral Pelt", "Quartz Scale", "Umbral Hide"] },
  { band: 8, mine: ["Primal Ore", "Elemental Ore", "Chaos Ore"], chop: ["Primal Wood", "Elemental Wood", "Chaoswood"], fish: ["Primal Fish", "Elemental Eel", "Chaos Bass"], forage: ["Primal Herb", "Elemental Petal", "Chaos Root"], hunt: ["Primal Hide", "Elemental Scale", "Chaos Pelt"] },
  { band: 9, mine: ["Sunstone Ore", "Moonstone Ore", "Starmetal Ore"], chop: ["Sunwood", "Moonwood", "Starwood"], fish: ["Sunfish", "Moon Eel", "Starfinned Bass"], forage: ["Sunpetal", "Moonbloom", "Starleaf"], hunt: ["Sunlion Pelt", "Moonwolf Hide", "Starbeast Scale"] },
  { band: 10, mine: ["Dragonite Ore", "Phoenix Ore", "Titanblood Ore"], chop: ["Dragonwood", "Phoenixwood", "Titanwood"], fish: ["Dragonfish", "Phoenix Eel", "Titan Bass"], forage: ["Dragonscale Herb", "Phoenix Petal", "Titan Root"], hunt: ["Dragonscale Hide", "Phoenix Feather", "Titan Pelt"] },
];

const RECIPE_NAMES = {
  weapon: { sword: "Sword", axe: "Axe", hammer: "Hammer", dagger: "Dagger", staff: "Staff", bow: "Bow", spear: "Spear", mace: "Mace" },
  armor: { armor: "Armor", helm: "Helm", boots: "Boots", gloves: "Gloves" },
};

/** "Copper Ore" -> "copper_ore", "Raw Salmon" -> "raw_salmon" */
function _matSlug(mat) {
  return String(mat).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}
/** "Copper Ore" -> "Copper", "Raw Salmon" -> "Salmon", "Oak Log" -> "Oak" */
function _matCoreName(mat) {
  return cap(mat.replace(/ (Ore|Log|Wood|Pelt|Scale)$/, "").replace(/^Raw /, ""));
}

function buildRecipeRegistry() {
  const all = { ...CORE_RECIPES };
  const weaponKinds = Object.keys(RECIPE_NAMES.weapon);
  const armorKinds = Object.keys(RECIPE_NAMES.armor);
  const BAND_COUNT = 10; // 10 tier bands -> 1000+ recipes
  const meleeKinds = ["sword", "axe", "hammer", "dagger", "mace"];
  const woodKinds = ["staff", "bow", "spear"];
  const profs = { sword: "blacksmithing", axe: "blacksmithing", hammer: "blacksmithing", dagger: "blacksmithing", staff: "carpentry", bow: "carpentry", spear: "carpentry", mace: "blacksmithing" };

  for (let bi = 0; bi < TIER_MATERIALS.length; bi++) {
    const band = TIER_MATERIALS[bi];
    const tierBase = bi * 10 + 1;
    const tier = () => tierBase + randInt(0, 8);

    // weapons from ores (melee) and wood (ranged)
    for (const mat of band.mine) {
      for (const kind of meleeKinds) {
        const id = `pro_w_${_matSlug(mat)}_${kind}_b${bi + 1}`;
        if (all[id]) continue;
        all[id] = {
          id, name: `${_matCoreName(mat)} ${RECIPE_NAMES.weapon[kind]}`,
          category: "weapon", tier: tier(), profession: profs[kind], professionXp: 6 + bi * 4,
          req: { [mat]: 4 + bi, [band.chop[0]]: 2 }, result: { name: `${_matCoreName(mat)} ${RECIPE_NAMES.weapon[kind]}`, qty: 1, statBonus: { atk: 10 + bi * 10 } },
          discoverable: true, procedural: true, flavor: "Forged from " + mat.toLowerCase() + ".",
        };
      }
    }
    for (const mat of band.chop) {
      for (const kind of woodKinds) {
        const id = `pro_w_${_matSlug(mat)}_${kind}_b${bi + 1}`;
        if (all[id]) continue;
        all[id] = {
          id, name: `${_matCoreName(mat)} ${RECIPE_NAMES.weapon[kind]}`,
          category: "weapon", tier: tier(), profession: profs[kind], professionXp: 6 + bi * 4,
          req: { [mat]: 5 + bi, [band.forage[0]]: 1 }, result: { name: `${_matCoreName(mat)} ${RECIPE_NAMES.weapon[kind]}`, qty: 1, statBonus: { atk: 9 + bi * 9, speed: 1 } },
          discoverable: true, procedural: true, flavor: "Carved from " + mat.toLowerCase() + ".",
        };
      }
    }
    // armor from ores + cloaks from hunt pelts
    for (const mat of band.mine) {
      for (const kind of armorKinds) {
        const id = `pro_a_${_matSlug(mat)}_${kind}_b${bi + 1}`;
        if (all[id]) continue;
        all[id] = {
          id, name: `${_matCoreName(mat)} ${RECIPE_NAMES.armor[kind]}`,
          category: "armor", tier: tier(), profession: "blacksmithing", professionXp: 6 + bi * 4,
          req: { [mat]: 5 + bi, [band.hunt[0]]: 2 }, result: { name: `${_matCoreName(mat)} ${RECIPE_NAMES.armor[kind]}`, qty: 1, statBonus: { def: 6 + bi * 7 } },
          discoverable: true, procedural: true, flavor: "Protection, plate by plate.",
        };
      }
    }
    for (const mat of band.hunt) {
      const id = `pro_a_${_matSlug(mat)}_cloak_b${bi + 1}`;
      if (all[id]) continue;
      all[id] = {
        id, name: `${_matCoreName(mat)} Cloak`, category: "armor", tier: tier(), profession: "tailoring", professionXp: 6 + bi * 4,
        req: { [mat]: 3, [band.forage[0]]: 2 }, result: { name: `${_matCoreName(mat)} Cloak`, qty: 1, statBonus: { def: 4 + bi * 5, dodge: 1 } },
        discoverable: true, procedural: true, flavor: "Woven from " + mat.toLowerCase() + ".",
      };
    }
    // tools: pickaxe (ore), axe (wood), rod (fish)
    const toolDefs = [
      { mat: band.mine[0], id: `pro_t_pick_${_matSlug(band.mine[0])}_b${bi + 1}`, name: `${_matCoreName(band.mine[0])} Pickaxe`, stat: "mining" },
      { mat: band.mine[1], id: `pro_t_pick_${_matSlug(band.mine[1])}_b${bi + 1}`, name: `${_matCoreName(band.mine[1])} Pickaxe`, stat: "mining" },
      { mat: band.chop[0], id: `pro_t_axe_${_matSlug(band.chop[0])}_b${bi + 1}`, name: `${_matCoreName(band.chop[0])} Axe`, stat: "woodcutting" },
      { mat: band.chop[1], id: `pro_t_axe_${_matSlug(band.chop[1])}_b${bi + 1}`, name: `${_matCoreName(band.chop[1])} Axe`, stat: "woodcutting" },
      { mat: band.fish[0], id: `pro_t_rod_${_matSlug(band.fish[0])}_b${bi + 1}`, name: `${_matCoreName(band.fish[0])} Rod`, stat: "fishing" },
    ];
    for (const td of toolDefs) {
      if (all[td.id]) continue;
      all[td.id] = {
        id: td.id, name: td.name, category: "tool", tier: tier(), profession: "carpentry", professionXp: 5 + bi * 3,
        req: { [td.mat]: 4, [band.forage[0]]: 2 }, result: { name: td.name, qty: 1, statBonus: { gatheringBonus: 1.2 + bi * 0.1 } },
        discoverable: true, procedural: true, flavor: `A fine ${td.stat} tool.`,
      };
    }
    // offhand: shields (ore), orbs (forage), instruments (hunt)
    const offhandDefs = [
      { mat: band.mine[0], kind: "shield", req: [band.mine[0], band.chop[0]], stat: "def" },
      { mat: band.forage[0], kind: "orb", req: [band.forage[0], band.fish[0]], stat: "magAtk" },
      { mat: band.hunt[0], kind: "instrument", req: [band.hunt[0], band.chop[0]], stat: "mp" },
    ];
    for (const od of offhandDefs) {
      const id = `pro_oh_${od.kind}_${_matSlug(od.mat)}_b${bi + 1}`;
      if (all[id]) continue;
      all[id] = {
        id, name: `${_matCoreName(od.mat)} ${cap(od.kind)}`, category: "armor", tier: tier(), profession: "carpentry", professionXp: 5 + bi * 3,
        req: { [od.req[0]]: 3, [od.req[1]]: 2 }, result: { name: `${_matCoreName(od.mat)} ${cap(od.kind)}`, qty: 1, statBonus: { [od.stat]: 4 + bi * 4 } },
        discoverable: true, procedural: true, flavor: "Held with pride.",
      };
    }
    // jewelry: ring + amulet per ore
    for (const mat of band.mine) {
      for (const kind of ["ring", "amulet"]) {
        const id = `pro_j_${kind}_${_matSlug(mat)}_b${bi + 1}`;
        if (all[id]) continue;
        all[id] = {
          id, name: `${_matCoreName(mat)} ${cap(kind)}`, category: "armor", tier: tier(), profession: "jewelcrafting", professionXp: 5 + bi * 3,
          req: { [mat]: 3, [band.forage[0]]: 1 }, result: { name: `${_matCoreName(mat)} ${cap(kind)}`, qty: 1, statBonus: { critChance: 0.005 + bi * 0.001 } },
          discoverable: true, procedural: true, flavor: "Catch the light.",
        };
      }
    }
    // food: ingredient x cooking method matrix (>=1000 food recipes total)
    const FOOD_METHODS = [
      { id: "grilled",   name: "Grilled",  verb: "Grilled" },
      { id: "roasted",   name: "Roasted",  verb: "Roasted" },
      { id: "smoked",    name: "Smoked",   verb: "Smoked" },
      { id: "stewed",    name: "Stewed",   verb: "Stew" },
      { id: "baked",     name: "Baked",    verb: "Baked" },
      { id: "fried",     name: "Fried",    verb: "Fried" },
      { id: "fermented", name: "Fermented", verb: "Fermented" },
      { id: "pickled",   name: "Pickled",  verb: "Pickled" },
      { id: "candied",   name: "Candied",  verb: "Candied" },
      { id: "spiced",    name: "Spiced",   verb: "Spiced" },
      { id: "glazed",    name: "Glazed",   verb: "Glazed" },
      { id: "stuffed",   name: "Stuffed",  verb: "Stuffed" },
    ];
    const foodIngredients = [...band.fish, ...band.hunt, ...band.forage];
    for (const ing of foodIngredients) {
      for (const method of FOOD_METHODS) {
        const id = `food_${_matSlug(ing)}_${method.id}_b${bi + 1}`;
        if (all[id]) continue;
        const core = _matCoreName(ing);
        const name = method.id === "stewed" ? `${core} ${method.verb}` : `${method.verb} ${core}`;
        const heal = 25 + bi * 18 + (method.id === "roasted" || method.id === "stuffed" ? 10 : 0);
        all[id] = {
          id, name, category: "food", tier: tier(), profession: "cooking", professionXp: 4 + bi * 2,
          req: { [ing]: 1, [band.chop[0]]: 1 }, result: { name, qty: 1, effect: { heal } },
          discoverable: true, procedural: true, flavor: `${method.verb} with care from ${ing.toLowerCase()}.`,
        };
      }
    }
    // potions per forage + fish
    for (const herb of band.forage) {
      const id = `pro_p_${_matSlug(herb)}_b${bi + 1}`;
      if (all[id]) continue;
      all[id] = {
        id, name: `${_matCoreName(herb)} Draught`, category: "consumable", tier: tier(), profession: "alchemy", professionXp: 5 + bi * 3,
        req: { [herb]: 2, "Water Flask": 1 }, result: { name: `${_matCoreName(herb)} Draught`, qty: 1, effect: { heal: 30 + bi * 30 } },
        discoverable: true, procedural: true, flavor: "Brewed from " + herb.toLowerCase() + ".",
      };
    }
    for (const fish of band.fish) {
      const id = `pro_p_${_matSlug(fish)}_oil_b${bi + 1}`;
      if (all[id]) continue;
      all[id] = {
        id, name: `${_matCoreName(fish)} Oil`, category: "consumable", tier: tier(), profession: "alchemy", professionXp: 5 + bi * 3,
        req: { [fish]: 2, [band.forage[0]]: 1 }, result: { name: `${_matCoreName(fish)} Oil`, qty: 1, effect: { mp: 20 + bi * 15 } },
        discoverable: true, procedural: true, flavor: "Slick and faintly glowing.",
      };
    }
    // enchants + runes per element
    for (const el of ["Fire", "Ice", "Lightning", "Shadow", "Light"]) {
      const eid = `pro_e_${el.toLowerCase()}_b${bi + 1}`;
      if (!all[eid]) {
        all[eid] = {
          id: eid, name: `Enchant: ${el}`, category: "enchant", tier: tier(), profession: "enchanting", professionXp: 6 + bi * 3,
          req: { [band.forage[0]]: 2, [band.mine[0]]: 1, "Arcane Dust": 1 }, result: { name: `${el} Enchant`, qty: 1, enchant: { element: el.toLowerCase() } },
          discoverable: true, procedural: true, flavor: `Infuse ${el.toLowerCase()} into an item.`,
        };
      }
      const rid = `pro_r_${el.toLowerCase()}_b${bi + 1}`;
      if (!all[rid]) {
        all[rid] = {
          id: rid, name: `Rune of ${el}`, category: "rune", tier: tier(), profession: "inscription", professionXp: 5 + bi * 3,
          req: { [band.forage[0]]: 1, "Arcane Dust": 2 }, result: { name: `Rune of ${el}`, qty: 1, rune: { element: el.toLowerCase() } },
          discoverable: true, procedural: true, flavor: `Carved with ${el.toLowerCase()} intent.`,
        };
      }
    }
    // furniture per wood + bars per ore + gems per ore
    for (const wood of band.chop) {
      const id = `pro_fu_${_matSlug(wood)}_b${bi + 1}`;
      if (all[id]) continue;
      all[id] = {
        id, name: `${_matCoreName(wood)} Cabinet`, category: "furniture", tier: tier(), profession: "carpentry", professionXp: 5 + bi * 3,
        req: { [wood]: 4 }, result: { name: `${_matCoreName(wood)} Cabinet`, qty: 1, furniture: { comfort: 2 + bi, storage: 5 + bi * 2 } },
        discoverable: true, procedural: true, flavor: "Storage with style.",
      };
    }
    // planks + scrolls + traps (extra families to fill out the registry)
    for (const wood of band.chop) {
      const pid = `pro_plank_${_matSlug(wood)}_b${bi + 1}`;
      if (!all[pid]) {
        all[pid] = {
          id: pid, name: `${_matCoreName(wood)} Planks`, category: "enchant", tier: tier(), profession: "carpentry", professionXp: 4 + bi * 2,
          req: { [wood]: 4 }, result: { name: `${_matCoreName(wood)} Planks`, qty: 2 },
          discoverable: true, procedural: true, flavor: "Cut, cured, and stacked.",
        };
      }
    }
    for (const el of ["Fire", "Ice", "Lightning", "Shadow", "Light", "Wind", "Earth", "Water", "Arcane", "Poison"]) {
      const sid = `pro_scroll_${el.toLowerCase()}_b${bi + 1}`;
      if (!all[sid]) {
        all[sid] = {
          id: sid, name: `Scroll of ${el}`, category: "misc", tier: tier(), profession: "inscription", professionXp: 4 + bi * 2,
          req: { [band.forage[0]]: 2, "Arcane Dust": 1 }, result: { name: `Scroll of ${el}`, qty: 1, scroll: { element: el.toLowerCase() } },
          discoverable: true, procedural: true, flavor: "One use, great power.",
        };
      }
    }
    for (const beast of band.hunt) {
      const tid = `pro_trap_${_matSlug(beast)}_b${bi + 1}`;
      if (!all[tid]) {
        all[tid] = {
          id: tid, name: `${_matCoreName(beast)} Trap`, category: "misc", tier: tier(), profession: "carpentry", professionXp: 4 + bi * 2,
          req: { [beast]: 1, [band.chop[0]]: 2 }, result: { name: `${_matCoreName(beast)} Trap`, qty: 1, effect: { hunt: true } },
          discoverable: true, procedural: true, flavor: "For when hunting gets personal.",
        };
      }
    }
    for (const herb of band.forage) {
      const pid = `pro_essence_${_matSlug(herb)}_b${bi + 1}`;
      if (!all[pid]) {
        all[pid] = {
          id: pid, name: `${_matCoreName(herb)} Essence`, category: "enchant", tier: tier(), profession: "enchanting", professionXp: 4 + bi * 2,
          req: { [herb]: 3 }, result: { name: `${_matCoreName(herb)} Essence`, qty: 1 },
          discoverable: true, procedural: true, flavor: "Distilled botanical power.",
        };
      }
    }
    for (const ore of band.mine) {
      const bid = `pro_bar_${_matSlug(ore)}_b${bi + 1}`;
      if (!all[bid]) {
        all[bid] = {
          id: bid, name: `${_matCoreName(ore)} Bar`, category: "enchant", tier: tier(), profession: "blacksmithing", professionXp: 4 + bi * 2,
          req: { [ore]: 5 }, result: { name: `${_matCoreName(ore)} Bar`, qty: 1 },
          discoverable: true, procedural: true, flavor: "Smelted to perfection.",
        };
      }
      const gid = `pro_gem_${_matSlug(ore)}_b${bi + 1}`;
      if (!all[gid]) {
        all[gid] = {
          id: gid, name: `Polished ${_matCoreName(ore)}`, category: "gem", tier: tier(), profession: "jewelcrafting", professionXp: 5 + bi * 3,
          req: { [ore]: 3 }, result: { name: `Polished ${_matCoreName(ore)}`, qty: 1, gem: { stat: "def", value: 2 + bi * 2 } },
          discoverable: true, procedural: true, flavor: "Cut to catch the light.",
        };
      }
    }
  }

  return all;
}

const RECIPE_REGISTRY = buildRecipeRegistry();
const ALL_RECIPES = Object.values(RECIPE_REGISTRY);

function getAllRecipes() { return ALL_RECIPES; }
function findRecipe(id) { return RECIPE_REGISTRY[id] || null; }

function getRecipePage(page, perPage = 10, filter = null) {
  let list = ALL_RECIPES;
  if (filter === "food") list = ALL_RECIPES.filter(r => r.category === "food");
  if (filter === "craft") list = ALL_RECIPES.filter(r => r.category !== "food");
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * perPage;
  return { recipes: list.slice(start, start + perPage), totalPages, page: p, total: list.length, filter };
}

function searchRecipes(query) {
  const q = query.toLowerCase();
  return ALL_RECIPES.filter(r => r.name.toLowerCase().includes(q) || r.category.includes(q) || (r.profession || "").includes(q));
}

// ---- crafting ------------------------------------------------
function _professionLevel(player, prof) {
  if (!prof || prof === "none") return 99;
  return player.professions[prof] || 1;
}

function canCraft(player, recipeId) {
  const r = findRecipe(recipeId);
  if (!r) return { ok: false, reason: "invalid_recipe" };
  if (r.discoverable && player.discoveredRecipes && !player.discoveredRecipes.has(r.id)) {
    return { ok: false, reason: "undiscovered" };
  }
  const profLvl = _professionLevel(player, r.profession);
  if (r.tier > 1 && profLvl < Math.ceil(r.tier / 2)) return { ok: false, reason: `requires ${r.profession} lvl ${Math.ceil(r.tier / 2)}` };
  if (!hasItems(player, r.req)) return { ok: false, reason: "missing_materials" };
  const goldCost = Math.floor(r.tier * 5);
  if (player.gold < goldCost) return { ok: false, reason: `need ${goldCost} gold` };
  return { ok: true };
}

function craftItem(player, recipeId) {
  const check = canCraft(player, recipeId);
  if (!check.ok) return { ok: false, reason: check.reason };
  const r = findRecipe(recipeId);
  consumeItems(player, r.req);
  const goldCost = Math.floor(r.tier * 5);
  player.gold -= goldCost;

  const critChance = r.profession && r.profession !== "none" ? Math.min(0.25, 0.05 + (player.professions[r.profession] || 1) / 200) : 0.02;
  const isCrit = chance(critChance);
  const qty = r.result.qty * (isCrit ? 2 : 1);
  addItem(player, r.result.name, qty);

  if (r.profession && r.profession !== "none") {
    player.professions[r.profession] += r.professionXp;
  }
  const msg = `🛠️ **CRAFTING SUCCESS!** Created **${qty}x ${r.result.name}**${isCrit ? " — ⭐ CRITICAL CRAFT (x2)!" : ""}!`;
  return { ok: true, message: msg, recipe: r, crafted: [{ name: r.result.name, qty }], crit: isCrit, goldCost };
}

// ---- discovery ------------------------------------------------
function discoverRecipes(player) {
  if (!player.discoveredRecipes) player.discoveredRecipes = new Set();
  const fresh = [];
  for (const r of ALL_RECIPES) {
    if (r.discoverable && !player.discoveredRecipes.has(r.id) && hasItems(player, r.req)) {
      player.discoveredRecipes.add(r.id);
      fresh.push(r);
    }
  }
  return fresh;
}

function recipeDiscoveryText(player) {
  const fresh = discoverRecipes(player);
  if (!fresh.length) return "🔍 No new recipes to discover.";
  return `🔍 **RECIPE DISCOVERED!** You can now craft:\n` + fresh.map(r => `• **${r.name}**`).join("\n");
}

// ---- enchanting ------------------------------------------------
const ENCHANTMENTS = {
  enchant_fire:       { id: "enchant_fire",       name: "Fiery",       element: "fire",      stat: "fireDmg",     value: 10, req: { "Essence of Fire": 2, "Arcane Dust": 2 },    tier: 3 },
  enchant_frost:      { id: "enchant_frost",      name: "Icy",         element: "ice",       stat: "iceDmg",      value: 10, req: { "Essence of Water": 1, "Frost Crystal": 2 },  tier: 3 },
  enchant_lightning:  { id: "enchant_lightning",  name: "Voltaic",     element: "lightning", stat: "lightningDmg", value: 12, req: { "Storm Fragment": 2, "Arcane Dust": 2 },      tier: 3 },
  enchant_warding:    { id: "enchant_warding",    name: "Warded",      element: "none",      stat: "def",        value: 8,  req: { "Turtle Shell": 1, "Arcane Dust": 3 },          tier: 4 },
  enchant_vitality:   { id: "enchant_vitality",   name: "Vital",       element: "none",      stat: "hp",         value: 30, req: { "Bloodroot": 2, "Arcane Dust": 2 },             tier: 4 },
  enchant_swiftness:  { id: "enchant_swiftness",  name: "Swift",       element: "wind",      stat: "speed",      value: 4,  req: { "Wind Petal": 2, "Arcane Dust": 2 },            tier: 4 },
  enchant_precision:  { id: "enchant_precision",  name: "Precise",     element: "none",      stat: "critChance", value: 0.02, req: { "Diamond": 1, "Arcane Dust": 4 },             tier: 6 },
  enchant_lifesteal:  { id: "enchant_lifesteal",  name: "Leeching",    element: "shadow",    stat: "lifestealPct", value: 0.03, req: { "Soul Shard": 1, "Ectoplasm": 2 },         tier: 7 },
  enchant_shadow:     { id: "enchant_shadow",     name: "Shadowed",    element: "shadow",    stat: "shadowDmg",  value: 14, req: { "Soul Shard": 1, "Arcane Dust": 3 },          tier: 5 },
  enchant_light:      { id: "enchant_light",      name: "Radiant",     element: "light",     stat: "lightDmg",   value: 12, req: { "Essence of Fire": 1, "Starbloom": 2 },        tier: 5 },
};

function enchantItem(player, item, enchantId) {
  const enc = ENCHANTMENTS[enchantId];
  if (!enc) return { ok: false, reason: "unknown_enchant" };
  if (!hasItems(player, enc.req)) return { ok: false, reason: "missing_materials" };
  if (!item) return { ok: false, reason: "no_item" };
  consumeItems(player, enc.req);
  if (!item.affixes) item.affixes = [];
  item.affixes.push({ name: enc.name, stat: enc.stat, value: enc.value, fromEnchant: true });
  item.value = Math.floor(item.value * 1.5);
  return { ok: true, item, message: `✨ **${item.name}** has been enchanted with **${enc.name}**!` };
}

// ---- refining ------------------------------------------------
const REFINING = {
  refine_iron:    { id: "refine_iron",  name: "Smelt Iron Bar", input: { "Iron Ore": 5 },  output: "Iron Bar",  qty: 1, tier: 2, profession: "blacksmithing", xp: 6 },
  refine_copper:  { id: "refine_copper", name: "Smelt Copper Bar", input: { "Copper Ore": 5 }, output: "Copper Bar", qty: 1, tier: 1, profession: "blacksmithing", xp: 4 },
  refine_silver:  { id: "refine_silver", name: "Smelt Silver Bar", input: { "Silver Ore": 5 }, output: "Silver Bar", qty: 1, tier: 3, profession: "blacksmithing", xp: 8 },
  refine_gold:    { id: "refine_gold",  name: "Smelt Gold Bar",   input: { "Gold Ore": 5 },   output: "Gold Bar",   qty: 1, tier: 3, profession: "blacksmithing", xp: 8 },
  refine_smoked:  { id: "refine_smoked", name: "Smoke Salmon",   input: { "Raw Salmon": 2 }, output: "Smoked Salmon", qty: 2, tier: 2, profession: "cooking", xp: 5 },
  refine_essence: { id: "refine_essence", name: "Distill Essence", input: { "Herbs": 4 },   output: "Arcane Dust", qty: 1, tier: 2, profession: "enchanting", xp: 5 },
};

function refineItem(player, refineId) {
  const r = REFINING[refineId];
  if (!r) return { ok: false, reason: "unknown_refine" };
  if (!hasItems(player, r.input)) return { ok: false, reason: "missing_materials" };
  consumeItems(player, r.input);
  addItem(player, r.output, r.qty);
  if (r.profession && player.professions[r.profession]) player.professions[r.profession] += r.xp;
  return { ok: true, message: `⚒️ Refined **${r.qty}x ${r.output}**!`, output: r.output, qty: r.qty };
}

const CRAFTING_STATIONS = [
  { id: "forge",          name: "Forge",          profession: "blacksmithing",  unlockLevel: 1 },
  { id: "anvil",          name: "Anvil",          profession: "blacksmithing",  unlockLevel: 3 },
  { id: "alchemy_table",  name: "Alchemy Table",  profession: "alchemy",        unlockLevel: 1 },
  { id: "cooking_fire",   name: "Cooking Fire",   profession: "cooking",        unlockLevel: 1 },
  { id: "enchanter_table", name: "Enchanter's Table", profession: "enchanting", unlockLevel: 2 },
  { id: "jewelers_bench", name: "Jeweler's Bench", profession: "jewelcrafting", unlockLevel: 2 },
  { id: "loom",           name: "Loom",           profession: "tailoring",      unlockLevel: 1 },
  { id: "workbench",      name: "Workbench",      profession: "carpentry",      unlockLevel: 1 },
];

module.exports = {
  CORE_RECIPES, RECIPE_REGISTRY, ALL_RECIPES, TIER_MATERIALS,
  getAllRecipes, findRecipe, getRecipePage, searchRecipes,
  canCraft, craftItem, discoverRecipes, recipeDiscoveryText,
  ENCHANTMENTS, enchantItem, REFINING, refineItem, CRAFTING_STATIONS,
};
});

// ---------------------- embedded module: src/util ----------------------
__def("src/util", function (module, exports, require) {
// ============================================================
// util.js — shared math/RNG/format helpers (pure, no deps)
// ============================================================

/** Integer in [min, max] inclusive. */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Float in [min, max). */
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** True with p probability (0..1). */
function chance(p) {
  return Math.random() < p;
}

/** Clamp n into [min, max]. */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Pick a random element. */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Weighted pick: [{item, weight}] -> item or null. */
function weightedPick(entries) {
  const total = entries.reduce((s, e) => s + (e.weight || 0), 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const e of entries) {
    roll -= e.weight || 0;
    if (roll <= 0) return e.item;
  }
  return entries[entries.length - 1].item;
}

/** Roll 1dN. */
function d(n) { return randInt(1, n); }

/** Format a number with separators. */
function fmt(n) {
  return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Compact number: 1.2K, 3.4M. */
function fmtShort(n) {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toString();
}

/** Deterministic pseudo-random from a string seed (for stable world gen). */
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded RNG factory (mulberry32). */
function seededRng(seedStr) {
  let a = hashSeed(seedStr);
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normalize a string id: lowercase, spaces->underscore, strip non-alnum. */
function slug(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/** Capitalize first letter. */
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Deterministic name from seed (syllable concat) for procedural items/enemies. */
const SYLLABLES_A = ["Vor", "Zar", "Mal", "Grim", "Ash", "Fen", "Dra", "Thal", "Nyx", "Kael", "Brum", "Syl", "Or", "Vel", "Kor", "Is"];
const SYLLABLES_B = ["drak", "mor", "gath", "vane", "thul", "rex", "mir", "lok", "sha", "deem", "tarn", "wick", "neth", "gor", "pell", "zul"];
function seedName(seedStr) {
  const rng = seededRng(seedStr);
  return cap(SYLLABLES_A[Math.floor(rng() * SYLLABLES_A.length)]) +
    SYLLABLES_B[Math.floor(rng() * SYLLABLES_B.length)];
}

/** Build an XP curve: xp needed to advance from level -> level+1. */
function xpForLevel(level, mult = 1) {
  return Math.floor(100 * Math.pow(level, 1.7) * mult);
}

/** Tier of a zone (1-based). */
function zoneTier(zoneId) {
  return Math.max(1, Math.ceil(zoneId / 10));
}

/** Random id string. */
function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

module.exports = {
  randInt, randFloat, chance, clamp, pick, weightedPick, d,
  fmt, fmtShort, hashSeed, seededRng, slug, cap, seedName,
  xpForLevel, zoneTier, uid,
};
});

// ---------------------- embedded module: src/world/enemies ----------------------
__def("src/world/enemies", function (module, exports, require) {
// ============================================================
// enemies.js — 1000+ enemy templates (20 families x 10 variants
// x 5 tier bands), elite modifiers, factions, instance scaling.
// Pure Node.
// ============================================================

const { ELEMENTS, ELEMENT_EMOJI } = require("../config");
const { pick, randInt, chance, clamp, cap } = require("../util");
const { getZone } = require("./zones");
const { rollLoot } = require("./loot");

// ---- 20 base families ---------------------------------------
const FAMILIES = [
  { id: "goblin",    name: "Goblin",    hp: 0.9,  atk: 0.8,  def: 0.6,  spd: 14, elements: ["physical", "poison"],          loot: ["Goblin Ear", "Iron Ore", "Copper Ore"],        xp: 30,  faction: "warbands",  intro: ["A cackling goblin brandishes a rusted blade.", "The goblin sniffs the air and grins at you."] },
  { id: "orc",       name: "Orc",       hp: 1.4,  atk: 1.2,  def: 1.0,  spd: 10, elements: ["physical", "fire"],              loot: ["Orc Tooth", "Iron Ore", "War Axe Fragment"],    xp: 55,  faction: "warbands",  intro: ["An orc warrior pounds its chest and roars.", "The orc hefts a massive axe, eyes burning."] },
  { id: "wolf",      name: "Dire Wolf", hp: 1.0,  atk: 1.0,  def: 0.7,  spd: 18, elements: ["physical", "ice"],               loot: ["Wolf Pelt", "Fang", "Raw Meat"],               xp: 40,  faction: "wilds",     intro: ["A low growl rumbles from the treeline.", "The wolf circles you, hackles raised."] },
  { id: "slime",     name: "Slime",     hp: 0.8,  atk: 0.6,  def: 0.9,  spd: 6,  elements: ["water", "poison"],              loot: ["Slime Core", "Glowing Slime", "Gel"],          xp: 25,  faction: "wilds",     intro: ["A gelatinous blob quivers and splits open.", "The slime oozes forward, leaving a burning trail."] },
  { id: "skeleton",  name: "Skeleton",  hp: 0.7,  atk: 0.9,  def: 1.1,  spd: 11, elements: ["physical", "shadow"],             loot: ["Bone Shard", "Ancient Coin", "Rusty Sword"],   xp: 45,  faction: "legion",    intro: ["Bones rattle as a skeleton claws out of the dirt.", "Empty sockets fix on you. It remembers your face."] },
  { id: "zombie",    name: "Zombie",    hp: 1.5,  atk: 0.8,  def: 0.5,  spd: 5,  elements: ["physical", "poison"],             loot: ["Rotten Flesh", "Old Ring", "Cloth"],            xp: 35,  faction: "legion",    intro: ["The shambling dead drag itself toward you.", "Rotting fingers reach out, grasping."] },
  { id: "spider",    name: "Cave Spider", hp: 0.8, atk: 0.9, def: 0.6,  spd: 15, elements: ["poison", "physical"],             loot: ["Spider Silk", "Venom Sac", "Chitin"],          xp: 38,  faction: "wilds",     intro: ["Eight glinting eyes watch from the web above.", "A spider drops silently onto the path."] },
  { id: "bat",       name: "Vampire Bat", hp: 0.6, atk: 0.7, def: 0.4,  spd: 20, elements: ["physical", "shadow"],             loot: ["Bat Wing", "Small Fang", "Guano"],             xp: 28,  faction: "wilds",     intro: ["Leathery wings cut the air as a bat shrieks.", "A swarm of bats peels away from the cave mouth."] },
  { id: "bandit",    name: "Bandit",    hp: 1.1,  atk: 1.0,  def: 0.8,  spd: 13, elements: ["physical"],                       loot: ["Stolen Goods", "Gold Pouch", "Dagger"],         xp: 60,  faction: "warbands",  intro: ["A masked bandit levels a crossbow at you.", "\"Hand over your gold and nobody gets hurt!\""] },
  { id: "cultist",   name: "Cultist",   hp: 0.9,  atk: 0.9,  def: 0.6,  spd: 12, elements: ["shadow", "arcane"],               loot: ["Cult Robe", "Ritual Dagger", "Dark Tome"],     xp: 65,  faction: "void_cult", intro: ["The cultist chants in a language that hurts to hear.", "Purple fire flickers between its fingers."] },
  { id: "elemental", name: "Elemental", hp: 1.2,  atk: 1.3,  def: 1.0,  spd: 9,  elements: ["fire", "ice", "lightning"],      loot: ["Elemental Core", "Primal Essence", "Cinder"],  xp: 80,  faction: "deep_ones", intro: ["Heat and rage coalesce into a living storm.", "The elemental's core pulses like a heartbeat."] },
  { id: "construct", name: "Construct", hp: 1.8,  atk: 1.1,  def: 1.6,  spd: 7,  elements: ["earth", "arcane"],               loot: ["Gear Fragment", "Ancient Plate", "Power Cell"], xp: 90,  faction: "deep_ones", intro: ["Stone and bronze grind into motion.", "An ancient guardian awakens, eyes blazing blue."] },
  { id: "insect",    name: "Giant Insect", hp: 0.9, atk: 0.8, def: 1.0, spd: 14, elements: ["poison", "earth"],                loot: ["Carapace", "Insect Wing", "Pheromone Sac"],    xp: 42,  faction: "wilds",     intro: ["The undergrowth rustles with skittering legs.", "Mandibles click in the darkness."] },
  { id: "plant",     name: "Corrupted Plant", hp: 1.3, atk: 0.7, def: 0.9, spd: 6, elements: ["poison", "water"],              loot: ["Venom Bloom", "Thorn Vine", "Sap"],            xp: 36,  faction: "wilds",     intro: ["A flower opens its petals to reveal teeth.", "Vines slither across the ground toward you."] },
  { id: "serpent",   name: "Serpent",   hp: 1.0,  atk: 1.1,  def: 0.7,  spd: 16, elements: ["poison", "water"],               loot: ["Serpent Scale", "Venom Fang", "Skin"],         xp: 52,  faction: "wilds",     intro: ["A forked tongue tastes the air. You taste fear.", "Coils tighten in the shallows."] },
  { id: "bird",      name: "Harpy",     hp: 0.7,  atk: 0.8,  def: 0.5,  spd: 22, elements: ["wind", "physical"],               loot: ["Harpy Feather", "Sharp Talon", "Egg"],         xp: 45,  faction: "fey",       intro: ["A harpy shrieks a mocking song from above.", "Talons rake the air as it dives."] },
  { id: "fish",      name: "Deep Fish", hp: 1.0,  atk: 0.9,  def: 0.8,  spd: 12, elements: ["water", "ice"],                   loot: ["Fish Scale", "Abyssal Fin", "Pearl"],          xp: 48,  faction: "deep_ones", intro: ["The water churns. A lamprey-toothed maw surfaces.", "Gills flare as the deep one lunges."] },
  { id: "spirit",    name: "Wraith",    hp: 0.7,  atk: 1.2,  def: 0.4,  spd: 19, elements: ["shadow", "ice"],                  loot: ["Ectoplasm", "Soul Shard", "Wisp Essence"],     xp: 70,  faction: "void_cult", intro: ["The air grows cold. A wail echoes from nowhere.", "A translucent shape drifts through the wall."] },
  { id: "demon",     name: "Demon",     hp: 1.6,  atk: 1.5,  def: 1.2,  spd: 11, elements: ["fire", "shadow", "arcane"],       loot: ["Demon Horn", "Infernal Heart", "Hellfire Ash"], xp: 120, faction: "void_cult", intro: ["The ground cracks and brimstone smoke rises.", "A demon steps from the rift, grinning with too many teeth."] },
  { id: "giant",     name: "Hill Giant", hp: 2.4, atk: 1.6,  def: 1.3,  spd: 6,  elements: ["earth", "physical"],              loot: ["Giant Toe", "Crushed Ore", "Big Club"],         xp: 140, faction: "deep_ones", intro: ["The ground shakes with every footfall.", "A giant squints down at you like you're an ant."] },
];

// ---- 10 variant modifiers ------------------------------------
const VARIANTS = [
  { id: "scout",       title: "Scout",        hp: 0.85, atk: 0.9,  def: 0.8,  spd: 1.3 },
  { id: "brute",       title: "Brute",        hp: 1.5,  atk: 1.25, def: 1.1,  spd: 0.8 },
  { id: "shaman",      title: "Shaman",       hp: 1.0,  atk: 0.9,  def: 0.9,  spd: 1.0, magic: 1.5 },
  { id: "leader",      title: "Warband Leader", hp: 1.4, atk: 1.15, def: 1.2, spd: 1.05 },
  { id: "frost",       title: "Frost-Touched",  hp: 1.1, atk: 1.05, def: 1.0, spd: 0.95, element: "ice" },
  { id: "void",        title: "Void-Touched",   hp: 1.15, atk: 1.1, def: 0.9, spd: 1.05, element: "shadow" },
  { id: "elder",       title: "Elder",        hp: 1.6,  atk: 1.2,  def: 1.3,  spd: 0.9 },
  { id: "cursed",      title: "Cursed",       hp: 1.2,  atk: 1.1,  def: 1.0,  spd: 1.0, element: "arcane" },
  { id: "radiant",     title: "Radiant",      hp: 1.1,  atk: 1.05, def: 1.15, spd: 1.0, element: "light" },
  { id: "ancient",     title: "Ancient",      hp: 2.0,  atk: 1.3,  def: 1.5,  spd: 0.7 },
];

// ---- 5 tier bands --------------------------------------------
const BANDS = [
  { id: 1, name: "Apprentice", tiers: [1, 20],   mult: 1 },
  { id: 2, name: "Adept",      tiers: [21, 40],  mult: 2.2 },
  { id: 3, name: "Expert",     tiers: [41, 60],  mult: 4.5 },
  { id: 4, name: "Master",     tiers: [61, 80],  mult: 8 },
  { id: 5, name: "Legend",     tiers: [81, 100], mult: 14 },
];

// ---- enemy skills --------------------------------------------
const ENEMY_SKILLS = [
  { id: "enrage",        name: "Enrage",         power: 1.4, element: "physical", statusId: "berserk",  statusChance: 1.0, cooldown: 4 },
  { id: "venom_bite",    name: "Venom Bite",     power: 0.9, element: "poison",   statusId: "poison",   statusChance: 0.6, cooldown: 3 },
  { id: "frost_strike",  name: "Frost Strike",   power: 1.1, element: "ice",      statusId: "chill",    statusChance: 0.5, cooldown: 3 },
  { id: "fireball",      name: "Fireball",       power: 1.3, element: "fire",     statusId: "burn",     statusChance: 0.5, cooldown: 4 },
  { id: "shadow_bolt",   name: "Shadow Bolt",    power: 1.2, element: "shadow",   statusId: "weaken",   statusChance: 0.4, cooldown: 3 },
  { id: "slam",          name: "Slam",           power: 1.5, element: "earth",    statusId: "stun",     statusChance: 0.3, cooldown: 5 },
  { id: "rend",          name: "Rend",           power: 1.0, element: "physical", statusId: "bleed",    statusChance: 0.6, cooldown: 3 },
  { id: "scream",        name: "Terrifying Scream", power: 0.6, element: "shadow", statusId: "fear",   statusChance: 0.35, cooldown: 5 },
  { id: "leech",         name: "Life Leech",     power: 0.8, element: "shadow",   statusId: "lifesteal", statusChance: 1.0, cooldown: 4 },
  { id: "charge",        name: "Charge",         power: 1.6, element: "physical", statusId: "knockback", statusChance: 0.5, cooldown: 4 },
];

// ---- elite modifiers -----------------------------------------
const ELITE_MODIFIERS = [
  { id: "armored",      name: "Armored",      desc: "+60% DEF", apply: (e) => { e.def *= 1.6; } },
  { id: "swift",        name: "Swift",        desc: "+40% SPD", apply: (e) => { e.speed *= 1.4; } },
  { id: "berserk",      name: "Berserk",      desc: "+50% ATK, -20% DEF", apply: (e) => { e.atk *= 1.5; e.def *= 0.8; } },
  { id: "regenerating", name: "Regenerating", desc: "Heals each turn", apply: (e) => { e.regenerates = true; } },
  { id: "cursed",       name: "Cursed",       desc: "Curses on hit", apply: (e) => { e.curseOnHit = true; } },
  { id: "vampiric",     name: "Vampiric",     desc: "Heals for damage dealt", apply: (e) => { e.lifesteal = 0.3; } },
  { id: "thorned",      name: "Thorned",      desc: "Reflects damage", apply: (e) => { e.thorns = 0.25; } },
  { id: "phasing",      name: "Phase-Shifting", desc: "Dodges more", apply: (e) => { e.dodge = Math.min(0.35, (e.dodge || 0.05) + 0.2); } },
  { id: "explosive",    name: "Explosive",    desc: "Explodes on death", apply: (e) => { e.explodes = true; } },
  { id: "frenzied",     name: "Frenzied",     desc: "Gains haste when hurt", apply: (e) => { e.frenzied = true; } },
  { id: "manaburn",     name: "Mana-Burning", desc: "Drains mana on hit", apply: (e) => { e.manaBurn = 10; } },
  { id: "immune_fire",  name: "Fire-Immune",  desc: "Immune to fire", apply: (e) => { e.resistances.fire = 1; } },
];

// ---- factions -------------------------------------------------
const FACTIONS = [
  { id: "warbands",   name: "The Crimson Warbands",  members: ["goblin", "orc", "bandit"] },
  { id: "wilds",      name: "The Wilds",             members: ["wolf", "slime", "spider", "bat", "insect", "plant", "serpent"] },
  { id: "legion",     name: "The Ashen Legion",      members: ["skeleton", "zombie"] },
  { id: "void_cult",  name: "The Void Cult",         members: ["cultist", "spirit", "demon"] },
  { id: "deep_ones",  name: "The Deep Ones",         members: ["elemental", "construct", "fish", "giant"] },
  { id: "fey",        name: "The Fey Court",         members: ["bird"] },
];

// ---- build 1000-template registry -----------------------------
const ENEMY_REGISTRY = [];
for (const fam of FAMILIES) {
  for (const var_ of VARIANTS) {
    for (const band of BANDS) {
      const mult = band.mult;
      ENEMY_REGISTRY.push({
        id: `${fam.id}_${var_.id}_t${band.id}`,
        name: `${fam.name} ${var_.title}`,
        family: fam.id,
        variant: var_.id,
        band: band.id,
        tierRange: band.tiers,
        baseStats: {
          hp: Math.floor(40 * fam.hp * var_.hp * mult),
          atk: Math.floor(8 * fam.atk * var_.atk * mult),
          def: Math.floor(2 * fam.def * var_.def * mult),
          magAtk: Math.floor(6 * (var_.magic || 1) * mult),
          magDef: Math.floor(2 * fam.def * mult),
          speed: Math.floor(fam.spd * var_.spd),
        },
        elements: var_.element ? [var_.element, fam.elements[0]] : fam.elements,
        resistances: Object.fromEntries(ELEMENTS.map(el => [el, el === (var_.element || fam.elements[0]) ? 0.2 : 0])),
        lootTable: fam.loot,
        xpBase: fam.xp,
        faction: fam.faction,
        introText: fam.intro,
      });
    }
  }
}

// ---- instance creation ----------------------------------------
function bandForTier(tier) {
  return BANDS.find(b => tier >= b.tiers[0] && tier <= b.tiers[1]) || BANDS[BANDS.length - 1];
}

function createEnemyInstance({ zoneId, playerLevel, elite = false, boss = false, template = null }) {
  const zone = getZone(zoneId);
  const tier = zone.tier;
  const tmpl = template || pick(ENEMY_REGISTRY.filter(t => tier >= t.tierRange[0] && tier <= t.tierRange[1]));
  const lvl = Math.max(1, Math.round(playerLevel * (zoneId / 400 + 0.65)));
  const levelFactor = 1 + (lvl - 1) * 0.12;
  const bossName = zone.worldBoss ? zone.worldBoss.name : null;

  const e = {
    id: `enemy_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    templateId: tmpl.id,
    name: bossName || tmpl.name,
    title: boss ? "World Boss" : elite ? "Elite" : tmpl.variant,
    family: tmpl.family,
    variant: tmpl.variant,
    band: tmpl.band,
    tier,
    zoneId,
    level: lvl,
    hp: Math.floor(tmpl.baseStats.hp * levelFactor * (boss ? 6 : elite ? 2.5 : 1)),
    atk: Math.floor(tmpl.baseStats.atk * levelFactor * (boss ? 2.2 : elite ? 1.6 : 1)),
    def: Math.floor(tmpl.baseStats.def * levelFactor),
    magAtk: Math.floor(tmpl.baseStats.magAtk * levelFactor * (boss ? 2.2 : elite ? 1.6 : 1)),
    magDef: Math.floor(tmpl.baseStats.magDef * levelFactor),
    speed: tmpl.baseStats.speed,
    critChance: 0.05,
    dodge: 0.02,
    elements: tmpl.elements,
    resistances: { ...tmpl.resistances },
    currentHp: null,
    statusEffects: [],
    skills: [pick(ENEMY_SKILLS), pick(ENEMY_SKILLS)].slice(0, chance(0.5) ? 2 : 3),
    elite,
    boss,
    isWorldBoss: !!zone.worldBoss,
    faction: tmpl.faction,
    loot: [],
    xpReward: Math.floor(tmpl.xpBase * levelFactor * (boss ? 8 : elite ? 3 : 1)),
    goldReward: Math.floor((15 + zoneId * 1.5) * levelFactor * (boss ? 8 : elite ? 3 : 1)),
    introText: bossName ? `THE SKY DARKENS. **${bossName}** has awoken!` : pick(tmpl.introText),
    eliteModifiers: [],
    regenerates: false,
    lifesteal: 0,
    thorns: 0,
  };
  e.currentHp = e.hp;
  e.maxHp = e.hp;

  if (elite) {
    const n = randInt(1, 2);
    const mods = [...ELITE_MODIFIERS].sort(() => Math.random() - 0.5).slice(0, n);
    for (const m of mods) {
      e.eliteModifiers.push(m.id);
      m.apply(e);
    }
  }
  if (e.regenerates) e.statusEffects.push({ id: "regeneration", stacks: 1, duration: -1, potency: Math.max(1, Math.floor(e.maxHp * 0.02)) });
  return e;
}

function getEnemyForZone(zone, playerLevel) {
  const tier = zone.tier;
  const pool = ENEMY_REGISTRY.filter(t => tier >= t.tierRange[0] && tier <= t.tierRange[1]);
  const seededPick = pool[Math.floor(Math.abs(Math.sin(zone.id * 7919)) * pool.length) % pool.length];
  const elite = chance(0.12 + tier * 0.002);
  return createEnemyInstance({ zoneId: zone.id, playerLevel, elite, template: seededPick });
}

function getBossForZone(zone, playerLevel) {
  return createEnemyInstance({ zoneId: zone.id, playerLevel, boss: true });
}

function getEnemyFactions() {
  return FACTIONS.map(f => ({ ...f }));
}

// ---- display helpers ------------------------------------------
function enemySummary(e) {
  const tag = e.isWorldBoss ? "🐲 WORLD BOSS" : e.elite ? "💀 Elite" : "";
  return `**${e.name}** ${tag} ⚔️ Lv ${e.level} — HP ${e.currentHp}/${e.maxHp}`;
}

function enemyIntro(e) {
  let s = `${e.introText}\n\n**${e.name}** — Lv ${e.level}\n`;
  if (e.eliteModifiers.length) s += `Modifiers: ${e.eliteModifiers.map(m => ELITE_MODIFIERS.find(x => x.id === m)?.name).join(", ")}\n`;
  s += `Elements: ${e.elements.map(el => ELEMENT_EMOJI[el] || "").join(" ")}\n`;
  s += `HP ${e.currentHp}/${e.maxHp}`;
  return s;
}

module.exports = {
  FAMILIES, VARIANTS, BANDS, ENEMY_SKILLS, ELITE_MODIFIERS, FACTIONS,
  ENEMY_REGISTRY, createEnemyInstance, getEnemyForZone, getBossForZone,
  getEnemyFactions, enemySummary, enemyIntro,
};
});

// ---------------------- embedded module: src/world/loot ----------------------
__def("src/world/loot", function (module, exports, require) {
// ============================================================
// loot.js — procedural loot engine: item generation, rarity
// rolls, affixes, gems/sockets, boss drops, treasure.
// Pure Node (no discord.js). All tables are canonical here.
// ============================================================

const { RARITIES, RARITY_MAP, ELEMENTS, ELEMENT_EMOJI } = require("../config");
const { pick, weightedPick, randInt, chance, seedName, cap, fmtShort } = require("../util");

// ------------------------------------------------------------
// Slots & base stat profiles
// ------------------------------------------------------------

const WEAPON_TYPES = [
  "sword", "axe", "hammer", "dagger", "staff", "wand",
  "bow", "crossbow", "spear", "mace", "fist", "rapier",
];
const OFFHAND_TYPES = ["shield", "orb", "spellbook", "instrument", "flask"];
const ARMOR_SLOTS = ["armor", "helm", "boots", "gloves", "amulet", "ring", "relic"];
const ALL_SLOTS = ["weapon", "offhand", ...ARMOR_SLOTS];

// Flat base stats per slot. Values are "per tier" — final stat is
// `base * tier * rarityMult`, e.g. a weapon at tier 5 / rare (1.6)
// gives ATK 8*5*1.6 = 64.
const SLOT_STATS = {
  armor:  { def: 7, health: 6 },
  helm:   { def: 5, magDef: 3 },
  boots:  { def: 4, speed: 3 },
  gloves: { def: 3, atk: 2 },
  amulet: { health: 6, magDef: 3 },
  ring:   { atk: 2, magAtk: 2 },
  relic:  { health: 10, magDef: 4, atk: 3, magAtk: 3 },
};

// Weapon: atk 8*tier*mult, plus one of magAtk/def depending on type.
const WEAPON_STATS = {
  staff: { atk: 2, magAtk: 8 },   // caster weapons trade atk for magAtk
  wand:  { atk: 2, magAtk: 8 },
  // everything else (sword, axe, hammer, dagger, bow, crossbow,
  // spear, mace, fist, rapier) defaults to { atk: 8, def: 2 }
};

const OFFHAND_STATS = {
  shield:     { def: 8, health: 4 },
  orb:        { magAtk: 7, magDef: 2 },
  spellbook:  { magAtk: 6, magDef: 3 },
  instrument: { magAtk: 4, atk: 3, magDef: 2 },
  flask:      { def: 3, magDef: 3, health: 4 },
};

// Material prefix for auto-named items, keyed by tier.
const MATERIALS = [
  { minTier: 1,  name: "Iron" },
  { minTier: 6,  name: "Steel" },
  { minTier: 11, name: "Mithril" },
  { minTier: 21, name: "Obsidian" },
  { minTier: 31, name: "Runeforged" },
  { minTier: 51, name: "Starlight" },
  { minTier: 81, name: "Voidforged" },
];

// Gold value multiplier per slot (value = 12 * tier * mult * slotMult).
const SLOT_VALUE_MULT = {
  weapon: 1.2, offhand: 0.9, armor: 1.0, helm: 0.9, boots: 0.85,
  gloves: 0.85, amulet: 1.0, ring: 1.0, relic: 1.5,
};

// ------------------------------------------------------------
// Display helpers (shared by summary/detailed)
// ------------------------------------------------------------

const STAT_LABELS = {
  atk: "ATK", magAtk: "MATK", def: "DEF", magDef: "MDEF", health: "HP",
  speed: "SPD", critChance: "CRIT", critDamage: "CDMG", dodge: "DODGE",
  parry: "PARRY", block: "BLOCK", manaRegen: "MPREG", staminaRegen: "STAM",
  xpBonus: "XP", goldBonus: "GOLD", thorns: "THORNS",
  weightReduction: "WEIGHT", lifestealPct: "LIFESTEAL",
  fireDmg: "FIRE DMG", iceDmg: "ICE DMG", lightningDmg: "STORM DMG",
  earthDmg: "EARTH DMG", windDmg: "WIND DMG", poisonDmg: "POISON DMG",
  shadowDmg: "SHADOW DMG", arcaneDmg: "ARCANE DMG",
  fireRes: "FIRE RES", iceRes: "ICE RES", lightningRes: "STORM RES",
  earthRes: "EARTH RES", windRes: "WIND RES", waterRes: "WATER RES",
  lightRes: "LIGHT RES", shadowRes: "SHADOW RES", poisonRes: "POISON RES",
  arcaneRes: "ARCANE RES",
  "atk%": "ATK%", "magAtk%": "MATK%", "health%": "HP%",
};

const PERCENT_STATS = new Set([
  "critChance", "critDamage", "dodge", "parry", "block", "xpBonus",
  "goldBonus", "lifestealPct", "atk%", "magAtk%", "health%",
  "weightReduction", "fireRes", "iceRes", "lightningRes", "earthRes",
  "windRes", "waterRes", "lightRes", "shadowRes", "poisonRes", "arcaneRes",
]);

function statLabel(stat) {
  return STAT_LABELS[stat] || cap(stat);
}

/** Round affix/gem values: 1 decimal for percents, int for flats. */
function roundStat(v, isPct) {
  return isPct ? Math.round(v * 10) / 10 : Math.round(v);
}

function isPctStat(stat) {
  return PERCENT_STATS.has(stat);
}

function fmtStatValue(stat, value) {
  return `${value}${isPctStat(stat) ? "%" : ""}`;
}

function fmtAffix(affix) {
  return `${affix.value}${affix.unit || (isPctStat(affix.stat) ? "%" : "")}`;
}

function localUid(prefix = "itm") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ------------------------------------------------------------
// Affix table (~32 affixes; value scales with tier & rarity)
// ------------------------------------------------------------

const AFFIXES = [
  { id: "precision",    name: "Precision",    stat: "critChance",    perTier: 1.0, unit: "%", desc: "critical hit chance" },
  { id: "ruthlessness", name: "Ruthlessness", stat: "critDamage",    perTier: 5.0, unit: "%", desc: "critical hit damage" },
  { id: "grace",        name: "Grace",        stat: "dodge",         perTier: 1.0, unit: "%", desc: "chance to dodge attacks" },
  { id: "parry",        name: "Parry",        stat: "parry",         perTier: 1.0, unit: "%", desc: "chance to parry melee attacks" },
  { id: "bulwark",      name: "Bulwark",      stat: "block",         perTier: 1.0, unit: "%", desc: "chance to block attacks" },
  { id: "swiftness",    name: "Swiftness",    stat: "speed",         perTier: 2.0, unit: "",  desc: "attack speed" },
  { id: "might",        name: "Might",        stat: "atk%",          perTier: 2.0, unit: "%", desc: "attack power" },
  { id: "sorcery",      name: "Sorcery",      stat: "magAtk%",       perTier: 2.0, unit: "%", desc: "magic attack power" },
  { id: "fortitude",    name: "Fortitude",    stat: "def",           perTier: 3.0, unit: "",  desc: "physical defense" },
  { id: "aegis",        name: "Aegis",        stat: "magDef",        perTier: 3.0, unit: "",  desc: "magical defense" },
  { id: "vampiric",     name: "Vampiric",     stat: "lifestealPct",  perTier: 0.5, unit: "%", desc: "healing from damage dealt" },
  { id: "clarity",      name: "Clarity",      stat: "manaRegen",     perTier: 2.0, unit: "",  desc: "mana regenerated per turn" },
  { id: "endurance",    name: "Endurance",    stat: "staminaRegen",  perTier: 2.0, unit: "",  desc: "stamina regenerated per turn" },
  { id: "insight",      name: "Insight",      stat: "xpBonus",       perTier: 2.0, unit: "%", desc: "experience gained" },
  { id: "greed",        name: "Greed",        stat: "goldBonus",     perTier: 3.0, unit: "%", desc: "gold gained" },
  { id: "thorns",       name: "Thorns",       stat: "thorns",        perTier: 3.0, unit: "",  desc: "damage reflected to attackers" },
  { id: "vitality",     name: "Vitality",     stat: "health%",       perTier: 2.0, unit: "%", desc: "maximum health" },
  { id: "featherlight", name: "Featherlight", stat: "weightReduction", perTier: 5.0, unit: "%", desc: "carry weight" },
  // Element damage bonus
  { id: "inferno",      name: "Inferno",      stat: "fireDmg",       perTier: 4.0, unit: "",  desc: "fire damage bonus" },
  { id: "frostbite",    name: "Frostbite",    stat: "iceDmg",        perTier: 4.0, unit: "",  desc: "ice damage bonus" },
  { id: "static",       name: "Static",       stat: "lightningDmg",  perTier: 4.0, unit: "",  desc: "lightning damage bonus" },
  { id: "earthshaker",  name: "Earthshaker",  stat: "earthDmg",      perTier: 4.0, unit: "",  desc: "earth damage bonus" },
  { id: "gale",         name: "Gale",         stat: "windDmg",       perTier: 4.0, unit: "",  desc: "wind damage bonus" },
  { id: "venom",        name: "Venom",        stat: "poisonDmg",     perTier: 4.0, unit: "",  desc: "poison damage bonus" },
  { id: "umbral",       name: "Umbral",       stat: "shadowDmg",     perTier: 4.0, unit: "",  desc: "shadow damage bonus" },
  { id: "mysticism",    name: "Mysticism",    stat: "arcaneDmg",     perTier: 4.0, unit: "",  desc: "arcane damage bonus" },
  // Element resistance
  { id: "fireward",     name: "Fire Ward",    stat: "fireRes",       perTier: 2.0, unit: "%", desc: "fire resistance" },
  { id: "frostward",    name: "Frost Ward",   stat: "iceRes",        perTier: 2.0, unit: "%", desc: "ice resistance" },
  { id: "stormward",    name: "Storm Ward",   stat: "lightningRes",  perTier: 2.0, unit: "%", desc: "lightning resistance" },
  { id: "venomward",    name: "Venom Ward",   stat: "poisonRes",     perTier: 2.0, unit: "%", desc: "poison resistance" },
  { id: "umbralward",   name: "Umbral Ward",  stat: "shadowRes",     perTier: 2.0, unit: "%", desc: "shadow resistance" },
  { id: "arcaneward",   name: "Arcane Ward",  stat: "arcaneRes",     perTier: 2.0, unit: "%", desc: "arcane resistance" },
];

// Affix count ranges per rarity: [min, max]
const AFFIX_RANGE = {
  common: [0, 0],
  uncommon: [1, 1],
  rare: [1, 2],
  epic: [2, 2],
  legendary: [2, 3],
  mythic: [3, 3],
  artifact: [3, 4],
};

// Ceilings for percent stats (probabilities can't exceed 100%).
const STAT_CAPS = {
  critChance: 40, dodge: 40, parry: 40, block: 40,
  lifestealPct: 25, weightReduction: 50,
  xpBonus: 100, goldBonus: 100,
  "atk%": 60, "magAtk%": 60, "health%": 60,
  fireRes: 60, iceRes: 60, lightningRes: 60, earthRes: 60,
  windRes: 60, waterRes: 60, lightRes: 60, shadowRes: 60,
  poisonRes: 60, arcaneRes: 60,
  critDamage: 200,
};

/**
 * Roll affixes for an item. Each affix appears at most once and its
 * value scales with item tier and rarity mult (±10% jitter).
 */
function rollAffixes(rarityId, tier, mult) {
  const [min, max] = AFFIX_RANGE[rarityId] || [0, 0];
  const count = randInt(min, max);
  const pool = AFFIXES.slice();
  const affixes = [];
  while (affixes.length < count && pool.length > 0) {
    const a = pool.splice(randInt(0, pool.length - 1), 1)[0];
    const jitter = randInt(90, 110) / 100;
    const raw = a.perTier * tier * mult * jitter;
    let value = a.unit === "%" ? roundStat(raw, true) : roundStat(raw, false);
    const cap = STAT_CAPS[a.stat];
    if (cap !== undefined) value = Math.min(value, cap);
    affixes.push({ id: a.id, name: a.name, stat: a.stat, value, unit: a.unit, desc: a.desc });
  }
  return affixes.sort((x, y) => y.value - x.value);
}

// ------------------------------------------------------------
// Gem table (~13 gems; socketed into items)
// ------------------------------------------------------------

const GEMS = [
  { id: "ruby",       name: "Ruby",       stat: "atk",          perTier: 3.0, unit: ""  },
  { id: "sapphire",   name: "Sapphire",   stat: "magAtk",       perTier: 3.0, unit: ""  },
  { id: "emerald",    name: "Emerald",    stat: "def",          perTier: 3.0, unit: ""  },
  { id: "diamond",    name: "Diamond",    stat: "magDef",       perTier: 3.0, unit: ""  },
  { id: "topaz",      name: "Topaz",      stat: "health",       perTier: 6.0, unit: ""  },
  { id: "opal",       name: "Opal",       stat: "speed",        perTier: 2.0, unit: ""  },
  { id: "onyx",       name: "Onyx",       stat: "critChance",   perTier: 0.8, unit: "%" },
  { id: "amethyst",   name: "Amethyst",   stat: "critDamage",   perTier: 4.0, unit: "%" },
  { id: "garnet",     name: "Garnet",     stat: "lifestealPct", perTier: 0.6, unit: "%" },
  { id: "citrine",    name: "Citrine",    stat: "goldBonus",    perTier: 3.0, unit: "%" },
  { id: "jade",       name: "Jade",       stat: "xpBonus",      perTier: 2.0, unit: "%" },
  { id: "aquamarine", name: "Aquamarine", stat: "iceRes",       perTier: 2.0, unit: "%" },
  { id: "peridot",    name: "Peridot",    stat: "fireRes",      perTier: 2.0, unit: "%" },
];

/** Roll a random gem of the given tier (default 1). */
function generateGem(tier = 1) {
  const def = pick(GEMS);
  const raw = def.perTier * tier;
  let value = def.unit === "%" ? roundStat(raw, true) : roundStat(raw, false);
  const cap = STAT_CAPS[def.stat];
  if (cap !== undefined) value = Math.min(value, cap);
  return { id: def.id, name: def.name, stat: def.stat, value, unit: def.unit, tier };
}

/** Socket a gem into an item. Returns false (and does nothing) if no free socket. */
function socketGem(item, gem) {
  if (!item || !gem) return false;
  if (!Array.isArray(item.gems) || item.gems.length >= (item.sockets || 0)) return false;
  item.gems.push(gem);
  return true;
}

// ------------------------------------------------------------
// Item generation
// ------------------------------------------------------------

function resolveSlot(slot) {
  if (slot === "weapon") {
    const type = pick(WEAPON_TYPES);
    return { slot: "weapon", type, stats: WEAPON_STATS[type] || { atk: 8, def: 2 } };
  }
  if (slot === "offhand") {
    const type = pick(OFFHAND_TYPES);
    return { slot: "offhand", type, stats: OFFHAND_STATS[type] };
  }
  const s = slot || pick(ALL_SLOTS);
  if (!SLOT_STATS[s]) return resolveSlot("weapon"); // unknown slot -> fall back
  return { slot: s, type: s, stats: SLOT_STATS[s] };
}

function defaultName(slot, type, tier) {
  const mat = MATERIALS.filter(m => tier >= m.minTier).pop() || MATERIALS[0];
  const noun = type && type !== slot ? cap(type) : cap(slot);
  return `${mat.name} ${noun}`;
}

/**
 * Generate an item.
 * opts: { tier=1, slot, rarity, element, level }
 * rarity defaults to "common"; element defaults to a random element.
 */
// ------------------------------------------------------------
// Item kinds, set items, cursed items
// ------------------------------------------------------------

const ITEM_KINDS = Object.freeze({
  equipment:   { id: "equipment",   name: "Equipment" },
  material:    { id: "material",    name: "Crafting Material" },
  food:        { id: "food",        name: "Food Item" },
  potion:      { id: "potion",      name: "Potion Item" },
  quest:       { id: "quest",       name: "Quest Item" },
  collectible: { id: "collectible", name: "Collectible Item" },
  cosmetic:    { id: "cosmetic",    name: "Cosmetic Item" },
  upgrade:     { id: "upgrade",     name: "Upgrade Item" },
  treasure:    { id: "treasure",    name: "Treasure Item" },
  event:       { id: "event",       name: "Event Item" },
  limited:     { id: "limited",     name: "Limited Item" },
  account:     { id: "account",     name: "Account Item" },
  relic:       { id: "relic",       name: "Relic Item" },
  cursed:      { id: "cursed",      name: "Cursed Item" },
  set:         { id: "set",         name: "Set Item" },
});

const SET_ITEMS = Object.freeze([
  { id: "set_ironheart", name: "Ironheart", pieces: ["Ironheart Blade", "Ironheart Plate", "Ironheart Helm", "Ironheart Ring"], bonus: "3 pieces: +10% DEF. 4 pieces: +15% ATK." },
  { id: "set_moonveil",  name: "Moonveil",  pieces: ["Moonveil Robe", "Moonveil Hood", "Moonveil Orb", "Moonveil Boots"], bonus: "3 pieces: +15% MATK. 4 pieces: +30 MP." },
  { id: "set_windrider", name: "Windrider", pieces: ["Windrider Bow", "Windrider Cloak", "Windrider Boots"], bonus: "2 pieces: +10% speed. 3 pieces: +10% dodge." },
  { id: "set_voidshroud", name: "Voidshroud", pieces: ["Voidshroud Dagger", "Voidshroud Mask", "Voidshroud Cloak"], bonus: "2 pieces: +10% crit. 3 pieces: +15% shadow damage." },
  { id: "set_dragonfire", name: "Dragonfire", pieces: ["Dragonfire Axe", "Dragonfire Scale", "Dragonfire Amulet"], bonus: "2 pieces: +10% fire damage. 3 pieces: +20% fire resistance." },
]);

const CURSED_AFFIXES = [
  { stat: "atk",      value: -8, desc: "The blade thirsts. -8 ATK" },
  { stat: "maxHp",    value: -60, desc: "Life ebbs away. -60 HP" },
  { stat: "def",      value: -6, desc: "Cracks spread. -6 DEF" },
  { stat: "speed",    value: -5, desc: "Weighted by doom. -5 speed" },
  { stat: "critChance", value: -0.03, desc: "Luck abandoned you. -3% crit" },
];

function generateItem(name, opts = {}) {
  const { tier = 1, slot: slotHint, rarity = "common", element, level, cursed = false, setId = null } = opts;
  let kind = opts.kind || "equipment";
  const rar = RARITY_MAP[rarity] || RARITY_MAP.common;
  const mult = rar.mult;
  const { slot, type, stats: baseStats } = resolveSlot(slotHint);

  const statBonus = {};
  for (const [stat, base] of Object.entries(baseStats)) {
    statBonus[stat] = Math.round(base * tier * mult);
  }

  const affixes = rollAffixes(rarity, tier, mult);
  const itemLevel = level ?? Math.min(100, tier);
  const el = element || pick(ELEMENTS);
  let value = Math.floor(12 * tier * mult * (SLOT_VALUE_MULT[slot] || 1));
  const legendary = ["legendary", "mythic", "artifact"].includes(rar.id);

  // cursed twist: negative affix, higher value
  let isCursed = cursed || (["rare", "epic", "legendary", "mythic"].includes(rar.id) && chance(0.04));
  if (isCursed) {
    const curse = pick(CURSED_AFFIXES);
    affixes.push({ name: "Cursed", stat: curse.stat, value: curse.value, curse: true, desc: curse.desc });
    value = Math.floor(value * 1.5);
    kind = "cursed";
  }

  // set membership
  let set = null;
  if (setId || (["epic", "legendary", "mythic"].includes(rar.id) && chance(0.12))) {
    const s = (SET_ITEMS.find(x => x.id === setId)) || pick(SET_ITEMS);
    set = { id: s.id, name: s.name, pieceName: `${s.name} ${cap(type || "Token")}` };
    name = name || set.pieceName;
    kind = "set";
  }

  return {
    id: localUid("itm"),
    name: name || defaultName(slot, type, tier),
    rarityId: rar.id,
    rarityName: rar.name,
    color: rar.color,
    slot,
    type,
    kind,
    kindName: (ITEM_KINDS[kind] || ITEM_KINDS.equipment).name,
    tier,
    level: itemLevel,
    element: el,
    value,
    statBonus,
    affixes,
    sockets: rar.sockets,
    gems: [],
    legendary,
    set,
    cursed: isCursed || undefined,
  };
}

// ------------------------------------------------------------
// Rarity rolls & loot drops
// ------------------------------------------------------------

/** Weight for a rarity id at a given tier (mythic/artifact unlock at 80+). */
function boostedWeight(rarityId, tier) {
  let w = RARITY_MAP[rarityId].weight;
  if (tier < 80 && (rarityId === "mythic" || rarityId === "artifact")) w = 0;
  if (rarityId === "epic" || rarityId === "legendary") {
    if (tier >= 50) w *= 3;
    else if (tier >= 20) w *= 2;
  }
  if (tier >= 80) {
    if (rarityId === "mythic") w *= 10;
    if (rarityId === "artifact") w *= 15;
  }
  return w;
}

/** Roll a rarity id via weightedPick over RARITIES, boosted at high tiers. */
function rollRarity(tier = 1) {
  const entries = RARITIES.map(r => ({ item: r.id, weight: boostedWeight(r.id, tier) }));
  return weightedPick(entries) || "common";
}

const EPIC_PLUS = ["epic", "legendary", "mythic", "artifact"];

/** Roll only epic+ rarities (boss guarantee). */
function rollEpicPlus(tier) {
  const entries = EPIC_PLUS.map(id => ({ item: id, weight: boostedWeight(id, tier) }));
  return weightedPick(entries) || "epic";
}

/**
 * Roll a loot drop.
 * opts: { tier=1, level, boss=false, playerLevel, lootMult=1 }
 * Returns { items, gold }.
 */
const FLAVOR_DROPS = {
  collectible: ["Ancient Coin", "Torn Map Page", "Hero's Token", "Beast Trophy", "Old Portrait"],
  cosmetic:    ["Crimson Dye", "Silk Ribbon", "Golden Circlet Skin", "Chalk Emblem"],
  upgrade:     ["Refinement Stone", "Sharpening Kit", "Armor Patch Kit", "Socket Chisel"],
  treasure:    ["Loose Gem", "Locked Strongbox", "Jeweled Idol", "Salted Bounty"],
  event:       ["Festival Lantern", "Harvest Token", "Winter Coin", "Blossom Petal"],
  limited:     ["Mystery Crate", "Vintage Cog", "One-of-a-Kind Trinket"],
  quest:       ["Strange Relic", "Sealed Letter", "Iron Key", "Ritual Ash"],
  material:    ["Enchanted Thread", "Tempered Glass", "Runic Shard", "Chimera Sinew"],
  food:        ["Smoked Fish", "Trail Mix", "Honeycomb", "Spiced Nuts"],
  potion:      ["Tonic of Clarity", "Bitter Antidote", "Glowing Draught"],
  account:     ["Soulbound Mark", "Legacy Seal", "Starter Blessing"],
  relic:       ["Relic of the First Age", "Hero's Remnant", "Void Charm"],
};

function rollLoot(opts = {}) {
  const { tier = 1, level, boss = false, playerLevel, lootMult = 1 } = opts;
  const itemLevel = level ?? playerLevel ?? Math.min(100, tier);
  const items = [];
  const dropCount = randInt(1, 3);

  for (let i = 0; i < dropCount; i++) {
    items.push(generateItem(null, { tier, rarity: rollRarity(tier), level: itemLevel }));
  }

  // Boss guarantee: at least one epic+ drop.
  if (boss && !items.some(it => EPIC_PLUS.includes(it.rarityId))) {
    items[items.length - 1] = generateItem(null, { tier, rarity: rollEpicPlus(tier), level: itemLevel });
  }

  // Rare lucky bonus drop when lootMult is high.
  if (chance(Math.min(0.35, 0.1 * lootMult))) {
    items.push(generateItem(null, { tier, rarity: rollRarity(tier), level: itemLevel }));
  }

  // Flavor-kind drops (collectible, cosmetic, upgrade, event, quest, material...)
  const flavorKinds = ["collectible", "cosmetic", "upgrade", "treasure", "event", "quest", "food", "potion", "relic", "account"];
  for (const kind of flavorKinds) {
    if (chance(0.04 + (boss ? 0.06 : 0))) {
      const pool = FLAVOR_DROPS[kind];
      if (pool) {
        items.push({
          id: localUid("itm"),
          name: pick(pool),
          rarityId: "common",
          rarityName: "Common",
          color: 0x9e9e9e,
          slot: kind,
          type: kind,
          kind,
          kindName: (ITEM_KINDS[kind] || ITEM_KINDS.equipment).name,
          tier: Math.max(1, Math.floor(tier / 2)),
          level: itemLevel,
          element: "physical",
          value: Math.floor(6 * tier),
          statBonus: {},
          affixes: [],
          sockets: 0,
          gems: [],
          legendary: false,
        });
      }
    }
  }

  // Gold: base scales with tier & lootMult, +2% per player level, x3 for boss.
  let gold = Math.floor(randInt(10, 18) * tier * lootMult * (1 + (playerLevel || 0) * 0.02));
  if (boss) gold = Math.floor(gold * 3);

  // Currency drops (gems / tokens)
  const currencies = {};
  if (chance(0.2 * lootMult)) currencies.gems = randInt(1, 3 + Math.floor(tier / 20));
  if (chance(0.15 * lootMult)) currencies.tokens = randInt(1, 2 + Math.floor(tier / 30));

  return { items, gold, currencies };
}

// ------------------------------------------------------------
// Treasure
// ------------------------------------------------------------

const SEALED_CHESTS = [
  { id: "iron",    name: "Iron Sealed Chest",    tier: 5,  emoji: "📦", desc: "A rusted chest bound with iron straps." },
  { id: "silver",  name: "Silver Sealed Chest",  tier: 15, emoji: "🥈", desc: "Filigree silver that hums faintly." },
  { id: "gold",    name: "Gold Sealed Chest",    tier: 30, emoji: "👑", desc: "A king's ransom waits inside." },
  { id: "rune",    name: "Rune-Sealed Chest",    tier: 50, emoji: "🔮", desc: "Warded runes crawl across the lid." },
  { id: "abyssal", name: "Abyssal Sealed Chest", tier: 80, emoji: "🌑", desc: "The lock stares back at you." },
];

const TREASURE_HINTS = [
  "Follow the old riverbed east until the trees part.",
  "Dig where the shadow of the third standing stone falls at dusk.",
  "A broken cart marks the trail — its wheel points the way.",
  "The bark of the oldest tree in the zone hides the first clue.",
  "Follow the birds that never land.",
  "Behind the waterfall, beneath the ledge, past the bones.",
  "The keeper sleeps at the end of the whispering path.",
];

/** Generate a treasure map pointing at a zone. */
function generateTreasureMap(zoneId) {
  const keeper = seedName("treasure_" + zoneId);
  return {
    id: localUid("map"),
    name: "Treasure Map",
    zoneId,
    hint: `${keeper}'s hoard: ${pick(TREASURE_HINTS)}`,
  };
}

/** Generate an artifact-tier relic with a unique flavor name. */
function generateRelic(tier = 1) {
  const flavor = seedName("relic_" + tier + "_" + randInt(1, 99999));
  return generateItem(`${flavor}'s Relic`, { tier, slot: "relic", rarity: "artifact", level: Math.min(100, tier) });
}

// ------------------------------------------------------------
// Formatting
// ------------------------------------------------------------

/**
 * Short one-line summary: **Iron Sword** [Rare] 🗡️ (ATK +64, CRIT +8%)
 */
function itemSummary(item) {
  const rar = RARITY_MAP[item.rarityId] || RARITY_MAP.common;
  const emoji = ELEMENT_EMOJI[item.element] || "🎒";
  const parts = [];

  const baseEntries = Object.entries(item.statBonus || {})
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([stat, v]) => `${statLabel(stat)} +${v}${isPctStat(stat) ? "%" : ""}`);

  if (baseEntries.length > 0) parts.push(baseEntries[0]);
  for (const aff of (item.affixes || []).slice(0, 2)) {
    parts.push(`${statLabel(aff.stat)} +${fmtAffix(aff)}`);
  }
  if (parts.length < 2 && baseEntries[1]) parts.push(baseEntries[1]);

  return `**${item.name}** [${rar.name}] ${emoji} (${parts.join(", ")})`;
}

/**
 * Multi-line breakdown: stats, affixes, sockets, gems, value.
 */
function itemDetailed(item) {
  const rar = RARITY_MAP[item.rarityId] || RARITY_MAP.common;
  const emoji = ELEMENT_EMOJI[item.element] || "";
  const lines = [];

  lines.push(`**${item.name}** [${rar.name}] ${emoji}${item.legendary ? " ⭐" : ""}`);
  const typePart = item.type && item.type !== item.slot ? ` (${cap(item.type)})` : "";
  lines.push(`Tier ${item.tier} • Level ${item.level} • ${cap(item.slot)}${typePart} • ${cap(item.element)}`);

  const stats = Object.entries(item.statBonus || {})
    .map(([stat, v]) => `${statLabel(stat)} +${v}${isPctStat(stat) ? "%" : ""}`);
  if (stats.length) lines.push(stats.join(" | "));

  if (item.affixes.length > 0) {
    lines.push("__Affixes:__");
    for (const aff of item.affixes) {
      const sign = aff.stat === "weightReduction" ? "−" : "+";
      lines.push(`  • **${aff.name}** — ${sign}${fmtAffix(aff)} ${aff.desc}`);
    }
  }

  const socketCount = item.sockets || 0;
  if (socketCount > 0) {
    const gemsStr = item.gems.map(() => "💎").join("") + "⚪".repeat(Math.max(0, socketCount - item.gems.length));
    if (item.gems.length > 0) {
      const gemStr = item.gems.map(g => `${g.name} (${statLabel(g.stat)} +${fmtStatValue(g.stat, g.value)})`).join(", ");
      lines.push(`Sockets: ${gemsStr} — ${gemStr}`);
    } else {
      lines.push(`Sockets: ${gemsStr}`);
    }
  } else {
    lines.push("Sockets: none");
  }

  lines.push(`Value: ${fmtShort(item.value)} 🪙`);
  return lines.join("\n");
}

module.exports = {
  // tables
  WEAPON_TYPES, OFFHAND_TYPES, ARMOR_SLOTS, ALL_SLOTS,
  AFFIXES, AFFIX_RANGE, GEMS, SEALED_CHESTS, ITEM_KINDS, SET_ITEMS, FLAVOR_DROPS,
  // generation
  generateItem, rollAffixes, generateGem, socketGem,
  rollRarity, rollEpicPlus, rollLoot,
  generateTreasureMap, generateRelic,
  // formatting
  itemSummary, itemDetailed,
};
});

// ---------------------- embedded module: src/world/quests ----------------------
__def("src/world/quests", function (module, exports, require) {
// ============================================================
// quests.js — quest engine: 10 types, objectives, tracking,
// daily/weekly resets, bounty chains, puzzles. Pure Node.
// ============================================================

const { pick, randInt, chance, cap, fmt, uid } = require("../util");
const { getZone } = require("./zones");
const { ENEMY_REGISTRY, getEnemyFactions } = require("./enemies");
const { rollLoot, generateTreasureMap, itemSummary } = require("./loot");

// ---- quest types ----------------------------------------------
const QUEST_TYPES = [
  { id: "main",        name: "Main Quest",     weight: 6,  daily: false, weekly: false },
  { id: "side",        name: "Side Quest",     weight: 14, daily: false, weekly: false },
  { id: "daily",       name: "Daily Quest",    weight: 0,  daily: true,  weekly: false },
  { id: "weekly",      name: "Weekly Quest",   weight: 0,  daily: false, weekly: true },
  { id: "monthly",     name: "Monthly Quest",  weight: 0,  daily: false, weekly: false },
  { id: "bounty",      name: "Bounty",         weight: 0,  daily: true,  weekly: false },
  { id: "hidden",      name: "Hidden Quest",   weight: 0,  daily: false, weekly: false },
  { id: "puzzle",      name: "Puzzle",         weight: 0,  daily: false, weekly: false },
  { id: "escort",      name: "Escort",         weight: 0,  daily: true,  weekly: false },
  { id: "delivery",    name: "Delivery",       weight: 0,  daily: true,  weekly: false },
  { id: "investigation", name: "Investigation", weight: 0, daily: false, weekly: false },
  { id: "boss",        name: "Boss",           weight: 0,  daily: false, weekly: true },
  { id: "dungeon",     name: "Dungeon",        weight: 0,  daily: false, weekly: false },
  { id: "raid",        name: "Raid",           weight: 0,  daily: false, weekly: true },
  { id: "faction",     name: "Faction",        weight: 0,  daily: false, weekly: false },
  { id: "guild",       name: "Guild",          weight: 0,  daily: false, weekly: false },
  { id: "companion",   name: "Companion",      weight: 0,  daily: false, weekly: false },
  { id: "world",       name: "World",          weight: 0,  daily: false, weekly: true },
  { id: "chain",       name: "Chain",          weight: 0,  daily: false, weekly: false },
  { id: "choice",      name: "Choice",         weight: 0,  daily: false, weekly: false },
  { id: "world_boss",  name: "World Boss",     weight: 0,  daily: false, weekly: true },
];

// ---- story arcs (main quest chains) ----------------------------
const STORY_ARCS = [
  { id: "arc_thorns", name: "The Thorn in the Plains", region: "Whispering Plains", faction: "warbands", steps: ["The First Blood", "A Bandit's Toll", "The Goblin King's Cache", "Whispers from the East", "The Crimson Banner", "Blood in the Wind"] },
  { id: "arc_iron",   name: "Echoes of Ironforge", region: "Ironforge Caverns", faction: "deep_ones", steps: ["The Quiet Forge", "Rust and Ruin", "The Clockwork Heart", "Giants in the Deep", "The Core"] },
  { id: "arc_blight", name: "The Blighted Crown", region: "Blighted Forest", faction: "legion", steps: ["Rot at the Roots", "The Hollow Grove", "The Dead King's Men", "Ash and Bone", "The Crown Falls"] },
  { id: "arc_void",   name: "The Void Opens", region: "Eldritch Void", faction: "void_cult", steps: ["A Rift in Reality", "The Cult's Mark", "Eyes in the Dark", "The Ritual", "Close the Gate"] },
  { id: "arc_frost",  name: "Frostbite Rising", region: "Frostbite Tundra", faction: "wilds", steps: ["The First Snow", "Winter's Teeth", "The Frozen Throne", "The Long Night", "Thaw"] },
  { id: "arc_abyss",  name: "Secrets of the Trench", region: "Abyssal Trench", faction: "deep_ones", steps: ["Below the Waves", "The Sunken Temple", "The Leviathan's Wake", "The City of Glass", "Rise"] },
  { id: "arc_sun",    name: "Sunscorch Requiem", region: "Sunscorch Desert", faction: "warbands", steps: ["Dust and Bones", "The Caravan Massacre", "The Sand King", "Oasis of Lies", "The Sun's Wrath"] },
  { id: "arc_sky",    name: "Skyreach Ascension", region: "Skyreach Mountains", faction: "fey", steps: ["The High Road", "The Eagle's Nest", "Storm's Summit", "The Sky Temple", "Above All"] },
  { id: "arc_murk",   name: "The Murkfen Curse", region: "Murkfen Swamp", faction: "void_cult", steps: ["Bog Lights", "The Witch's Hut", "The Croaking Choir", "The Hollow Tree", "Lift the Curse"] },
  { id: "arc_ash",    name: "Legacy of Ashes", region: "Ashen Ruins", faction: "legion", steps: ["The Buried City", "The Ash Archives", "The Last Emperor", "The Rekindling", "From Ashes"] },
];

// ---- side quest templates --------------------------------------
const TEMPLATES = [
  { t: "Help the {npc} find {item}", obj: { kind: "gather", target: "{item}", count: 5 } },
  { t: "Clear {n} {enemy}s from {zone}", obj: { kind: "kill", target: "{family}", count: 8 } },
  { t: "Escort {npc} to {zone}", obj: { kind: "escort", count: 1 } },
  { t: "Investigate the {location} in {zone}", obj: { kind: "explore", count: 1 } },
  { t: "Recover the stolen {item} from {enemy}s", obj: { kind: "kill", target: "{family}", count: 5 } },
  { t: "Fish up {n} {fish} for {npc}", obj: { kind: "fish", target: "{fish}", count: 10 } },
  { t: "Mine {n} {ore} for the blacksmith", obj: { kind: "mine", target: "{ore}", count: 12 } },
  { t: "Chop {n} {wood} for the carpenter", obj: { kind: "chop", target: "{wood}", count: 12 } },
  { t: "Hunt {n} {beast}s in {zone}", obj: { kind: "kill", target: "{family}", count: 6 } },
  { t: "Craft {n} {recipe} for a customer", obj: { kind: "craft", target: "{recipe}", count: 2 } },
  { t: "Deliver {item} to {npc} in {zone}", obj: { kind: "travel", target: "{zone}", count: 1 } },
  { t: "Collect {n} {flower} for the alchemist", obj: { kind: "gather", target: "{flower}", count: 8 } },
  { t: "Slay the {enemy} terrorizing {zone}", obj: { kind: "kill", target: "{family}", count: 3 } },
  { t: "Defend {zone} from a {enemy} raid", obj: { kind: "kill", target: "{family}", count: 10 } },
  { t: "Search {zone} for ancient {item}", obj: { kind: "explore", count: 2 } },
];

const NPCS = ["Old Man Wren", "Mira the Fletcher", "Bren the Smith", "Sister Lark", "Captain Voss", "Hilda the Innkeeper", "Rook the Scout", "Elder Thistle", "The Cartographer", "Madame Vesper"];
const LOCATIONS = ["old mill", "abandoned shrine", "cursed well", "fallen tower", "hidden grotto", "dry fountain", "dwarven door", "haunted crossroads"];
const ITEMS = ["family heirloom", "ceremonial dagger", "lost ledger", "warding charm", "blessed idol", "cursed coin", "ancient scroll", "stolen necklace"];

// ---- riddles ----------------------------------------------------
const RIDDLES = [
  { riddle: "I have cities, but no houses; forests, but no trees; water, but no fish. What am I?", answer: "map" },
  { riddle: "The more you take, the more you leave behind. What am I?", answer: "footsteps" },
  { riddle: "What has keys but opens no locks?", answer: "piano" },
  { riddle: "What gets wetter the more it dries?", answer: "towel" },
  { riddle: "I speak without a mouth and hear without ears. What am I?", answer: "echo" },
  { riddle: "What has a head, a tail, but no body?", answer: "coin" },
  { riddle: "I have a neck but no head, and arms but no hands. What am I?", answer: "shirt" },
  { riddle: "The more you take, the less you have. What am I?", answer: "time" },
  { riddle: "What belongs to you but others use it more than you?", answer: "name" },
  { riddle: "What is always in front of you but can never be seen?", answer: "future" },
  { riddle: "What can travel around the world while staying in a corner?", answer: "stamp" },
  { riddle: "What is so fragile that saying its name breaks it?", answer: "silence" },
];

// ---- helpers -----------------------------------------------------
function tierFactor(zoneId) {
  return 1 + (Math.ceil(zoneId / 10) - 1) * 0.06;
}

function _familyForZone(zoneId) {
  const tier = Math.ceil(zoneId / 10);
  const pool = ENEMY_REGISTRY.filter(t => tier >= t.tierRange[0] && tier <= t.tierRange[1]);
  return pool[Math.floor(Math.abs(Math.sin(zoneId * 2657)) * pool.length) % pool.length];
}

function _scaleReward(level, zoneId, type) {
  const tf = tierFactor(zoneId);
  const mult = type === "weekly" ? 5 : type === "monthly" ? 10 : type === "bounty" ? 4 : type === "world_boss" ? 8 : type === "boss" ? 4 : type === "raid" ? 6 : type === "world" ? 3 : type === "main" ? 1.6 : type === "investigation" ? 2 : type === "companion" ? 2 : type === "delivery" ? 1.2 : type === "faction" ? 1.5 : type === "guild" ? 1.5 : type === "chain" ? 1.3 : type === "choice" ? 1.2 : 1;
  return {
    xp: Math.floor((120 + level * 22) * tf * mult),
    gold: Math.floor((30 + level * 10) * tf * mult),
    items: [],
  };
}

// ---- generation ---------------------------------------------------
function generateQuest(player, { type = "side", zoneId = null } = {}) {
  const zone = zoneId ? getZone(zoneId) : getZone(player.zone || 1);
  const t = QUEST_TYPES.find(x => x.id === type) || QUEST_TYPES[1];
  const level = player.level || 1;
  const reward = _scaleReward(level, zone.id, type);
  let title, description, objectives = [];
  let qChainNext = false;

  if (type === "main") {
    const arc = STORY_ARCS[Math.floor((zone.id - 1) / 10) % STORY_ARCS.length];
    const step = Math.min(arc.steps.length - 1, Math.floor((zone.id % 100) / 10));
    const fam = _familyForZone(zone.id);
    title = arc.steps[step];
    description = `Arc: ${arc.name} — a chapter in a story spanning the realm.`;
    objectives = [{ kind: "kill", target: fam.family, count: 6 + step * 2, current: 0, label: `Slay ${fam.family}s (${fam.name}s)` }];
    if (step >= 3) objectives.push({ kind: "travel", target: Math.min(100, zone.id + 10), count: 1, current: 0, label: "Travel deeper" });
    reward.items.push({ name: pick(["Iron Ore", "Arcane Dust", "Health Potion (M)"]), qty: 2 });
  } else if (type === "side") {
    const tmpl = pick(TEMPLATES);
    const fam = _familyForZone(zone.id);
    const npc = pick(NPCS);
    const obj = { ...tmpl.obj };
    const sub = { "{npc}": npc, "{zone}": zone.name, "{family}": fam.family, "{enemy}": fam.name, "{item}": pick(ITEMS), "{fish}": zone.gatherables.fish, "{ore}": zone.gatherables.mine, "{wood}": zone.gatherables.chop, "{flower}": pick(["Moonpetal", "Starbloom", "Bloodroot"]), "{recipe}": pick(["Health Potion (S)", "Grilled Salmon", "Iron Sword"]), "{beast}": pick(["Boar", "Wolf", "Bear", "Serpent"]) };
    const fill = (s) => s.replace(/\{(\w+)\}/g, (m, k) => sub[k] || k);
    title = fill(tmpl.t);
    description = `A local request near ${zone.name}.`;
    const kind = obj.kind;
    objectives = [{ kind, target: fill(obj.target || ""), count: obj.count, current: 0, label: `${cap(kind)} ${obj.count}x ${fill(obj.target || "")}` }];
    reward.items.push({ name: pick(["Gold", "Iron Ore", "Health Potion (S)"]), qty: 3 });
  } else if (type === "daily") {
    const fam = _familyForZone(zone.id);
    title = `Daily: ${fam.name} Purge`;
    description = `A routine request to keep ${zone.name} safe.`;
    objectives = [{ kind: "kill", target: fam.family, count: 5, current: 0, label: `Slay 5 ${fam.name}s` }];
  } else if (type === "weekly") {
    const fam = _familyForZone(zone.id);
    title = `Weekly: The ${cap(fam.name)} Problem`;
    description = `The elders of ${zone.name} need a serious pest problem dealt with.`;
    objectives = [{ kind: "kill", target: fam.family, count: 15, current: 0, label: `Slay 15 ${fam.name}s` }];
    reward.items.push({ name: "Arcane Dust", qty: 5 });
  } else if (type === "bounty") {
    const fam = _familyForZone(zone.id);
    title = `BOUNTY: ${fam.name} (Elite)`;
    description = `A bounty is posted for an elite ${fam.name.toLowerCase()} in ${zone.name}.`;
    objectives = [{ kind: "kill", target: fam.family, count: 3, elite: true, current: 0, label: `Hunt 3 elite ${fam.name}s` }];
  } else if (type === "hidden") {
    const loc = pick(LOCATIONS);
    title = `A Strange ${cap(loc)}`;
    description = `You heard a rumor about a strange ${loc} in ${zone.name}. Investigate it.`;
    objectives = [{ kind: "explore", target: zone.id, count: 1, current: 0, label: `Investigate the ${loc}` }];
    reward.items.push({ name: "Treasure Compass", qty: 1 });
  } else if (type === "puzzle") {
    const r = pick(RIDDLES);
    title = "The Sphinx's Riddle";
    description = `A sphinx bars the way in ${zone.name}. Answer its riddle:\n\n**${r.riddle}**\n\nAnswer with: \`playrpg quest answer <your answer>\``;
    objectives = [{ kind: "puzzle", target: r.answer, riddle: r.riddle, count: 1, current: 0, label: "Answer the riddle" }];
    reward.xp = Math.floor(reward.xp * 1.5);
  } else if (type === "escort") {
    const npc = pick(NPCS);
    const dest = Math.min(100, zone.id + randInt(1, 3));
    title = `Escort ${npc}`;
    description = `${npc} needs safe passage to ${getZone(dest).name}.`;
    objectives = [{ kind: "escort", target: dest, count: 1, current: 0, label: `Escort ${npc} to ${getZone(dest).name}` }];
    reward.gold = Math.floor(reward.gold * 1.5);
  } else if (type === "dungeon") {
    title = `Clear ${zone.dungeon?.name || "the dungeon"}`;
    description = `Something stirs beneath ${zone.name}. Clear the dungeon.`;
    objectives = [{ kind: "dungeon", target: zone.id, count: 1, current: 0, label: `Clear ${zone.dungeon?.name || "the dungeon"}` }];
    reward.items.push({ name: "Arcane Dust", qty: 8 });
  } else if (type === "world_boss") {
    title = "Slay the World Boss";
    description = `A world boss prowls ${zone.name}. Rally and bring it down!`;
    objectives = [{ kind: "defeat_boss", target: zone.id, count: 1, current: 0, label: `Defeat the boss of ${zone.name}` }];
    reward.items.push({ name: "Soul Shard", qty: 2 });
  } else if (type === "monthly") {
    const fam = _familyForZone(zone.id);
    title = `Monthly: The ${cap(fam.name)} Threat`;
    description = `A month-long campaign to reduce the ${fam.name} population across ${zone.name}.`;
    objectives = [
      { kind: "kill", target: fam.family, count: 30, current: 0, label: `Slay 30 ${fam.name}s` },
      { kind: "gather", target: zone.gatherables.mine, count: 20, current: 0, label: `Gather 20 ${zone.gatherables.mine}` },
    ];
    reward.items.push({ name: "Soul Shard", qty: 3 }, { name: "Arcane Dust", qty: 10 });
  } else if (type === "delivery") {
    const dest = Math.min(100, zone.id + randInt(2, 5));
    title = "Delivery Run";
    description = `Carry a sealed crate to ${getZone(dest).name}.`;
    objectives = [
      { kind: "collect", target: "Sealed Crate", count: 1, current: 0, label: "Pick up the Sealed Crate" },
      { kind: "travel", target: dest, count: 1, current: 0, label: `Deliver to ${getZone(dest).name}` },
    ];
    reward.gold = Math.floor(reward.gold * 1.4);
  } else if (type === "investigation") {
    const loc = pick(LOCATIONS);
    title = "The Case of the Missing Goods";
    description = `Something was stolen from ${zone.name}. Gather clues and investigate.`;
    objectives = [
      { kind: "explore", target: zone.id, count: 1, current: 0, label: `Investigate the ${loc}` },
      { kind: "collect", target: "Clue", count: 3, current: 0, label: "Collect 3 clues" },
      { kind: "kill", target: _familyForZone(zone.id).family, count: 5, current: 0, label: "Interrogate witnesses (fight)" },
    ];
    reward.xp = Math.floor(reward.xp * 1.2);
  } else if (type === "boss") {
    const bossZone = Math.max(25, Math.ceil(zone.id / 25) * 25);
    title = `Hunt the Boss of ${getZone(bossZone).name}`;
    description = "A named monster terrorizes the region. Bring it down.";
    objectives = [{ kind: "defeat_boss", target: bossZone, count: 1, current: 0, label: `Defeat the boss of zone ${bossZone}` }];
    reward.items.push({ name: "Essence of Fire", qty: 2 });
  } else if (type === "raid") {
    const b1 = Math.max(25, Math.ceil(zone.id / 25) * 25);
    const b2 = Math.min(100, b1 + 25);
    title = "Raid: Two Bosses, One Night";
    description = "A coordinated raid against the region's bosses.";
    objectives = [
      { kind: "defeat_boss", target: b1, count: 1, current: 0, label: `Defeat boss of zone ${b1}` },
      { kind: "defeat_boss", target: b2, count: 1, current: 0, label: `Defeat boss of zone ${b2}` },
    ];
    reward.items.push({ name: "Soul Shard", qty: 4 });
  } else if (type === "faction") {
    const factions = getEnemyFactions();
    const rival = factions.find(f => f.members.includes(_familyForZone(zone.id).family)) || factions[0];
    title = `Faction Contract: ${rival.name}`;
    description = `The ${rival.name} grows bold. Prove yourself against them.`;
    objectives = [{ kind: "kill", target: rival.members[0], count: 8, current: 0, label: `Slay 8 ${rival.name} members` }];
    reward.rep = { factionId: rival.id, amount: 150 };
    reward.items.push({ name: "Faction Token", qty: 5 });
  } else if (type === "guild") {
    title = "Guild Contribution";
    description = `Earn glory for your guild by hunting in ${zone.name}.`;
    objectives = [
      { kind: "kill", target: _familyForZone(zone.id).family, count: 10, current: 0, label: "Slay 10 enemies" },
      { kind: "craft", target: "Health Potion (S)", count: 2, current: 0, label: "Craft 2 Health Potions" },
    ];
    reward.guildXp = Math.floor(100 * tierFactor(zone.id));
  } else if (type === "companion") {
    const npc = pick(NPCS);
    const dest = Math.min(100, zone.id + randInt(1, 3));
    title = `${npc}'s Request`;
    description = `A companion-worthy task: protect ${npc} on the road to ${getZone(dest).name}.`;
    objectives = [
      { kind: "escort", target: dest, count: 1, current: 0, label: `Escort ${npc} to ${getZone(dest).name}` },
      { kind: "kill", target: _familyForZone(zone.id).family, count: 4, current: 0, label: "Repel 4 ambushes" },
    ];
    reward.companionXp = 250;
  } else if (type === "world") {
    title = `World Event: Protect ${zone.region.name}`;
    description = `A world event is unfolding in ${zone.region.name}. Contribute to the effort!`;
    objectives = [
      { kind: "kill", target: _familyForZone(zone.id).family, count: 15, current: 0, label: "Slay 15 event enemies" },
      { kind: "gather", target: zone.gatherables.forage, count: 10, current: 0, label: "Gather 10 event supplies" },
    ];
    reward.items.push({ name: "Event Token", qty: 8 });
    reward.seasonXp = 300;
  } else if (type === "chain") {
    const fam = _familyForZone(zone.id);
    const step = player.questChainStep || 0;
    title = `Chain Quest: The Hunt, Part ${step + 1}`;
    description = `A mystery unfolds one hunt at a time. Continue the chain.`;
    objectives = [{ kind: "kill", target: fam.family, count: 5 + step * 2, current: 0, label: `Slay ${5 + step * 2} ${fam.name}s` }];
    if (step < 4) qChainNext = true;
  } else if (type === "choice") {
    title = "A Fork in the Road";
    description = "Two paths lie ahead. Your choice changes the reward.";
    objectives = [{ kind: "choice", option: "a", count: 1, current: 0, label: "Choose: a) take the gold, b) take the power" }];
  }

  const q = {
    id: uid("quest"),
    type,
    title,
    description,
    objectives,
    zoneId: zone.id,
    reward,
    hidden: type === "hidden",
    chainNext: qChainNext || null,
    expiresAt: type === "daily" || type === "bounty" || type === "escort" || type === "delivery" ? endOfDay() : type === "weekly" || type === "world_boss" || type === "boss" || type === "raid" || type === "world" ? endOfWeek() : type === "monthly" ? endOfMonth() : null,
    level,
    createdAt: Date.now(),
  };
  return q;
}

function endOfMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 0);
  return d.getTime();
}

function endOfDay() { const d = new Date(); d.setHours(23, 59, 59, 0); return d.getTime(); }
function endOfWeek() { const d = new Date(); d.setDate(d.getDate() + (7 - d.getDay())); d.setHours(23, 59, 59, 0); return d.getTime(); }

function acceptQuest(player, quest) {
  if ((player.quests.active || []).length >= 10) return { ok: false, reason: "quest_log_full" };
  if (!player.quests.active) player.quests.active = [];
  player.quests.active.push(quest);
  if (quest.type === "daily") player.quests.dailyDone = (player.quests.dailyDone || 0) + 1;
  if (quest.type === "weekly") player.quests.weeklyDone = (player.quests.weeklyDone || 0) + 1;
  return { ok: true, quest };
}

function progressQuest(player, event) {
  const updated = [];
  const active = player.quests.active || [];
  for (const quest of active) {
    for (const obj of quest.objectives) {
      let matched = false;
      if (obj.kind === event.type) {
        if (event.type === "kill") {
          matched = !obj.target || event.target === obj.target || String(event.target).startsWith(obj.target) || (event.family && event.family === obj.target);
        } else if (event.type === "travel" || event.type === "escort") {
          matched = !obj.target || Number(event.target) === Number(obj.target) || Number(event.target) === Number(quest.zoneId);
        } else if (event.type === "defeat_boss") {
          matched = !obj.target || Number(event.target) === Number(quest.zoneId) || !event.zoneId;
        } else if (event.type === "puzzle") {
          matched = String(event.target || "").trim().toLowerCase() === String(obj.target || "").toLowerCase();
        } else {
          matched = !obj.target || String(event.target || "") === String(obj.target) || String(obj.target || "").includes(String(event.target || ""));
        }
      } else if (obj.kind === "choice" && event.type === "choice") {
        matched = event.target === obj.option;
      }
      if (matched && obj.current < obj.count) {
        obj.current += event.amount || 1;
        updated.push({ quest, objective: obj });
        if (obj.current >= obj.count) {
          // check completion
          if (quest.objectives.every(o => o.current >= o.count)) {
            completeQuest(player, quest.id);
            updated.push({ quest, complete: true });
          }
        }
      }
    }
  }
  return updated;
}

function completeQuest(player, questId) {
  const idx = (player.quests.active || []).findIndex(q => q.id === questId);
  if (idx === -1) return { ok: false, reason: "not_found" };
  const [quest] = player.quests.active.splice(idx, 1);
  player.exp += quest.reward.xp;
  player.gold += quest.reward.gold;
  for (const it of quest.reward.items || []) {
    if (it.name === "Gold") player.gold += it.qty * 10;
    else player.inventory[it.name] = (player.inventory[it.name] || 0) + it.qty;
  }
  if (quest.reward.rep) {
    player.reputation[quest.reward.rep.factionId] = (player.reputation[quest.reward.rep.factionId] || 0) + quest.reward.rep.amount;
  }
  if (quest.reward.guildXp && player.guildId) {
    const { guilds } = require("../core/schema");
    const g = guilds.get(player.guildId);
    if (g) g.xp = (g.xp || 0) + quest.reward.guildXp;
  }
  if (quest.reward.companionXp) {
    if (!player.companionXp) player.companionXp = {};
    const comp = player.activeCompanion || "Companion";
    player.companionXp[comp] = (player.companionXp[comp] || 0) + quest.reward.companionXp;
  }
  if (quest.reward.seasonXp) player.seasonXp = (player.seasonXp || 0) + quest.reward.seasonXp;
  // chain quests: offer the next link
  let chainNext = null;
  if (quest.chainNext) {
    player.questChainStep = (player.questChainStep || 0) + 1;
    const next = generateQuest(player, { type: "chain" });
    player.quests.active.push(next);
    chainNext = next;
  }
  if (!player.quests.completed) player.quests.completed = [];
  player.quests.completed.push(quest.id);
  player.quests.totalCompleted = (player.quests.totalCompleted || 0) + 1;
  return { ok: true, quest, rewards: quest.reward, chainNext };
}

function getDailyQuests(player) {
  const quests = [];
  const zone = getZone(player.zone || 1);
  quests.push(generateQuest(player, { type: "daily", zoneId: zone.id }));
  quests.push(generateQuest(player, { type: "bounty", zoneId: zone.id }));
  if (randInt(1, 2) === 1) quests.push(generateQuest(player, { type: "escort", zoneId: zone.id }));
  else quests.push(generateQuest(player, { type: "daily", zoneId: Math.min(100, zone.id + 10) }));
  player.quests.daily = quests;
  return quests;
}

function getWeeklyQuests(player) {
  const quests = [];
  const zone = getZone(player.zone || 1);
  quests.push(generateQuest(player, { type: "weekly", zoneId: zone.id }));
  quests.push(generateQuest(player, { type: "world_boss", zoneId: Math.min(100, Math.ceil(zone.id / 25) * 25) }));
  player.quests.weekly = quests;
  return quests;
}

function checkQuestReset(player) {
  const now = Date.now();
  let reset = false;
  for (const q of player.quests.active || []) {
    if (q.expiresAt && q.expiresAt < now) {
      player.quests.active = player.quests.active.filter(x => x.id !== q.id);
      reset = true;
    }
  }
  if (!player.quests.lastDaily || player.quests.lastDaily < endOfDay()) {
    player.quests.daily = [];
    player.quests.dailyDone = 0;
    player.quests.lastDaily = now;
    reset = true;
  }
  if (!player.quests.lastWeekly || player.quests.lastWeekly < endOfWeek()) {
    player.quests.weekly = [];
    player.quests.weeklyDone = 0;
    player.quests.lastWeekly = now;
    reset = true;
  }
  return reset;
}

function generateBounty(player) {
  const b = generateQuest(player, { type: "bounty" });
  if (player.bountyChain === undefined) player.bountyChain = 0;
  player.bountyChain += 1;
  if (player.bountyChain % 5 === 0) {
    b.reward.xp = Math.floor(b.reward.xp * 2);
    b.reward.gold = Math.floor(b.reward.gold * 2);
    b.title = `MEGA BOUNTY: ${b.title.replace("BOUNTY: ", "")}`;
  }
  return b;
}

function generatePuzzleQuest(player) {
  return generateQuest(player, { type: "puzzle" });
}

function questListText(player) {
  const active = player.quests.active || [];
  if (!active.length) return "📋 **No active quests.** Visit a town and use `playrpg quests daily` to pick up contracts.";
  let s = `📋 **ACTIVE QUESTS (${active.length}/10)**\n\n`;
  for (const q of active) {
    s += `**${q.title}** (${q.type})\n`;
    for (const o of q.objectives) {
      s += `  ↳ ${o.label}: ${o.current}/${o.count}${o.current >= o.count ? " ✅" : ""}\n`;
    }
    s += `\n`;
  }
  return s;
}

function questSummary(q) {
  return `**${q.title}** [${q.type}] — ${q.objectives.map(o => `${o.label} (${o.current}/${o.count})`).join(", ")}`;
}

module.exports = {
  QUEST_TYPES, STORY_ARCS, TEMPLATES, RIDDLES,
  generateQuest, acceptQuest, progressQuest, completeQuest,
  getDailyQuests, getWeeklyQuests, checkQuestReset,
  generateBounty, generatePuzzleQuest, questListText, questSummary,
};
});

// ---------------------- embedded module: src/world/zones ----------------------
__def("src/world/zones", function (module, exports, require) {
// ============================================================
// zones.js — Procedural 1000-zone world generation.
//
// Every zone is derived DETERMINISTICALLY from its id via
// seededRng("zone_" + id): the same id always yields the same
// zone object, across runs and across processes. Nothing is
// stored — zones are regenerated on demand from compact tables.
//
// World layout: 100 pages x 10 zones. The region cycles every
// 10 zones; towns sit on every 5th zone, dungeons on every
// 10th, world bosses on every 25th, PvP zones on every 40th,
// and safe zones start each page (id % 10 === 1).
// ============================================================

const { WORLD, REGIONS, ELEMENTS } = require("../config");
const { seededRng, zoneTier, pick, randInt } = require("../util");

const ZONE_COUNT = WORLD.ZONE_COUNT;                    // 1000
const ZONES_PER_PAGE = WORLD.ZONES_PER_PAGE;            // 10
const ZONE_PAGES = Math.ceil(ZONE_COUNT / ZONES_PER_PAGE); // 100
const WORLD_BOSS_COUNT = Math.floor(ZONE_COUNT / 25);   // 40

// ------------------------------------------------------------
// Data tables (compact, tier-scaled)
// ------------------------------------------------------------

// Biome flavor derived from the region id.
const BIOME_BY_REGION = {
  plains:    "Rolling Grasslands",
  caverns:   "Deep Cave Systems",
  forest:    "Dense Blighted Woods",
  void:      "Riftwarped Expanse",
  tundra:    "Frozen Wastes",
  trench:    "Sunken Depths",
  desert:    "Scorched Dunes",
  mountains: "High Alpine Peaks",
  swamp:     "Murky Marshlands",
  ruins:     "Scorched Rubblefields",
};

// Flavor hazards keyed by region id.
const DANGERS_BY_REGION = {
  plains:    ["bandits", "wild beasts", "stampedes", "poacher traps"],
  caverns:   ["cave-ins", "giant spiders", "drow raiders", "poison gas pockets"],
  forest:    ["bandits", "dire wolves", "venomous flora", "awakened treants"],
  void:      ["reality tears", "void whispers", "eldritch watchers", "madness miasma"],
  tundra:    ["blizzards", "frost giants", "hidden crevasses", "ice wolves"],
  trench:    ["kraken tentacles", "undercurrents", "siren song", "abyssal leviathans"],
  desert:    ["sandstorms", "scorpion swarms", "mirage thieves", "quicksand pits"],
  mountains: ["rockfalls", "harpy ambushes", "thin air", "avalanches"],
  swamp:     ["toxic air", "quicksand", "leech swarms", "bog crocodiles"],
  ruins:     ["trap springs", "undead patrols", "collapsing floors", "cursed relics"],
};

// Gatherable material pools per tier band. Bands are cumulative:
// a zone uses the highest band whose `min` is <= its tier.
//   tier >= 20 -> Mithril / Ancient Wood
//   tier >= 50 -> Adamantite / Void Wood
//   tier >= 80 -> Celestial Ore / Eternity Wood
const MATERIAL_BANDS = [
  {
    min: 1,
    mine:   ["Copper Ore", "Tin Ore", "Iron Ore"],
    chop:   ["Oak Log", "Pine Wood", "Birch Log"],
    fish:   ["Raw Salmon", "Trout"],
    forage: ["Herbs", "Moonpetal"],
    hunt:   ["Rabbit Pelt", "Boar Hide"],
  },
  {
    min: 20,
    mine:   ["Mithril Ore", "Silver Ore", "Gold Ore"],
    chop:   ["Ancient Wood", "Ironbark"],
    fish:   ["Catfish", "Raw Salmon"],
    forage: ["Bloodroot", "Starbloom"],
    hunt:   ["Wolf Pelt", "Boar Hide"],
  },
  {
    min: 50,
    mine:   ["Adamantite Ore", "Orichalcum Ore", "Eternium Ore"],
    chop:   ["Shadowwood", "Frostwood", "Void Wood"],
    fish:   ["Void Fish", "Abyss Eel"],
    forage: ["Starbloom", "Void Lotus"],
    hunt:   ["Bear Pelt", "Wyvern Scale"],
  },
  {
    min: 80,
    mine:   ["Celestial Ore", "Eternium Ore", "Adamantite Ore"],
    chop:   ["Celestial Wood", "Eternity Wood"],
    fish:   ["Skyfin", "Leviathan Scale", "Abyss Eel"],
    forage: ["Void Lotus", "Emberleaf"],
    hunt:   ["Wyvern Scale", "Drake Hide"],
  },
];

const WEATHERS = [
  "clear", "rain", "storm", "snow", "fog",
  "eclipse", "meteor shower", "aurora",
];

const NPC_ROLES = [
  "merchant", "blacksmith", "questgiver", "trainer", "innkeeper",
  "alchemist", "librarian", "scout", "healer", "tinkerer",
];

const NPC_NAMES = [
  "Aldric", "Bram", "Cedric", "Dorian", "Elena", "Fenwick", "Greta",
  "Hilda", "Ingrid", "Jorah", "Kara", "Lysandra", "Mira", "Nolan",
  "Ophelia", "Petra", "Quinn", "Rowan", "Sable", "Torvin", "Ulric",
  "Vesper", "Wren", "Xander", "Yara", "Zephyr",
];

const TOWN_PREFIXES = [
  "Ald", "Bram", "Ced", "Dun", "El", "Fen", "Grim", "Hol", "Ith", "Kael",
  "Lun", "Mor", "Nord", "Ost", "Riv", "Sil", "Thal", "Vale", "Wes", "Yor",
];

const TOWN_SUFFIXES = [
  "haven", "burg", "wick", "ford", "hollow", "reach", "stead", "gate", "mere", "ton",
];

const DUNGEON_NAMES = [
  "Crypt of the Drowned King", "Halls of the Stone Tyrant",
  "Depths of the Forgotten", "Cavern of a Thousand Eyes",
  "Spire of the Mad Archon", "Maze of Whispering Bones",
  "Keep of the Ashen Lord", "Sanctum of the Void Serpent",
  "Vault of the Sunken Moon", "Catacombs of the First Flame",
  "Citadel of the Frozen Heart", "Labyrinth of Shifting Sand",
  "Temple of the Rotted Bloom", "Pit of the World Serpent",
  "Archive of the Dead Stars", "Throne of the Silence Beyond",
];

const BOSS_NAMES = [
  "Vor'gath the World Eater", "Zharrax, Serpent of the Void",
  "Kraulthar the Earthbreaker", "Aeshara, Queen of Storms",
  "Malgoroth the Devourer", "Ix'thul, the Drowned One",
  "Volkanos, Heart of the Mountain", "Nyxara, Mother of Shadows",
  "Thalrond the Frost Tyrant", "Scorchmaw, the Ember Wyrm",
  "Dreadscale the Unmaker", "Oblivion, Walker of the Rift",
  "The Ashen Colossus", "Leviathan of the Deep",
  "Sun-Devourer Ra'zul", "The Endless Hunger",
];

const SECRET_NAMES = [
  "Hidden Cache", "Abandoned Shrine", "Sunken Vault", "Ancient Barrow",
  "Feral Grotto", "Smuggler's Den", "Forgotten Armory", "Moonlit Glade",
  "Wizard's Hollow", "Underground Spring",
];

const SECRET_HINTS = [
  "Rumors say a loose stone hides a passage.",
  "Follow the glow of strange mushrooms at dusk.",
  "A local's map marks an X near the eastern cliffs.",
  "The waterfall hides a narrow ledge behind it.",
  "Strange tracks lead into a hollow tree.",
  "An old rhyme points to the third gravestone.",
  "Fishermen whisper of a cave only visible at low tide.",
  "The moss grows oddly thick on one section of wall.",
  "A raven circles the same spot every morning.",
  "The ground sounds hollow near the old oak.",
];

// ------------------------------------------------------------
// Deterministic helpers
// ------------------------------------------------------------

/** Seeded pick: index into arr with the given rng (returns [0,1)). */
function sPick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

/** Waypoints are town zones (every 5th zone) — travel is free to/from them. */
function isWaypointZone(zoneId) {
  return Number.isFinite(zoneId) && zoneId > 0 && zoneId % 5 === 0;
}

/** Clamp a numeric zone id/page/tier into its valid range (NaN-safe). */
function toRange(n, min, max, fallback) {
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

// ------------------------------------------------------------
// Zone generation
// ------------------------------------------------------------

/**
 * Generate the zone with the given id (1..ZONE_COUNT).
 * Fully deterministic: seededRng("zone_" + id) drives every pick,
 * always consumed in the same order (gatherables -> dangers ->
 * npcs -> secrets -> weather -> danger level).
 */
// ---- world zones: biome types + special realms ----------------
const TYPE_INFO = Object.freeze({
  open:            { id: "open",            name: "Open Region",      emoji: "🌾" },
  forest:          { id: "forest",          name: "Forest Zone",      emoji: "🌲" },
  desert:          { id: "desert",          name: "Desert Zone",      emoji: "🏜️" },
  mountain:        { id: "mountain",        name: "Mountain Zone",    emoji: "🏔️" },
  swamp:           { id: "swamp",           name: "Swamp Zone",       emoji: "🐸" },
  ocean:           { id: "ocean",           name: "Ocean Zone",       emoji: "🌊" },
  island:          { id: "island",          name: "Island Zone",      emoji: "🏝️" },
  cave:            { id: "cave",            name: "Cave Zone",        emoji: "🕳️" },
  volcanic:        { id: "volcanic",        name: "Volcanic Zone",    emoji: "🌋" },
  snow:            { id: "snow",            name: "Snow Zone",        emoji: "❄️" },
  sky:             { id: "sky",             name: "Sky Zone",         emoji: "☁️" },
  underground:     { id: "underground",     name: "Underground Zone", emoji: "⛰️" },
  ruined_city:     { id: "ruined_city",     name: "Ruined City",      emoji: "🏚️" },
  ancient_temple:  { id: "ancient_temple",  name: "Ancient Temple",   emoji: "🏛️" },
  floating_island: { id: "floating_island", name: "Floating Island",  emoji: "🪁" },
  secret_realm:    { id: "secret_realm",    name: "Secret Realm",     emoji: "🔮" },
  dream_realm:     { id: "dream_realm",     name: "Dream Realm",      emoji: "💤" },
  time_realm:      { id: "time_realm",      name: "Time Realm",       emoji: "⏳" },
  elemental_realm: { id: "elemental_realm", name: "Elemental Realm",  emoji: "🌀" },
  endgame_realm:   { id: "endgame_realm",   name: "Endgame Realm",    emoji: "💀" },
});

const BASE_TYPE_BY_REGION = Object.freeze({
  plains: "open", caverns: "cave", forest: "forest", void: "underground",
  tundra: "snow", trench: "ocean", desert: "desert", mountains: "mountain",
  swamp: "swamp", ruins: "ruined_city",
});

/** Milestone realm overrides, highest priority first. Returns override type or null. */
function realmOverride(id, tier) {
  if (id % 89 === 0 && tier >= 8) return "endgame_realm";
  if (id % 83 === 0 && tier >= 5) return "elemental_realm";
  if (id % 79 === 0 && tier >= 6) return "time_realm";
  if (id % 71 === 0 && tier >= 4) return "dream_realm";
  if (id % 61 === 0 && tier >= 3) return "secret_realm";
  if (id % 53 === 0 && tier >= 3) return "floating_island";
  if (id % 37 === 0 && tier >= 2) return "ancient_temple";
  if (id % 13 === 0 && tier >= 2) return "volcanic";
  if (id % 11 === 0 && tier >= 4) return "sky";
  if (id % 17 === 0 && ["ocean", "island"].includes(BASE_TYPE_BY_REGION[REGIONS[(id - 1) % REGIONS.length].id])) return "island";
  return null;
}

function getZoneType(zoneId) {
  const id = zoneId;
  const tier = zoneTier(id);
  const region = REGIONS[(id - 1) % REGIONS.length];
  return realmOverride(id, tier) || BASE_TYPE_BY_REGION[region.id] || "open";
}
function getTypeInfo(typeId) { return TYPE_INFO[typeId] || TYPE_INFO.open; }
function allTypes() { return Object.values(TYPE_INFO); }

function getZone(zoneId) {
  const id = toRange(zoneId, 1, ZONE_COUNT, 1);
  const rng = seededRng("zone_" + id);
  const tier = zoneTier(id);                              // 1..100
  const page = Math.floor((id - 1) / ZONES_PER_PAGE) + 1; // 1..100
  const region = REGIONS[(id - 1) % REGIONS.length];

  // --- gatherables: one deterministic material per skill ---
  const band = getMaterialPoolForTier(tier);
  const gatherables = {
    mine:   sPick(rng, band.mine),
    chop:   sPick(rng, band.chop),
    fish:   sPick(rng, band.fish),
    forage: sPick(rng, band.forage),
    hunt:   sPick(rng, band.hunt),
  };

  // --- dangers: 1-3 hazards from the region's pool ---
  const hazardPool = DANGERS_BY_REGION[region.id] || DANGERS_BY_REGION.plains;
  const dangerCount = 1 + (rng() < 0.5 ? 1 : 0) + (rng() < 0.25 ? 1 : 0);
  const dangers = [];
  for (let i = 0; i < dangerCount; i++) dangers.push(sPick(rng, hazardPool));

  // --- npcs: 1-3 unique name+role pairs ---
  const roles = NPC_ROLES.slice();
  const npcNames = NPC_NAMES.slice();
  const npcCount = 1 + (rng() < 0.6 ? 1 : 0) + (rng() < 0.3 ? 1 : 0);
  const npcs = [];
  for (let i = 0; i < npcCount; i++) {
    const role = roles.splice(Math.floor(rng() * roles.length), 1)[0];
    npcs.push({ name: sPick(rng, npcNames), role });
  }

  // --- secrets: 1-2 hidden locations on every 4th or 7th zone ---
  const secrets = [];
  if (id % 4 === 0 || id % 7 === 0) {
    const secretNames = SECRET_NAMES.slice();
    const secretCount = 1 + (rng() < 0.35 ? 1 : 0);
    for (let i = 0; i < secretCount; i++) {
      const name = secretNames.splice(Math.floor(rng() * secretNames.length), 1)[0];
      secrets.push({ name, hint: sPick(rng, SECRET_HINTS) });
    }
  }

  // --- town (every 5th zone) ---
  const hasTown = id % 5 === 0;
  let townName = null;
  if (hasTown) {
    const trng = seededRng("town_" + id);
    townName = sPick(trng, TOWN_PREFIXES) + sPick(trng, TOWN_SUFFIXES);
  }

  // --- dungeon (every 10th zone) ---
  const hasDungeon = id % 10 === 0;
  let dungeon = null;
  if (hasDungeon) {
    const drng = seededRng("dungeon_" + id);
    dungeon = { name: sPick(drng, DUNGEON_NAMES), level: id * 2, seed: "dungeon_" + id };
  }

  // --- world boss (every 25th zone) ---
  let worldBoss = null;
  if (id % 25 === 0) {
    const brng = seededRng("worldboss_" + id);
    worldBoss = { id: "worldboss_" + id, name: sPick(brng, BOSS_NAMES) };
  }

  // --- weather + danger level (tier-scaled, lightly jittered) ---
  const weather = sPick(rng, WEATHERS);
  let dangerLevel = Math.min(5, 1 + Math.floor(tier / 20));
  dangerLevel = Math.max(1, Math.min(5, dangerLevel + (rng() < 0.25 ? 1 : 0) - (rng() < 0.25 ? 1 : 0)));

  const type = getZoneType(id);
  return {
    id,
    tier,
    page,
    region,
    type,
    typeInfo: TYPE_INFO[type],
    isRealm: TYPE_INFO[type].name.includes("Realm") || ["ruined_city", "ancient_temple", "floating_island"].includes(type),
    name: `${region.name} — Sector ${((id - 1) % 10) + 1}`,
    recommendedLevel: id * 2,
    biome: BIOME_BY_REGION[region.id] || region.name,
    gatherables,
    dangers,
    npcs,
    hasTown,
    townName,
    hasDungeon,
    dungeon,
    worldBoss,
    secrets,
    weather,
    dangerLevel,
    isPvpZone: id % 40 === 0,
    isSafeZone: id % 10 === 1,
  };
}

// ------------------------------------------------------------
// Pages / pools / travel
// ------------------------------------------------------------

/** Return the 10 zones on a page (1..ZONE_PAGES, clamped). */
function getZonePage(page) {
  const p = toRange(page, 1, ZONE_PAGES, 1);
  const start = (p - 1) * ZONES_PER_PAGE + 1;
  const zones = [];
  for (let i = 0; i < ZONES_PER_PAGE; i++) zones.push(getZone(start + i));
  return zones;
}

/**
 * Gatherable material pools for a zone tier (1..100).
 * Returns fresh arrays so callers can't mutate the tables.
 */
function getMaterialPoolForTier(tier) {
  const t = toRange(tier, 1, 100, 1);
  let band = MATERIAL_BANDS[0];
  for (const b of MATERIAL_BANDS) {
    if (t >= b.min) band = b;
  }
  return {
    mine:   band.mine.slice(),
    chop:   band.chop.slice(),
    fish:   band.fish.slice(),
    forage: band.forage.slice(),
    hunt:   band.hunt.slice(),
  };
}

// skill name -> gatherables key (accepts both gathering-skill names
// and shorthand: "mining"/"mine", "woodcutting"/"chop", ...).
const GATHER_KEY = {
  mine: "mine", mining: "mine",
  chop: "chop", woodcutting: "chop",
  fish: "fish", fishing: "fish",
  forage: "forage", foraging: "forage",
  hunt: "hunt", hunting: "hunt",
};

/**
 * The deterministic material for a zone + gathering skill.
 * Prefers the zone's own gatherables table; falls back to
 * computing it from the zone id/tier so it works for any
 * well-formed zone object.
 */
function pickGatherable(zone, skill) {
  const key = GATHER_KEY[skill] || skill;
  if (zone && zone.gatherables && typeof zone.gatherables[key] === "string") {
    return zone.gatherables[key];
  }
  const id = zone && Number.isFinite(zone.id) ? zone.id : 1;
  const tier = zone && Number.isFinite(zone.tier) ? zone.tier : zoneTier(id);
  const pool = getMaterialPoolForTier(tier)[key];
  const rng = seededRng("zone_" + id + ":" + key);
  return pool[Math.floor(rng() * pool.length)];
}

/** Gold cost to travel between zones: |delta| * 2, free if a waypoint. */
function travelCost(fromZone, toZone) {
  const from = toRange(fromZone, 1, ZONE_COUNT, 1);
  const to = toRange(toZone, 1, ZONE_COUNT, 1);
  if (isWaypointZone(from) || isWaypointZone(to)) return 0;
  return Math.abs(to - from) * 2;
}

module.exports = {
  ZONE_COUNT,
  ZONES_PER_PAGE,
  ZONE_PAGES,
  WORLD_BOSS_COUNT,
  getZone,
  getZonePage,
  getMaterialPoolForTier,
  pickGatherable,
  travelCost,
  isWaypointZone,
  TYPE_INFO, allTypes, getZoneType, getTypeInfo, realmOverride,
};
});

// ---------------------- entry: index.js ----------------------
(function () {
  var require = function (spec) { return __requireFrom("__entry", spec); };
// ============================================================
// index.js — PlayRPG Discord bot entry point.
// Prefix: playrpg   (e.g. "playrpg help")
// ============================================================
require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const OpenAI = require("openai");

const { getOrCreatePlayer, players, saveAll, loadAll } = require("./src/core/schema");
const { runCommand } = require("./src/commands");
const { getZone } = require("./src/world/zones");
const { seedName } = require("./src/util");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Optional AI enemy flavor via Groq (falls back to procedural if unset/failing)
let openai = null;
if (process.env.GROQ_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

async function generateAIEnemy(zoneId, playerLevel) {
  if (!openai) return null;
  const zone = getZone(zoneId);
  try {
    const response = await openai.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      temperature: 0.85,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "dynamic_enemy",
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              title: { type: "string" },
              hp: { type: "number" },
              atk: { type: "number" },
              def: { type: "number" },
              loot: { type: "array", items: { type: "string" } },
              introText: { type: "string" },
            },
            required: ["name", "title", "hp", "atk", "def", "loot", "introText"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        { role: "system", content: `Generate a dynamic RPG monster for ${zone.name}. Player Level is ${playerLevel}. Scale stats appropriately.` },
        { role: "user", content: `Generate monster for zone ${zoneId}` },
      ],
    });
    const data = JSON.parse(response.choices[0]?.message?.content || "{}");
    if (data.name) return { ...data, fromAI: true };
  } catch (err) {
    console.error("AI Monster Gen failed (falling back to procedural):", err.message);
  }
  return null;
}

client.on("ready", () => {
  console.log(`🤖 PlayRPG v2 engine active as ${client.user.tag}`);
  const hadSave = loadAll();
  console.log(`Loaded ${players.size} players from save${hadSave ? "" : " (fresh start)"}`);
  // Autosave every 5 minutes
  setInterval(() => { saveAll(); }, 5 * 60 * 1000);
  process.on("SIGINT", () => { saveAll(); process.exit(0); });
  process.on("SIGTERM", () => { saveAll(); process.exit(0); });
});

// ============================================================
// EMBED REPLY HELPERS — every bot answer is an embed, kept small.
// ============================================================
function pickEmbedColor(text) {
  if (text.includes("❌")) return 0xed4245;          // errors
  if (text.includes("✅") || text.includes("🎉") || text.includes("VICTORY") || text.includes("WINS")) return 0x57f287; // success
  if (text.includes("⚔️") || text.includes("💀") || text.includes("ENCOUNTER") || text.includes("DUEL")) return 0xe67e22; // combat
  if (text.includes("🪙") || text.includes("💰") || text.includes("gold")) return 0xffd700; // economy
  if (text.includes("📜") || text.includes("📚") || text.includes("🗺️") || text.includes("FEATURE")) return 0x5865f2; // info
  if (text.includes("🌍") || text.includes("📍")) return 0x1abc9c; // world
  return 0x5865f2;
}

function buildEmbed(text) {
  return new EmbedBuilder()
    .setDescription(text.slice(0, 4000))
    .setColor(pickEmbedColor(text))
    .setFooter({ text: "PlayRPG" });
}

/** Reply with embeds; long replies are split into small chunks. */
async function replyWithEmbeds(message, text) {
  const chunks = text.match(/[\s\S]{1,3800}/g) || [text];
  await message.reply({ embeds: [buildEmbed(chunks[0])] });
  for (const c of chunks.slice(1)) await message.channel.send({ embeds: [buildEmbed(c)] });
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.toLowerCase().startsWith("playrpg")) return;

  const args = message.content.slice(7).trim().split(/\s+/).filter(Boolean);
  if (!args.length) return replyWithEmbeds(message, "Type `playrpg help` to see commands.");

  const player = getOrCreatePlayer(message.author.id, message.author.username);
  player.playtimeMin = (player.playtimeMin || 0) + 1;

  // Route
  let reply = runCommand(message, args, player);
  if (reply === null) {
    reply = `❌ Unknown command \`${args[0]}\`. Try \`playrpg help\`.`;
  }
  try {
    await replyWithEmbeds(message, reply);
  } catch (e) {
    console.error("reply failed:", e.message);
    try { await message.channel.send({ embeds: [buildEmbed("⚠️ Something went wrong — try again.")] }); } catch (_) { /* noop */ }
  }
});

// Intercept explore to add AI-generated enemy flavor when available
const originalExplore = require("./src/commands/world").explore;
require("./src/commands/world").explore = async function (message, args, player) {
  const { startEncounter } = require("./src/core/combat");
  const { battleStatusText } = require("./src/core/combat");
  const res = startEncounter(player, { zoneId: player.zone });
  if (!res.ok) {
    if (res.reason === "already_in_battle") {
      const b = require("./src/core/combat").getPlayerBattle(player.id);
      return `⚔️ You're already fighting!\n\n${battleStatusText(b)}`;
    }
    return `❌ ${res.reason}`;
  }
  const aiEnemy = await generateAIEnemy(player.zone, player.level);
  if (aiEnemy) {
    const e = res.battle.enemy;
    e.name = aiEnemy.name;
    e.title = aiEnemy.title || e.title;
    e.introText = aiEnemy.introText || e.introText;
    if (aiEnemy.loot?.length) e.loot = aiEnemy.loot;
    res.battle.log[0] = `${e.introText}\n\n**${e.name}** — Lv ${e.level} (AI-generated)`;
  }
  let s = `⚔️ **ENCOUNTER!**\n\n${res.battle.log[0]}\n\n`;
  if (res.battle.enemy.elite) s += `💀 This is an **elite** — higher rewards, higher risk!\n`;
  s += `\nActions: \`playrpg attack\` | \`playrpg skill <name>\` | \`playrpg item <name>\` | \`playrpg guard\` | \`playrpg flee\``;
  return s;
};

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌ DISCORD_TOKEN not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}
client.login(token);
})();