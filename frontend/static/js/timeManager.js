export function initializeTimeBoxes() {
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
}
