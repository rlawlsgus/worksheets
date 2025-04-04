import { api } from "./api.js";

export class AdminManager {
  constructor() {
    this.isAdmin = false;
  }

  async init() {
    await this.checkAdmin();
    this.initializeAdminButtons();
  }

  async checkAdmin() {
    try {
      const response = await api.auth.getIsAdmin();
      this.isAdmin = response.is_admin;
    } catch (error) {
      console.error("Failed to get admin info:", error);
      alert("관리자 정보를 불러오는 데 실패했습니다.");
    }
  }

  initializeAdminButtons() {
    if (!this.isAdmin) {
      document.querySelectorAll(".admin-only")?.forEach((button) => {
        button.remove();
      });
    }
  }
}
