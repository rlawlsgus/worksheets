// modal.js - 재사용 가능한 모달 컴포넌트

export class CustomModal {
  constructor() {
    this.modalDiv = null;
    this.modalContent = null;
    this.messageElement = null;
    this.buttonContainer = null;
  }

  /**
   * 모달 표시 함수
   * @param {Object} options - 모달 구성 옵션
   * @param {string} options.message - 메시지 내용
   * @param {Array} options.buttons - 버튼 배열. 각 버튼은 { text, value, primary } 형태
   * @returns {Promise} - 사용자가 선택한 버튼의 value를 resolve하는 Promise
   */
  show(options) {
    return new Promise((resolve) => {
      // 모달 컨테이너 생성
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

      // 모달 내용 생성
      this.modalContent = document.createElement("div");
      this.modalContent.className = "custom-modal-content";
      this.modalContent.style.backgroundColor = "white";
      this.modalContent.style.padding = "20px";
      this.modalContent.style.borderRadius = "5px";
      this.modalContent.style.maxWidth = "500px";
      this.modalContent.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";

      // 메시지 생성
      this.messageElement = document.createElement("div");
      this.messageElement.className = "custom-modal-message";
      this.messageElement.style.marginBottom = "15px";

      if (typeof options.message === "string") {
        const messageText = document.createElement("p");
        messageText.textContent = options.message;
        this.messageElement.appendChild(messageText);
      } else if (options.message instanceof HTMLElement) {
        this.messageElement.appendChild(options.message);
      }

      // 버튼 컨테이너 생성
      this.buttonContainer = document.createElement("div");
      this.buttonContainer.className = "custom-modal-buttons";
      this.buttonContainer.style.display = "flex";
      this.buttonContainer.style.justifyContent = "flex-end";
      this.buttonContainer.style.marginTop = "15px";

      // 버튼 생성
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
            button.style.border = "1px solid #ced4da";
          }

          button.style.padding = "8px 16px";
          button.style.marginLeft = "10px";
          button.style.borderRadius = "4px";
          button.style.cursor = "pointer";

          button.onclick = () => {
            this.close();
            resolve(buttonConfig.value);
          };

          this.buttonContainer.appendChild(button);
        });
      }

      // 모달 조립
      this.modalContent.appendChild(this.messageElement);
      this.modalContent.appendChild(this.buttonContainer);
      this.modalDiv.appendChild(this.modalContent);

      // DOM에 추가
      document.body.appendChild(this.modalDiv);
    });
  }

  /**
   * 모달 닫기
   */
  close() {
    if (this.modalDiv && this.modalDiv.parentNode) {
      document.body.removeChild(this.modalDiv);
    }
  }

  /**
   * 경고 모달 표시 (편의 메서드)
   * @param {string} message - 경고 메시지
   * @param {Object} options - 옵션
   * @returns {Promise}
   */
  static warning(message, options = {}) {
    const modal = new CustomModal();
    const buttons = options.buttons || [
      { text: "취소", value: false },
      { text: "확인", value: true, primary: true },
    ];

    const container = document.createElement("div");

    const iconContainer = document.createElement("div");
    iconContainer.style.display = "flex";
    iconContainer.style.alignItems = "center";
    iconContainer.style.marginBottom = "10px";

    const icon = document.createElement("span");
    icon.innerHTML = "⚠️";
    icon.style.fontSize = "24px";
    icon.style.marginRight = "10px";

    const title = document.createElement("h3");
    title.textContent = "경고";
    title.style.margin = "0";

    iconContainer.appendChild(icon);
    iconContainer.appendChild(title);

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    container.appendChild(iconContainer);
    container.appendChild(messageElement);

    return modal.show({
      message: container,
      buttons: buttons,
    });
  }

  /**
   * 확인 모달 표시 (편의 메서드)
   * @param {string} message - 확인 메시지
   * @param {Object} options - 옵션
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
   * 알림 모달 표시 (편의 메서드)
   * @param {string} message - 알림 메시지
   * @param {Object} options - 옵션
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
