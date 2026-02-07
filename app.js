document.addEventListener("DOMContentLoaded", () => {
  const captcha = document.getElementById("captcha");
  const game = document.getElementById("game");

  const wrapper = document.getElementById("firstValentine-checkboxWrapper");

  const gridEl = document.getElementById("valentineGrid");
  const btnVerify = document.getElementById("btnVerify");
  const btnRefresh = document.getElementById("btnRefresh");
  const gameError = document.getElementById("gameError");

  if (
    !captcha ||
    !game ||
    !wrapper ||
    !gridEl ||
    !btnVerify ||
    !btnRefresh ||
    !gameError
  ) {
    console.error("Missing required elements", {
      captcha,
      game,
      wrapper,
      gridEl,
      btnVerify,
      btnRefresh,
      gameError,
    });
    return;
  }

  // --- CONFIG: your 9 images ---
  // "eu1..eu7" are CORRECT selections; "cris" and "ele1" are traps.
  const BASE_IMAGES = [
    { key: "eu1", src: "assets/eu1.jpeg", isValentine: true },
    { key: "eu2", src: "assets/eu2.JPG", isValentine: true },
    { key: "eu3", src: "assets/eu3.JPG", isValentine: true },
    { key: "eu4", src: "assets/eu4.JPG", isValentine: true },
    { key: "eu5", src: "assets/eu5.jpeg", isValentine: true },
    { key: "eu6", src: "assets/eu6.jpeg", isValentine: true },
    { key: "eu7", src: "assets/eu7.PNG", isValentine: true },

    { key: "cris", src: "assets/cris.jpg", isValentine: false },
    { key: "ele1", src: "assets/ele1.jpg", isValentine: false },
  ];

  // Start: only captcha visible
  game.classList.add("is-hidden");
  wrapper.classList.add("is-idle");

  let state = "idle";
  let currentImages = [];

  function setState(next) {
    state = next;
    wrapper.classList.remove("is-idle", "is-loading", "is-done");
    wrapper.classList.add(`is-${next}`);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function hideError() {
    gameError.classList.add("is-hidden");
  }

  function showError() {
    gameError.classList.remove("is-hidden");
  }

  function renderGrid() {
    hideError();
    gridEl.innerHTML = "";

    currentImages.forEach((img) => {
      const item = document.createElement("div");
      item.className = "grid-item";
      item.dataset.key = img.key;
      item.dataset.isValentine = String(img.isValentine);

      const image = document.createElement("img");
      image.src = img.src;
      image.alt = img.key;

      const checkmark = document.createElement("div");
      checkmark.className = "checkmark";

      item.appendChild(image);
      item.appendChild(checkmark);

      item.addEventListener("click", () => {
        item.classList.toggle("selected");
      });

      gridEl.appendChild(item);
    });
  }

  function resetGame({ reshuffle } = { reshuffle: true }) {
    // clear selections
    gridEl
      .querySelectorAll(".grid-item.selected")
      .forEach((el) => el.classList.remove("selected"));

    // reshuffle and re-render
    if (reshuffle) {
      currentImages = shuffle(BASE_IMAGES);
      renderGrid();
    }
  }

  function getSelection() {
    const selectedKeys = new Set(
      [...gridEl.querySelectorAll(".grid-item.selected")].map(
        (el) => el.dataset.key,
      ),
    );
    return selectedKeys;
  }

  function isValidSelection(selectedKeys) {
    // Must select ALL 7 "eu*" and select NONE of the traps.
    const required = BASE_IMAGES.filter((i) => i.isValentine).map((i) => i.key);
    const forbidden = BASE_IMAGES.filter((i) => !i.isValentine).map(
      (i) => i.key,
    );

    // all required selected
    for (const k of required) {
      if (!selectedKeys.has(k)) return false;
    }
    // none forbidden selected
    for (const k of forbidden) {
      if (selectedKeys.has(k)) return false;
    }
    // (Optional strictness) ensure they didn't select anything else (they can't, but keeps it correct)
    if (selectedKeys.size !== required.length) return false;

    return true;
  }

  // --- Buttons ---
  btnRefresh.addEventListener("click", () => {
    // Treat refresh as a retry: reshuffle every time.
    resetGame({ reshuffle: true });
  });

  btnVerify.addEventListener("click", () => {
    const selected = getSelection();

    if (isValidSelection(selected)) {
      window.location.href = "valentine.html"; // change if needed
      return;
    }

    // Failure: show error like reCAPTCHA, then reshuffle
    showError();

    // keep the message visible briefly
    setTimeout(() => {
      resetGame({ reshuffle: true });
    }, 2000);
  });

  // --- CAPTCHA click -> show game ---
  wrapper.addEventListener("click", () => {
    if (state !== "idle") return;

    setState("loading");

    setTimeout(() => {
      setState("done");

      setTimeout(() => {
        captcha.classList.add("is-fading-out");

        setTimeout(() => {
          captcha.classList.add("is-hidden");

          game.classList.remove("is-hidden");
          void game.offsetHeight; // force reflow
          game.classList.add("is-visible");

          // init grid (shuffled on entry too)
          currentImages = shuffle(BASE_IMAGES);
          renderGrid();
        }, 260);
      }, 650);
    }, 1100);
  });
});
