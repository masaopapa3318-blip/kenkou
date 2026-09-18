// Mobile nav toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const nav = document.querySelector(".main-nav");
  const backdrop = document.getElementById("navBackdrop");
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.classList.remove("open");
  };

  const openNav = () => {
    nav.classList.add("open");
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if (backdrop) backdrop.classList.add("open");
  };

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("open")) closeNav();
    else openNav();
  });

  if (backdrop) backdrop.addEventListener("click", closeNav);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
});

// Desktop nav dropdown ("レジオン八ヶ岳"): click/keyboard toggle,
// closes on outside click or Escape. Hover is handled purely by CSS.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    const caret = dropdown.querySelector(".nav-dropdown-caret");
    if (!caret) return;

    const close = () => {
      dropdown.classList.remove("is-open");
      caret.setAttribute("aria-expanded", "false");
    };

    caret.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("is-open");
      caret.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  });
});

// Scroll reveal: fade + rise elements into view as the page is scrolled.
// Checked directly against each element's position (rather than relying only on
// IntersectionObserver) so a jump-scroll (End key, scrollbar-track click, anchor
// link) can't skip over an element and leave it permanently invisible.
document.addEventListener("DOMContentLoaded", () => {
  let pending = Array.from(document.querySelectorAll(".reveal"));
  if (!pending.length) return;

  let ticking = false;

  const revealVisible = () => {
    ticking = false;
    const vh = window.innerHeight;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.classList.add("is-visible");
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(revealVisible);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  revealVisible();
});
