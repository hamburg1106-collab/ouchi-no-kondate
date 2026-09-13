"use strict";

/* ---------- 定数 ---------- */

const STAPLES = ["しょうゆ", "みりん", "味噌", "塩", "こしょう", "酒", "片栗粉", "油", "ケチャップ", "カレールー", "だし", "砂糖"];

/* 食材は {name, amount, unit} の形。amountがnull/未指定の調味料などは
   買い物リストの計算では常に「足りている」ものとして扱う（STAPLES判定と同じ考え方）。 */
function ing(name, amount, unit) {
  return { name, amount: amount == null ? null : amount, unit: unit || "" };
}

const BUILTIN_RECIPES = [
  ["肉じゃが", "主菜", [ing("牛肉", 200, "g"), ing("じゃがいも", 3, "個"), ing("玉ねぎ", 1, "個"), ing("にんじん", 1, "本"), ing("しらたき", 1, "袋")]],
  ["生姜焼き", "主菜", [ing("豚肉", 250, "g"), ing("玉ねぎ", 1, "個"), ing("しょうが", 1, "かけ")]],
  ["鶏の唐揚げ", "主菜", [ing("鶏肉", 300, "g"), ing("片栗粉"), ing("しょうが", 1, "かけ"), ing("にんにく", 1, "片")]],
  ["鮭の塩焼き", "主菜", [ing("鮭", 2, "切れ"), ing("大根", 100, "g")]],
  ["麻婆豆腐", "主菜", [ing("豆腐", 1, "丁"), ing("ひき肉", 150, "g"), ing("ねぎ", 1, "本"), ing("にんにく", 1, "片"), ing("しょうが", 1, "かけ")]],
  ["餃子", "主菜", [ing("ひき肉", 200, "g"), ing("キャベツ", 200, "g"), ing("にら", 1, "束"), ing("にんにく", 1, "片"), ing("餃子の皮", 1, "袋")]],
  ["ハンバーグ", "主菜", [ing("ひき肉", 400, "g"), ing("玉ねぎ", 1, "個"), ing("パン粉", 1, "カップ"), ing("卵", 1, "個")]],
  ["豚の角煮", "主菜", [ing("豚肉", 400, "g"), ing("大根", 200, "g"), ing("しょうが", 1, "かけ")]],
  ["鶏の照り焼き", "主菜", [ing("鶏肉", 300, "g"), ing("しょうゆ"), ing("みりん")]],
  ["さばの味噌煮", "主菜", [ing("さば", 2, "切れ"), ing("しょうが", 1, "かけ"), ing("味噌")]],
  ["回鍋肉", "主菜", [ing("豚肉", 200, "g"), ing("キャベツ", 200, "g"), ing("ピーマン", 2, "個"), ing("にんにく", 1, "片")]],
  ["親子丼の具", "主菜", [ing("鶏肉", 200, "g"), ing("玉ねぎ", 1, "個"), ing("卵", 2, "個")]],
  ["カレー", "主菜", [ing("玉ねぎ", 2, "個"), ing("にんじん", 1, "本"), ing("じゃがいも", 2, "個"), ing("豚肉", 250, "g"), ing("カレールー")]],
  ["豆腐ハンバーグ", "主菜", [ing("豆腐", 1, "丁"), ing("ひき肉", 200, "g"), ing("玉ねぎ", 1, "個")]],
  ["ぶり大根", "主菜", [ing("ぶり", 2, "切れ"), ing("大根", 200, "g")]],
  ["きんぴらごぼう", "副菜", [ing("ごぼう", 1, "本"), ing("にんじん", 1, "本")]],
  ["ほうれん草のおひたし", "副菜", [ing("ほうれん草", 1, "束")]],
  ["ひじきの煮物", "副菜", [ing("ひじき", 20, "g"), ing("にんじん", 1, "本"), ing("油揚げ", 1, "枚")]],
  ["野菜炒め", "副菜", [ing("キャベツ", 200, "g"), ing("もやし", 1, "袋"), ing("にんじん", 1, "本"), ing("ピーマン", 1, "個")]],
  ["切り干し大根の煮物", "副菜", [ing("切り干し大根", 30, "g"), ing("にんじん", 1, "本"), ing("油揚げ", 1, "枚")]],
  ["冷奴", "副菜", [ing("豆腐", 1, "丁"), ing("ねぎ", 1, "本")]],
  ["ポテトサラダ", "副菜", [ing("じゃがいも", 3, "個"), ing("きゅうり", 1, "本"), ing("ハム", 3, "枚"), ing("卵", 2, "個")]],
  ["かぼちゃの煮物", "副菜", [ing("かぼちゃ", 300, "g")]],
  ["なすの煮浸し", "副菜", [ing("なす", 3, "本")]],
  ["もやしのナムル", "副菜", [ing("もやし", 1, "袋")]],
  ["味噌汁（豆腐とわかめ）", "汁物", [ing("豆腐", 1, "丁"), ing("わかめ", 5, "g"), ing("味噌")]],
  ["味噌汁（大根と油揚げ）", "汁物", [ing("大根", 100, "g"), ing("油揚げ", 1, "枚"), ing("味噌")]],
  ["けんちん汁", "汁物", [ing("大根", 100, "g"), ing("にんじん", 1, "本"), ing("ごぼう", 1, "本"), ing("豆腐", 1, "丁")]],
  ["豚汁", "汁物", [ing("豚肉", 150, "g"), ing("大根", 100, "g"), ing("にんじん", 1, "本"), ing("ごぼう", 1, "本"), ing("味噌")]],
  ["コンソメスープ", "汁物", [ing("キャベツ", 100, "g"), ing("にんじん", 1, "本"), ing("玉ねぎ", 1, "個")]],
  ["炒飯", "ご飯もの", [ing("ご飯", 2, "杯"), ing("卵", 2, "個"), ing("ねぎ", 1, "本"), ing("ハム", 3, "枚")]],
  ["焼きそば", "ご飯もの", [ing("焼きそば麺", 2, "玉"), ing("キャベツ", 150, "g"), ing("豚肉", 150, "g")]],
  ["パスタ（ナポリタン）", "ご飯もの", [ing("パスタ", 200, "g"), ing("玉ねぎ", 1, "個"), ing("ピーマン", 1, "個"), ing("ウインナー", 4, "本"), ing("ケチャップ")]],
  ["お好み焼き", "ご飯もの", [ing("キャベツ", 300, "g"), ing("卵", 2, "個"), ing("豚肉", 150, "g"), ing("お好み焼き粉", 1, "袋")]],
];

