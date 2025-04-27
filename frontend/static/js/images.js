import { CustomModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  // 이미지 업로드 폼 처리
  const uploadForm = document.getElementById("upload-form");
  uploadForm.addEventListener("submit", handleUpload);

  // 이미지 삭제 폼 처리
  const deleteForm = document.getElementById("bulk-delete-form");
  deleteForm.addEventListener("submit", handleDelete);

  // 월 네비게이션 버튼
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  prevMonthBtn.addEventListener("click", showPreviousMonth);
  nextMonthBtn.addEventListener("click", showNextMonth);

  // 현재 표시중인 연도와 월을 저장하는 변수
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();

  // 페이지 로드 시 현재 월의 이미지만 표시
  initializeMonthlyView();

  // 월별 보기 초기화
  function initializeMonthlyView() {
    updateMonthDisplay();
    filterImagesByMonth(currentYear, currentMonth);
  }

  // 월 표시 업데이트
  function updateMonthDisplay() {
    document.getElementById(
      "current-month-display"
    ).textContent = `${currentYear}년 ${currentMonth + 1}월`;
  }

  // 이전 월 표시
  function showPreviousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateMonthDisplay();
    filterImagesByMonth(currentYear, currentMonth);
  }

  // 다음 월 표시
  function showNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateMonthDisplay();
    filterImagesByMonth(currentYear, currentMonth);
  }

  // 특정 월에 해당하는 이미지만 필터링하여 표시
  function filterImagesByMonth(year, month) {
    const imageCards = document.querySelectorAll(".image-card");
    let visibleCount = 0;

    imageCards.forEach((card) => {
      const dateString = card.getAttribute("data-date");
      const imageDate = new Date(dateString);

      if (imageDate.getFullYear() === year && imageDate.getMonth() === month) {
        card.style.display = "block";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // 해당 월에 이미지가 없을 경우 메시지 표시
    const noImagesMessage = document.getElementById("no-images-message");
    if (noImagesMessage) {
      noImagesMessage.style.display = visibleCount === 0 ? "block" : "none";
    } else if (visibleCount === 0) {
      const message = document.createElement("p");
      message.id = "no-images-message";
      message.textContent = "이 달에 등록된 이미지가 없습니다.";
      document.getElementById("images-by-month").appendChild(message);
    }

    const deleteButton = document.getElementById("delete-button");
    deleteButton.style.display = visibleCount === 0 ? "none" : "block";
  }

  function getAssistantId() {
    return document.getElementById("assistant-id").value;
  }

  // 이미지 업로드 처리
  async function handleUpload(event) {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    const assistantId = getAssistantId();

    formData.append("assistant_id", assistantId);

    try {
      const response = await fetch("/api/image_upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await CustomModal.alert("이미지가 성공적으로 업로드되었습니다.");
        window.location.href = `/images/${assistantId}`;
      }
    } catch (error) {
      await CustomModal.warning("업로드 중 오류가 발생했습니다.");
    }
  }

  // 이미지 삭제 처리 함수
  async function handleDelete(event) {
    event.preventDefault();

    // 현재 보이는 이미지 중에서만 체크된 항목 선택
    const checkedBoxes = document.querySelectorAll(
      '.image-card[style="display: block;"] input[name="image_ids"]:checked'
    );
    if (checkedBoxes.length === 0) {
      await CustomModal.alert("삭제할 이미지를 선택해주세요.");
      return;
    }

    const confirmDelete = await CustomModal.confirm(
      "선택한 이미지를 삭제하시겠습니까?"
    );

    if (!confirmDelete) {
      return;
    }

    const formData = new FormData();
    checkedBoxes.forEach((checkbox) => {
      formData.append("image_ids", checkbox.value);
    });

    const assistantId = getAssistantId();
    formData.append("assistant_id", assistantId);

    try {
      const response = await fetch("/api/image_delete", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await CustomModal.alert("선택한 이미지가 성공적으로 삭제되었습니다.");
        window.location.href = `/images/${assistantId}`;
      }
    } catch (error) {
      await CustomModal.warning("삭제 중 오류가 발생했습니다.");
    }
  }
});
