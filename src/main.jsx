import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const routePages = {
  "/": "index.html",
  "/features": "features.html",
  "/how-it-works": "how-it-works.html",
  "/solutions": "solutions.html",
  "/about": "about.html",
  "/contact": "contact.html",
  "/terms": "terms.html",
  "/privacy": "privacy.html",
  "/software-license": "software-license.html",
  "/refunds": "refunds.html",
  "/intellectual-property": "intellectual-property.html",
  "/customer-exit": "customer-exit.html",
  "/security": "security.html",
  "/accessibility": "accessibility.html",
  "/login": "login-unavailable.html",
};

function App() {
  const [markup, setMarkup] = useState("");
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    let alive = true;
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const page = routePages[path] || "404.html";
    fetch(`/pages/${page}`)
      .then((r) => {
        if (!r.ok) throw new Error("Page unavailable");
        return r.text();
      })
      .then((html) => {
        if (!alive) return;
        const doc = new DOMParser().parseFromString(html, "text/html");
        setMarkup(doc.body.innerHTML);
        document.title = doc.title || "QuoteFlow AI";
        const description = doc.querySelector('meta[name="description"]')?.content;
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
        if (description) meta.content = description;
        const canonical = doc.querySelector('link[rel="canonical"]')?.href;
        let canon = document.querySelector('link[rel="canonical"]');
        if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
        if (canonical) canon.href = canonical;
        window.scrollTo(0, 0);
      })
      .catch(() => alive && setLoadingError(true));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!markup) return;
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");
    const toggleMenu = () => {
      if (!toggle || !links) return;
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.style.display = open ? "" : "flex";
    };
    toggle?.addEventListener("click", toggleMenu);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = document.querySelectorAll(".reveal");
    let observer;
    if ("IntersectionObserver" in window && !reduce) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
      reveals.forEach(el => observer.observe(el));
    } else reveals.forEach(el => el.classList.add("is-visible"));

    document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
    const form = document.querySelector("#enquiry-form");
    if (form) {
      const selected = new URLSearchParams(window.location.search).get("type");
      const typeSelect = form.querySelector("[name=type]");
      if (selected && typeSelect && [...typeSelect.options].some(o => o.value === selected)) typeSelect.value = selected;
    }
    const submit = async (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const button = form.querySelector('button[type="submit"]');
      status.textContent = ""; status.className = "form-status";
      button.disabled = true; button.textContent = "Sending…";
      const data = Object.fromEntries(new FormData(form).entries());
      data.privacy = form.querySelector('[name="privacy"]')?.checked === true;
      try {
        const response = await fetch("/api/enquiry", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || "Unable to send your enquiry.");
        status.textContent = result.message; status.classList.add("success"); form.reset();
      } catch (err) {
        status.textContent = err.message || "Something went wrong. Please email quoteflowai@gmail.com.";
        status.classList.add("error");
      } finally { button.disabled = false; button.textContent = "Send enquiry"; }
    };
    form?.addEventListener("submit", submit);

    const internalLinks = [...document.querySelectorAll('a[href]')].filter(a => {
      const href = a.getAttribute("href");
      return href && href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/assets/") && !href.startsWith("/api/");
    });
    const handleLink = (event) => {
      const a = event.currentTarget;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.target === "_blank") return;
      const url = new URL(a.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      window.history.pushState({}, "", url.pathname + url.search + url.hash);
      window.dispatchEvent(new PopStateEvent("popstate"));
    };
    internalLinks.forEach(a => a.addEventListener("click", handleLink));
    return () => {
      toggle?.removeEventListener("click", toggleMenu);
      observer?.disconnect();
      form?.removeEventListener("submit", submit);
      internalLinks.forEach(a => a.removeEventListener("click", handleLink));
    };
  }, [markup]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      const page = routePages[path] || "404.html";
      fetch(`/pages/${page}`).then(r => r.text()).then(html => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        setMarkup(doc.body.innerHTML); document.title = doc.title || "QuoteFlow AI";
        const description = doc.querySelector('meta[name="description"]')?.content;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && description) meta.content = description;
        window.scrollTo(0, 0);
      }).catch(() => setLoadingError(true));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (loadingError) return <main className="load-error"><h1>QuoteFlow AI</h1><p>This page could not be loaded. Please refresh or return to the <a href="/">homepage</a>.</p></main>;
  if (!markup) return <main className="load-screen" aria-label="Loading QuoteFlow AI">Loading…</main>;
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

createRoot(document.getElementById("root")).render(<App />);
