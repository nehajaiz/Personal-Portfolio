document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navbarToggle = document.querySelector(".navbar__toggle");
  const navbarMenu = document.querySelector(".navbar__menu");
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");
  const heroTagline = document.querySelector(".hero__tagline");
  const projectCards = document.querySelectorAll(".project-card");
  const scrollProgress = document.getElementById("scroll-progress");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const smoothScrollTo = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;

    const navHeight = navbar ? navbar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - (navHeight - 4);
    window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      event.preventDefault();
      smoothScrollTo(href);

      if (navbarMenu && navbarMenu.classList.contains("is-open")) {
        navbarMenu.classList.remove("is-open");
        navbarToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener("click", () => {
      const isOpen = navbarMenu.classList.toggle("is-open");
      navbarToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const setActiveLink = () => {
    const navHeight = navbar ? navbar.offsetHeight : 0;
    const scrollMarker = window.scrollY + navHeight + 24;
    let activeId = "home";

    sections.forEach((section) => {
      if (scrollMarker >= section.offsetTop) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = (doc.scrollHeight || doc.clientHeight) - doc.clientHeight;
    const pct = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
    scrollProgress.style.width = `${pct}%`;
  };

  setActiveLink();
  updateScrollProgress();
  window.addEventListener("scroll", () => {
    setActiveLink();
    updateScrollProgress();
  }, { passive: true });

  const revealTargets = document.querySelectorAll(
    ".section__header, .about__highlights, .about__content, .skills__lead, .skills__chips, .contact__wrap"
  );
  revealTargets.forEach((element) => element.classList.add("reveal"));

  const staggerGrids = document.querySelectorAll(".skills__grid--stagger, .projects__grid--stagger");
  staggerGrids.forEach((grid) => grid.classList.add("reveal"));

  const allReveal = [...revealTargets, ...staggerGrids];

  if (prefersReducedMotion) {
    allReveal.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    allReveal.forEach((element) => revealObserver.observe(element));
  }

  const animateCount = (element, target, duration = 900) => {
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) ** 3;
      const value = Math.round(eased * target);
      element.textContent = `${value}%`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const progressElements = document.querySelectorAll(".progress[data-progress]");
  if (!prefersReducedMotion && progressElements.length) {
    const progressObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const raw = el.dataset.progress;
          const pct = Math.min(100, Math.max(0, parseInt(raw, 10) || 0));
          el.style.setProperty("--fill", `${pct}%`);
          el.classList.add("is-filled");
          const bar = el.querySelector(".progress__bar");
          if (bar) {
            requestAnimationFrame(() => {
              bar.style.width = `${pct}%`;
            });
          }
          const card = el.closest(".skill-card");
          const valueEl = card?.querySelector(".skill-card__value[data-count]");
          if (valueEl) {
            const target = parseInt(valueEl.dataset.count, 10) || pct;
            animateCount(valueEl, target);
          }
          observer.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );
    progressElements.forEach((el) => progressObserver.observe(el));
  } else {
    progressElements.forEach((el) => {
      const pct = parseInt(el.dataset.progress, 10) || 0;
      el.style.setProperty("--fill", `${pct}%`);
      el.classList.add("is-filled");
      const bar = el.querySelector(".progress__bar");
      if (bar) bar.style.width = `${pct}%`;
      const card = el.closest(".skill-card");
      const valueEl = card?.querySelector(".skill-card__value[data-count]");
      if (valueEl) valueEl.textContent = `${pct}%`;
    });
  }

  if (heroTagline) {
    const originalText = heroTagline.textContent.trim();
    if (prefersReducedMotion || !originalText) {
      heroTagline.classList.add("is-typed", "is-complete");
    } else {
      heroTagline.textContent = "";
      heroTagline.classList.add("is-typed");
      let index = 0;
      const typeInterval = setInterval(() => {
        heroTagline.textContent += originalText[index];
        index += 1;
        if (index >= originalText.length) {
          clearInterval(typeInterval);
          heroTagline.classList.add("is-complete");
        }
      }, 28);
    }
  }

  projectCards.forEach((card) => {
    card.classList.add("project-card--interactive");
    if (prefersReducedMotion) return;

    const resetCard = () => {
      card.style.transform = "";
      card.classList.remove("is-hovered");
    };

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x - centerX) / centerX) * 4.5;
      const rotateX = ((centerY - y) / centerY) * 4.5;
      card.classList.add("is-hovered");
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", resetCard);
  });

  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");

  if (contactForm && formFeedback) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailTo = contactForm.dataset.contactEmail || "hello@nehakumari.dev";
      const name = (document.getElementById("name")?.value || "").trim();
      const email = (document.getElementById("email")?.value || "").trim();
      const subject = (document.getElementById("subject")?.value || "").trim();
      const message = (document.getElementById("message")?.value || "").trim();

      if (!name || !email || !message) {
        formFeedback.hidden = false;
        formFeedback.classList.add("form-feedback--error");
        formFeedback.textContent = "Please fill in your name, email, and message.";
        return;
      }

      formFeedback.classList.remove("form-feedback--error");
      const subj = subject || `Portfolio — message from ${name}`;
      const body = `From: ${name}\nReply-to: ${email}\n\n${message}`;
      const mailto = `mailto:${emailTo}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;

      formFeedback.hidden = false;
      formFeedback.textContent = "Opening your email app… If it does not open, send manually to " + emailTo;
      window.setTimeout(() => {
        window.location.href = mailto;
      }, 200);
    });
  }

  if (!prefersReducedMotion) {
    const heroSection = document.querySelector(".hero");
    const heroBg = document.getElementById("hero-bg");
    const heroMedia = document.getElementById("hero-media");
    const heroContent = document.getElementById("hero-content");

    const parallaxScroll = () => {
      const y = window.scrollY;
      if (heroBg) {
        heroBg.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
      }
    };

    window.addEventListener("scroll", parallaxScroll, { passive: true });
    parallaxScroll();

    if (heroSection && heroContent && heroMedia) {
      const move = (event) => {
        const rect = heroSection.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        const cx = parseFloat(heroContent.dataset.parallax) || -0.04;
        const mx = parseFloat(heroMedia.dataset.parallax) || 0.06;
        heroContent.style.transform = `translate3d(${px * cx * -120}px, ${py * cx * -80}px, 0)`;
        heroMedia.style.transform = `translate3d(${px * mx * 100}px, ${py * mx * 80}px, 0)`;
      };

      const reset = () => {
        heroContent.style.transform = "";
        heroMedia.style.transform = "";
      };

      heroSection.addEventListener("mousemove", move);
      heroSection.addEventListener("mouseleave", reset);
    }

    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (event) => {
        const rect = btn.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
        btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }
});
