import {encrypt_text as encrypt_text_cbc, decrypt_text as decrypt_text_cbc} from './crypto.js';
import {encrypt_text as encrypt_text_gcm, decrypt_text as decrypt_text_gcm} from './crypto2.js';
import {generateJWT, checkAuth} from './jwt_token.js';
import {session_set, session_set2, session_get, session_check, decrypt_signup_info_if_exists} from './session.js';

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
            try {
                const parsed = JSON.parse(cbcDecrypted);
                console.log("\n복호화된 값 (CBC):", parsed.id);
            } catch (e) {
                console.warn("CBC JSON 파싱 실패:", e);
            }
        }
        const gcmDecrypted = await decrypt_text_gcm();
        if (gcmDecrypted) {
            try {
                const parsed = JSON.parse(gcmDecrypted);
                console.log("\n복호화된 값 (GCM):", parsed.id);
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
        if (loginBtn) 
            loginBtn.disabled = true;
        
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
    const date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = `${
        escape(name)
    }=${
        escape(value)
    }; expires=${
        date.toUTCString()
    }; path=/`;
}
function getCookie(name) {
    const cookie = document.cookie;
    if (cookie !== "") {
        const cookie_array = cookie.split("; ");
        for (const pair of cookie_array) {
            const [cookie_name, cookie_value] = pair.split("=");
            if (cookie_name.trim() === name) 
                return cookie_value;
            
        }
    }
    return;
}
function init() {
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    if (! emailInput || ! idsave_check) {
        console.warn("필수 입력 요소가 없습니다. init() 중단");
        return;
    }
    const get_id = getCookie("id");
    if (get_id) {
        emailInput.value = get_id;
        idsave_check.checked = true;
    }
    session_check();
}
const check_input = async () => {
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const idsave_check = document.getElementById('idSaveCheck');
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const sanitizedEmail = check_xss(emailValue);
    const sanitizedPassword = check_xss(passwordValue);
    if (! emailValue || ! passwordValue || ! sanitizedEmail || ! sanitizedPassword) {
        alert('입력값 부족');
        login_failed();
        return;
    }
    if (idsave_check.checked) {
        setCookie("id", emailValue, 1);
    } else {
        setCookie("id", emailValue, 0);
    } login_count(emailValue);
    sessionStorage.setItem("Session_Storage_test", emailValue);
    sessionStorage.setItem("Session_Storage_pass", passwordValue);
    await decrypt_signup_info_if_exists();
    const result = await session_set();
    if (! result) {
        alert("로그인 실패: 회원가입 정보가 없거나 일치하지 않습니다.");
        login_failed();
        return;
    }
    const payload = {
        id: emailValue,
        exp: Math.floor(Date.now() / 1000) + 3600
    };
    const jwtToken = generateJWT(payload);
    console.log("생성된 JWT:", jwtToken);
    localStorage.setItem('jwt_token', jwtToken);
    await init_logined();
    location.href = "../login/index_login.html";
};
document.addEventListener('DOMContentLoaded', () => {
    init_logined();
    const loginBtn = document.getElementById("login_btn");
    if (loginBtn) 
        loginBtn.addEventListener('click', check_input);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const emailInput = document.getElementById("typeEmailX");
            if (! emailInput) 
                return;
            
            login_count(emailInput.value.trim());
            check_input();
        }
    });
});