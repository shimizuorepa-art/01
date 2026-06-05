const mobileTitle = document.getElementById("mobileTitle");
const mobileHome = document.getElementById("mobileHome");
const mobileAfter = document.getElementById("mobileAfter");
const mobileNav = document.getElementById("mobileNav");
const requestButton = document.getElementById("requestButton");
const startRequestFromHero = document.getElementById("startRequestFromHero");
const consoleStatus = document.getElementById("consoleStatus");
const caseBadge = document.getElementById("caseBadge");
const queueItem = document.getElementById("queueItem");
const eventLog = document.getElementById("eventLog");
const assignButton = document.getElementById("assignButton");
const templeButton = document.getElementById("templeButton");
const notifyButton = document.getElementById("notifyButton");

const events = [
  "会員番号 T-0246-8310 を照合。ゴールド会員、デジタルティアカード有効。",
  "入力階層を判定。Level 1は完了、Level 2は2項目未確定、Level 3以降は打合せ用として保持。",
  "電話で伺う6項目を事前登録から展開。故人様、ご連絡者様、お迎え先、搬送先、自宅情報、お迎え時間を受付票へ反映。",
  "未確定項目を抽出。死亡診断書、退院準備、お迎え可能時刻、安置先の最終確認のみ残す。",
  "任意登録情報を添付。代表者、搬送補足、安置希望、第一報先は会館連絡の補足として別枠表示。",
  "お急ぎ受付キューへ OM-260605-014 を作成。希望会館: ティア名古屋中央。",
  "家族代表へ受付通知。知人・会社関係は担当者確認後に保留。",
  "会館担当者と搬送担当へ通知。11:30以降のお迎え候補を提示。",
];

function currentTime(offsetSeconds = 0) {
  const now = new Date();
  now.setSeconds(now.getSeconds() + offsetSeconds);
  return now.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function appendEvent(text, index = 0) {
  const item = document.createElement("li");
  const time = document.createElement("time");
  const span = document.createElement("span");
  time.textContent = currentTime(index);
  span.textContent = text;
  item.append(time, span);
  eventLog.prepend(item);
}

function activateRequest() {
  mobileHome.classList.remove("active");
  mobileAfter.classList.add("active");
  mobileTitle.textContent = "ご依頼を受け付けました";
  mobileNav.hidden = true;

  consoleStatus.textContent = "アプリ依頼 受付中";
  consoleStatus.classList.remove("waiting");
  consoleStatus.classList.add("live");
  caseBadge.textContent = "受付済み";
  caseBadge.classList.add("live");
  queueItem.classList.remove("muted");
  queueItem.classList.add("live");
  queueItem.querySelector("strong").textContent = "アプリ依頼 受付済み";

  events.forEach((event, index) => {
    window.setTimeout(() => appendEvent(event, index), index * 260);
  });
}

requestButton.addEventListener("click", activateRequest);
startRequestFromHero.addEventListener("click", () => {
  document.getElementById("demo").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(activateRequest, 300);
});

assignButton.addEventListener("click", () => {
  appendEvent("担当者: 佐藤プランナーを割り当て。ご遺族への折り返しタスクを作成。");
  caseBadge.textContent = "担当者割当済み";
});

templeButton.addEventListener("click", () => {
  appendEvent("光明寺へ確認タスクを作成。不可時は提携寺院候補2件へ自動分岐。");
});

notifyButton.addEventListener("click", () => {
  appendEvent("第一報文面を担当者確認へ。即時送信許可済みの家族代表以外は保留。");
});

if (new URLSearchParams(window.location.search).get("state") === "request") {
  activateRequest();
}
