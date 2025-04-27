import { api } from "./api.js";
import { CustomModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const form = document.getElementById("profile-form");
  const deleteButton = document.getElementById("delete-user-button");
  const loadingElement = document.getElementById("loading");
  const errorContainer = document.getElementById("error-container");
  const successContainer = document.getElementById("success-container");
  const adminBadge = document.getElementById("admin-badge");
  let isAdmin = false;

  // 사용자 및 관리자 확인
  function initializeProfileEdit() {
    api.auth
      .checkAuth()
      .then((authData) => {
        if (authData.user_id !== parseInt(id) && !authData.is_admin) {
          showError("접근 권한이 없습니다.");
          loadingElement.classList.add("hidden");
          return;
        }

        isAdmin = authData.is_admin;

        if (isAdmin) {
          adminBadge.classList.remove("hidden");
          document
            .getElementById("delete-user-group")
            .classList.remove("hidden");
        }

        return Promise.all([api.assistants.get(id), isAdmin]);
      })
      .then(([assistant, is_admin]) => {
        if (!assistant) return;

        document.getElementById("name").value = assistant.name;
        document.querySelectorAll('input[name="subject"]').forEach((radio) => {
          if (radio.value === assistant.subject) {
            radio.checked = true;
          }
        });
        document.getElementById("bank-account").value = assistant.bank_account;
        document.getElementById("salary").value = assistant.salary;

        if (is_admin) {
          document.getElementById("name").removeAttribute("readonly");
          document
            .querySelectorAll('input[name="subject"]')
            .forEach((radio) => {
              radio.removeAttribute("readonly");
              radio.removeAttribute("disabled");
            });
          document.getElementById("bank-account").removeAttribute("readonly");
          document.getElementById("salary").removeAttribute("readonly");
        }

        loadingElement.classList.add("hidden");
        form.classList.remove("hidden");
      })
      .catch((error) => {
        showError(error.message);
        loadingElement.classList.add("hidden");
      });
  }

  initializeProfileEdit();

  // 폼 제출
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    const updateData = {};

    if (isAdmin) {
      const name = document.getElementById("name").value;
      const subject = document.querySelector(
        "input[name='subject']:checked"
      )?.value;
      const bankAccount = document.getElementById("bank-account").value;
      const salary = document.getElementById("salary").value;

      if (!name || !subject || !bankAccount || !salary) {
        showError("모든 필드를 입력해주세요.");
        return;
      }

      updateData.name = name;
      updateData.subject = subject;
      updateData.bank_account = bankAccount;
      updateData.salary = parseInt(salary);
    }
    if (password && password !== confirmPassword) {
      showError("비밀번호가 일치하지 않습니다.");
      return;
    } else if (password) {
      updateData.password = password;
    }

    if (Object.keys(updateData).length === 0) {
      showError("변경할 내용이 없습니다.");
      return;
    }

    api.assistants
      .update(id, updateData)
      .then(() => {
        showSuccess("프로필이 성공적으로 업데이트되었습니다.");
        initializeProfileEdit();
        document.getElementById("password").value = "";
        document.getElementById("confirm-password").value = "";
      })
      .catch((error) => {
        showError(error.message);
      });
  });

  deleteButton?.addEventListener("click", async (e) => {
    e.preventDefault();
    const confirmed = await CustomModal.confirm(
      "정말로 유저를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (confirmed) {
      api.assistants
        .delete(id)
        .then(async () => {
          await CustomModal.alert("유저가 성공적으로 삭제되었습니다.");
          window.location.href = "/";
        })
        .catch((error) => {
          showError(error.message);
        });
    }
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
