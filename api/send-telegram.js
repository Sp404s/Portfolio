const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "8847549155";

function clean(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
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
  const message = clean(body.message, 3000);

  if (body.website || !name || !phone || !message || body.consent !== true) {
    return res.status(400).json({ ok: false, error: "Заполните обязательные поля" });
  }

  if (!token) {
    return res.status(500).json({ ok: false, error: "Telegram не настроен" });
  }

  const text = [
    "Новая заявка с сайта",
    "",
    `ФИО: ${name}`,
    `Телефон: ${phone}`,
    `Мессенджер: ${messenger || "не указан"}`,
    "",
    "Задача:",
    message
  ].join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
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
