/* ============================================
   LA BEAUTÉ — Interactions
   ============================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const header = $("#header");
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  const navClose = $("#navClose");
  const progress = $("#scrollProgress");
  const loader = $("#loader");
  const backToTop = $("#backToTop");
  const year = $("#year");

  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------
     Loading Screen
     ------------------------------------------ */
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("is-hidden");
    document.body.style.overflow = "";
  }

  document.body.style.overflow = "hidden";
  window.addEventListener("load", () => {
    setTimeout(hideLoader, 400);
  });
  setTimeout(hideLoader, 1200);

  /* ------------------------------------------
     Active Nav Highlight
     ------------------------------------------ */
  const sections = $$("main section[id]");

  function highlightNav() {
    const fromTop = window.scrollY + 120;
    let current = sections[0]?.id;
    sections.forEach((sec) => {
      if (sec.offsetTop <= fromTop) current = sec.id;
    });
    $$(".nav__link").forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", href === current);
    });
  }

  /* ------------------------------------------
     Sticky Navbar + Progress + Back to Top
     ------------------------------------------ */
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;

    header?.classList.toggle("is-solid", y > 24);
    if (progress) {
      progress.style.width = pct + "%";
      progress.setAttribute("aria-valuenow", String(Math.round(pct)));
    }
    backToTop?.classList.toggle("is-visible", y > 600);
    highlightNav();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ------------------------------------------
     Mobile Menu
     ------------------------------------------ */
  function closeMenu() {
    navMenu?.classList.remove("is-open");
    navToggle?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  function openMenu() {
    navMenu?.classList.add("is-open");
    navToggle?.classList.add("is-open");
    navToggle?.setAttribute("aria-expanded", "true");
    navToggle?.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  navToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu?.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  navClose?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenu();
  });

  $$(".nav__link, .nav__actions .btn").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  /* ------------------------------------------
     Smooth Scroll (native + offset)
     ------------------------------------------ */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ------------------------------------------
     Scroll Reveal
     ------------------------------------------ */
  const revealEls = $$(".reveal, .reveal-left, .reveal-right, .reveal-zoom");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ------------------------------------------
     Animated Counters
     ------------------------------------------ */
  const counters = $$(".stats__number");
  let countersDone = false;

  function animateCount(el) {
    const end = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(eased * end);
      el.textContent = value.toLocaleString("en-IN") + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const stats = $("#stats");
  if (stats && "IntersectionObserver" in window) {
    const statsIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersDone) {
          countersDone = true;
          counters.forEach(animateCount);
          statsIo.disconnect();
        }
      });
    }, { threshold: 0.35 });
    statsIo.observe(stats);
  }

  /* ------------------------------------------
     Button Ripple
     ------------------------------------------ */
  $$(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty("--ripple-x", e.clientX - rect.left + "px");
      btn.style.setProperty("--ripple-y", e.clientY - rect.top + "px");
      btn.classList.remove("is-rippling");
      void btn.offsetWidth;
      btn.classList.add("is-rippling");
      setTimeout(() => btn.classList.remove("is-rippling"), 700);
    });
  });

  /* ------------------------------------------
     Hero Slideshow
     ------------------------------------------ */
  const slides = $$(".hero__slide");
  const heroDots = $("#heroDots");
  let heroIndex = 0;
  let heroTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Show slide " + (i + 1));
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goHero(i, true));
    heroDots?.appendChild(dot);
  });

  const heroDotBtns = $$("#heroDots button");

  function goHero(i, user) {
    heroIndex = (i + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle("is-active", idx === heroIndex));
    heroDotBtns.forEach((dot, idx) => dot.classList.toggle("is-active", idx === heroIndex));
    if (user) restartHero();
  }

  function restartHero() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goHero(heroIndex + 1), 5200);
  }

  $("#heroPrev")?.addEventListener("click", () => goHero(heroIndex - 1, true));
  $("#heroNext")?.addEventListener("click", () => goHero(heroIndex + 1, true));
  $(".hero")?.addEventListener("mouseenter", () => clearInterval(heroTimer));
  $(".hero")?.addEventListener("mouseleave", restartHero);
  if (slides.length) restartHero();

  /* ------------------------------------------
     Lookbook Drag Scroll
     ------------------------------------------ */
  const lookScroll = $("#lookbookScroll");
  if (lookScroll) {
    let isDown = false;
    let startX = 0;
    let startLeft = 0;
    lookScroll.addEventListener("pointerdown", (e) => {
      isDown = true;
      lookScroll.classList.add("is-dragging");
      startX = e.clientX;
      startLeft = lookScroll.scrollLeft;
      lookScroll.setPointerCapture(e.pointerId);
    });
    lookScroll.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      lookScroll.scrollLeft = startLeft - (e.clientX - startX);
    });
    const stopDrag = () => {
      isDown = false;
      lookScroll.classList.remove("is-dragging");
    };
    lookScroll.addEventListener("pointerup", stopDrag);
    lookScroll.addEventListener("pointercancel", stopDrag);
  }

  /* ------------------------------------------
     Hero Parallax (legacy removed — slideshow handles motion)
     ------------------------------------------ */
  /* ------------------------------------------
     Gallery Filter + Lightbox
     ------------------------------------------ */
  const galleryItems = $$(".gallery__item");
  const filterBtns = $$(".filter-btn");
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  let visibleItems = galleryItems.slice();
  let currentIndex = 0;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;
      galleryItems.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !show);
      });
      visibleItems = galleryItems.filter((item) => !item.classList.contains("is-hidden"));
    });
  });

  function openLightbox(index) {
    if (!lightbox || !visibleItems.length) return;
    currentIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[currentIndex];
    const img = $("img", item);
    lightboxImage.src = img.src.replace("w=800", "w=1400");
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = item.dataset.caption || img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    $(".lightbox__close")?.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      visibleItems = galleryItems.filter((el) => !el.classList.contains("is-hidden"));
      openLightbox(visibleItems.indexOf(item));
    });
  });

  $$("[data-lightbox-close]").forEach((el) => el.addEventListener("click", closeLightbox));
  $("#lightboxPrev")?.addEventListener("click", () => openLightbox(currentIndex - 1));
  $("#lightboxNext")?.addEventListener("click", () => openLightbox(currentIndex + 1));

  document.addEventListener("keydown", (e) => {
    if (lightbox?.hidden) return;
    if (e.key === "ArrowLeft") openLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") openLightbox(currentIndex + 1);
  });

  /* ------------------------------------------
     Before & After Slider
     ------------------------------------------ */
  const ba = $("#beforeAfter");
  const baBefore = $("#baBefore");
  const baRange = $("#baRange");
  const baHandle = $("#baHandle");

  function setBa(value) {
    const v = Number(value);
    if (baBefore) baBefore.style.width = v + "%";
    if (baHandle) baHandle.style.left = v + "%";
  }

  baRange?.addEventListener("input", (e) => setBa(e.target.value));
  setBa(baRange?.value || 50);

  if (ba && baRange) {
    let dragging = false;
    const updateFromPointer = (clientX) => {
      const rect = ba.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      baRange.value = String(pct);
      setBa(pct);
    };
    ba.addEventListener("pointerdown", (e) => {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX);
    });
    ba.addEventListener("pointermove", (e) => {
      if (dragging) updateFromPointer(e.clientX);
    });
    ba.addEventListener("pointerup", () => {
      dragging = false;
    });
  }

  /* ------------------------------------------
     Testimonials Auto Slider
     ------------------------------------------ */
  const cards = $$(".testimonial-card");
  const dotsWrap = $("#testimonialDots");
  let slideIndex = 0;
  let slideTimer;

  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goSlide(i, true));
    dotsWrap?.appendChild(dot);
  });

  const dots = $$("#testimonialDots button");

  function goSlide(i, user) {
    slideIndex = (i + cards.length) % cards.length;
    cards.forEach((card, idx) => card.classList.toggle("is-active", idx === slideIndex));
    dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === slideIndex));
    if (user) restartSlider();
  }

  function restartSlider() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goSlide(slideIndex + 1), 5200);
  }

  const slider = $("#testimonialSlider");
  slider?.addEventListener("mouseenter", () => clearInterval(slideTimer));
  slider?.addEventListener("mouseleave", restartSlider);
  slider?.addEventListener("focusin", () => clearInterval(slideTimer));
  slider?.addEventListener("focusout", restartSlider);
  restartSlider();

  /* ------------------------------------------
     FAQ Accordion
     ------------------------------------------ */
  const items = $$(".accordion__item");
  items.forEach((item) => {
    const btn = $(".accordion__btn", item);
    btn?.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.remove("is-open");
        $(".accordion__btn", other)?.setAttribute("aria-expanded", "false");
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

  /* ------------------------------------------
     Appointment Form → WhatsApp
     ------------------------------------------ */
  const form = $("#appointmentForm");
  const success = $("#formSuccess");

  const validators = {
    name: (v) => (v.trim().length < 2 ? "Please enter your name." : ""),
    phone: (v) =>
      /^[+]?[\d\s-]{10,15}$/.test(v.trim()) ? "" : "Enter a valid phone number.",
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address.",
    service: (v) => (v ? "" : "Please select a service."),
    message: (v) => (v.trim().length < 8 ? "Please add a short message." : "")
  };

  function showFieldError(field, message) {
    const row = field.closest(".form-row");
    const err = $('[data-error-for="' + field.name + '"]');
    row?.classList.toggle("is-invalid", Boolean(message));
    if (err) err.textContent = message;
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      const message = validators[name](field.value);
      showFieldError(field, message);
      if (message) valid = false;
    });
    if (!valid) return;

    const serviceEl = form.elements.service;
    const serviceLabel = serviceEl.options[serviceEl.selectedIndex]?.text || serviceEl.value;

    openWhatsApp(
      [
        "Hello LA BEAUTÉ,",
        "I would like to book / enquire from the website.",
        "",
        "Name: " + form.elements.name.value.trim(),
        "Phone: " + form.elements.phone.value.trim(),
        "Email: " + form.elements.email.value.trim(),
        "Service: " + serviceLabel,
        "Message: " + form.elements.message.value.trim()
      ].join("\n")
    );

    if (success) success.hidden = false;
  });

  form &&
    $$("input, select, textarea", form).forEach((field) => {
      field.addEventListener("blur", () => {
        if (validators[field.name]) {
          showFieldError(field, validators[field.name](field.value));
        }
      });
    });

  /* ------------------------------------------
     Newsletter
     ------------------------------------------ */
  const newsForm = $("#newsletterForm");
  const newsError = $("#newsError");
  const newsSuccess = $("#newsSuccess");

  newsForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#newsletterEmail");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!ok) {
      if (newsError) newsError.textContent = "Please enter a valid email.";
      newsSuccess && (newsSuccess.hidden = true);
      return;
    }
    if (newsError) newsError.textContent = "";
    email.value = "";
    if (newsSuccess) {
      newsSuccess.hidden = false;
      setTimeout(() => {
        newsSuccess.hidden = true;
      }, 4000);
    }
  });

  /* ------------------------------------------
     Cursor Glow + Mouse Trail
     ------------------------------------------ */
  const glow = $("#cursorGlow");
  const canvas = $("#mouseTrail");
  const finePointer = window.matchMedia("(pointer: fine) and (min-width: 901px)");

  if (glow && finePointer.matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;

    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.style.opacity = "1";
    });

    function follow() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.left = gx + "px";
      glow.style.top = gy + "px";
      requestAnimationFrame(follow);
    }
    follow();

    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext("2d");
      const points = [];
      const max = 18;

      function sizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      sizeCanvas();
      window.addEventListener("resize", sizeCanvas);

      window.addEventListener("mousemove", (e) => {
        points.push({ x: e.clientX, y: e.clientY, life: 1 });
        if (points.length > max) points.shift();
      });

      function drawTrail() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points.forEach((p, i) => {
          p.life *= 0.94;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(99, 230, 255," + (0.18 + i / max / 4) + ")";
          ctx.fill();
        });
        requestAnimationFrame(drawTrail);
      }
      drawTrail();
    }
  }

  /* ------------------------------------------
     Offers Tab Filtering & Collapsible Items
     ------------------------------------------ */
  const tabBtns = $$(".lux-tab-btn");
  const offerCards = $$(".lux-offer-card");

  if (tabBtns.length && offerCards.length) {
    // 1. Collapsible List Items inside each Card (Show 4 items initially)
    const ITEM_LIMIT = 4;
    offerCards.forEach((card) => {
      const list = card.querySelector(".lux-offer-card__list");
      if (!list) return;

      const items = Array.from(list.querySelectorAll("li"));
      if (items.length > ITEM_LIMIT) {
        items.forEach((item, index) => {
          if (index >= ITEM_LIMIT) {
            item.classList.add("is-extra-item");
          }
        });

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "lux-card-toggle";
        toggleBtn.innerHTML = `<span>View All (${items.length} services)</span> <i class="chevron">▼</i>`;

        toggleBtn.addEventListener("click", () => {
          const isExpanded = card.classList.toggle("is-expanded");
          if (isExpanded) {
            toggleBtn.innerHTML = `<span>Show Less</span> <i class="chevron">▲</i>`;
          } else {
            toggleBtn.innerHTML = `<span>View All (${items.length} services)</span> <i class="chevron">▼</i>`;
          }
        });

        const footer = card.querySelector(".lux-offer-card__footer");
        if (footer) {
          card.insertBefore(toggleBtn, footer);
        } else {
          card.appendChild(toggleBtn);
        }
      }
    });

    // 2. Tab Filter Handler
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter") || "all";
        const filterArr = filter.split(",").map((s) => s.trim());

        tabBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        let visibleCards = [];
        offerCards.forEach((card) => {
          const category = card.getAttribute("data-category");
          if (filter === "all" || filterArr.includes(category)) {
            card.classList.remove("is-hidden");
            visibleCards.push(card);
          } else {
            card.classList.add("is-hidden");
          }
        });

        offerCards.forEach((card) => {
          if (visibleCards.length === 1 && visibleCards[0] === card) {
            card.classList.add("is-single");
          } else {
            card.classList.remove("is-single");
          }
        });

        applyCardLimit();
      });
    });

    // 3. Grid Truncation ("View All Offers" for "All Offers" Tab)
    const CARD_LIMIT = 6;
    const grid = document.querySelector(".lux-offers__grid");

    if (grid && offerCards.length > CARD_LIMIT) {
      const gridToggleWrap = document.createElement("div");
      gridToggleWrap.className = "lux-offers__grid-toggle-wrap";

      const gridToggleBtn = document.createElement("button");
      gridToggleBtn.type = "button";
      gridToggleBtn.className = "lux-grid-toggle-btn";
      gridToggleBtn.textContent = `View All Offers (${offerCards.length} Categories)`;

      gridToggleWrap.appendChild(gridToggleBtn);
      grid.after(gridToggleWrap);

      let isGridExpanded = false;

      function applyCardLimit() {
        const activeTab = document.querySelector(".lux-tab-btn.is-active");
        const currentFilter = activeTab ? activeTab.getAttribute("data-filter") : "all";

        if (currentFilter === "all" && !isGridExpanded) {
          offerCards.forEach((card, idx) => {
            if (idx >= CARD_LIMIT) {
              card.classList.add("is-hidden-by-limit");
            } else {
              card.classList.remove("is-hidden-by-limit");
            }
          });
          gridToggleWrap.style.display = "flex";
        } else {
          offerCards.forEach((card) => card.classList.remove("is-hidden-by-limit"));
          if (currentFilter !== "all") {
            gridToggleWrap.style.display = "none";
          } else {
            gridToggleWrap.style.display = "flex";
          }
        }
      }

      gridToggleBtn.addEventListener("click", () => {
        isGridExpanded = !isGridExpanded;
        if (isGridExpanded) {
          gridToggleBtn.textContent = "Show Less Offers";
        } else {
          gridToggleBtn.textContent = `View All Offers (${offerCards.length} Categories)`;
        }
        applyCardLimit();
      });

      applyCardLimit();
    }
  }

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
})();
