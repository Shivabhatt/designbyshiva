/* Portfolio behaviour: scroll reveals, copy-to-clipboard, live local time.
   (Runs after the video's last frame; the portfolio scrolls up over it.) */
gsap.registerPlugin(ScrollTrigger);

/* Fade-up reveal for tagged elements */
document.querySelectorAll(".reveal").forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 0.9,
    ease: "power2.out",
    scrollTrigger: {
      trigger: el,
      start: "top 88%",
    },
  });
});

/* Copy-to-clipboard (email) */
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
    }
    const msg = btn.parentElement.querySelector(".copied-msg");
    if (msg) {
      msg.textContent = "Copied";
      msg.classList.add("show");
      setTimeout(() => {
        msg.classList.remove("show");
        msg.textContent = "";
      }, 1500);
    }
  });
});

/* Fixed header: appears once the About section covers the video's last frame,
   with scroll-spy that underlines the active section's nav link. */
const header = document.querySelector(".site-header");
if (header) {
  ScrollTrigger.create({
    trigger: "#intro",
    start: "top top",
    onEnter: () => {
      header.classList.add("visible");
    },
    onLeaveBack: () => {
      header.classList.remove("visible");
    },
  });

  const navLinks = document.querySelectorAll(".site-nav a");
  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle("active", a.dataset.section === id));
  };
  ["about", "work", "contact"].forEach((id) => {
    ScrollTrigger.create({
      trigger: "#" + id,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => { if (self.isActive) setActive(id); },
    });
  });

  const brand = header.querySelector(".brand");
  if (brand) {
    brand.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/* Work tabs: switch between "Selected Work" and "Professional Experience".
   Selected Work is active on load; the active tab shows the animated underline. */
const workTabs = document.querySelectorAll(".work-tab");
const workPanels = document.querySelectorAll(".work-panel");
if (workTabs.length && workPanels.length) {
  const revealItems = (panel) => {
    gsap.fromTo(
      panel.querySelectorAll(".work-item"),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out", overwrite: true }
    );
  };

  const activateTab = (name, animate) => {
    workTabs.forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    workPanels.forEach((panel) => {
      const on = panel.dataset.panel === name;
      panel.hidden = !on;
      if (on && animate) revealItems(panel);
    });
    ScrollTrigger.refresh();
  };

  const tabArr = Array.from(workTabs);
  workTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab, true));
    tab.addEventListener("keydown", (e) => {
      let next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabArr.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabArr.length) % tabArr.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabArr.length - 1;
      if (next === -1) return;
      e.preventDefault();
      activateTab(tabArr[next].dataset.tab, true);
      tabArr[next].focus();
    });
  });

  /* Reveal the active panel's items when the work section scrolls into view */
  ScrollTrigger.create({
    trigger: "#work",
    start: "top 80%",
    once: true,
    onEnter: () => {
      const active = document.querySelector(".work-panel:not([hidden])");
      if (active) revealItems(active);
    },
  });
}
