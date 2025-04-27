import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form");
  const errorContainer = document.getElementById("error-container");
  const successContainer = document.getElementById("success-container");
  const adminBadge = document.getElementById("admin-badge");
  const admincheckbox = document.getElementById("is-admin");
  let isAdmin = false;

  // 관리자 확인
  api.auth.checkAuth().then((authData) => {
    isAdmin = authData.is_admin;

    if (!isAdmin) {
      form.classList.add("hidden");
      window.location.href = "/";
      return;
    } else {
      adminBadge.classList.remove("hidden");
      form.classList.remove("hidden");
    }
  });

  admincheckbox.addEventListener("change", () => {
    if (admincheckbox.checked) {
      document
        .querySelectorAll("input[name='subject']")
        .forEach((radio) => (radio.checked = false));
      document.getElementById("bank-account").value = "";
      document.getElementById("salary").value = "";
      document.getElementById("subject-group").classList.add("hidden");
      document.getElementById("bank-account-group").classList.add("hidden");
      document.getElementById("salary-group").classList.add("hidden");
    } else {
      document.getElementById("subject-group").classList.remove("hidden");
      document.getElementById("bank-account-group").classList.remove("hidden");
      document.getElementById("salary-group").classList.remove("hidden");
    }
  });

  // 폼 제출
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newUser = {};

    if (isAdmin) {
      const name = document.getElementById("name").value;
      const subject = document.querySelector(
        "input[name='subject']:checked"
      )?.value;
      const bankAccount = document.getElementById("bank-account").value;
      const salary = document.getElementById("salary").value;
      const is_admin = document.getElementById("is-admin").checked;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (is_admin && !name) {
        showError("모든 필드를 입력해주세요.");
        return;
      } else if (!is_admin && (!name || !subject || !bankAccount || !salary)) {
        showError("모든 필드를 입력해주세요.");
        return;
      }

      if (!password || password !== confirmPassword) {
        showError("비밀번호가 일치하지 않습니다.");
        return;
      }

      newUser.name = name;
      newUser.subject = subject || null;
      newUser.bank_account = bankAccount || null;
      newUser.salary = parseInt(salary) || null;
      newUser.is_admin = is_admin;
      newUser.password = password;
    }

    api.assistants
      .create(newUser)
      .then(() => {
        showSuccess("유저가 추가되었습니다.");
        // 필드 초기화
        document.getElementById("name").value = "";
        document
          .querySelectorAll("input[name='subject']")
          .forEach((radio) => (radio.checked = false));
        document.getElementById("bank-account").value = "";
        document.getElementById("salary").value = "";
        document.getElementById("is-admin").checked = false;
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
