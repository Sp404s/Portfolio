const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "95459466";

function clean(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseMessengerUrl(value, domains) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!domains.includes(hostname) || !["http:", "https:"].includes(url.protocol)) return null;

    url.protocol = "https:";
    const handle = url.pathname.replace(/^\/+|\/+$/g, "").split("/").pop() || "";
    return handle ? { handle, url: url.toString() } : null;
  } catch {
    return null;
  }
}

function normalizeMessengerHandle(value) {
  return value.trim().replace(/^@/, "");
}

function buildMessengerLink(type, value) {
  if (!value) return null;

  const normalizedType = type.toLowerCase();
  let handle = "";
  let url = "";

  if (normalizedType === "telegram") {
    const directLink = parseMessengerUrl(value, ["t.me", "telegram.me"]);
    if (directLink) return directLink;
    handle = normalizeMessengerHandle(value);
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(handle)) return null;
    url = `https://t.me/${handle}`;
  } else if (normalizedType === "вк") {
    const directLink = parseMessengerUrl(value, ["vk.com"]);
    if (directLink) return directLink;
    handle = normalizeMessengerHandle(value);
    if (!/^[a-zA-Z0-9_.-]+$/.test(handle)) return null;
    url = `https://vk.com/${handle}`;
  } else if (normalizedType === "max") {
    const directLink = parseMessengerUrl(value, ["max.ru"]);
    if (directLink) return directLink;
    handle = normalizeMessengerHandle(value);
    if (!/^[a-zA-Z0-9_.-]+$/.test(handle)) return null;
    url = `https://max.ru/${handle}`;
  } else {
    return null;
  }

  return { handle, url };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const body = req.body || {};
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const messenger = clean(body.messenger, 80);
  const messengerType = clean(body.messenger_type, 20);
  const message = clean(body.message, 3000);

  if (body.website || !name || !/^\+7\d{10}$/.test(phone) || body.consent !== true) {
    return res.status(400).json({ ok: false, error: "Заполните обязательные поля" });
  }

  if (!token) {
    return res.status(500).json({ ok: false, error: "Telegram не настроен" });
  }

  const messengerLink = buildMessengerLink(messengerType, messenger);
  const messengerLabel = messengerType || "Мессенджер";
  const messengerValue = messengerLink
    ? `<a href="${escapeHtml(messengerLink.url)}">${escapeHtml(messengerLabel)}: @${escapeHtml(messengerLink.handle)}</a>`
    : escapeHtml([messengerLabel, messenger].filter(Boolean).join(": ") || "не указан");

  const text = [
    "<b>Новая заявка с сайта</b>",
    "",
    "<b>Клиент</b>",
    `Имя: ${escapeHtml(name)}`,
    `Телефон: <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`,
    `Связаться: ${messengerValue}`,
    "",
    "<b>Задача</b>",
    escapeHtml(message || "не указана")
  ].join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true }
      })
    });

    if (!telegramResponse.ok) {
      const telegramError = await telegramResponse.json().catch(() => null);
      const description = telegramError?.description;
      console.error("Telegram sendMessage failed", {
        status: telegramResponse.status,
        description
      });
      return res.status(502).json({
        ok: false,
        error: description || "Telegram не принял заявку"
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(502).json({ ok: false, error: "Не удалось отправить заявку" });
  }
};
