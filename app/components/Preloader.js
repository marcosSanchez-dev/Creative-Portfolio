import { Texture } from "ogl";
import GSAP from "gsap";
import Component from "classes/Component";
import { split } from "utils/text";

export default class Preloader extends Component {
  constructor({ canvas }) {
    super({
      element: ".preloader",
      elements: {
        title: ".preloader__text",
        number: ".preloader__number",
        numberText: ".preloader__number__text",
      },
    });

    this.canvas = canvas;
    this.textures = {};
    this.assetCount = window.ASSETS.length;
    this.loadedCount = 0;
    this.welcomeMessageShown = false; // Control para el mensaje de bienvenida

    // Mantener la doble división para el mensaje de bienvenida
    split({
      element: this.elements.title,
      expression: "<br>",
    });

    split({
      element: this.elements.title,
      expression: "<br>",
    });

    this.elements.titleSpans =
      this.elements.title.querySelectorAll("span span");

    this.loadAssets();
  }

  async loadAssets() {
    const loadPromises = window.ASSETS.map((image) => this.loadTexture(image));

    try {
      await Promise.all(loadPromises);
      this.showWelcomeMessage(); // Mostrar mensaje de bienvenida
      this.onLoaded();
    } catch (error) {
      console.error("Error loading assets:", error);
      this.showWelcomeMessage(); // Mostrar mensaje incluso con errores
      this.onLoaded();
    }
  }

  loadTexture(imageSrc) {
    return new Promise((resolve, reject) => {
      const texture = new Texture(this.canvas.gl, {
        generateMipmaps: false,
        anisotropic: 16,
      });

      const media = new Image();
      media.crossOrigin = "anonymous";
      media.src = imageSrc;

      media.onload = () => {
        texture.image = media;
        this.textures[imageSrc] = texture;
        this.onAssetLoaded();
        resolve();
      };

      media.onerror = (error) => {
        console.warn(`Failed to load image: ${imageSrc}`, error);
        this.onAssetLoaded();
        resolve(); // Continuar aunque falle
      };
    });
  }

  onAssetLoaded() {
    this.loadedCount++;
    const percent = Math.round((this.loadedCount / this.assetCount) * 100);
    this.elements.numberText.textContent = `${percent}%`;
  }

  showWelcomeMessage() {
    if (!this.welcomeMessageShown) {
      this.welcomeMessageShown = true;

      // Animación para mostrar el mensaje de bienvenida
      GSAP.fromTo(
        this.elements.titleSpans,
        {
          autoAlpha: 0,
          y: "20%",
        },
        {
          autoAlpha: 1,
          y: "0%",
          duration: 1.5,
          stagger: 0.1,
          ease: "expo.out",
        }
      );
    }
  }

  async onLoaded() {
    window.TEXTURES = this.textures;

    await new Promise((resolve) => {
      this.emit("completed");

      this.animateOut = GSAP.timeline({
        delay: 1,
        onComplete: () => {
          this.destroy();
          resolve();
        },
      });

      this.animateOut
        .to(this.elements.titleSpans, {
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.1,
          y: "150%",
        })
        .to(
          this.elements.numberText,
          {
            duration: 1.5,
            ease: "expo.out",
            y: "100%",
          },
          "-=1.4"
        )
        .to(
          this.element,
          {
            autoAlpha: 0,
            duration: 1.5,
          },
          "-=0.1"
        );
    });
  }

  destroy() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
