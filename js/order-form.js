(function () {
  const form = document.querySelector("[data-order-form]");
  if (!form) return;

  const submitButton = form.querySelector("[type=submit]");
  const status = form.querySelector("[data-order-status]");
  const phoneInput = form.querySelector("[data-phone-input]");
  const requestSection = form.closest(".price-page__request");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
      phoneInput.setCustomValidity("");
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const phoneDigits = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
    if (phoneInput) {
      phoneInput.setCustomValidity(phoneDigits.length === 10 ? "" : "Введите 10 цифр номера после +7.");
    }
    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    if (status) {
      status.textContent = "Отправляем заявку...";
      status.dataset.state = "loading";
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.elements.consent?.checked === true;
    data.phone = `+7${phoneDigits}`;

    const messengerType = form.querySelector("input[name=messenger_type]:checked")?.value || "";
    const messengerName = String(data.messenger || "").trim();
    data.messenger = [messengerType, messengerName].filter(Boolean).join(": ");

    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Не удалось отправить заявку");
      }

      form.reset();
      requestSection?.classList.add("is-submitted");
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
