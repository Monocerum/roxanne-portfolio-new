(function () {
  "use strict";

  const PAGE_TITLES = {
    home: "Roxanne's Portfolio | Home",
    menu: "Roxanne's Portfolio | Menu",
    about: "Roxanne's Portfolio | About",
    book: "Roxanne's Portfolio | About",
    portfolio: "Roxanne's Portfolio | Portfolio"
  };

  const PARENT_PAGE = {
    menu: "home",
    about: "menu",
    book: "about",
    portfolio: "menu"
  };

  const views = Array.from(document.querySelectorAll(".view"));
  const nav = document.getElementById("nav");

  let currentPage = "home";
  let previousPage = null;

  function route() {
    let page = location.hash.slice(1);
    if (!PAGE_TITLES[page]) page = "home";

    if (page !== currentPage) {
      previousPage = currentPage;
      currentPage = page;
    }

    views.forEach((view) => {
      const isCurrent = view.id === page;
      view.classList.toggle("is-active", isCurrent);
      view.inert = !isCurrent;
    });
    nav.classList.toggle("is-solid", page !== "home");
    document.title = PAGE_TITLES[page];
  }

  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
      const fromPage = button.closest(".view").id;
      let target = PARENT_PAGE[fromPage];
      if (fromPage === "book" && previousPage === "menu") target = "menu";
      location.hash = target;
    });
  });

  window.addEventListener("hashchange", route);
  route();
})();