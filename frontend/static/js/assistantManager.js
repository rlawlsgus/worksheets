import { api } from "./api.js";

export class AssistantManager {
  constructor() {
    this.currentAssistantId = 1;
    this.assistantList = [];
    this.initializeMenuButtons();
    this.initializeEditButton();
    this.loadAssistantList();
  }

  async loadAssistantList() {
    try {
      this.assistantList = await api.assistants.getAll();
      this.renderAssistantButtons();

      if (this.assistantList.length > 0) {
        await this.selectAssistant(this.assistantList[0].id);
      }
    } catch (error) {
      console.error("Failed to load assistants:", error);
      alert("조교 목록을 불러오는 데 실패했습니다.");
    }
  }

  renderAssistantButtons() {
    const memberButtonsContainer = document.querySelector(".member-buttons");
    memberButtonsContainer.innerHTML = ""; // Clear existing buttons

    this.assistantList.forEach((assistant) => {
      const button = document.createElement("button");
      button.className = "member-button";
      button.dataset.id = assistant.id;

      // Create SVG element
      const svg = this.createUserSVG();

      // Create span for name
      const span = document.createElement("span");
      span.textContent = assistant.name;

      // Append SVG and span to button
      button.appendChild(svg);
      button.appendChild(span);

      button.addEventListener("click", () =>
        this.selectAssistant(assistant.id)
      );

      memberButtonsContainer.appendChild(button);
    });
  }

  createUserSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const path1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path1.setAttribute(
      "d",
      "M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
    );
    path1.setAttribute("stroke", "currentColor");
    path1.setAttribute("stroke-width", "1.5");
    path1.setAttribute("stroke-linecap", "round");
    path1.setAttribute("stroke-linejoin", "round");

    const path2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path2.setAttribute(
      "d",
      "M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25989 15 3.40991 18.13 3.40991 22"
    );
    path2.setAttribute("stroke", "currentColor");
    path2.setAttribute("stroke-width", "1.5");
    path2.setAttribute("stroke-linecap", "round");
    path2.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path1);
    svg.appendChild(path2);

    return svg;
  }

  async selectAssistant(assistantId) {
    try {
      const memberButtons = document.querySelectorAll(".member-button");
      memberButtons.forEach((btn) => btn.classList.remove("active"));

      // Activate selected button
      const selectedButton = document.querySelector(
        `.member-button[data-id="${assistantId}"]`
      );
      selectedButton.classList.add("active");

      this.currentAssistantId = assistantId;
      const assistantData = await api.assistants.get(assistantId);

      // 프로필 정보 업데이트
      document.querySelector(".profile-details h2").textContent =
        assistantData.name;
      document.querySelector(".profile-details p").textContent =
        assistantData.bank_account;

      // 근무 일지 로드 콜백 호출
      if (this.onAssistantSelect) {
        this.onAssistantSelect(assistantId);
      }
    } catch (error) {
      console.error("Failed to load assistant details:", error);
      alert("조교 정보를 불러오는 데 실패했습니다.");
    }
  }

  initializeMenuButtons() {
    document
      .querySelector(".add-assistant-button")
      ?.addEventListener("click", () => this.createAssistant());
  }

  async createAssistant() {
    const name = prompt("조교 이름을 입력하세요:");
    if (name) {
      const bankAccount = prompt("계좌번호를 입력하세요:");
      const salary = prompt("급여를 입력하세요:");
      const subject = prompt("담당 과목을 입력하세요 (화학/생명/지학):");

      await api.assistants.create({
        name,
        bank_account: bankAccount,
        salary,
        subject,
      });

      // 페이지 새로고침하여 목록 업데이트
      location.reload();
    }
  }

  initializeMemberButtons() {
    const memberButtons = document.querySelectorAll(".member-button");
    memberButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        memberButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // 조교 이름에서 ID 가져오기 (버튼의 data-id 속성 사용 가정)
        this.currentAssistantId = button.dataset.id;
        await this.updateProfileDetails();
      });
    });
  }

  async updateProfileDetails() {
    if (!this.currentAssistantId) return;

    const assistantData = await api.assistants.get(this.currentAssistantId);

    // 조교 정보 업데이트
    document.querySelector(".profile-details h2").textContent =
      assistantData.name;
    document.querySelector(".profile-details p").textContent =
      assistantData.bank_account;

    // 근무 일지 불러오기 (외부에서 주입받아야 할 콜백)
    if (this.onAssistantSelect) {
      this.onAssistantSelect(this.currentAssistantId);
    }
  }

  initializeEditButton() {
    document
      .querySelector(".edit-button")
      .addEventListener("click", async () => {
        if (!this.currentAssistantId) {
          alert("조교를 선택해주세요.");
          return;
        }

        await this.updateAssistant();
      });
  }

  async updateAssistant() {
    const assistantData = await api.assistants.get(this.currentAssistantId);
    const name = prompt("조교 이름:", assistantData.name);
    const bankAccount = prompt("계좌번호:", assistantData.bank_account);
    const salary = prompt("급여:", assistantData.salary);
    const subject = prompt(
      "담당 과목 (화학/생명/지학):",
      assistantData.subject
    );

    if (name && bankAccount && salary && subject) {
      await api.assistants.update(this.currentAssistantId, {
        name,
        bank_account: bankAccount,
        salary,
        subject,
      });
      location.reload();
    }
  }

  // 옵션: 현재 선택된 조교의 ID를 반환
  getCurrentAssistantId() {
    return this.currentAssistantId;
  }
}
