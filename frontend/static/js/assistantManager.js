import { api } from "./api.js";

export class AssistantManager {
  constructor(adminManager) {
    this.adminManager = adminManager;
    this.currentAssistantId = null;
    this.currentSubject = "화학";
    this.assistantList = [];
    this.filteredAssistantList = [];
  }

  init() {
    this.initializeButtons();
    this.initializeEditButton();
    this.loadAssistantList();
  }

  initializeButtons() {
    document
      .querySelector(".add-assistant-button")
      ?.addEventListener("click", () => this.createAssistant());
    document
      .querySelector(".logout-button")
      ?.addEventListener("click", async () => {
        const response = await api.auth.logout();
        window.location.href = response.redirect;
      });

    const subjectButtons = document.querySelectorAll(".subject-button");

    subjectButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.currentSubject = e.target.id;
        this.renderAssistantButtons();
        if (this.filteredAssistantList.length > 0) {
          this.selectAssistant(this.filteredAssistantList[0].id);
        }
      });
    });

    document.querySelector(".image-button")?.addEventListener("click", () => {
      if (!this.currentAssistantId) {
        alert("조교를 선택해주세요.");
        return;
      }
      window.location.href = `/images/${this.currentAssistantId}`;
    });
  }

  async loadAssistantList() {
    try {
      this.assistantList = await api.assistants.getAll();
      this.renderAssistantButtons();

      if (this.filteredAssistantList.length > 0) {
        await this.selectAssistant(this.filteredAssistantList[0].id);
      }
    } catch (error) {
      console.error("Failed to load assistants:", error);
      alert("조교 목록을 불러오는 데 실패했습니다.");
    }
  }

  getFilteredAssistantList() {
    return this.assistantList.filter(
      (assistant) => assistant.subject === this.currentSubject
    );
  }

  renderAssistantButtons() {
    const memberButtonsContainer = document.querySelector(".member-buttons");
    memberButtonsContainer.innerHTML = "";

    this.filteredAssistantList = this.getFilteredAssistantList();

    this.filteredAssistantList.forEach((assistant) => {
      const button = document.createElement("button");
      button.className = "member-button";
      button.dataset.id = assistant.id;

      const svg = this.createUserSVG();

      const span = document.createElement("span");
      span.textContent = assistant.name;

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

      const selectedButton = document.querySelector(
        `.member-button[data-id="${assistantId}"]`
      );
      selectedButton.classList.add("active");

      this.currentAssistantId = assistantId;
      const assistantData = await api.assistants.get(assistantId);

      document.querySelector(".profile-details h2").textContent =
        assistantData.name;
      document.querySelector(".profile-details p").textContent =
        assistantData.bank_account;
      document.querySelector(".profile-image").textContent =
        assistantData.subject;

      // 근무 일지 로드 콜백 호출
      if (this.onAssistantSelect) {
        this.onAssistantSelect(assistantId);
      }
    } catch (error) {
      console.error("Failed to load assistant details:", error);
      alert("조교 정보를 불러오는 데 실패했습니다.");
    }
  }

  async createAssistant() {
    const name = prompt("조교 이름을 입력하세요:");
    if (name) {
      const bankAccount = prompt("계좌번호를 입력하세요:");
      const salary = prompt("급여를 입력하세요:");
      const subject = prompt("담당 과목을 입력하세요 (화학/생명/지학):");
      const password = prompt("비밀번호를 입력하세요:");

      await api.assistants.create({
        name,
        password,
        bank_account: bankAccount,
        salary,
        subject,
      });

      location.reload();
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

    if (this.adminManager.isAdmin) {
      const updatePassword = confirm("비밀번호를 변경하시겠습니까?");

      const updateData = {};

      if (updatePassword) {
        const password = prompt("새 비밀번호:");
        if (password) {
          updateData.password = password;
        }
      }

      const name = prompt("조교 이름:", assistantData.name);
      const bankAccount = prompt("계좌번호:", assistantData.bank_account);
      const salary = prompt("급여:", assistantData.salary);
      const subject = prompt(
        "담당 과목 (화학/생명/지학):",
        assistantData.subject
      );

      if (name) updateData.name = name;
      if (bankAccount) updateData.bank_account = bankAccount;
      if (salary) updateData.salary = salary;
      if (subject) updateData.subject = subject;

      if (Object.keys(updateData).length > 0) {
        await api.assistants.update(this.currentAssistantId, updateData);
        location.reload();
      }
    } else {
      const password = prompt("새 비밀번호:");
      if (password) {
        await api.assistants.update(this.currentAssistantId, {
          password,
        });
        location.reload();
      }
    }
  }
}