const CATEGORY_ORDER = ["主菜", "副菜", "汁物", "ご飯もの", "デザート"];
const COMBO_CATEGORIES = ["主菜", "副菜", "汁物"];
const INVENTORY_CATEGORIES = ["野菜", "肉・魚", "卵・乳製品", "豆腐・大豆製品", "調味料", "穀物・麺", "その他"];

/* ---------- ユーティリティ ---------- */

function normalize(s) {
  return (s || "").toString().trim().toLowerCase().replace(/\s+/g, "");
}

function ingredientAvailable(ingredient, inventoryNames) {
  const n = normalize(ingredient);
  return inventoryNames.some((inv) => inv.includes(n) || n.includes(inv));
}

function isStaple(ingredient) {
  const n = normalize(ingredient);
  return STAPLES.some((s) => n.includes(normalize(s)));
}

/* レシピの食材入力欄（1行1食材）をパースする。
   「じゃがいも 3個」のように末尾の数値+単位を数量として読み取り、
   数値がなければ「調味料など数量なし」の食材として扱う（例: しょうゆ）。 */
function parseIngredientLines(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)[\s]*([0-9]+(?:\.[0-9]+)?)\s*([^\s0-9]*)$/);
      if (m && m[1].trim()) {
        return { name: m[1].trim(), amount: parseFloat(m[2]), unit: m[3].trim() };
      }
      return { name: line, amount: null, unit: "" };
    });
}

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2));
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function daysBetween(dateStr, refStr) {
  const a = new Date(dateStr + "T00:00:00");
  const b = new Date(refStr + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------- ストレージ層 ----------
   claude.use('db') が使える場合はDB(端末間同期あり)、
   使えない場合は localStorage(この端末のみ)にフォールバックする。 */

function createLocalBackend() {
  const KEY = (name) => "menuapp_" + name;
  const listeners = { inventory: [], recipes: [], history: [] };

  function readAll(name) {
    try {
      return JSON.parse(localStorage.getItem(KEY(name)) || "[]");
    } catch (e) {
      return [];
    }
  }
  function writeAll(name, arr) {
    localStorage.setItem(KEY(name), JSON.stringify(arr));
    listeners[name].forEach((cb) => cb(arr.slice()));
  }

  return {
    kind: "local",
    subscribe(name, cb) {
      listeners[name].push(cb);
      cb(readAll(name));
      return () => {
        listeners[name] = listeners[name].filter((f) => f !== cb);
      };
    },
    async add(name, data) {
      const arr = readAll(name);
      const doc = Object.assign({ id: uid() }, data);
      arr.push(doc);
      writeAll(name, arr);
      return doc.id;
    },
    async update(name, id, patch) {
      const arr = readAll(name);
      const idx = arr.findIndex((d) => d.id === id);
      if (idx >= 0) {
        arr[idx] = Object.assign({}, arr[idx], patch);
        writeAll(name, arr);
      }
    },
    async remove(name, id) {
      const arr = readAll(name).filter((d) => d.id !== id);
      writeAll(name, arr);
    },
  };
}

function createDbBackend(db) {
  const cols = {
    inventory: db.collection("inventory"),
    recipes: db.collection("recipes"),
    history: db.collection("history"),
  };
  return {
    kind: "db",
    subscribe(name, cb) {
      return cols[name].onSnapshot(
        (snap) => cb(snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))),
        (err) => console.error("db " + name + " error", err)
      );
    },
    async add(name, data) {
      const ref = await cols[name].add(data);
      return ref.id;
    },
    async update(name, id, patch) {
      await cols[name].doc(id).update(patch);
    },
    async remove(name, id) {
      await cols[name].doc(id).delete();
    },
  };
}

