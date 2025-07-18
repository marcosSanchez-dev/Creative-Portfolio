/* eslint-disable no-unused-vars */
/* eslint-disable no-new */

import NormalizeWheel from "normalize-wheel";

import each from "lodash/each";

import Canvas from "components/Canvas";
import Detection from "classes/Detection";

import Navigation from "components/Navigation";
import Preloader from "components/Preloader";

import About from "pages/About";
import Collections from "pages/Collections";
import Home from "pages/Home";
import Detail from "pages/Detail";

class App {
  constructor() {
    this.createContent();

    this.createCanvas();
    this.createPreloader();
    this.createNavigation();
    this.createPages();

    this.addEventListeners();
    this.addLinkListeners();

    this.onResize();

    this.update();
  }

  createNavigation() {
    this.navigation = new Navigation({
      template: this.template,
    });
  }

  createPreloader() {
    this.preloader = new Preloader({
      canvas: this.canvas,
    });

    this.preloader.once("completed", this.onPreloaded.bind(this));
  }

  createCanvas() {
    this.canvas = new Canvas({
      template: this.template,
    });
  }

  createContent() {
    this.content = document.querySelector(".content");
    this.template = this.content.getAttribute("data-template");
  }

  createPages() {
    this.pages = {
      about: new About(),
      collections: new Collections(),
      home: new Home(),
      detail: new Detail(),
    };

    this.page = this.pages[this.template];
    this.page.create();
  }

  /*
   * Events
   */

  onPreloaded() {
    this.onResize();

    this.canvas.onPreloaded();

    this.page.show();
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: true,
    });
  }

  async onChange({ url, push = true }) {
    // Parse URL relative to current page
    const link = new URL(url, window.location.href);

    // If it’s the same origin, do SPA navigation…
    if (link.origin === window.location.origin) {
      // let’s grab the new path
      const path = link.pathname;

      // start canvas transition
      this.canvas.onChangeStart(this.template, path);

      await this.page.hide();

      const res = await fetch(path, { credentials: "same-origin" });
      if (res.status === 200) {
        const html = await res.text();
        const div = document.createElement("div");
        if (push) window.history.pushState({}, "", path);

        div.innerHTML = html;
        const divContent = div.querySelector(".content");
        this.template = divContent.getAttribute("data-template");

        // update your Navigation instance
        this.navigation.onChange(this.template);

        // swap in the new content
        this.content.setAttribute("data-template", this.template);
        this.content.innerHTML = divContent.innerHTML;

        this.canvas.onChangeEnd(this.template);

        // re-create the page object
        this.page = this.pages[this.template];
        this.page.create();
        this.onResize();
        this.page.show();
        this.addLinkListeners();
      } else {
        console.error(`Fetch failed: ${res.status}`);
      }
    } else {
      // any other origin → open in new tab
      window.open(url, "_blank");
    }
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }

    window.requestAnimationFrame((_) => {
      if (this.canvas && this.canvas.onResize) {
        this.canvas.onResize();
      }
    });
  }

  onTouchDown(e) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(e);
    }

    if (this.page && this.page.onTouchDown) {
      this.page.onTouchDown(e);
    }
  }

  onTouchMove(e) {
    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(e);
    }

    if (this.page && this.page.onTouchMove) {
      this.page.onTouchMove(e);
    }
  }

  onTouchUp(e) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(e);
    }

    if (this.page && this.page.onTouchUp) {
      this.page.onTouchUp(e);
    }
  }

  onWheel(e) {
    const normalizedWheel = NormalizeWheel(e);

    if (this.canvas && this.canvas.onWheel) {
      this.canvas.onWheel(normalizedWheel);
    }

    if (this.page && this.page.onWheel) {
      // console.log("onwheel: ", true);
      this.page.onWheel(normalizedWheel);
    }
  }

  /*
   *  LOop
   */

  update() {
    if (this.page && this.page.update) {
      this.page.update();
    }

    if (this.canvas && this.canvas.update) {
      this.canvas.update(this.page.scroll);
    }

    this.frame = window.requestAnimationFrame(this.update.bind(this));
  }

  /*
   * Listeners
   */

  addEventListeners() {
    window.addEventListener("wheel", this.onWheel.bind(this));

    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));

    window.addEventListener("pointerdown", this.onTouchDown.bind(this));
    window.addEventListener("pointermove", this.onTouchMove.bind(this));
    window.addEventListener("pointerup", this.onTouchUp.bind(this));

    window.addEventListener("resize", this.onResize.bind(this));
  }

  addLinkListeners() {
    const links = document.querySelectorAll("a");

    each(links, (link) => {
      link.onclick = (event) => {
        event.preventDefault();

        const { href } = link;
        this.onChange({ url: href });
      };
    });
  }
}

new App();
