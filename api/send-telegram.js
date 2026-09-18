/**
 * The website contact form is intentionally disabled.
 * Keep the former route closed as well so it cannot be called directly.
 */
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    ok: false,
    error: "Форма временно отключена. Используйте контактные ссылки на странице услуг."
  });
};
