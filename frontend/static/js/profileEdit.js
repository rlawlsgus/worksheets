import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const form = document.getElementById("profile-form");
  const loadingElement = document.getElementById("loading");
  const errorContainer = document.getElementById("error-container");
  const successContainer = document.getElementById("success-container");
  const adminBadge = document.getElementById("admin-badge");
  let isAdmin = false;

  // 현재 사용자 정보와 권한 확인
  api.auth
    .checkAuth()
    .then((authData) => {
      // 현재 사용자 ID와 URL의 ID가 다르고 어드민도 아니면 접근 불가
      if (authData.user_id !== parseInt(id) && !authData.is_admin) {
        showError("접근 권한이 없습니다.");
        loadingElement.classList.add("hidden");
        return;
      }

      isAdmin = authData.is_admin;

      // 어드민이면 어드민 배지 표시
      if (isAdmin) {
        adminBadge.classList.remove("hidden");
      }

      // 어시스턴트 정보 로드
      return Promise.all([api.assistants.get(id), isAdmin]);
    })
    .then(([assistant, is_admin]) => {
      if (!assistant) return;

      // 폼에 데이터 채우기
      document.getElementById("name").value = assistant.name;
      document.getElementById("subject").value = assistant.subject;
      document.getElementById("bank-account").value = assistant.bank_account;
      document.getElementById("salary").value = assistant.salary;

      // 어드민이면 readonly 속성 제거
      if (is_admin) {
        document.getElementById("name").removeAttribute("readonly");
        document.getElementById("subject").removeAttribute("readonly");
        document.getElementById("bank-account").removeAttribute("readonly");
        document.getElementById("salary").removeAttribute("readonly");
      }

      // 로딩 상태 숨기기
      loadingElement.classList.add("hidden");
      // 폼 표시
      form.classList.remove("hidden");
    })
    .catch((error) => {
      showError(error.message);
      loadingElement.classList.add("hidden");
    });

  // 폼 제출 처리
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // 비밀번호 확인
    if (password && password !== confirmPassword) {
      showError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const updateData = {};

    // 업데이트할 데이터
    if (isAdmin) {
      const name = document.getElementById("name").value;
      const subject = document.getElementById("subject").value;
      const bankAccount = document.getElementById("bank-account").value;
      const salary = document.getElementById("salary").value;

      // 필수 필드 확인
      if (!name || !subject || !bankAccount || !salary) {
        showError("모든 필드를 입력해주세요.");
        return;
      }

      updateData.name = name;
      updateData.subject = subject;
      updateData.bank_account = bankAccount;
      updateData.salary = parseInt(salary);
    }
    if (password) {
      updateData.password = password;
    }

    // 빈 객체면 변경사항 없음
    if (Object.keys(updateData).length === 0) {
      showError("변경할 내용이 없습니다.");
      return;
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