/* ---------- アプリ状態 ---------- */

const state = { inventory: [], recipes: [], history: [] };
let Store = null;

async function initStore() {
  let db = null;
  try {
    if (window.claude && typeof window.claude.use === "function") {
      db = await window.claude.use("db");
    }
  } catch (e) {
    db = null;
  }

  Store = db ? createDbBackend(db) : createLocalBackend();

  const badge = document.getElementById("syncBadge");
  if (Store.kind === "db") {
    badge.textContent = "端末間で同期中";
    badge.classList.add("on");
  } else {
    badge.textContent = "端末内保存";
  }

  Store.subscribe("inventory", (rows) => {
    state.inventory = rows;
    renderInventory();
    renderSuggestions();
  });
  Store.subscribe("recipes", (rows) => {
    state.recipes = rows;
    renderRecipes();
    renderSuggestions();
    fillHistoryRecipeSelect();
  });
  Store.subscribe("history", (rows) => {
    state.history = rows;
    renderHistory();
    renderSuggestions();
  });
}

/* ---------- 提案ロジック ---------- */

function getRecentDays() {
  const v = parseInt(document.getElementById("recentDays").value, 10);
  return Number.isFinite(v) && v >= 0 ? v : 7;
}

function lastMadeMap() {
  const map = {};
  state.history.forEach((h) => {
    if (!map[h.recipeName] || h.date > map[h.recipeName]) map[h.recipeName] = h.date;
  });
  return map;
}

function evaluateRecipe(recipe, inventoryNames) {
  const nonStaple = recipe.ingredients.filter((i) => !isStaple(i.name));
  const missing = nonStaple.filter((i) => !ingredientAvailable(i.name, inventoryNames)).map((i) => i.name);
  const total = nonStaple.length || 1;
  const matched = nonStaple.length - missing.length;
  return { missing, matchedCount: matched, totalCount: nonStaple.length, rate: matched / total };
}

/* 在庫の数量を、食材名ごとに集計する。
   amountがnull（＝常備で切らさない食材）が1件でもあれば「常に足りている」扱いにする。 */
function summarizeInventoryByName() {
  const buckets = {};
  state.inventory.forEach((item) => {
    const key = normalize(item.name);
    if (!buckets[key]) buckets[key] = { amount: 0, alwaysEnough: false };
    if (item.amount == null || item.amount === "") {
      buckets[key].alwaysEnough = true;
    } else {
      buckets[key].amount += Number(item.amount) || 0;
    }
  });
  return buckets;
}

function findInventoryBucket(buckets, ingredientName) {
  const n = normalize(ingredientName);
  const key = Object.keys(buckets).find((k) => k.includes(n) || n.includes(k));
  return key ? buckets[key] : null;
}

