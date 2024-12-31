document.addEventListener("DOMContentLoaded", () => {
  // 모든 .menu-button 요소를 선택
  const menuButtons = document.querySelectorAll(".menu-button");

  // 각 버튼에 클릭 이벤트 추가
  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 모든 버튼에서 active 클래스 제거
      menuButtons.forEach((btn) => btn.classList.remove("active"));
      // 클릭한 버튼에 active 클래스 추가
      button.classList.add("active");
    });
  });

  // 모든 .member-button 요소를 선택
  const memberButtons = document.querySelectorAll(".member-button");

  // 각 버튼에 클릭 이벤트 추가
  memberButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 모든 버튼에서 active 클래스 제거
      memberButtons.forEach((btn) => btn.classList.remove("active"));
      // 클릭한 버튼에 active 클래스 추가
      button.classList.add("active");
    });
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

  // 모든 근무시간 행 선택
  const tableRows = document.querySelectorAll(".table-row");

  // 각 행에 클릭 이벤트 추가
  tableRows.forEach((row) => {
    row.addEventListener("click", () => {
      // 클릭 시 selected 클래스 토글 -> 선택됨
      row.classList.toggle("selected");
    });
  });

  // 조교 정보 수정 버튼 이벤트
  document.querySelector(".edit-button").addEventListener("click", () => {
    // 수정 누르면 해당 조교 정보 수정하는 페이지로 이동하는 코드 써야함함
  });

  // 일지 추가 버튼 이벤트
  document.querySelector(".add-button").addEventListener("click", () => {
    // 추가 누르면 시작 시간, 종료 시간 반양해서 로그 추가하는 코드 써야함
  });

  // 일지 삭제 버튼 이벤트
  document.querySelector(".delete-button").addEventListener("click", () => {
    // 삭제 누르면 선택된 로그 삭제하는 코드 써야함
  });
});

document.addEventListener("DOMContentLoaded", () => {
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
