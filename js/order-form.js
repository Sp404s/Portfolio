(function () {
  const form = document.querySelector("[data-order-form]");
  if (!form) return;

  const submitButton = form.querySelector("[type=submit]");
  const status = form.querySelector("[data-order-status]");
  const phoneInput = form.querySelector("[data-phone-input]");
  const requestSection = form.closest(".price-page__request");
  const requestCopy = requestSection?.querySelector(".price-page__request-copy");
  const successPanel = requestSection?.querySelector("[data-form-success]");
  const localDemo = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get("demo") === "success";

  const playSuccessAnimation = ({ initialTop, finalTop, initialHeight, finalHeight }) => {
    if (!successPanel || !requestSection) return;

    const buttonLabel = successPanel.querySelector(".price-form-success__button-label");
    const icon = successPanel.querySelector(".price-form-success__icon");
    const label = successPanel.querySelector(".price-form-success__label");
    const text = successPanel.querySelector(".price-form-success__text");
    const formFadeElements = Array.from(form.children)
      .filter((element) => (
        element !== submitButton
        && !element.classList.contains("price-form__status")
        && !element.classList.contains("price-form__honeypot")
      ))
      .reverse();
    const copyFadeElements = requestCopy
      ? Array.from(requestCopy.children).reverse()
      : [];
    const fadeElements = [...formFadeElements, ...copyFadeElements];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finalRadius = window.matchMedia("(max-width: 900px)").matches ? "10px" : "20px";

    successPanel.getAnimations().forEach((animation) => animation.cancel());
    [buttonLabel, icon, label, text, ...fadeElements].forEach((element) => {
      element?.getAnimations().forEach((animation) => animation.cancel());
    });

    if (reduceMotion) {
      successPanel.style.top = `${finalTop}px`;
      successPanel.style.height = `${finalHeight}px`;
      successPanel.style.borderRadius = finalRadius;
      buttonLabel.style.opacity = "0";
      requestSection.classList.add("is-submitted", "is-success-content");
      return;
    }

    buttonLabel?.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 420,
      easing: "ease-in-out",
      fill: "forwards"
    });

    fadeElements.forEach((element, index) => {
      element.animate([
        {
          opacity: 1,
          transform: "translateY(0)",
          filter: "blur(0)"
        },
        {
          opacity: 0,
          transform: "translateY(-12px)",
          filter: "blur(3px)"
        }
      ], {
        duration: 650,
        delay: 420 + index * 85,
        easing: "cubic-bezier(.4, 0, .2, 1)",
        fill: "forwards"
      });
    });

    successPanel.animate([
      {
        top: `${initialTop}px`,
        height: `${initialHeight}px`,
        borderRadius: "10px"
      },
      {
        top: `${initialTop}px`,
        height: `${initialHeight}px`,
        borderRadius: "10px",
        offset: .2
      },
      {
        top: `${finalTop}px`,
        height: `${finalHeight}px`,
        borderRadius: finalRadius
      }
    ], {
      duration: 2300,
      delay: 420,
      easing: "cubic-bezier(.65, 0, .35, 1)",
      fill: "forwards"
    });

    window.setTimeout(() => {
      requestSection.classList.add("is-submitted");
    }, 1700);

    icon?.animate([
      { opacity: 0, transform: "scale(.55) rotate(-18deg)" },
      { opacity: 1, transform: "scale(1.1) rotate(6deg)", offset: .72 },
      { opacity: 1, transform: "scale(1) rotate(0)" }
    ], {
      duration: 800,
      delay: 2670,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "forwards"
    });

    label?.animate([
      { opacity: 0, transform: "translateY(14px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], {
      duration: 700,
      delay: 2920,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "forwards"
    });

    text?.animate([
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], {
      duration: 700,
      delay: 3120,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "forwards"
    });

    window.setTimeout(() => {
      requestSection.classList.add("is-success-content");
    }, 3900);
  };

  const revealSuccessPanel = () => {
    if (!requestSection || !requestCopy || !successPanel) {
      requestSection?.classList.add("is-submitted");
      return;
    }

    const requestRect = requestSection.getBoundingClientRect();
    const formRect = form.getBoundingClientRect();
    const copyRect = requestCopy.getBoundingClientRect();
    const submitRect = submitButton.getBoundingClientRect();
    const initialTop = submitRect.top - requestRect.top;
    const initialHeight = submitRect.height;
    const fullFinalHeight = formRect.bottom - copyRect.top;
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    const finalHeight = isMobile
      ? Math.max(280, fullFinalHeight * 0.52)
      : fullFinalHeight;
    const finalTop = isMobile
      ? initialTop - (finalHeight - initialHeight)
      : copyRect.top - requestRect.top;

    successPanel.style.setProperty("--success-left", `${formRect.left - requestRect.left}px`);
    successPanel.style.setProperty("--success-width", `${formRect.width}px`);
    successPanel.style.setProperty("--success-top", `${initialTop}px`);
    successPanel.style.setProperty("--success-height", `${initialHeight}px`);
    successPanel.setAttribute("aria-hidden", "false");
    requestSection.classList.remove("is-submitted", "is-success-content");
    requestSection.classList.add("is-success-active");
    playSuccessAnimation({ initialTop, finalTop, initialHeight, finalHeight });
  };

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
      revealSuccessPanel();
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

  if (localDemo) {
    window.setTimeout(() => {
      form.reset();
      revealSuccessPanel();
    }, 500);
  }
})();