/* 「これを作る」用: 買うべきものと個数を計算する。調味料などのSTAPLESは対象外。 */
function computeShoppingList(recipe) {
  const buckets = summarizeInventoryByName();
  return recipe.ingredients
    .filter((i) => !isStaple(i.name))
    .map((i) => {
      const bucket = findInventoryBucket(buckets, i.name);
      if (!bucket) {
        return { name: i.name, unit: i.unit, need: i.amount, have: 0, toBuy: i.amount, sufficient: false };
      }
      if (bucket.alwaysEnough) {
        return { name: i.name, unit: i.unit, need: i.amount, have: null, toBuy: 0, sufficient: true };
      }
      if (i.amount == null) {
        return { name: i.name, unit: i.unit, need: null, have: bucket.amount, toBuy: 0, sufficient: true };
      }
      const toBuy = Math.max(0, i.amount - bucket.amount);
      return { name: i.name, unit: i.unit, need: i.amount, have: bucket.amount, toBuy, sufficient: toBuy <= 0 };
    });
}

function buildCandidates() {
  const inventoryNames = state.inventory.map((i) => normalize(i.name));
  const lastMade = lastMadeMap();
  const today = todayStr();
  const recentDays = getRecentDays();

  return state.recipes.map((recipe) => {
    const evalRes = evaluateRecipe(recipe, inventoryNames);
    const last = lastMade[recipe.name];
    const isRecent = last != null && daysBetween(last, today) <= recentDays;
    return Object.assign({ recipe, isRecent, lastMade: last }, evalRes);
  });
}

function sortCandidates(cands) {
  return cands.slice().sort((a, b) => {
    if (a.isRecent !== b.isRecent) return a.isRecent ? 1 : -1;
    if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
    if (b.rate !== a.rate) return b.rate - a.rate;
    return a.recipe.name.localeCompare(b.recipe.name, "ja");
  });
}

function matchBadge(cand) {
  if (cand.missing.length === 0) return { cls: "full", label: "在庫だけで作れる" };
  if (cand.missing.length <= 2) return { cls: "near", label: "あと" + cand.missing.length + "品で作れる" };
  return { cls: "far", label: "不足" + cand.missing.length + "品" };
}

/* ---------- レンダリング: 提案 ---------- */

function recipeCardHtml(cand, { compact } = {}) {
  const badge = matchBadge(cand);
  const chips = cand.recipe.ingredients
    .map((i) => {
      const missing = cand.missing.includes(i.name);
      const label = i.amount ? `${i.name} ${i.amount}${i.unit}` : i.name;
      return `<span class="chip${missing ? " missing" : ""}">${escapeHtml(label)}</span>`;
    })
    .join("");
  const lastLine = cand.lastMade
    ? `<div class="last-made">前回: ${cand.lastMade}${cand.isRecent ? "（最近作った）" : ""}</div>`
    : `<div class="last-made">作った記録なし</div>`;
  return `
    <article class="recipe-card">
      <span class="cat-tag">${escapeHtml(cand.recipe.category)}</span>
      <h3>${escapeHtml(cand.recipe.name)}</h3>
      <span class="match-badge ${badge.cls}">${badge.label}</span>
      <div class="chip-row">${chips}</div>
      ${lastLine}
      <div class="item-actions">
        <button class="btn ghost" data-action="shop" data-id="${cand.recipe.id}">これを作る（買うものを見る）</button>
        <button class="btn secondary" data-action="cook" data-id="${cand.recipe.id}">これを作った</button>
      </div>
    </article>`;
}

function shoppingPanelHtml(recipe, list) {
  const toBuy = list.filter((i) => i.toBuy > 0 || (i.toBuy == null && !i.sufficient));
  const ready = list.filter((i) => i.sufficient);

  const buyRows = toBuy.length
    ? toBuy
        .map((i) => {
          const amountText = i.toBuy ? `あと${i.toBuy}${i.unit}` : "必要（在庫になし）";
          return `<div class="item-row"><div class="item-main"><span class="name">${escapeHtml(i.name)}</span><span class="qty">${escapeHtml(amountText)}</span></div></div>`;
        })
        .join("")
    : `<div class="empty-note">買うものはありません。在庫だけで作れます。</div>`;

  const readyRows = ready.length
    ? `<div class="chip-row">${ready.map((i) => `<span class="chip">${escapeHtml(i.name)}${i.have != null ? `（在庫${i.have}${i.unit}）` : ""}</span>`).join("")}</div>`
    : "";

  return `
    <div class="card" id="shoppingPanelInner">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;">
        <h3 style="margin:0;">${escapeHtml(recipe.name)} の買い物リスト</h3>
        <button class="icon-btn" data-action="close-shopping">閉じる</button>
      </div>
      <p class="section-sub">在庫と比べて、足りない分だけ表示しています。</p>
      <div class="list-plain" style="margin-bottom:14px;">${buyRows}</div>
      ${ready.length ? `<p class="section-sub" style="margin-bottom:6px;">在庫で足りているもの</p>${readyRows}` : ""}
    </div>`;
}

