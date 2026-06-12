// ===========================================================
// ティアの会連動 お見送り依頼アプリ プロトタイプ
// 3画面スイッチ + URLクエリ同期 + 依頼後モード
// ===========================================================

const VIEWS = ["customer", "staff-mobile", "staff-desktop"];

const VIEW_META = {
  customer: {
    kicker: "お客様向け / スマホ",
    title: "当日は押すだけ。以後は、画面も判断も減らす。",
    desc: "会員証・ポイント・事前準備の上に、ワンタップ依頼を重ねた画面です。依頼後は通常機能を隠し、電話・受付状況・共有内容だけに絞ります。",
  },
  "staff-mobile": {
    kicker: "従業員向け / スマホ",
    title: "次の行動・未確認・電話。初動判断をこの3つに絞る。",
    desc: "会館スタッフや外出中の担当者が、初動確認だけをスマホで判断するための画面です。PC管理画面の縮小版にせず、要点カードで1画面に収めます。",
  },
  "staff-desktop": {
    kicker: "従業員向け / PC",
    title: "登録内容を即座に確認し、未確定だけを進める。",
    desc: "会館・コールセンター・搬送担当が、受付票と任意情報を見ながら初動対応を進めるための画面です。主CTAは1つに絞り、判断の速さを優先します。",
  },
};

// ---- elements ----
const tabs = Array.from(document.querySelectorAll("[data-view]"));
const panels = Array.from(document.querySelectorAll("[data-view-panel]"));
const viewKicker = document.getElementById("viewKicker");
const viewTitle = document.getElementById("viewTitle");
const viewDesc = document.getElementById("viewDesc");

const customerHome = document.getElementById("customerHome");
const customerAfter = document.getElementById("customerAfter");
const customerNav = document.getElementById("customerNav");
const customerTitle = document.getElementById("customerTitle");
const requestButton = document.getElementById("requestButton");
const requestConfirm = document.getElementById("requestConfirm");
const cancelRequestButton = document.getElementById("cancelRequestButton");
const confirmRequestButton = document.getElementById("confirmRequestButton");
const registeredToggle = document.getElementById("registeredToggle");
const registeredDetails = document.getElementById("registeredDetails");
const resetButton = document.getElementById("resetButton");

const consoleStatus = document.getElementById("consoleStatus");
const caseBadge = document.getElementById("caseBadge");
const queueItem = document.getElementById("queueItem");
const eventLog = document.getElementById("eventLog");
const assignButton = document.getElementById("assignButton");
const templeButton = document.getElementById("templeButton");
const notifyButton = document.getElementById("notifyButton");

// ---- URL helpers ----
function updateUrl(view, requested) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", view);
  if (view === "customer" && requested) {
    url.searchParams.set("state", "request");
  } else {
    url.searchParams.delete("state");
  }
  window.history.replaceState({}, "", url);
}

// ---- view switching ----
function setView(view, { sync = true } = {}) {
  if (!VIEWS.includes(view)) view = "customer";

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== view;
  });

  tabs.forEach((tab) => {
    const on = tab.dataset.view === view;
    tab.setAttribute("aria-selected", on ? "true" : "false");
  });

  const meta = VIEW_META[view];
  viewKicker.textContent = meta.kicker;
  viewTitle.textContent = meta.title;
  viewDesc.textContent = meta.desc;

  if (sync) {
    const requested = customerAfter.classList.contains("active");
    updateUrl(view, requested);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

// ---- customer request flow ----
function openRequestConfirm() {
  if (!requestConfirm) return;
  requestConfirm.hidden = false;
  confirmRequestButton?.focus();
}

function closeRequestConfirm() {
  if (!requestConfirm) return;
  requestConfirm.hidden = true;
  requestButton?.focus();
}

function activateRequest({ sync = true } = {}) {
  if (requestConfirm) requestConfirm.hidden = true;
  customerHome.style.display = "none";
  customerAfter.classList.add("active");
  customerNav.hidden = true;
  customerTitle.textContent = "ご依頼を受け付けました";

  // 会館側コンソールも受付済みへ
  if (consoleStatus) {
    consoleStatus.textContent = "アプリ依頼 受付中";
    consoleStatus.classList.add("live");
  }
  if (caseBadge) {
    caseBadge.textContent = "受付済み";
    caseBadge.classList.add("live");
  }
  if (queueItem) {
    queueItem.classList.remove("muted");
    queueItem.classList.add("live");
    queueItem.querySelector("strong").textContent = "アプリ依頼 受付済み";
  }

  if (sync) updateUrl("customer", true);
}

function resetRequest() {
  if (requestConfirm) requestConfirm.hidden = true;
  customerHome.style.display = "";
  customerAfter.classList.remove("active");
  customerNav.hidden = false;
  customerTitle.textContent = "お見送りサポート";
  updateUrl("customer", false);
}

if (requestButton) requestButton.addEventListener("click", openRequestConfirm);
if (cancelRequestButton) cancelRequestButton.addEventListener("click", closeRequestConfirm);
if (confirmRequestButton) confirmRequestButton.addEventListener("click", () => activateRequest());
if (requestConfirm) {
  requestConfirm.addEventListener("click", (event) => {
    if (event.target === requestConfirm) closeRequestConfirm();
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && requestConfirm && !requestConfirm.hidden) {
    closeRequestConfirm();
  }
});
if (resetButton) resetButton.addEventListener("click", resetRequest);

if (registeredToggle && registeredDetails) {
  registeredToggle.addEventListener("click", () => {
    const expanded = registeredToggle.getAttribute("aria-expanded") === "true";
    registeredToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
    registeredDetails.hidden = expanded;
  });
}

// ---- staff desktop: event log ----
function appendEvent(text) {
  if (!eventLog) return;
  const li = document.createElement("li");
  const time = document.createElement("time");
  const span = document.createElement("span");
  const now = new Date();
  time.textContent = now.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  span.textContent = text;
  li.append(time, span);
  eventLog.prepend(li);
}

if (assignButton) {
  assignButton.addEventListener("click", () => {
    appendEvent("担当者: 佐藤プランナーを割り当て。ご遺族への折り返しタスクを作成。");
    if (caseBadge) caseBadge.textContent = "担当者割当済み";
  });
}
if (templeButton) {
  templeButton.addEventListener("click", () => {
    appendEvent("光明寺へ確認タスクを作成。不可時は提携寺院候補2件へ自動分岐。");
  });
}
if (notifyButton) {
  notifyButton.addEventListener("click", () => {
    appendEvent("第一報文面を担当者確認へ。即時送信許可済みの家族代表以外は保留。");
  });
}

// ---- init from URL ----
(function init() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "customer";
  const requested = params.get("state") === "request";

  if (requested) {
    setView("customer", { sync: false });
    activateRequest({ sync: false });
  } else {
    setView(view, { sync: false });
  }
})();
