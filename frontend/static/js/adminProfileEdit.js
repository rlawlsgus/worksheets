import { api } from "./api.js";
import { CustomModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("profile-form");
  const deleteButton = document.getElementById("delete-user-button");
  const loadingElement = document.getElementById("loading");
  const errorContainer = document.getElementById("error-container");
  const successContainer = document.getElementById("success-container");
  let id = null;

  function initializeProfileEdit() {
    api.auth
      .checkAuth()
      .then((authData) => {
        if (!authData.is_admin) {
          showError("어드민만 접근할 수 있습니다.");
          loadingElement.classList.add("hidden");
          return;
        }

        id = authData.user_id;

        api.assistants
          .get(id)
          .then((user) => {
            document.getElementById("name").value = user.name;

            loadingElement.classList.add("hidden");

            form.classList.remove("hidden");
            document
              .getElementById("delete-user-group")
              .classList.remove("hidden");
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
  }

  initializeProfileEdit();

  // 폼 제출
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!name) {
      showError("모든 필드를 입력해주세요.");
      return;
    }

    if (password && password !== confirmPassword) {
      showError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const updateData = {
      name: name,
    };

    if (password) {
      updateData.password = password;
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

  deleteButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const confirmed = await CustomModal.confirm(
      "정말로 이 관리자 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (confirmed) {
      api.assistants
        .delete(id)
        .then(async () => {
          await CustomModal.alert("계정이 성공적으로 삭제되었습니다.");
          window.location.href = "/login";
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
