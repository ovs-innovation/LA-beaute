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

  const WA_NUMBER = "917007424711";

  function openWhatsApp(text) {
    const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) window.location.href = url;
  }

  function bindForm(id, title) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (!data.name || !data.phone) return;
      const lines = [
        "Hello LA BEAUTÉ Academy,",
        title,
        "",
        "Name: " + data.name.trim(),
        "Phone: " + data.phone.trim()
      ];
      if (data.course) lines.push("Course: " + data.course);
      if (data.batch) lines.push("Batch: " + data.batch);
      openWhatsApp(lines.join("\n"));
      const ok = form.querySelector(".lk-ok");
      if (ok) ok.hidden = false;
    });
  }
  bindForm("demoForm", "I want a free demo class / course enquiry from the website.");
  bindForm("counselForm", "I want free career counselling from the website.");

  /* ------------------------------------------
     Transformations Slider
     ------------------------------------------ */
  const transformSlides = $$(".lk-transform__slide");
  const prevBtn = $("#prevSlide");
  const nextBtn = $("#nextSlide");

  if (transformSlides.length && prevBtn && nextBtn) {
    let currentIndex = 0;

    function showSlide(index) {
      transformSlides.forEach((s) => s.classList.remove("is-active"));
      if (index < 0) currentIndex = transformSlides.length - 1;
      else if (index >= transformSlides.length) currentIndex = 0;
      else currentIndex = index;
      transformSlides[currentIndex].classList.add("is-active");
    }

    prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
    nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));
  }

  /* ------------------------------------------
     Syllabus Tab Switching
     ------------------------------------------ */
  const tabBtns = $$(".lk-tab-btn");
  const tabPanels = $$(".lk-tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("aria-controls");
      tabBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      tabPanels.forEach((p) => {
        p.classList.remove("is-active");
        p.hidden = true;
      });

      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("is-active");
        targetPanel.hidden = false;
      }
    });
  });

  /* ------------------------------------------
     View All / Close Courses Toggle
     ------------------------------------------ */
  const btnViewAll = $("#btnViewAllCourses");
  const viewAllWrap = $("#viewAllCoursesWrap");
  const btnCloseBottom = $("#btnCloseCoursesBottom");
  const closeBottomWrap = $("#closeCoursesBottomWrap");

  function expandCourses() {
    const hiddenCourses = $$(".lk-course-collapsible");
    hiddenCourses.forEach((c) => {
      c.removeAttribute("hidden");
      c.hidden = false;
      c.classList.add("is-revealed");
    });
    if (viewAllWrap) {
      viewAllWrap.setAttribute("hidden", "true");
      viewAllWrap.hidden = true;
      viewAllWrap.style.display = "none";
    }
    if (closeBottomWrap) {
      closeBottomWrap.removeAttribute("hidden");
      closeBottomWrap.hidden = false;
      closeBottomWrap.style.display = "flex";
    }
  }

  function collapseCourses() {
    const hiddenCourses = $$(".lk-course-collapsible");
    hiddenCourses.forEach((c) => {
      c.setAttribute("hidden", "true");
      c.hidden = true;
      c.classList.remove("is-revealed");
    });
    if (closeBottomWrap) {
      closeBottomWrap.setAttribute("hidden", "true");
      closeBottomWrap.hidden = true;
      closeBottomWrap.style.display = "none";
    }
    if (viewAllWrap) {
      viewAllWrap.removeAttribute("hidden");
      viewAllWrap.hidden = false;
      viewAllWrap.style.display = "flex";
    }

    // Smooth scroll back to Courses section top
    const coursesSection = document.getElementById("courses") || document.getElementById("prospectus");
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (btnViewAll) {
    btnViewAll.addEventListener("click", expandCourses);
  }

  if (btnCloseBottom) {
    btnCloseBottom.addEventListener("click", collapseCourses);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();
