import { AssistantManager } from "./assistantManager.js";
import { WorklogManager } from "./worklogManager.js";
import { AdminManager } from "./adminManager.js";
import { initializeTimeBoxes } from "./timeManager.js";

document.addEventListener("DOMContentLoaded", async () => {
  initializeTimeBoxes();

  const adminManager = new AdminManager();
  const assistantManager = new AssistantManager(adminManager);
  const worklogManager = new WorklogManager(adminManager);

  await adminManager.init();
  await Promise.all([assistantManager.init(), worklogManager.init()]);

  assistantManager.onAssistantSelect = async (assistantId) => {
    worklogManager.currentAssistantId = assistantId;
    worklogManager.loadWorkLogs();
  };

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
});
