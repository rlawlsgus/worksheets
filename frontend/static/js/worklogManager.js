import { api } from "./api.js";

export class WorklogManager {
  constructor() {
    this.currentAssistantId = 1;
    this.currentDate = new Date();
    this.currentDate.setDate(1);
    this.initializeButtons();
    this.initializeMonthNavigation();
  }

  initializeButtons() {
    document
      .querySelector(".add-button")
      ?.addEventListener("click", () => this.createWorklog());
    document
      .querySelector(".delete-button")
      ?.addEventListener("click", () => this.deleteWorklogs());
    document
      .querySelector(".export-button")
      ?.addEventListener("click", () => this.exportWorklogs());
    document
      .querySelector(".check-button")
      ?.addEventListener("click", () => this.checkWorklog());
  }

  initializeMonthNavigation() {
    const prevMonthBtn = document.querySelector(".prev-month");
    const nextMonthBtn = document.querySelector(".next-month");

    this.updateMonthHeader();
    this.loadWorkLogs();
    prevMonthBtn.addEventListener("click", () => this.changeMonth(-1));
    nextMonthBtn.addEventListener("click", () => this.changeMonth(1));
  }

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.updateMonthHeader();
    this.loadWorkLogs();
  }

  updateMonthHeader() {
    const monthHeader = document.querySelector(".log-header h3");
    monthHeader.textContent = `${this.currentDate.getFullYear()}년 ${
      this.currentDate.getMonth() + 1
    }월 근무 일지`;
  }

  async loadWorkLogs() {
    if (!this.currentAssistantId) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    try {
      const logs = await api.worklog.getMonthly(
        this.currentAssistantId,
        year,
        month
      );
      this.renderWorkLogs(logs);
    } catch (error) {
      console.error("Failed to load worklogs:", error);
      alert("근무 기록을 불러오는 데 실패했습니다.");
    }
  }

  renderWorkLogs(logs) {
    const tableBody = document.querySelector(".attendance-table");

    const existingRows = tableBody.querySelectorAll(".table-row");
    existingRows.forEach((row) => row.remove());

    logs.forEach((log) => {
      const row = document.createElement("div");
      row.className = "table-row";
      row.dataset.id = log.id;

      const date = new Date(log.date);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

      if (this.currentAssistantId === 1) {
        row.innerHTML = `
          <span>${formattedDate}</span>
          <span>${log.start_time}</span>
          <span>${log.end_time}</span>
          <span>${log.work_hours}</span>
          <input type="checkbox" ${log.checked ? "checked" : ""} />
        `;
      } else {
        row.innerHTML = `
          <span>${formattedDate}</span>
          <span>${log.start_time}</span>
          <span>${log.end_time}</span>
          <span>${log.work_hours}</span>
          <input type="checkbox" disabled ${log.checked ? "checked" : ""} />
        `;
      }

      const checkbox = row.querySelector('input[type="checkbox"]');

      checkbox.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      row.addEventListener("click", () => {
        row.classList.toggle("selected");
      });

      tableBody.appendChild(row);
    });
  }

  async createWorklog() {
    if (!this.currentAssistantId) {
      alert("조교를 선택해주세요.");
      return;
    }

    const startDate = document.querySelector("#start-date").value;
    const endDate = document.querySelector("#end-date").value;
    const startHour = document.querySelector(
      ".start-time .hour-box"
    ).textContent;
    const startMinute = document.querySelector(
      ".start-time .minute-box"
    ).textContent;
    const endHour = document.querySelector(".end-time .hour-box").textContent;
    const endMinute = document.querySelector(
      ".end-time .minute-box"
    ).textContent;

    const start_time = new Date(
      `${startDate}T${startHour.padStart(2, "0")}:${startMinute.padStart(
        2,
        "0"
      )}`
    );
    const end_time = new Date(
      `${endDate}T${endHour.padStart(2, "0")}:${endMinute.padStart(2, "0")}`
    );

    if (start_time >= end_time) {
      alert("시작 시간이 종료 시간보다 늦거나 같을 수 없습니다.");
    } else {
      const worklog = {
        assistant_id: this.currentAssistantId,
        start_time: `${startDate} ${startHour}:${startMinute}`,
        end_time: `${endDate} ${endHour}:${endMinute}`,
      };

      try {
        await api.worklog.create(worklog);
        this.loadWorkLogs();
      } catch (error) {
        console.error("Failed to create worklog:", error);
        alert("근무 기록 추가에 실패했습니다.");
      }
    }
  }

  async deleteWorklogs() {
    const selectedRows = document.querySelectorAll(".table-row.selected");
    if (selectedRows.length === 0) {
      alert("삭제할 근무 기록을 선택해주세요.");
      return;
    }

    if (confirm("선택한 근무 기록을 삭제하시겠습니까?")) {
      try {
        for (const row of selectedRows) {
          await api.worklog.delete(row.dataset.id);
        }
        this.loadWorkLogs();
      } catch (error) {
        console.error("Failed to delete worklogs:", error);
        alert("근무 기록 삭제에 실패했습니다.");
      }
    }
  }

  async checkWorklog() {
    const rows = document.querySelectorAll('div > input[type="checkbox"]');

    const changedRows = Array.from(rows)
      .filter((checkbox) => checkbox.checked !== checkbox.defaultChecked)
      .map((checkbox) => {
        const row = checkbox.closest("div");
        return {
          id: row.dataset.id,
          checked: checkbox.checked,
        };
      });

    if (changedRows.length === 0) {
      alert("승인할 근무 기록을 선택해주세요.");
      return;
    }

    try {
      await api.worklog.check(changedRows);
      this.loadWorkLogs();
    } catch (error) {
      console.error("Failed to delete worklogs:", error);
      alert("근무 기록 승인에 실패했습니다.");
    }
  }

  async exportWorklogs() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    try {
      const blob = await api.worklog.exportLogs(year, month);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `worklog_${year}_${month}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export worklogs:", error);
      alert("근무 기록을 내보내는 데 실패했습니다.");
    }
  }
}