let shoppingRecipeId = null;

function renderShoppingPanel() {
  const el = document.getElementById("shoppingPanel");
  if (!shoppingRecipeId) {
    el.hidden = true;
    el.innerHTML = "";
    return;
  }
  const recipe = state.recipes.find((r) => r.id === shoppingRecipeId);
  if (!recipe) {
    shoppingRecipeId = null;
    el.hidden = true;
    el.innerHTML = "";
    return;
  }
  el.hidden = false;
  el.innerHTML = shoppingPanelHtml(recipe, computeShoppingList(recipe));
}

function renderSuggestions() {
  const cands = sortCandidates(buildCandidates());
  renderShoppingPanel();

  const comboGrid = document.getElementById("comboGrid");
  const usedIds = new Set();
  const comboCards = [];
  COMBO_CATEGORIES.forEach((cat) => {
    const pick = cands.find((c) => c.recipe.category === cat && !usedIds.has(c.recipe.id));
    if (pick) {
      usedIds.add(pick.recipe.id);
      comboCards.push(recipeCardHtml(pick));
    }
  });
  comboGrid.innerHTML = comboCards.length
    ? comboCards.join("")
    : `<div class="empty-note">レシピを登録すると、ここに今日のおすすめが表示されます。</div>`;

  const list = document.getElementById("candidateList");
  const rest = cands.filter((c) => !usedIds.has(c.recipe.id));
  list.innerHTML = rest.length
    ? `<div class="combo-grid">${rest.map((c) => recipeCardHtml(c)).join("")}</div>`
    : (cands.length ? "" : `<div class="empty-note">レシピタブから定番レシピを読み込むか、自分のレシピを登録してください。</div>`);
}

/* ---------- レンダリング: 在庫 ---------- */

let editingInventoryId = null;

function inventoryEditRowHtml(item) {
  const catOptions = INVENTORY_CATEGORIES.map(
    (c) => `<option value="${escapeHtml(c)}"${c === item.category ? " selected" : ""}>${escapeHtml(c)}</option>`
  ).join("");
  return `
    <div class="item-row" data-editing="${item.id}">
      <div class="form-grid" style="flex:1;margin-bottom:0;">
        <label class="field">食材名
          <input type="text" class="edit-name" value="${escapeHtml(item.name)}">
        </label>
        <label class="field">数量（空欄で常備品）
          <input type="number" class="edit-amount" min="0" step="0.1" value="${item.amount != null ? item.amount : ""}">
        </label>
        <label class="field">単位
          <input type="text" class="edit-unit" value="${escapeHtml(item.unit || "")}" placeholder="例: g / 個">
        </label>
        <label class="field">カテゴリ
          <select class="edit-category">${catOptions}</select>
        </label>
        <label class="field">消費期限
          <input type="date" class="edit-expiry" value="${item.expiry || ""}">
        </label>
      </div>
      <div class="item-actions">
        <button class="btn secondary" data-action="save-inventory" data-id="${item.id}">保存</button>
        <button class="icon-btn" data-action="cancel-inventory">キャンセル</button>
      </div>
    </div>`;
}

