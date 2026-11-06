(function () {
  "use strict";

  document.querySelectorAll("[data-book-tab]").forEach((link) => {
    link.addEventListener("click", () => Book.select(Number(link.dataset.bookTab)));
  });
})();