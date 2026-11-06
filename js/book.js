(function () {
  "use strict";

  const tabs = Array.from(document.querySelectorAll(".tab"));
  const spreads = Array.from(document.querySelectorAll(".spread"));

  function select(index) {
    tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.classList.toggle("is-active", isSelected);
      tab.setAttribute("aria-selected", isSelected);
      tab.tabIndex = isSelected ? 0 : -1;
    });
    spreads.forEach((spread, i) => spread.classList.toggle("is-active", i === index));
  }

  window.Book = { select };

  const KEY_DIRECTION = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (e) => {
      const direction = KEY_DIRECTION[e.key];
      if (!direction) return;
      e.preventDefault();
      const next = (i + direction + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
    });
  });
})();