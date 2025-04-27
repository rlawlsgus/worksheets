export class CustomModal {
  constructor() {
    this.modalDiv = null;
    this.modalContent = null;
    this.messageElement = null;
    this.buttonContainer = null;
  }

  /**
   * 모달 표시
   * @param {Object} options
   * @param {string} options.message
   * @param {Array} options.buttons
   * @returns {Promise}
   */
  show(options) {
    return new Promise((resolve) => {
      this.modalDiv = document.createElement("div");
      this.modalDiv.className = "custom-modal-container";
      this.modalDiv.style.position = "fixed";
      this.modalDiv.style.top = "0";
      this.modalDiv.style.left = "0";
      this.modalDiv.style.width = "100%";
      this.modalDiv.style.height = "100%";
      this.modalDiv.style.backgroundColor = "rgba(0,0,0,0.5)";
      this.modalDiv.style.display = "flex";
      this.modalDiv.style.justifyContent = "center";
      this.modalDiv.style.alignItems = "center";
      this.modalDiv.style.zIndex = "1000";

      this.modalContent = document.createElement("div");
      this.modalContent.className = "custom-modal-content";
      this.modalContent.style.backgroundColor = "white";
      this.modalContent.style.padding = "1.25rem";
      this.modalContent.style.borderRadius = "0.3125rem";
      this.modalContent.style.width = "90%";
      this.modalContent.style.maxWidth = "31.25rem";
      this.modalContent.style.boxShadow = "0 0.25rem 0.5rem rgba(0,0,0,0.2)";
      this.modalContent.style.margin = "0 1rem";

      this.messageElement = document.createElement("div");
      this.messageElement.className = "custom-modal-message";
      this.messageElement.style.marginBottom = "0.9375rem";

      if (typeof options.message === "string") {
        const messageText = document.createElement("p");
        messageText.textContent = options.message;
        messageText.style.fontSize = "1rem";
        messageText.style.lineHeight = "1.5";
        this.messageElement.appendChild(messageText);
      } else if (options.message instanceof HTMLElement) {
        this.messageElement.appendChild(options.message);
      }

      this.buttonContainer = document.createElement("div");
      this.buttonContainer.className = "custom-modal-buttons";
      this.buttonContainer.style.display = "flex";
      this.buttonContainer.style.justifyContent = "flex-end";
      this.buttonContainer.style.marginTop = "0.9375rem";

      const isMobile = window.innerWidth < 480;
      if (isMobile) {
        this.buttonContainer.style.flexDirection = "column";
        this.buttonContainer.style.width = "100%";
      }

      if (options.buttons && Array.isArray(options.buttons)) {
        options.buttons.forEach((buttonConfig) => {
          const button = document.createElement("button");
          button.textContent = buttonConfig.text || "";
          button.className = "custom-modal-button";

          if (buttonConfig.primary) {
            button.className += " custom-modal-button-primary";
            button.style.backgroundColor = "#007bff";
            button.style.color = "white";
            button.style.border = "none";
          } else {
            button.style.backgroundColor = "#f8f9fa";
            button.style.border = "0.0625rem solid #ced4da";
          }

          button.style.padding = "0.5rem 1rem";
          button.style.borderRadius = "0.25rem";
          button.style.cursor = "pointer";
          button.style.fontSize = "1rem";

          if (isMobile) {
            button.style.width = "100%";
            button.style.marginLeft = "0";
            button.style.marginBottom = "0.5rem";
            button.style.padding = "0.75rem 1rem";
          } else {
            button.style.marginLeft = "0.625rem";
          }

          button.onclick = () => {
            this.close();
            resolve(buttonConfig.value);
          };

          this.buttonContainer.appendChild(button);
        });
      }

      this.modalContent.appendChild(this.messageElement);
      this.modalContent.appendChild(this.buttonContainer);
      this.modalDiv.appendChild(this.modalContent);

      document.body.appendChild(this.modalDiv);
      window.addEventListener("resize", this.adjustButtonLayout.bind(this));
    });
  }

  /**
   * 버튼 레이아웃 조정 (반응형)
   */
  adjustButtonLayout() {
    if (!this.buttonContainer) return;

    const isMobile = window.innerWidth < 480;
    const buttons = this.buttonContainer.querySelectorAll("button");

    if (isMobile) {
      this.buttonContainer.style.flexDirection = "column";
      this.buttonContainer.style.width = "100%";

      buttons.forEach((button) => {
        button.style.width = "100%";
        button.style.marginLeft = "0";
        button.style.marginBottom = "0.5rem";
        button.style.padding = "0.75rem 1rem";
      });
    } else {
      this.buttonContainer.style.flexDirection = "row";
      this.buttonContainer.style.width = "auto";

      buttons.forEach((button) => {
        button.style.width = "auto";
        button.style.marginLeft = "0.625rem";
        button.style.marginBottom = "0";
        button.style.padding = "0.5rem 1rem";
      });
    }
  }

  /**
   * 모달 닫기
   */
  close() {
    if (this.modalDiv && this.modalDiv.parentNode) {
      window.removeEventListener("resize", this.adjustButtonLayout.bind(this));
      document.body.removeChild(this.modalDiv);
    }
  }

  /**
   * 경고 모달
   * @param {string} message
   * @param {Object} options
   * @returns {Promise}
   */
  static warning(message, options = {}) {
    const modal = new CustomModal();
    const buttons = options.buttons || [
      { text: "확인", value: true, primary: true },
    ];

    const container = document.createElement("div");

    const iconContainer = document.createElement("div");
    iconContainer.style.display = "flex";
    iconContainer.style.alignItems = "center";
    iconContainer.style.marginBottom = "0.625rem";

    const icon = document.createElement("span");
    icon.innerHTML = "⚠️";
    icon.style.fontSize = "1.5rem";
    icon.style.marginRight = "0.625rem";

    const title = document.createElement("h3");
    title.textContent = "경고";
    title.style.margin = "0";
    title.style.fontSize = "1.25rem";

    iconContainer.appendChild(icon);
    iconContainer.appendChild(title);

    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.style.fontSize = "1rem";
    messageElement.style.lineHeight = "1.5";

    container.appendChild(iconContainer);
    container.appendChild(messageElement);

    return modal.show({
      message: container,
      buttons: buttons,
    });
  }

  /**
   * 확인 모달
   * @param {string} message
   * @param {Object} options
   * @returns {Promise}
   */
  static confirm(message, options = {}) {
    const modal = new CustomModal();
    const buttons = options.buttons || [
      { text: "취소", value: false },
      { text: "확인", value: true, primary: true },
    ];

    return modal.show({
      message: message,
      buttons: buttons,
    });
  }

  /**
   * 알림 모달 표시
   * @param {string} message
   * @param {Object} options
   * @returns {Promise}
   */
  static alert(message, options = {}) {
    const modal = new CustomModal();
    const buttons = options.buttons || [
      { text: "확인", value: true, primary: true },
    ];

    return modal.show({
      message: message,
      buttons: buttons,
    });
  }
}
