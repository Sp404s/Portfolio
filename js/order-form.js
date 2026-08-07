(function () {
  const form = document.querySelector("[data-order-form]");
  if (!form) return;

  const submitButton = form.querySelector("[type=submit]");
  const status = form.querySelector("[data-order-status]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    if (status) {
      status.textContent = "Отправляем заявку...";
      status.dataset.state = "loading";
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.elements.consent?.checked === true;

    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Не удалось отправить заявку");
      }

      form.reset();
      if (status) {
        status.textContent = "Заявка отправлена. Я свяжусь с вами в ближайшее время.";
        status.dataset.state = "success";
      }
    } catch (error) {
      if (status) {
        status.textContent = error.message || "Не удалось отправить заявку. Попробуйте ещё раз.";
        status.dataset.state = "error";
      }
    } finally {
      submitButton.disabled = false;
    }
  });
})();
