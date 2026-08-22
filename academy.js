(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const loader = $("#loader");
  function hideLoader() {
    loader?.classList.add("is-hidden");
    document.body.style.overflow = "";
  }
  document.body.style.overflow = "hidden";
  window.addEventListener("load", () => setTimeout(hideLoader, 350));
  setTimeout(hideLoader, 1100);

  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  function closeMenu() {
    navMenu?.classList.remove("is-open");
    navToggle?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  navToggle?.addEventListener("click", () => {
    if (navMenu?.classList.contains("is-open")) closeMenu();
    else {
      navMenu?.classList.add("is-open");
      navToggle.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
  });
  $$(".nav__link").forEach((el) => el.addEventListener("click", closeMenu));

  $$(".ac-faq__item").forEach((item) => {
    const btn = $(".ac-faq__btn", item);
    btn?.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      $$(".ac-faq__item").forEach((other) => {
        other.classList.remove("is-open");
        $(".ac-faq__btn", other)?.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  function bindForm(id) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (!data.name || !data.phone) return;
      form.reset();
      const ok = form.querySelector(".lk-ok");
      if (ok) ok.hidden = false;
    });
  }
  bindForm("demoForm");
  bindForm("counselForm");

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();