function renderInventory() {
  const el = document.getElementById("inventoryList");
  if (!state.inventory.length) {
    el.innerHTML = `<div class="empty-note">在庫が登録されていません。上のフォームから追加してください。</div>`;
    return;
  }
  const today = todayStr();
  const byCategory = {};
  state.inventory.forEach((item) => {
    const cat = item.category || "その他";
    (byCategory[cat] = byCategory[cat] || []).push(item);
  });
  let html = "";
  Object.keys(byCategory).forEach((cat) => {
    html += `<div class="group-heading">${escapeHtml(cat)}</div><div class="list-plain">`;
    byCategory[cat]
      .sort((a, b) => a.name.localeCompare(b.name, "ja"))
      .forEach((item) => {
        if (item.id === editingInventoryId) {
          html += inventoryEditRowHtml(item);
          return;
        }
        const expiringSoon = item.expiry && daysBetween(today, item.expiry) <= 2;
        const qtyLabel = item.amount != null ? `${item.amount}${item.unit || ""}` : "常備";
        html += `
        <div class="item-row">
          <div class="item-main">
            <span class="name">${escapeHtml(item.name)}</span>
            <span class="qty">${escapeHtml(qtyLabel)}</span>
            ${item.expiry ? `<span class="chip${expiringSoon ? " expiring" : ""}">期限 ${item.expiry}</span>` : ""}
          </div>
          <div class="item-actions">
            <button class="icon-btn" data-action="edit-inventory" data-id="${item.id}">編集</button>
            <button class="icon-btn" data-action="del-inventory" data-id="${item.id}">削除</button>
          </div>
        </div>`;
      });
    html += `</div>`;
  });
  el.innerHTML = html;
}

/* ---------- レンダリング: レシピ ---------- */

function renderRecipes() {
  const el = document.getElementById("recipeList");
  if (!state.recipes.length) {
    el.innerHTML = `<div class="empty-note">レシピがありません。定番レシピを読み込むか、自分のレシピを追加してください。</div>`;
    return;
  }
  const sorted = state.recipes
    .slice()
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name, "ja"));
  el.innerHTML = sorted
    .map(
      (r) => `
      <article class="recipe-card">
        <span class="cat-tag">${escapeHtml(r.category)}</span>
        <h3>${escapeHtml(r.name)}</h3>
        <div class="chip-row">${r.ingredients.map((i) => `<span class="chip">${escapeHtml(i.amount ? `${i.name} ${i.amount}${i.unit}` : i.name)}</span>`).join("")}</div>
        ${r.memo ? `<p class="section-sub" style="margin:0;">${escapeHtml(r.memo)}</p>` : ""}
        <div class="item-actions">
          <button class="icon-btn" data-action="del-recipe" data-id="${r.id}">削除</button>
        </div>
      </article>`
    )
    .join("");
}

