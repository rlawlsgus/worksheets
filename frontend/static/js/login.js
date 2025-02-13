import { api } from "./api.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  try {
    const response = await api.auth.login(username, password);
    if (response.success) {
      window.location.href = response.redirect;
    } else {
      errorMessage.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    }
  } catch (error) {
    errorMessage.textContent = "서버와의 통신 중 오류가 발생했습니다.";
  }
});
