(() => {
  document.addEventListener(
    "dragstart",
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) {
        event.preventDefault();
      }
    },
    { capture: true }
  );

  const disableImageDrag = () => {
    document.querySelectorAll("img").forEach((img) => {
      img.setAttribute("draggable", "false");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", disableImageDrag, { once: true });
  } else {
    disableImageDrag();
  }

  document.addEventListener(
    "contextmenu",
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) {
        event.preventDefault();
      }
    },
    { capture: true }
  );

  const loader = document.querySelector("#site-loader");
  const loaderFill = loader ? loader.querySelector(".site-loader__fill") : null;
  const loaderDots = loader ? loader.querySelector(".site-loader__dots") : null;
  const enablePageLoader = true;

  if (loaderDots && loaderDots.children.length === 0) {
    loaderDots.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  }
  let heroModelLoaded = false;
  let heroHdriLoaded = false;
  const hasHero = Boolean(document.querySelector("#hero-canvas"));
  const hasProjectViewer = Boolean(document.querySelector("#project-viewer"));
  let totalAssets = 0;
  let loadedAssets = 0;
  let progressTarget = 0;
  let progressCurrent = 0;

  const setProgress = (value) => {
    progressTarget = Math.max(0, Math.min(1, value));
  };

  const tickProgress = () => {
    if (!loader || !loaderFill) return;
    progressCurrent += (progressTarget - progressCurrent) * 0.12;
    loader.style.setProperty("--loader-progress", progressCurrent.toFixed(4));
    if (Math.abs(progressTarget - progressCurrent) > 0.002) {
      requestAnimationFrame(tickProgress);
    }
  };

  const markLoaded = () => {
    loadedAssets = Math.min(totalAssets, loadedAssets + 1);
    if (totalAssets > 0) {
      const ratio = loadedAssets / totalAssets;
      const stepped = Math.round(ratio * 20) / 20;
      setProgress(stepped);
      tickProgress();
    }
    tryHideLoader();
  };

  const tryHideLoader = () => {
    if (!heroModelLoaded || !heroHdriLoaded) return;
    if (totalAssets > 0 && loadedAssets < totalAssets) return;
    if (!loader) return;
    loader.classList.add("is-hidden");
    setTimeout(() => {
      loader.remove();
    }, 500);
  };

  if (hasHero) {
    totalAssets += 2;
    window.addEventListener(
      "hero-model-loaded",
      () => {
        heroModelLoaded = true;
        markLoaded();
        tryHideLoader();
      },
      { once: true }
    );
    window.addEventListener(
      "hero-hdri-loaded",
      () => {
        heroHdriLoaded = true;
        markLoaded();
        tryHideLoader();
      },
      { once: true }
    );
  }
  if (hasProjectViewer) {
    totalAssets += 2;
    window.addEventListener(
      "project-model-loaded",
      () => {
        markLoaded();
      },
      { once: true }
    );
    window.addEventListener(
      "project-hdri-loaded",
      () => {
        markLoaded();
      },
      { once: true }
    );
  }
  if (loader) {
    const images = Array.from(document.images || []);
    totalAssets += images.length;
    if (totalAssets === 0) {
      setProgress(1);
      tickProgress();
    } else {
      images.forEach((img) => {
        if (img.complete) {
          markLoaded();
        } else {
          img.addEventListener("load", markLoaded, { once: true });
          img.addEventListener("error", markLoaded, { once: true });
        }
      });
    }
  }

  window.addEventListener("load", () => {
    if (!hasHero) {
      heroModelLoaded = true;
      heroHdriLoaded = true;
      tryHideLoader();
    }
    if (!hasProjectViewer) {
      markLoaded();
      markLoaded();
    }
    if (loader) {
      setTimeout(() => {
        heroModelLoaded = true;
        heroHdriLoaded = true;
        setProgress(1);
        tickProgress();
        tryHideLoader();
      }, 12000);
    }
  });

  const toggleButton = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector(".nav-panel");

  const toggleNav = () => {
    if (!toggleButton || !navPanel) return;
    const isOpen = document.body.classList.toggle("nav-open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  };

  const closeNav = () => {
    if (!toggleButton || !navPanel) return;
    document.body.classList.remove("nav-open");
    toggleButton.setAttribute("aria-expanded", "false");
  };

  const getTargetX = (link, nav, activeBlock) => {
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    return linkRect.left - navRect.left + linkRect.width / 2 - activeBlock.offsetWidth / 2;
  };

  const positionActive = (opts = {}) => {
    const nav = document.querySelector(".nav-links");
    const activeBlock = document.querySelector(".nav-active");
    if (!nav || !activeBlock) return;

    const page = document.body.dataset.page;
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (!activeLink) return;

    const targetX = getTargetX(activeLink, nav, activeBlock);

    if (opts.fromPage) {
      const fromLink = document.querySelector(`.nav-link[data-page="${opts.fromPage}"]`);
      if (fromLink) {
        const fromX = getTargetX(fromLink, nav, activeBlock);
        activeBlock.style.transition = "none";
        activeBlock.style.transform = `translateX(${fromX}px) translateY(-50%)`;
        activeBlock.classList.add("is-visible");
        requestAnimationFrame(() => {
          activeBlock.style.transition = "";
          activeBlock.style.transform = `translateX(${targetX}px) translateY(-50%)`;
        });
      } else {
        activeBlock.style.transform = `translateX(${targetX}px) translateY(-50%)`;
      }
    } else {
      activeBlock.style.transform = `translateX(${targetX}px) translateY(-50%)`;
    }

    activeBlock.classList.add("is-visible");

    document.querySelectorAll(".nav-link").forEach((link) => {
      if (link === activeLink) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const storeCurrentPage = () => {
    const page = document.body.dataset.page;
    if (page) {
      localStorage.setItem("navPrevPage", page);
    }
  };

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(() => positionActive());
  });

  window.addEventListener("DOMContentLoaded", () => {
    const prevPage = localStorage.getItem("navPrevPage");
    positionActive({ fromPage: prevPage });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetUrl = new URL(link.href, window.location.origin);
        const currentUrl = new URL(window.location.href);
        if (targetUrl.pathname === currentUrl.pathname) {
          event.preventDefault();
          closeNav();
          return;
        }
        storeCurrentPage();
        closeNav();
      });
    });

    if (toggleButton) {
      toggleButton.addEventListener("click", toggleNav);
    }
  });

  window.addEventListener("beforeunload", storeCurrentPage);
})();
