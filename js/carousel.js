(function () {
  "use strict";

  const projects = window.PROJECTS;
  const viewer = window.project;
  const total = projects.length;

  const section = document.getElementById("portfolio");
  const carousel = document.getElementById("carousel");
  const counter = document.getElementById("carouselCount");
  const progress = document.getElementById("carouselProgress");
  const gallery = document.getElementById("gallery");
  const backBtn = document.getElementById("backBtn");
  const compactCarousel = window.matchMedia("(max-width: 1000px)");

  let suppressClick = false;
  let active = 0;
  let openIndex = -1;
  const previousOffsets = [];

  const ICONS = {
    github: "assets/about/contacts/github.png",
    figma: "assets/about/figma.png",
    view: "assets/portfolio/view.png"
  };

  const cards = projects.map((item, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "project-card";
    card.setAttribute("aria-label", `${item.title}, ${i + 1} of ${total}`);
    card.innerHTML =
      '<span class="card-text">' +
      '<h3 class="font-display"></h3><p></p><span class="card-link">SEE PHOTOS</span>' +
      '</span>';
    card.querySelector("h3").textContent = item.title;
    card.querySelector("p").textContent = item.summary || "";

    const linkBox = document.createElement("span");
    linkBox.className = "card-links";
    (item.links || []).forEach((l) => {
      const icon = document.createElement("span");
      icon.className = "card-icon";
      icon.setAttribute("role", "link");
      icon.setAttribute("aria-label", `${item.title} on ${l.type}`);
      icon.innerHTML = `<img src="${ICONS[l.type]}" alt="">`;
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        window.open(l.url, "_blank", "noopener");
      });
      linkBox.appendChild(icon);
    });

    card.querySelector(".card-text").appendChild(linkBox);

    if (item.cover) {
      card.style.backgroundImage = item.cover;
      card.classList.add("has-cover");
    }

    card.addEventListener("click", () => {
      if (suppressClick) return;
      if (openIndex >= 0) return;

      if (i !== active) {
        active = i;
        render();
      } else {
        openProject(i);
      }
    });

    carousel.appendChild(card);
    return card;
  });

  function render() {
    const half = Math.floor(total / 2);
    cards.forEach((card, i) => {
      const offset = ((i - active + total + half) % total) - half;
      const visibleRange = compactCarousel.matches ? 1 : 2;
      const value = Math.abs(offset) <= visibleRange ? offset : "hide";
      const previous = previousOffsets[i];

      if (previous !== undefined && Math.abs(offset - previous) > 2) {
        card.style.transition = "none";
        card.dataset.offset = value;
        void card.offsetWidth;
        card.style.transition = "";
      } else {
        card.dataset.offset = value;
      }
      card.tabIndex = offset === 0 ? 0 : -1;
      previousOffsets[i] = offset;
    });
    counter.textContent = `${active + 1} / ${total}`;
    progress.style.setProperty("--pct", ((active + 1) / total) * 100);
    progress.setAttribute("aria-valuemax", total);
    progress.setAttribute("aria-valuenow", active + 1);
  }

  compactCarousel.addEventListener("change", render);

  function step(direction) {
    active = (active + direction + total) % total;
    render();
  }

  document.getElementById("prev").addEventListener("click", () => step(-1));
  document.getElementById("next").addEventListener("click", () => step(1));

  let swipeStart = null;

  carousel.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    swipeStart = e.clientX;
    suppressClick = false;
  });

  carousel.addEventListener("pointerup", (e) => {
    if (swipeStart === null) return;
    const distance = e.clientX - swipeStart;

    if (Math.abs(distance) > 50) {
      suppressClick = true;
      step(distance < 0 ? 1 : -1);
      setTimeout(() => { suppressClick = false; }, 0);
    }
    swipeStart = null;
  });

  carousel.addEventListener("pointercancel", () => { swipeStart = null; });

  function openProject(i) {
    openIndex = i;
    cards[i].classList.add("is-open");

    gallery.innerHTML = "";
    gallery.scrollTop = 0;

    const item = projects[i];
    const pics = item.pics || [];

    if (pics.length === 0) {
      const message = document.createElement("p");
      message.className = "gallery-empty font-display";
      message.textContent = "Pictures coming soon!";
      gallery.appendChild(message);
    } else {
      const columns = [document.createElement("div"), document.createElement("div")];
      columns.forEach((column) => {
        column.className = "gallery-col";
        gallery.appendChild(column);
      });

      pics.forEach((src, k) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "tile";
        tile.style.setProperty("--k", k);
        tile.dataset.src = src;
        tile.setAttribute("aria-label", `${item.title} picture ${k + 1}`);

        const img = new Image();
        img.alt = "";
        img.src = src;

        const fitTile = () => {
          if (img.naturalWidth) tile.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        };
        if (img.complete) fitTile();
        else img.addEventListener("load", fitTile);

        tile.appendChild(img);
        tile.addEventListener("click", () => viewer.open(tile));

        columns[k % 2].appendChild(tile);
      });
    }

    section.classList.add("is-detail");
    backBtn.focus({ preventScroll: true });
  }

  function closeProject() {
    if (openIndex < 0) return;
    const card = cards[openIndex];
    openIndex = -1;
    section.classList.remove("is-detail");
    card.classList.remove("is-open");
    card.focus({ preventScroll: true });
  }

  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeProject();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (viewer.isOpen()) viewer.close();
      else closeProject();
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (!section.classList.contains("is-active") || openIndex >= 0) return;
    step(e.key === "ArrowLeft" ? -1 : 1);
  });

  render();
})();