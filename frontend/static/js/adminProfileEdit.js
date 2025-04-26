import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("profile-form");
  const loadingElement = document.getElementById("loading");
  const errorContainer = document.getElementById("error-container");
  const successContainer = document.getElementById("success-container");
  const adminBadge = document.getElementById("admin-badge");

  // 현재 사용자 정보와 어드민 권한 확인
  api.auth
    .checkAuth()
    .then((authData) => {
      // 어드민이 아니면 접근 불가
      if (!authData.is_admin) {
        showError("어드민만 접근할 수 있습니다.");
        loadingElement.classList.add("hidden");
        return;
      }

      const isAdmin = authData.is_admin;
      const id = authData.user_id;

      // 어드민이면 어드민 배지 표시
      if (isAdmin) {
        adminBadge.classList.remove("hidden");
      }

      // 어시스턴트 정보 로드
      api.assistants
        .get(id)
        .then((user) => {
          // 폼에 데이터 채우기
          document.getElementById("name").value = user.name;

          // 로딩 상태 숨기기
          loadingElement.classList.add("hidden");
          // 폼 표시
          form.classList.remove("hidden");
        })
        .catch((error) => {
          showError(error.message);
          loadingElement.classList.add("hidden");
        });
    })
    .catch((error) => {
      showError(error.message);
      loadingElement.classList.add("hidden");
    });

  // 폼 제출 처리
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // 필수 필드 확인
    if (!name) {
      showError("모든 필드를 입력해주세요.");
      return;
    }

    // 비밀번호 확인
    if (password && password !== confirmPassword) {
      showError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 업데이트할 데이터
    const updateData = {
      name: name,
    };

    if (password) {
      updateData.password = password;
    }

    // API 호출
    api.assistants
      .update(id, updateData)
      .then(() => {
        showSuccess("프로필이 성공적으로 업데이트되었습니다.");
        // 비밀번호 필드 초기화
        document.getElementById("password").value = "";
        document.getElementById("confirm-password").value = "";
      })
      .catch((error) => {
        showError(error.message);
      });
  });

  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");
    successContainer.classList.add("hidden");
  }

  function showSuccess(message) {
    successContainer.textContent = message;
    successContainer.classList.remove("hidden");
    errorContainer.classList.add("hidden");
  }
});