function fillHistoryRecipeSelect() {
  const sel = document.getElementById("histRecipe");
  const current = sel.value;
  sel.innerHTML = state.recipes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
    .map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`)
    .join("");
  if (current) sel.value = current;
}

/* ---------- レンダリング: 履歴 ---------- */

function renderHistory() {
  const el = document.getElementById("historyList");
  if (!state.history.length) {
    el.innerHTML = `<div class="empty-note">履歴はまだありません。</div>`;
    return;
  }
  const sorted = state.history.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  el.innerHTML = sorted
    .map(
      (h) => `
      <div class="item-row">
        <div class="item-main">
          <span class="qty">${h.date}</span>
          <span class="name">${escapeHtml(h.recipeName)}</span>
        </div>
        <div class="item-actions">
          <button class="icon-btn" data-action="del-history" data-id="${h.id}">削除</button>
        </div>
      </div>`
    )
    .join("");
}

/* ---------- escape ---------- */

function escapeHtml(s) {
  return (s || "").toString().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- イベント配線 ---------- */

function wireTabs() {
  document.getElementById("tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tab]");
    if (!btn) return;
    document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + btn.dataset.tab));
  });
}

function wireInventoryForm() {
  document.getElementById("inventoryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("invName").value.trim();
    if (!name) return;
    const amountRaw = document.getElementById("invAmount").value;
    const data = {
      name,
      amount: amountRaw === "" ? null : parseFloat(amountRaw),
      unit: document.getElementById("invUnit").value.trim(),
      category: document.getElementById("invCategory").value,
      expiry: document.getElementById("invExpiry").value || null,
      addedAt: new Date().toISOString(),
    };
    await Store.add("inventory", data);
    e.target.reset();
    document.getElementById("invCategory").value = data.category;
    showToast("在庫に追加しました");
  });

  document.getElementById("inventoryList").addEventListener("click", async (e) => {
    const delBtn = e.target.closest("button[data-action='del-inventory']");
    if (delBtn) {
      await Store.remove("inventory", delBtn.dataset.id);
      showToast("在庫から削除しました");
      return;
    }

    const editBtn = e.target.closest("button[data-action='edit-inventory']");
    if (editBtn) {
      editingInventoryId = editBtn.dataset.id;
      renderInventory();
      return;
    }

    const cancelBtn = e.target.closest("button[data-action='cancel-inventory']");
    if (cancelBtn) {
      editingInventoryId = null;
      renderInventory();
      return;
    }

    const saveBtn = e.target.closest("button[data-action='save-inventory']");
    if (saveBtn) {
      const row = saveBtn.closest(".item-row");
      const amountRaw = row.querySelector(".edit-amount").value;
      const patch = {
        name: row.querySelector(".edit-name").value.trim(),
        amount: amountRaw === "" ? null : parseFloat(amountRaw),
        unit: row.querySelector(".edit-unit").value.trim(),
        category: row.querySelector(".edit-category").value,
        expiry: row.querySelector(".edit-expiry").value || null,
      };
      if (!patch.name) return;
      await Store.update("inventory", saveBtn.dataset.id, patch);
      editingInventoryId = null;
      showToast("在庫を更新しました");
    }
  });
}

function wireRecipeForm() {
  document.getElementById("recipeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("recName").value.trim();
    const ingredientsRaw = document.getElementById("recIngredients").value;
    const ingredients = parseIngredientLines(ingredientsRaw);
    if (!name || !ingredients.length) return;
    const data = {
      name,
      category: document.getElementById("recCategory").value,
      ingredients,
      memo: document.getElementById("recMemo").value.trim(),
      isBuiltin: false,
      createdAt: new Date().toISOString(),
    };
    await Store.add("recipes", data);
    e.target.reset();
    showToast("レシピを追加しました");
  });

  document.getElementById("recipeList").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action='del-recipe']");
    if (!btn) return;
    await Store.remove("recipes", btn.dataset.id);
    showToast("レシピを削除しました");
  });

  document.getElementById("seedBtn").addEventListener("click", async () => {
    const existingNames = new Set(state.recipes.map((r) => r.name));
    const toAdd = BUILTIN_RECIPES.filter(([name]) => !existingNames.has(name));
    if (!toAdd.length) {
      showToast("定番レシピは追加済みです");
      return;
    }
    for (const [name, category, ingredients] of toAdd) {
      await Store.add("recipes", { name, category, ingredients, memo: "", isBuiltin: true, createdAt: new Date().toISOString() });
    }
    showToast(toAdd.length + "件の定番レシピを追加しました");
  });
}

function wireHistoryForm() {
  document.getElementById("histDate").value = todayStr();

  document.getElementById("historyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const recipeId = document.getElementById("histRecipe").value;
    const recipe = state.recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    const date = document.getElementById("histDate").value || todayStr();
    await Store.add("history", { recipeId: recipe.id, recipeName: recipe.name, date });
    showToast("履歴に追加しました");
  });

  document.getElementById("historyList").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action='del-history']");
    if (!btn) return;
    await Store.remove("history", btn.dataset.id);
    showToast("履歴から削除しました");
  });
}

function wireSuggestionActions() {
  document.getElementById("recentDays").addEventListener("input", renderSuggestions);

  document.body.addEventListener("click", async (e) => {
    const cookBtn = e.target.closest("button[data-action='cook']");
    if (cookBtn) {
      const recipe = state.recipes.find((r) => r.id === cookBtn.dataset.id);
      if (!recipe) return;
      await Store.add("history", { recipeId: recipe.id, recipeName: recipe.name, date: todayStr() });
      showToast(recipe.name + "を記録しました");
      return;
    }

    const shopBtn = e.target.closest("button[data-action='shop']");
    if (shopBtn) {
      shoppingRecipeId = shopBtn.dataset.id;
      renderShoppingPanel();
      document.getElementById("shoppingPanel").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const closeShopBtn = e.target.closest("button[data-action='close-shopping']");
    if (closeShopBtn) {
      shoppingRecipeId = null;
      renderShoppingPanel();
    }
  });
}

/* ---------- 起動 ---------- */

document.getElementById("todayLabel").textContent = todayStr();
wireTabs();
wireInventoryForm();
wireRecipeForm();
wireHistoryForm();
wireSuggestionActions();
initStore();

/* PWA: manifest.json / アイコンによりホーム画面へのアイコン追加には対応。
   Service Workerの登録はこのホスティング環境では機能しないため行わない
   （sw.js自体は残してあるが未使用）。 */
