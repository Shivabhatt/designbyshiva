

/* The encoding is super important here to enable frame-by-frame scrubbing. */

// ffmpeg -i ~/Downloads/Toshiba\ video/original.mov -movflags faststart -vcodec libx264 -crf 23 -g 1 -pix_fmt yuv420p output.mp4
// ffmpeg -i ~/Downloads/Toshiba\ video/original.mov -vf scale=960:-1 -movflags faststart -vcodec libx264 -crf 20 -g 1 -pix_fmt yuv420p output_960.mp4
// ffmpeg -i Okay_so_I_have_an_idea_for_yo.mp4 -movflags faststart -vcodec libx264 -crf 23 -g 1 -pix_fmt yuv420p output.mp4

/* Always start from the top on load/reload (laptop + mobile): disable the
   browser's scroll restoration and jump to 0 before anything is measured. */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);
/* iOS Safari restores the old scroll position asynchronously — sometimes AFTER
   load/pageshow — ignoring scrollRestoration="manual". Pin the page to the top
   for the first moments after every show (reload, back/forward, bfcache). */
function forceTop() {
  var until = Date.now() + 700;
  (function pin() {
    /* Only correct when Safari actually restored a position — calling
       scrollTo(0,0) every frame fires scroll events that make the scrubbed
       video/hero flicker on reload. */
    if (window.scrollY > 0) window.scrollTo(0, 0);
    if (Date.now() < until) requestAnimationFrame(pin);
  })();
}
forceTop();
window.addEventListener("pageshow", forceTop);
window.addEventListener("load", forceTop);

const video = document.querySelector(".video-background");
const IS_MOBILE = window.matchMedia("(max-width: 800px)").matches;

/* The correct clip (laptop = landscape, mobile = portrait) is already chosen by
   the inline script in index.html, before the browser preloads. Read it back
   from the attribute rather than currentSrc, which can transiently lag. */
let src = video.getAttribute("src") || video.currentSrc || video.src;

/* Make sure the video is 'activated' on iOS */
function once(el, event, fn, opts) {
  var onceFn = function (e) {
    el.removeEventListener(event, onceFn);
    fn.apply(this, arguments);
  };
  el.addEventListener(event, onceFn, opts);
  return onceFn;
}

once(document.documentElement, "touchstart", function (e) {
  video.play();
  video.pause();
});

/* ---------------------------------- */
/* Scroll Control! */

gsap.registerPlugin(ScrollTrigger);

let tl = gsap.timeline({
  defaults: { duration: 1 },
  scrollTrigger: {
    trigger: "#container",
    start: "top top",
    /* Desktop's last frame is light, so the scrub ends early (70%) and a dark
       stage crossfades in over the remaining scroll to hide the white. The
       mobile clip already ends on black, so run the scrub right up to where the
       portfolio content begins (66.7% — with the mobile 300vh container,
       #portfolio's -100vh margin puts it at 200vh) so the hero text starts on
       that final black frame with no dead black scroll in between. */
    end: IS_MOBILE ? "66.7% top" : "70% top",
    scrub: true
  }
});

function addScrubTween() {
  if (IS_MOBILE) {
    /* iOS Safari: setting video.currentTime on every scroll frame queues up
       seeks faster than the decoder can finish them; after 2-3 scroll passes
       the pipeline stalls and the frame stops updating. Instead, tween a proxy
       value and apply it to the video only when the previous seek has actually
       completed — the video always ends up at the latest scroll position. */
    var proxy = { t: 0 };
    tl.fromTo(proxy, { t: 0 }, { t: video.duration || 1, ease: "none" });
    (function applySeek() {
      if (
        !video.seeking &&
        video.readyState >= 2 &&
        Math.abs(video.currentTime - proxy.t) > 0.01
      ) {
        video.currentTime = proxy.t;
      }
      requestAnimationFrame(applySeek);
    })();
  } else {
    tl.fromTo(
      video,
      {
        currentTime: 0
      },
      {
        currentTime: video.duration || 1
      }
    );
  }
}

/* If metadata is already available (e.g. cached/local asset), wire the scrub
   tween immediately; otherwise wait for loadedmetadata. Guards against a race
   where metadata arrives before the listener is attached. */
if (video.readyState >= 1) {
  addScrubTween();
} else {
  once(video, "loadedmetadata", addScrubTween);
}

/* Hero headline reveal — pinned & scroll-scrubbed.
   Once the video's crossfade lands on the black intro screen, the section pins
   in place and the five lines rise line-by-line AS YOU SCROLL (and re-hide when
   you scroll back up), so the message is never skipped past. Reduced-motion
   users just get the text shown, without the pin. */
gsap.set(".hero-line-inner", { yPercent: 110 });

const heroMM = gsap.matchMedia();
heroMM.add("(prefers-reduced-motion: no-preference)", () => {
  const heroReveal = gsap.timeline({
    scrollTrigger: {
      trigger: "#intro",
      start: "top top",
      end: "+=110%",
      pin: true,
      pinSpacing: true,
      scrub: 0.6,
    },
  });
  heroReveal.to(".hero-line-inner", {
    yPercent: 0,
    ease: "power4.out",
    stagger: 0.35,
    duration: 1,
  });
});
heroMM.add("(prefers-reduced-motion: reduce)", () => {
  gsap.set(".hero-line-inner", { yPercent: 0 });
});

/* Intro -> black stage crossfade.
   1) The last (light) frame is held briefly, then a dark stage fades in over
      it so the white "disappears".
   2) The About section fades into place at the same time, so About Me appears
      right there on that final frame instead of wiping up over it. */
gsap.to(".stage-dark", {
  opacity: 1,
  ease: "none",
  scrollTrigger: {
    trigger: "#container",
    start: IS_MOBILE ? "53.3% top" : "76% top",
    end: IS_MOBILE ? "66.7% top" : "80% top",
    scrub: true,
  },
});

gsap.fromTo(
  "#portfolio",
  { opacity: 0 },
  {
    opacity: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#intro",
      start: "top 25%",
      end: "top top",
      scrub: true,
    },
  }
);

/* The cursive hero signature shows fully on load, then tucks away word by word
   ("Designed" -> "by" -> "Shiva") — each word slides down behind its own mask as
   you scroll, and slides back up in reverse. Scroll-scrubbed to stay in sync. */
gsap.to(".sig-word-inner", {
  yPercent: 155,
  ease: "none",
  stagger: 0.18,
  scrollTrigger: {
    trigger: "#container",
    start: "top top",
    end: "14% top",
    scrub: true,
  },
});

/* When first coded, the Blobbing was important to ensure the browser wasn't dropping previously played segments, but it doesn't seem to be a problem now. Possibly based on memory availability?
   On mobile (iOS Safari) the blob swap reloads the video ~1s in and resets the
   decode/seek pipeline, which makes scroll-scrubbing update only on the first
   pass and go stale afterwards — so skip it on mobile entirely. */
setTimeout(function () {
  if (!IS_MOBILE && window["fetch"]) {
    fetch(src)
      .then((response) => response.blob())
      .then((response) => {
        var blobURL = URL.createObjectURL(response);

        var t = video.currentTime;
        once(document.documentElement, "touchstart", function (e) {
          video.play();
          video.pause();
        });

        video.setAttribute("src", blobURL);
        video.currentTime = t + 0.01;
      });
  }
}, 1000);

/* ---------------------------------- */
