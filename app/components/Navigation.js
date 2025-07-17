import GSAP from "gsap";
import Component from "classes/Component";
import { COLOR_BRIGHT_GREY, COLOR_WHITE } from "utils/color";

export default class Navigation extends Component {
  constructor({ template }) {
    super({
      element: ".navigation",
      elements: {
        items: document.querySelectorAll(".navigation__list__item"),
        links: document.querySelectorAll(".navigation__list__link"),
      },
    });

    this.template = template;
    this.timeline = null;
    this.onChange(template);
  }

  onChange(template) {
    // Cancelar animaciones en curso
    if (this.timeline) {
      this.timeline.kill();
    }

    this.timeline = GSAP.timeline();
    const isAboutPage = template === "about";
    const firstItem = this.elements.items[0];
    const firstLink = this.elements.links[0];
    const color = isAboutPage ? COLOR_BRIGHT_GREY : COLOR_WHITE;

    // Animaciones comunes
    this.timeline.to(
      this.element,
      {
        color,
        duration: 1.5,
      },
      0
    );

    // Animaciones específicas para la página "about"
    if (isAboutPage) {
      this.timeline
        .to(
          firstItem,
          {
            autoAlpha: 0,
            duration: 0.75,
          },
          0.75
        )
        .to(
          firstLink,
          {
            autoAlpha: 1,
            duration: 0.75,
          },
          0.75
        );
    }
    // Animaciones para otras páginas
    else {
      this.timeline
        .to(
          firstLink,
          {
            autoAlpha: 0,
            duration: 0.75,
          },
          0
        )
        .to(
          firstItem,
          {
            autoAlpha: 0,
            duration: 0.75,
          },
          0
        )
        .to(
          firstItem,
          {
            autoAlpha: 1,
            duration: 0.75,
          },
          0.75
        );
    }
  }
}
