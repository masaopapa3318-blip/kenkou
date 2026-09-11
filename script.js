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
