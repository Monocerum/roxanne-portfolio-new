window.project = (function () {
  "use strict";

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const BUTTON_STEP = 1.4;
  const MAX_WIDTH = 900;
  const FILL = 0.86;

  const box = document.getElementById("project");
  const photo = document.getElementById("projectPhoto");
  const scroller = document.getElementById("projectScroll");
  const image = document.getElementById("projectImg");
  const emptyMsg = document.getElementById("projectEmpty");
  const closeBtn = document.getElementById("projectClose");

  let tile = null;
  let zoom = 1;
  const pointers = {};
  let lastPoint = null, pinchDistance = 0;

  const isOpen = () => box.classList.contains("is-open");

  function setZoom(value, clientX, clientY) {
    const previous = zoom;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    if (zoom === previous) return;

    const rect = scroller.getBoundingClientRect();
    const fx = (clientX ?? rect.left + rect.width / 2) - rect.left;
    const fy = (clientY ?? rect.top + rect.height / 2) - rect.top;
    const contentX = scroller.scrollLeft + fx;
    const contentY = scroller.scrollTop + fy;

    photo.style.setProperty("--zoom", zoom);
    scroller.scrollLeft = contentX * zoom / previous - fx;
    scroller.scrollTop = contentY * zoom / previous - fy;
    photo.classList.toggle("is-zoomed", zoom > 1);
  }

  function transformOfTile() {
    const r = tile.getBoundingClientRect();
    const dx = r.left + r.width / 2 - innerWidth / 2;
    const dy = r.top + r.height / 2 - innerHeight / 2;
    return `translate(${dx}px, ${dy}px) scale(${r.width / photo.offsetWidth}, ${r.height / photo.offsetHeight})`;
  }

  function open(fromTile) {
    tile = fromTile;
    const src = tile.dataset.src;
    let ratio = 1.4;

    if (src) {
      image.src = src;
      image.hidden = false;
      emptyMsg.hidden = true;
      const thumb = tile.querySelector("img");
      if (thumb && thumb.naturalWidth) ratio = thumb.naturalWidth / thumb.naturalHeight;
    } else {
      image.hidden = true;
      image.removeAttribute("src");
      emptyMsg.hidden = false;
    }

    const width = Math.min(innerWidth * FILL, MAX_WIDTH);
    const height = Math.min(innerHeight * FILL, width / ratio);
    photo.style.width = width + "px";
    photo.style.height = height + "px";

    zoom = 1;
    photo.style.setProperty("--zoom", 1);
    photo.classList.remove("is-zoomed");
    scroller.scrollTo(0, 0);

    photo.classList.add("no-transition");
    photo.style.transform = transformOfTile();
    box.classList.add("is-open");
    void photo.offsetWidth;
    tile.style.opacity = "0";
    photo.classList.remove("no-transition");
    photo.style.transform = "none";
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen()) return;
    const returnTo = tile;
    photo.classList.remove("is-dragging");
    photo.style.transform = transformOfTile();
    box.classList.remove("is-open");
    setTimeout(() => {
      returnTo.style.opacity = "";
      returnTo.focus({ preventScroll: true });
    }, 520);
  }

  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  closeBtn.addEventListener("click", close);
  document.getElementById("projectZoomIn").addEventListener("click", () => setZoom(zoom * BUTTON_STEP));
  document.getElementById("projectZoomOut").addEventListener("click", () => setZoom(zoom / BUTTON_STEP));

  box.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(zoom * Math.exp(-e.deltaY * .01), e.clientX, e.clientY);
    } else if (!photo.contains(e.target)) {
      e.preventDefault();
    }
  }, { passive: false });

  photo.addEventListener("dblclick", (e) => setZoom(zoom > 1 ? 1 : 2.5, e.clientX, e.clientY));

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "+" || e.key === "=") setZoom(zoom * BUTTON_STEP);
    if (e.key === "-") setZoom(zoom / BUTTON_STEP);
  });

  const distanceBetween = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  photo.addEventListener("pointerdown", (e) => {
    pointers[e.pointerId] = [e.clientX, e.clientY];
    lastPoint = [e.clientX, e.clientY];
    const ids = Object.keys(pointers);
    if (ids.length === 2) {
      pinchDistance = distanceBetween(pointers[ids[0]], pointers[ids[1]]);
    } else if (e.pointerType === "mouse" && zoom > 1) {
      photo.setPointerCapture(e.pointerId);
      photo.classList.add("is-dragging");
    }
  });

  photo.addEventListener("pointermove", (e) => {
    if (!pointers[e.pointerId]) return;
    const ids = Object.keys(pointers);

    if (ids.length === 2) {
      pointers[e.pointerId] = [e.clientX, e.clientY];
      const a = pointers[ids[0]], b = pointers[ids[1]];
      const d = distanceBetween(a, b);
      if (pinchDistance) setZoom(zoom * d / pinchDistance, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      pinchDistance = d;
      return;
    }
    if (e.pointerType === "mouse" && zoom > 1 && (e.buttons & 1)) {
      scroller.scrollLeft -= e.clientX - lastPoint[0];
      scroller.scrollTop -= e.clientY - lastPoint[1];
    }
    lastPoint = [e.clientX, e.clientY];
    pointers[e.pointerId] = lastPoint.slice();
  });

  function endPointer(e) {
    delete pointers[e.pointerId];
    pinchDistance = 0;
    if (!Object.keys(pointers).length) photo.classList.remove("is-dragging");
  }
  photo.addEventListener("pointerup", endPointer);
  photo.addEventListener("pointercancel", endPointer);

  return { open, close, isOpen };
})();