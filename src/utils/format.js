const MAX_TITLE_LENGTH = 26;

function formatCount(count) {
  return count >= 1000 ? `${Math.floor(count / 1000)}k` : String(count);
}

function truncateTitle(title) {
  return title.length > MAX_TITLE_LENGTH
    ? `${title.slice(0, MAX_TITLE_LENGTH)}...`
    : title;
}

function formatNow() {
  const now = new Date();
  const toPad = (num) => String(num).padStart(2, "0");

  const date = `${now.getFullYear()}-${toPad(now.getMonth() + 1)}-${toPad(now.getDate())}`;
  const time = `${toPad(now.getHours())}:${toPad(now.getMinutes())}:${toPad(now.getSeconds())}`;

  return `${date} ${time}`;
}

function parseServerDate(value) {
  if (!value) return null;
  const normalized = value.replace(" ", "T").replace(/(\.\d{3})\d+$/, "$1");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRoomListTime(value) {
  const date = parseServerDate(value);
  if (!date) return "";

  const now = new Date();
  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffDays <= 0) {
    const h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, "0");
    const period = h < 12 ? "오전" : "오후";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${period} ${h12}:${m}`;
  }
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

function formatMessageTime(value) {
  const date = parseServerDate(value);
  if (!date) return "";
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${h12}:${m}`;
}

function formatMessageDate(value) {
  const date = parseServerDate(value);
  if (!date) return "";
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export {
  formatCount,
  truncateTitle,
  formatNow,
  parseServerDate,
  formatRoomListTime,
  formatMessageTime,
  formatMessageDate,
};
