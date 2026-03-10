(() => {
  const grid = document.getElementById("product-grid");
  const cards = Array.from(grid ? grid.querySelectorAll(".card") : []);
  const search = document.getElementById("search");
  const hairBase = document.getElementById("hair-base");
  const colorFamily = document.getElementById("color-family");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const resetBtn = document.getElementById("reset");
  const count = document.getElementById("result-count");
  const empty = document.getElementById("empty");
  const prepNote = document.getElementById("prep-note");

  let activeChip = "all";

  function matchesChip(card) {
    const base = card.dataset.hairBase;
    const bleach = card.dataset.bleach;
    const fade = card.dataset.fade;

    if (activeChip === "all") return true;
    if (activeChip === "no-bleach") return bleach === "no";
    if (activeChip === "dark-hair") return base === "dark";
    if (activeChip === "cool-fade") return fade === "cool";
    if (activeChip === "warm-fade") return fade === "warm";
    return true;
  }

  function updatePrepNote(visibleCards) {
    if (!prepNote) return;

    if (!visibleCards.length) {
      prepNote.textContent = "No matching shades right now. Reset filters to view prep guidance.";
      return;
    }

    const needBleach = visibleCards.some((card) => card.dataset.bleach === "yes");
    const allNoBleach = visibleCards.every((card) => card.dataset.bleach === "no");

    if (allNoBleach) {
      prepNote.textContent = "Great news: all visible shades can be used without bleach.";
      return;
    }

    if (needBleach) {
      prepNote.textContent = "Current results include shades that may need pre-lightening. Show bleach only as a separate recommendation.";
    }
  }

  function applyFilters() {
    const term = (search ? search.value.trim().toLowerCase() : "") || "";
    const baseValue = hairBase ? hairBase.value : "all";
    const familyValue = colorFamily ? colorFamily.value : "all";

    let visible = 0;
    const visibleCards = [];

    cards.forEach((card) => {
      const name = (card.dataset.name || "").toLowerCase();
      const base = card.dataset.hairBase;
      const family = card.dataset.family;

      const matchesSearch = !term || name.includes(term);
      const matchesBase = baseValue === "all" || base === baseValue;
      const matchesFamily = familyValue === "all" || family === familyValue;
      const show = matchesSearch && matchesBase && matchesFamily && matchesChip(card);

      card.classList.toggle("is-hidden", !show);

      if (show) {
        visible += 1;
        visibleCards.push(card);
      }
    });

    if (count) {
      count.textContent = `Showing ${visible} shade${visible === 1 ? "" : "s"}`;
    }

    if (empty) {
      empty.classList.toggle("is-hidden", visible !== 0);
    }

    updatePrepNote(visibleCards);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-on"));
      chip.classList.add("is-on");
      activeChip = chip.dataset.chip || "all";
      applyFilters();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (search) search.value = "";
      if (hairBase) hairBase.value = "all";
      if (colorFamily) colorFamily.value = "all";

      activeChip = "all";
      chips.forEach((item) => {
        item.classList.toggle("is-on", item.dataset.chip === "all");
      });

      applyFilters();
    });
  }

  [search, hairBase, colorFamily].forEach((control) => {
    if (!control) return;
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  applyFilters();
})();
