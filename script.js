/* ================================================================
   ReBalance Wellness — Interactions
   Cursor-driven effects, scroll reveals, and navigation behaviors.
   ================================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------------
     CONFIG — replace this with your Google Form link when ready.
     All "Join the Next Session" / "Register Now" / "Reserve Your Spot"
     buttons (any element with the class .js-join-btn) will open it.
     Until you set this, those buttons gently scroll to the Sessions
     section so the page stays fully usable.
     ---------------------------------------------------------------- */
  const GOOGLE_FORM_URL = "https://forms.gle/9aCLu4hbtSmtCdpi9";

  /* ================================================================
     1. CUSTOM CURSOR (dot + smoothly trailing ring)
     Tracks pointer with a soft lerp, expands on interactive elements.
     ================================================================ */
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;

  if (isFinePointer && cursorDot && cursorRing) {
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener("mouseenter", () => {
      cursorDot.classList.remove("hidden");
      cursorRing.classList.remove("hidden");
    });

    document.addEventListener("mouseleave", () => {
      cursorDot.classList.add("hidden");
      cursorRing.classList.add("hidden");
    });

    document.addEventListener("mousedown", () => {
      cursorRing.classList.add("click");
    });

    document.addEventListener("mouseup", () => {
      cursorRing.classList.remove("click");
    });

    // Animate cursor with smooth lerp
    const animateCursor = () => {
      // Dot — quick follow
      dotX += (mouseX - dotX) * 0.55;
      dotY += (mouseY - dotY) * 0.55;
      cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

      // Ring — soft trailing follow
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Expand cursor on interactive elements
    const interactiveSelector = "a, button, .btn, [data-magnetic], .tilt, input, textarea, label";
    document.querySelectorAll(interactiveSelector).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursorRing.classList.add("hover");
        cursorDot.classList.add("hover");
      });
      el.addEventListener("mouseleave", () => {
        cursorRing.classList.remove("hover");
        cursorDot.classList.remove("hover");
      });
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = "none";
    cursorRing.style.display = "none";
  }

  /* ================================================================
     2. STICKY NAVBAR — adds shadow & compact padding when scrolled
     ================================================================ */
  const navbar = document.getElementById("navbar");

  const handleScroll = () => {
    if (window.scrollY > 24) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ================================================================
     3. SMOOTH SCROLL — accounts for sticky-nav offset
     ================================================================ */
  const NAV_OFFSET = 70;
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");

  const closeMobileMenu = () => {
    if (!navLinks || !navToggle) return;
    if (navLinks.classList.contains("open")) {
      navLinks.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      // .js-join-btn handles its own click below
      if (link.classList.contains("js-join-btn") && GOOGLE_FORM_URL) return;

      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        if (!link.classList.contains("js-join-btn")) e.preventDefault();
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;

      window.scrollTo({ top, behavior: "smooth" });
      closeMobileMenu();
    });
  });

  /* ================================================================
     4. JOIN / REGISTER BUTTONS — open Google Form when configured
     ================================================================ */
  document.querySelectorAll(".js-join-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (GOOGLE_FORM_URL) {
        e.preventDefault();
        window.open(GOOGLE_FORM_URL, "_blank", "noopener,noreferrer");
        closeMobileMenu();
      }
      // Otherwise the smooth scroll handler (above) takes over.
    });
  });

  /* ================================================================
     5. FADE-IN ON SCROLL — IntersectionObserver
     ================================================================ */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* ================================================================
     6. MOBILE MENU TOGGLE
     ================================================================ */
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMobileMenu();
  });

  /* ================================================================
     7. FOOTER YEAR
     ================================================================ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ================================================================
     SHARED — runs on every device. Each effect is dialed back to
     stay tasteful so the page never feels "busy" on mobile.
     ================================================================ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  /* ---- 7a. SPLIT TEXT INTO WORDS + LETTERS ---------------------- */
  /* Used by the desktop cursor magnify AND the mobile-friendly
     scroll-driven letter ripple. */
  function splitText(root) {
    if (!root || root.dataset.split === "1") return;
    root.dataset.split = "1";

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue) textNodes.push(n);
    }

    for (const node of textNodes) {
      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      let i = 0;
      while (i < text.length) {
        const ch = text[i];
        if (/\s/.test(ch)) {
          let end = i;
          while (end < text.length && /\s/.test(text[end])) end++;
          frag.appendChild(document.createTextNode(text.slice(i, end)));
          i = end;
        } else {
          let end = i;
          while (end < text.length && !/\s/.test(text[end])) end++;
          const word = document.createElement("span");
          word.className = "word";
          for (let j = i; j < end; j++) {
            const cs = document.createElement("span");
            cs.className = "char";
            cs.textContent = text[j];
            word.appendChild(cs);
          }
          frag.appendChild(word);
          i = end;
        }
      }
      node.parentNode.replaceChild(frag, node);
    }
  }

  const SPLIT_SELECTOR = [
    ".hero-title",
    ".hero-sub",
    ".section-title",
    ".lead",
    ".quote-text",
    ".visual-quote",
    ".testimonial p",
    ".card h3",
    ".card p",
    ".block h3",
    ".block p",
  ].join(", ");
  document.querySelectorAll(SPLIT_SELECTOR).forEach(splitText);

  /* ---- 7b. AMBIENT FLOATING PETALS ------------------------------ */
  /* Just 7 slow petals at low opacity. Subtle "spa" mood, never
     competes with content. Slightly speeds with scroll velocity. */
  const petalsContainer = document.createElement("div");
  petalsContainer.className = "petals";
  petalsContainer.setAttribute("aria-hidden", "true");
  const petals = [];
  if (!prefersReducedMotion) {
    document.body.appendChild(petalsContainer);
    const PETAL_COUNT = 7;
    for (let i = 0; i < PETAL_COUNT; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const left = 5 + Math.random() * 90;
      const size = 10 + Math.random() * 12;
      const sway = (Math.random() - 0.5) * 80;
      const opacity = 0.16 + Math.random() * 0.12;
      const baseDur = 18 + Math.random() * 14;
      const delay = Math.random() * baseDur;
      p.style.left = left + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.setProperty("--petal-sway", sway.toFixed(0) + "px");
      p.style.setProperty("--petal-opacity", opacity.toFixed(2));
      p.style.animationDuration = baseDur.toFixed(2) + "s";
      p.style.animationDelay = (-delay).toFixed(2) + "s";
      petalsContainer.appendChild(p);
      petals.push({ el: p, baseDur: baseDur });
    }

    // Scroll-velocity boost (capped, smoothly reverts)
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    let scrollBoostT = 0;
    window.addEventListener("scroll", () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastScrollY);
      const dt = now - lastScrollT;
      if (dt > 80) {
        const v = dy / dt; // px/ms
        const factor = Math.min(1.6, 1 + v * 0.45);
        for (const p of petals) {
          p.el.style.animationDuration = (p.baseDur / factor).toFixed(2) + "s";
        }
        lastScrollY = window.scrollY;
        lastScrollT = now;
        scrollBoostT = now;
      }
      // ease back to base after a pause
      if (now - scrollBoostT > 600) {
        for (const p of petals) {
          p.el.style.animationDuration = p.baseDur.toFixed(2) + "s";
        }
      }
    }, { passive: true });
  }

  /* ---- 7c. SCROLL-DRIVEN LETTER RIPPLE -------------------------- */
  /* When a headline first enters view, run a single gentle wave
     left-to-right through its letters. Subtle, calming, no-op for
     reduced-motion users. */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const rippleTargets = document.querySelectorAll(
      ".hero-title, .section-title, .quote-text, .visual-quote"
    );
    const rippleObs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        if (el.dataset.rippled === "1") {
          rippleObs.unobserve(el);
          continue;
        }
        el.dataset.rippled = "1";
        rippleObs.unobserve(el);
        const chars = el.querySelectorAll(".char");
        chars.forEach((c, i) => {
          // Cap delay so very long titles still finish quickly
          const delay = Math.min(i * 22, 1800);
          setTimeout(() => {
            c.classList.add("ripple-pop");
            setTimeout(() => c.classList.remove("ripple-pop"), 760);
          }, delay);
        });
      }
    }, { threshold: 0.45 });
    rippleTargets.forEach((el) => rippleObs.observe(el));
  }

  /* ---- 7d. TAP-TO-BLOOM RIPPLE + MASCOT BOUNCE ------------------ */
  /* Soft mauve/blush ripple from the tap point on any button or
     contact channel. The mascot does a tiny happy bounce in tandem. */
  const mascot = document.getElementById("rocksMascot");
  if (!prefersReducedMotion) {
    document.addEventListener("pointerdown", (e) => {
      const target = e.target.closest(".btn, .contact-channel");
      if (!target) return;

      // Bloom ripple from tap point
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const bloom = document.createElement("span");
      bloom.className = "btn-bloom";
      bloom.style.left = x + "px";
      bloom.style.top = y + "px";
      target.appendChild(bloom);
      setTimeout(() => bloom.remove(), 760);

      // Mascot bounce (debounced)
      if (mascot && !mascot.classList.contains("bounced")) {
        mascot.classList.add("bounced");
        setTimeout(() => mascot.classList.remove("bounced"), 560);
      }
    }, { passive: true });
  }

  /* ---- 7e. DEVICE TILT (gyroscope) ------------------------------ */
  /* Touch devices only. The mascot's plank leans with gravity and
     the hero's soft glows shift slightly — phone tilt becomes part
     of the "balance" metaphor. iOS asks for permission via a small
     dismissible chip. */
  if (
    !prefersReducedMotion &&
    isCoarsePointer &&
    typeof window.DeviceOrientationEvent !== "undefined"
  ) {
    const root = document.documentElement;
    let tiltX = 0, tiltY = 0; // smoothed values
    let targetX = 0, targetY = 0;

    function applyTiltLoop() {
      // Lerp toward target for buttery motion
      tiltX += (targetX - tiltX) * 0.12;
      tiltY += (targetY - tiltY) * 0.12;
      root.style.setProperty("--tilt-x", tiltX.toFixed(3));
      root.style.setProperty("--tilt-y", tiltY.toFixed(3));
      requestAnimationFrame(applyTiltLoop);
    }

    function onOrient(e) {
      if (e.gamma == null || e.beta == null) return;
      // gamma: -90..90 (left/right), beta: -180..180 (front/back)
      // Clamp to ±25° so the effect stays subtle.
      const gx = Math.max(-1, Math.min(1, e.gamma / 25));
      const gy = Math.max(-1, Math.min(1, (e.beta - 35) / 25));
      targetX = gx;
      targetY = gy;
    }

    function enableTilt() {
      window.addEventListener("deviceorientation", onOrient, { passive: true });
      document.body.classList.add("tilt-active");
      requestAnimationFrame(applyTiltLoop);
    }

    const needsPerm = typeof window.DeviceOrientationEvent.requestPermission === "function";
    if (!needsPerm) {
      // Android & most other touch devices — just enable.
      enableTilt();
    } else {
      // iOS Safari — show a small dismissible chip after the page settles.
      setTimeout(() => {
        const chip = document.createElement("button");
        chip.className = "motion-chip";
        chip.type = "button";
        chip.innerHTML =
          '<span>Tap to enable balance motion</span>' +
          '<span class="motion-chip-x" aria-label="Dismiss">×</span>';
        document.body.appendChild(chip);
        requestAnimationFrame(() => chip.classList.add("show"));

        function hideChip() {
          chip.classList.remove("show");
          setTimeout(() => chip.remove(), 400);
        }

        chip.addEventListener("click", async (ev) => {
          if (ev.target.classList.contains("motion-chip-x")) {
            hideChip();
            return;
          }
          try {
            const res = await window.DeviceOrientationEvent.requestPermission();
            if (res === "granted") enableTilt();
          } catch (_) { /* ignore */ }
          hideChip();
        });

        setTimeout(hideChip, 12000);
      }, 1800);
    }
  }

  /* ----------------------------------------------------------------
     The remaining cursor effects only matter on fine-pointer devices.
     ---------------------------------------------------------------- */
  if (!isFinePointer) return;

  /* ================================================================
     8. HERO PARALLAX ORBS + SPOTLIGHT
     ================================================================ */
  const hero = document.getElementById("hero");
  const heroSpotlight = document.getElementById("heroSpotlight");
  const orbs = hero ? hero.querySelectorAll("[data-parallax]") : [];

  if (hero) {
    let heroRect = hero.getBoundingClientRect();
    let heroMouseX = heroRect.width / 2;
    let heroMouseY = heroRect.height / 2;
    let heroRenderX = heroMouseX;
    let heroRenderY = heroMouseY;
    let heroAnimating = false;

    const updateHeroRect = () => {
      heroRect = hero.getBoundingClientRect();
    };
    window.addEventListener("resize", updateHeroRect, { passive: true });
    window.addEventListener("scroll", updateHeroRect, { passive: true });

    const animateHero = () => {
      heroRenderX += (heroMouseX - heroRenderX) * 0.08;
      heroRenderY += (heroMouseY - heroRenderY) * 0.08;

      const cx = heroRect.width / 2;
      const cy = heroRect.height / 2;
      const offsetX = (heroRenderX - cx) / cx; // -1..1
      const offsetY = (heroRenderY - cy) / cy;

      orbs.forEach((orb) => {
        const depth = parseFloat(orb.getAttribute("data-parallax")) || 20;
        const tx = -offsetX * depth;
        const ty = -offsetY * depth;
        orb.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });

      if (heroSpotlight) {
        heroSpotlight.style.transform = `translate3d(${heroRenderX}px, ${heroRenderY}px, 0) translate(-50%, -50%)`;
      }

      const dx = Math.abs(heroMouseX - heroRenderX);
      const dy = Math.abs(heroMouseY - heroRenderY);
      if (dx < 0.5 && dy < 0.5) {
        heroAnimating = false;
        return;
      }
      requestAnimationFrame(animateHero);
    };

    hero.addEventListener("mousemove", (e) => {
      heroMouseX = e.clientX - heroRect.left;
      heroMouseY = e.clientY - heroRect.top;
      if (!heroAnimating) {
        heroAnimating = true;
        requestAnimationFrame(animateHero);
      }
    });

    hero.addEventListener("mouseleave", () => {
      heroMouseX = heroRect.width / 2;
      heroMouseY = heroRect.height / 2;
      if (!heroAnimating) {
        heroAnimating = true;
        requestAnimationFrame(animateHero);
      }
    });
  }

  /* ================================================================
     9. CARD 3D TILT — every .tilt element follows the cursor
     ================================================================ */
  const TILT_MAX = 8; // degrees
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    let rect = null;

    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };

    el.addEventListener("mouseenter", () => {
      updateRect();
    });

    el.addEventListener("mousemove", (e) => {
      if (!rect) updateRect();
      const px = (e.clientX - rect.left) / rect.width;  // 0..1
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 2 * TILT_MAX;             // rotateY
      const rx = -(py - 0.5) * 2 * TILT_MAX;            // rotateX
      el.style.setProperty("--ty", ry.toFixed(2) + "deg");
      el.style.setProperty("--tx", rx.toFixed(2) + "deg");
      el.style.setProperty("--mx", (px * 100).toFixed(2) + "%");
      el.style.setProperty("--my", (py * 100).toFixed(2) + "%");
    });

    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--tx", "0deg");
      el.style.setProperty("--ty", "0deg");
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    });

    window.addEventListener("scroll", () => { rect = null; }, { passive: true });
    window.addEventListener("resize", () => { rect = null; }, { passive: true });
  });

  /* ================================================================
     10. MAGNETIC BUTTONS — gently pulled toward the cursor
     ================================================================ */
  const MAGNET_STRENGTH = 0.32;
  const MAGNET_RADIUS = 90; // px from button center where pull starts

  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    let rect = null;
    let raf = null;
    let targetX = 0;
    let targetY = 0;
    let renderX = 0;
    let renderY = 0;

    const animate = () => {
      renderX += (targetX - renderX) * 0.18;
      renderY += (targetY - renderY) * 0.18;
      btn.style.transform = `translate3d(${renderX}px, ${renderY}px, 0)`;

      const inner = btn.querySelector("span");
      if (inner) {
        inner.style.transform = `translate3d(${renderX * 0.4}px, ${renderY * 0.4}px, 0)`;
      }

      if (Math.abs(targetX - renderX) < 0.1 && Math.abs(targetY - renderY) < 0.1) {
        raf = null;
        return;
      }
      raf = requestAnimationFrame(animate);
    };

    const updateRect = () => {
      rect = btn.getBoundingClientRect();
    };

    btn.addEventListener("mouseenter", updateRect);

    btn.addEventListener("mousemove", (e) => {
      if (!rect) updateRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const max = Math.max(rect.width, rect.height) / 2 + MAGNET_RADIUS;
      const falloff = Math.max(0, 1 - dist / max);
      targetX = dx * MAGNET_STRENGTH * falloff;
      targetY = dy * MAGNET_STRENGTH * falloff;

      // Hover sheen position
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      btn.style.setProperty("--mx", (px * 100).toFixed(2) + "%");
      btn.style.setProperty("--my", (py * 100).toFixed(2) + "%");

      if (!raf) raf = requestAnimationFrame(animate);
    });

    btn.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(animate);
    });

    window.addEventListener("scroll", () => { rect = null; }, { passive: true });
    window.addEventListener("resize", () => { rect = null; }, { passive: true });
  });

  /* ================================================================
     11. QUOTE & FINAL-CTA GLOW — a soft light tracks the cursor
     ================================================================ */
  const trackGlow = (containerId, glowEl) => {
    const container = document.getElementById(containerId);
    if (!container || !glowEl) return;

    let rect = container.getBoundingClientRect();
    const updateRect = () => { rect = container.getBoundingClientRect(); };
    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });

    container.addEventListener("mousemove", (e) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  };

  trackGlow("quote", document.getElementById("quoteGlow"));
  trackGlow("finalCta", document.getElementById("ctaGlow"));

  /* ================================================================
     12. PER-LETTER CURSOR MAGNIFY
     The letters directly under the cursor scale up, lift, and lean
     toward it — like they're balancing on tiptoes. Letter splitting
     was already done up in 7a so this just runs the proximity loop.
     ================================================================ */
  const LETTER_RADIUS = 110;     // px — influence range around cursor
  const LETTER_MAX_SCALE = 1.7;  // peak scale at cursor center
  const LETTER_MAX_ROT = 22;     // degrees — max lean toward cursor
  const LETTER_MAX_LIFT = 9;     // px — upward lift at cursor center

  const letterChars = Array.from(document.querySelectorAll(".char"));
  const letterRects = new Array(letterChars.length).fill(null);
  const letterDirty = new Array(letterChars.length).fill(false);

  let letterMouseX = -9999;
  let letterMouseY = -9999;
  window.addEventListener("mousemove", (e) => {
    letterMouseX = e.clientX;
    letterMouseY = e.clientY;
  }, { passive: true });

  let rectsStale = true;
  const markRectsStale = () => { rectsStale = true; };
  window.addEventListener("scroll", markRectsStale, { passive: true });
  window.addEventListener("resize", markRectsStale, { passive: true });

  function refreshLetterRects() {
    const top = -120;
    const bottom = window.innerHeight + 120;
    for (let i = 0; i < letterChars.length; i++) {
      const r = letterChars[i].getBoundingClientRect();
      if (r.bottom < top || r.top > bottom || r.width === 0) {
        letterRects[i] = null;
      } else {
        letterRects[i] = {
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
        };
      }
    }
    rectsStale = false;
  }

  let lastRectTime = 0;
  function letterTick(now) {
    if (rectsStale || now - lastRectTime > 240) {
      refreshLetterRects();
      lastRectTime = now;
    }

    for (let i = 0; i < letterChars.length; i++) {
      const r = letterRects[i];
      if (!r) continue;

      const dx = letterMouseX - r.cx;
      const dy = letterMouseY - r.cy;
      const d = Math.hypot(dx, dy);

      if (d < LETTER_RADIUS) {
        // Smooth proximity falloff (ease-out)
        let f = 1 - d / LETTER_RADIUS;
        f = f * f * (3 - 2 * f); // smoothstep

        const scale = 1 + (LETTER_MAX_SCALE - 1) * f;
        const rot = (dx / LETTER_RADIUS) * LETTER_MAX_ROT * f;
        const lift = -LETTER_MAX_LIFT * f;

        letterChars[i].style.transform =
          "translateY(" + lift.toFixed(2) + "px) " +
          "scale(" + scale.toFixed(3) + ") " +
          "rotate(" + rot.toFixed(2) + "deg)";
        letterDirty[i] = true;
      } else if (letterDirty[i]) {
        letterChars[i].style.transform = "";
        letterDirty[i] = false;
      }
    }

    requestAnimationFrame(letterTick);
  }

  if (letterChars.length) {
    requestAnimationFrame(letterTick);
  }
})();
