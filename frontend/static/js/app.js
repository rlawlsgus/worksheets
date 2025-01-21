document.addEventListener("DOMContentLoaded", () => {
  // API 기본 URL
  const API_BASE_URL = "http://localhost:5000/api";

  // API 요청 함수들
  const api = {
    // 조교 관련 API
    assistants: {
      getAll: () =>
        fetch(`${API_BASE_URL}/assistant`).then((res) => res.json()),
      get: (id) =>
        fetch(`${API_BASE_URL}/assistant/${id}`).then((res) => res.json()),
      update: (id, data) =>
        fetch(`${API_BASE_URL}/assistant/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then((res) => res.json()),
      create: (data) =>
        fetch(`${API_BASE_URL}/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then((res) => res.json()),
    },
    // 근무일지 관련 API
    worklog: {
      getMonthly: (assistantId, year, month) =>
        fetch(`${API_BASE_URL}/worklogs/${assistantId}/${year}/${month}`).then(
          (res) => res.json()
        ),
      create: (data) =>
        fetch(`${API_BASE_URL}/worklog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then((res) => res.json()),
      delete: (id) =>
        fetch(`${API_BASE_URL}/worklog/${id}`, {
          method: "DELETE",
        }).then((res) => res.json()),
    },
  };

  // 현재 선택된 조교 ID를 저장할 변수
  let currentAssistantId = null;

  // 모든 .menu-button 요소를 선택
  const menuButtons = document.querySelectorAll(".menu-button");
  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      menuButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // "조교 추가" 버튼 클릭 시
      if (button.querySelector("span").textContent === "조교 추가") {
        const name = prompt("조교 이름을 입력하세요:");
        if (name) {
          const bankAccount = prompt("계좌번호를 입력하세요:");
          const subject = prompt("담당 과목을 입력하세요 (화학/생명/지학):");

          api.assistants
            .create({
              name,
              bank_account: bankAccount,
              subject,
            })
            .then(() => {
              // 페이지 새로고침하여 목록 업데이트
              location.reload();
            });
        }
      }
    });
  });

  // 조교 목록 불러오기 및 이벤트 설정
  const memberButtons = document.querySelectorAll(".member-button");
  memberButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      memberButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // 조교 이름에서 ID 가져오기 (버튼의 data-id 속성 사용 가정)
      currentAssistantId = button.dataset.id;
      const assistantData = await api.assistants.get(currentAssistantId);

      // 조교 정보 업데이트
      document.querySelector(".profile-details h2").textContent =
        assistantData.name;
      document.querySelector(".profile-details p").textContent =
        assistantData.bank_account;

      // 근무 일지 불러오기
      loadWorkLogs();
    });
  });

  // 근무 일지 불러오기 함수
  async function loadWorkLogs() {
    if (!currentAssistantId) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const logs = await api.worklog.getMonthly(currentAssistantId, year, month);
    const tableBody = document.querySelector(".attendance-table");

    // 헤더를 제외한 기존 행들 제거
    const rows = tableBody.querySelectorAll(".table-row");
    rows.forEach((row) => row.remove());

    // 새로운 근무 기록 추가
    logs.forEach((log) => {
      const row = document.createElement("div");
      row.className = "table-row";
      row.dataset.id = log.id;
      row.innerHTML = `
        <span>${log.date.split("-")[2]}</span>
        <span>${log.start_time}</span>
        <span>${log.end_time}</span>
        <span>${log.work_hours}</span>
      `;
      tableBody.appendChild(row);
    });
  }

  // 조교 정보 수정 버튼 이벤트
  document.querySelector(".edit-button").addEventListener("click", async () => {
    if (!currentAssistantId) {
      alert("조교를 선택해주세요.");
      return;
    }

    const assistantData = await api.assistants.get(currentAssistantId);
    const name = prompt("조교 이름:", assistantData.name);
    const bankAccount = prompt("계좌번호:", assistantData.bank_account);
    const subject = prompt(
      "담당 과목 (화학/생명/지학):",
      assistantData.subject
    );

    if (name && bankAccount && subject) {
      await api.assistants.update(currentAssistantId, {
        name,
        bank_account: bankAccount,
        subject,
      });
      location.reload();
    }
  });

  // 일지 추가 버튼 이벤트
  document.querySelector(".add-button").addEventListener("click", async () => {
    if (!currentAssistantId) {
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

    const worklog = {
      assistant_id: currentAssistantId,
      start_time: `${startDate} ${startHour}:${startMinute}`,
      end_time: `${endDate} ${endHour}:${endMinute}`,
    };

    await api.worklog.create(worklog);
    loadWorkLogs();
  });

  // 일지 삭제 버튼 이벤트
  document
    .querySelector(".delete-button")
    .addEventListener("click", async () => {
      const selectedRows = document.querySelectorAll(".table-row.selected");
      if (selectedRows.length === 0) {
        alert("삭제할 근무 기록을 선택해주세요.");
        return;
      }

      if (confirm("선택한 근무 기록을 삭제하시겠습니까?")) {
        for (const row of selectedRows) {
          await api.worklog.delete(row.dataset.id);
        }
        loadWorkLogs();
      }
    });

  // 과목 전환 애니메이션
  // 모든 subject-button 요소를 선택
  const subjectButtons = document.querySelectorAll(".subject-button");
  // subject-container를 선택
  const subjectContainer = document.querySelector(".subject-container");

  // active-indicator 생성
  const activeIndicator = document.createElement("div");
  activeIndicator.classList.add("active-indicator");
  subjectContainer.appendChild(activeIndicator);

  // 초기 active 버튼 위치 설정
  function updateIndicator() {
    const activeButton = document.querySelector(".subject-button.active");
    const buttonRect = activeButton.getBoundingClientRect();
    const containerRect = subjectContainer.getBoundingClientRect();

    // 위치 및 크기 업데이트
    activeIndicator.style.width = `${buttonRect.width}px`;
    activeIndicator.style.left = `${buttonRect.left - containerRect.left}px`;
  }

  // 각 버튼에 클릭 이벤트 추가
  subjectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 모든 버튼에서 active 클래스 제거
      subjectButtons.forEach((btn) => btn.classList.remove("active"));
      // 클릭한 버튼에 active 클래스 추가
      button.classList.add("active");
      // 애니메이션 업데이트
      updateIndicator();
    });
  });

  // 초기 위치 설정
  updateIndicator();
  // 화면 크기 변화에 대응 -> 이거 꼭 필요한가 모르겠음
  window.addEventListener("resize", updateIndicator);

  const timeBoxes = document.querySelectorAll(".time-box");
  const dateInputs = document.querySelectorAll(".date-input");

  // 현재 시간 가져오기
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 분을 30분 단위로 반올림
  const roundedMinute = currentMinute < 15 ? 0 : currentMinute < 45 ? 30 : 0;
  const nextHour =
    roundedMinute === 0 && currentMinute >= 45
      ? (currentHour + 1) % 24
      : currentHour;

  // 날짜 계산 함수
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 날짜 초기화
  if (dateInputs.length > 0) {
    // 첫 번째 .date-input
    const firstDate = new Date(now);
    if (currentHour >= 0 && currentHour < 4) {
      // 00시~04시: 어제 날짜로 설정
      firstDate.setDate(firstDate.getDate() - 1);
    }
    dateInputs[0].value = getFormattedDate(firstDate);

    // 두 번째 .date-input
    if (dateInputs.length > 1) {
      dateInputs[1].value = getFormattedDate(now);
    }
  }

  // 시간/분 초기화
  timeBoxes.forEach((box) => {
    const type = box.getAttribute("data-type");

    if (type === "hour") {
      box.textContent = String(nextHour).padStart(2, "0");
    } else if (type === "minute") {
      box.textContent = String(roundedMinute).padStart(2, "0");
    }
  });

  // 시간/분 박스에 스크롤 이벤트 추가
  timeBoxes.forEach((box) => {
    box.addEventListener("wheel", (event) => {
      event.preventDefault();
      const type = box.getAttribute("data-type");
      let value = parseInt(box.textContent, 10);

      if (type === "hour") {
        value = (value + (event.deltaY < 0 ? 1 : -1) + 24) % 24;
      } else if (type === "minute") {
        value = (value + (event.deltaY < 0 ? 30 : -30) + 60) % 60;
      }

      box.textContent = String(value).padStart(2, "0");
    });

    // 시간/분 박스 클릭 시 직접 입력
    box.addEventListener("click", () => {
      const currentValue = box.textContent;
      const input = prompt("값을 입력하세요:", currentValue);

      if (input !== null) {
        const newValue = parseInt(input, 10);

        if (!isNaN(newValue)) {
          const type = box.getAttribute("data-type");

          if (type === "hour" && newValue >= 0 && newValue < 24) {
            box.textContent = String(newValue).padStart(2, "0");
          } else if (type === "minute" && newValue >= 0 && newValue < 60) {
            const roundedMinute2 = newValue < 15 ? 0 : newValue < 45 ? 30 : 0;
            box.textContent = String(roundedMinute2).padStart(2, "0");
          } else {
            alert("유효한 값을 입력해주세요!");
          }
        }
      }
    });
  });
});
