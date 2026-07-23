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

export { formatCount, truncateTitle, formatNow };
