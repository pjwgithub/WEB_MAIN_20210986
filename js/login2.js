import { encrypt_text as encrypt_text_cbc, decrypt_text as decrypt_text_cbc } from './crypto.js';
import { encrypt_text as encrypt_text_gcm, decrypt_text as decrypt_text_gcm } from './crypto2.js';
import { generateJWT, checkAuth } from './jwt_token.js';
import { session_set, session_set2, session_get, session_check, decrypt_signup_info_if_exists } from './session.js';

const check_xss = (input) => {
  const DOMPurify = window.DOMPurify;
  const sanitizedInput = DOMPurify.sanitize(input);
  if (sanitizedInput !== input) {
    alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
    return false;
  }
  return sanitizedInput;
};

function session_del() {
  if (sessionStorage) {
    sessionStorage.removeItem("Session_Storage_test");
    sessionStorage.clear();
    alert('로그아웃: 세션 삭제 완료');
  } else {
    alert("세션 스토리지 지원 x");
  }
}

async function init_logined() {
  if (sessionStorage) {
    const cbcDecrypted = decrypt_text_cbc();
    if (cbcDecrypted) {
      console.log("\n복호화된 CBC JSON:", cbcDecrypted);
      try {
        const parsed = JSON.parse(cbcDecrypted);
        console.log("\n복호화된 값 :", parsed.id);
      } catch (e) {
        console.warn("CBC JSON 파싱 실패:", e);
      }
    }

    const gcmDecrypted = await decrypt_text_gcm();
    if (gcmDecrypted) {
      console.log("\n복호화된 GCM JSON:", gcmDecrypted);
      try {
        const parsed = JSON.parse(gcmDecrypted);
        console.log("\n복호화된 값 :", parsed.id);
      } catch (e) {
        console.warn("GCM JSON 파싱 실패:", e);
      }
    }
  } else {
    alert("세션 스토리지 지원 x");
  }
}

function logout() {
  localStorage.setItem("isLoggedOut", "true");
  session_del();
  localStorage.removeItem("jwt_token");
  location.href = '../index.html';
}

function login_failed() {
  let failCount = parseInt(getCookie('login_failed_cnt')) || 0;
  failCount++;
  setCookie('login_failed_cnt', failCount, 1);
  alert(`로그인 실패 횟수: ${failCount}`);
  if (failCount >= 3) {
    alert("로그인 3회 이상 실패. 제한됩니다.");
    const loginBtn = document.getElementById("login_btn");
    if (loginBtn) loginBtn.disabled = true;
  }
}

function login_count(userId) {
  let count = parseInt(getCookie(`login_cnt_${userId}`)) || 0;
  count++;
  setCookie(`login_cnt_${userId}`, count, 7);
  console.log(`로그인 카운트 (${userId}): ${count}`);
}

function logout_count(userId) {
  let count = parseInt(getCookie(`logout_cnt_${userId}`)) || 0;
  count++;
  setCookie(`logout_cnt_${userId}`, count, 7);
  console.log(`로그아웃 카운트 (${userId}): ${count}`);
}

function setCookie(name, value, expiredays) {
  var date = new Date();
  date.setDate(date.getDate() + expiredays);
  document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString() + "; path=/";
}

function getCookie(name) {
  var cookie = document.cookie;
  if (cookie !== "") {
    var cookie_array = cookie.split("; ");
    for (var index in cookie_array) {
      var cookie_name = cookie_array[index].split("=");
      if (cookie_name[0].trim() === name) return cookie_name[1];
    }
  }
  return;
}

function init() {
  const emailInput = document.getElementById('typeEmailX');
  const idsave_check = document.getElementById('idSaveCheck');

  if (!emailInput || !idsave_check) {
    console.warn("필수 입력 요소가 없습니다. init() 중단");
    return;
  }

  const payload = {
    id: emailInput.value,
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const jwtToken = generateJWT(payload);
  localStorage.setItem('jwt_token', jwtToken);

  let get_id = getCookie("id");
  if (get_id) {
    emailInput.value = get_id;
    idsave_check.checked = true;
  }

  session_check();
}

const check_input = async () => {
  const loginForm = document.getElementById('login_form');
  const emailInput = document.getElementById('typeEmailX');
  const passwordInput = document.getElementById('typePasswordX');
  const idsave_check = document.getElementById('idSaveCheck');

  if (!emailInput || !passwordInput || !idsave_check) {
    alert("입력 요소가 누락되었습니다.");
    return false;
  }

  alert('아이디와 비밀번호를 확인 중');

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  const sanitizedEmail = check_xss(emailValue);
  const sanitizedPassword = check_xss(passwordValue);

  if (!emailValue || !passwordValue || !sanitizedEmail || !sanitizedPassword) {
    alert('아이디와 비밀번호를 입력해주세요.');
    login_failed();
    return false;
  }

  if (emailValue.length < 5 || emailValue.length > 10) {
    alert('아이디는 5~10자의 조건을 만족해야합니다.');
    login_failed();
    return false;
  }
  if (passwordValue.length < 12 || passwordValue.length > 15) {
    alert('비밀번호는 12~15자의 조건을 만족해야합니다.');
    login_failed();
    return false;
  }
  if (/(.)\1{2,}/.test(emailValue)) {
    alert('아이디에 동일 문자 3회 이상이면 안됩니다.');
    login_failed();
    return false;
  }
  if (/(\d{2,})[a-zA-Z가-힣]*\1/.test(emailValue)) {
    alert('아이디에 연속된 숫자 반복 불가합니다.');
    login_failed();
    return false;
  }
  if (!/[A-Z]/.test(passwordValue) || !/[a-z]/.test(passwordValue)) {
    alert('비밀번호에 대소문자 포함 필요합니다.');
    login_failed();
    return false;
  }
  if (!/[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue)) {
    alert('비밀번호에 특수문자 필요합니다.');
    login_failed();
    return false;
  }

  if (idsave_check.checked) {
    alert(`쿠키 저장: ${emailValue}`);
    setCookie("id", emailValue, 1);
  } else {
    setCookie("id", emailValue, 0);
  }

  login_count(emailValue);

  sessionStorage.setItem("Session_Storage_test", emailValue);
  sessionStorage.setItem("Session_Storage_pass", passwordValue);

  await decrypt_signup_info_if_exists();
  await session_set();
  await init_logined();

  // loginForm.submit(); // 필요 시 주석 해제
};

const loginOver = (obj) => {
  obj.src = "image/LOGO.png";
};

const loginOut = (obj) => {
  obj.src = "image/LOGO_2.jpg";
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  init_logined();

  const failCount = parseInt(getCookie('login_failed_cnt')) || 0;
  if (failCount >= 3) {
    const loginBtn = document.getElementById("login_btn");
    if (loginBtn) {
      loginBtn.disabled = true;
      alert(`로그인 제한 중: ${failCount}회 실패`);
    }
  }

  const loginBtn = document.getElementById("login_btn");
  if (loginBtn) {
    loginBtn.addEventListener('click', check_input);
  }

  const logoutBtn = document.getElementById("logout_btn");
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      const userId = sessionStorage.getItem("Session_Storage_test");
      logout_count(userId);
      logout();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const emailInput = document.getElementById("typeEmailX");
      if (!emailInput) {
        console.warn("Enter 입력 시 'typeEmailX' 요소가 존재하지 않습니다.");
        return;
      }
      const userId = emailInput.value.trim();
      login_count(userId);
      check_input();
    }
  });

  const emailInput = document.getElementById('typeEmailX');
  const idsave_check = document.getElementById('idSaveCheck');
  if (emailInput && idsave_check) {
    init();
  }
});
