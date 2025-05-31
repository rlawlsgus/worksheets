import { CustomModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  // 이미지 삭제 폼 처리
  const deleteForm = document.getElementById("bulk-delete-form");
  deleteForm.addEventListener("submit", handleDelete);

  // 월 네비게이션 버튼
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  prevMonthBtn.addEventListener("click", showPreviousMonth);
  nextMonthBtn.addEventListener("click", showNextMonth);

  // 이미지 클릭 이벤트 처리
  const imageCards = document.querySelectorAll(".image-card img");
  imageCards.forEach((img) => {
    img.addEventListener("click", handleImageClick);
  });

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

    try {
      const response = await fetch("/api/admin/image_delete", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await CustomModal.alert("선택한 이미지가 성공적으로 삭제되었습니다.");
        window.location.reload();
      }
    } catch (error) {
      await CustomModal.warning("삭제 중 오류가 발생했습니다.");
    }
  }

  // 이미지 클릭 처리 함수
  async function handleImageClick(event) {
    const img = event.target;
    const imageCard = img.closest(".image-card");
    const imageInfo = imageCard.querySelector(".image-info");
    const assistantName = imageInfo.querySelector("p:first-child").textContent;
    const date = imageInfo.querySelector("p:last-child").textContent;

    const container = document.createElement("div");
    container.className = "image-modal-content";

    const expandedImage = document.createElement("img");
    expandedImage.src = img.src;
    expandedImage.alt = img.alt;
    expandedImage.className = "expanded-image";

    const infoDiv = document.createElement("div");
    infoDiv.className = "image-modal-info";
    infoDiv.innerHTML = `
      <p>${assistantName}</p>
      <p>${date}</p>
    `;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "image-modal-actions";

    const downloadButton = document.createElement("button");
    downloadButton.className = "download-button";
    downloadButton.textContent = "다운로드";
    downloadButton.onclick = () => {
      const imageId = imageCard.querySelector('input[name="image_ids"]').value;
      window.location.href = `/api/image_download/${imageId}`;
    };

    actionsDiv.appendChild(downloadButton);
    container.appendChild(expandedImage);
    container.appendChild(infoDiv);
    container.appendChild(actionsDiv);

    const modal = new CustomModal();
    await modal.show({
      message: container,
      buttons: [{ text: "닫기", value: true, primary: true }],
    });
  }
});
