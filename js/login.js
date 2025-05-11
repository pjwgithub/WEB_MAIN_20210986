const check_xss = (input) => {
    const DOMPurify = window.DOMPurify;
    const sanitizedInput = DOMPurify.sanitize(input);
    if (sanitizedInput !== input) {
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    return sanitizedInput;
};

function session_set() {
    if (sessionStorage) {
        const session_id = document.getElementById("typeEmailX").value;
        sessionStorage.setItem("Session_Storage_test", session_id);
        alert("세션 스토리지 생성: " + session_id);
    } else {
        alert("세션 스토리지 지원하지 않는 브라우저입니다.");
    }
}

function session_check() {
    if (window.location.pathname.includes('index_login.html')) {
        if (localStorage.getItem("isLoggedOut") === "true") {
            localStorage.removeItem("isLoggedOut");
            return;
        }
        if (sessionStorage.getItem("Session_Storage_test")) {
            alert("이미 로그인 되었습니다.");
            location.href = '../login/index_login.html';
        }
    }
}

function session_del() {
    if (sessionStorage) {
        sessionStorage.removeItem("Session_Storage_test");
        sessionStorage.clear();
        alert('로그아웃 버튼 클릭 확인 : 세션 스토리지를 삭제합니다.');
    } else {
        alert("세션 스토리지 지원 x");
    }
}

function logout() {
    localStorage.setItem("isLoggedOut", "true");
    session_del();
    location.href = '../index.html';
}

function login_failed() {
    let failCount = parseInt(getCookie('login_failed_cnt')) || 0;
    failCount++;
    setCookie('login_failed_cnt', failCount, 1);
    alert(`로그인 실패 횟수: ${failCount}`);

    if (failCount >= 3) {
        alert("로그인 3회 이상 실패. 로그인이 제한됩니다.");
        const loginBtn = document.getElementById("login_btn");
        if (loginBtn) {
            loginBtn.disabled = true;
        }
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
    document.cookie = escape(name) + "=" + escape(value) +
        "; expires=" + date.toUTCString() + "; path=/";
}

function getCookie(name) {
    const cookie = document.cookie;
    console.log("쿠키를 요청합니다.");
    if (cookie !== "") {
        const cookie_array = cookie.split("; ");
        for (const item of cookie_array) {
            const [cookie_name, cookie_value] = item.split("=");
            if (cookie_name.trim() === name) {
                return cookie_value;
            }
        }
    }
    return;
}

function init() {
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    const get_id = getCookie("id");
    if (get_id && emailInput) {
        emailInput.value = get_id;
        idsave_check.checked = true;
    }
    session_check();
}

const check_input = () => {
    const loginForm = document.getElementById('login_form');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const idsave_check = document.getElementById('idSaveCheck');

    alert('아이디, 패스워드를 체크합니다');

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    const sanitizedEmail = check_xss(emailValue);
    const sanitizedPassword = check_xss(passwordValue);

    if (emailValue === '') {
        alert('이메일을 입력하세요.');
        login_failed();
        return false;
    }

    if (passwordValue === '') {
        alert('비밀번호를 입력하세요.');
        login_failed();
        return false;
    }

    if (emailValue.length < 5 || emailValue.length > 10) {
        alert('아이디는 5~10글자의 형식을 유지해야합니다');
        login_failed();
        return false;
    }

    if (passwordValue.length < 12 || passwordValue.length > 15) {
        alert('비밀번호는 반드시 12~15글자의 형식을 유지해야 합니다.');
        login_failed();
        return false;
    }

    if (!sanitizedEmail || !sanitizedPassword) {
        login_failed();
        return false;
    }

    if (/(.)\1{2,}/.test(emailValue)) {
        alert('아이디에 동일한 문자가 3번 이상 반복되면 안 됩니다.');
        login_failed();
        return false;
    }

    if (/(\d{2,})[a-zA-Z가-힣]*\1/.test(emailValue)) {
        alert('아이디에 연속된 숫자 2자리 이상이 반복되면 안 됩니다.');
        login_failed();
        return false;
    }

    const hasUpperCase = /[A-Z]/.test(passwordValue);
    const hasLowerCase = /[a-z]/.test(passwordValue);
    if (!hasUpperCase || !hasLowerCase) {
        alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
        login_failed();
        return false;
    }

    const hasSpecialChar = /[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue);
    if (!hasSpecialChar) {
        alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
        login_failed();
        return false;
    }

    // 로그인 성공: 실패 카운트 초기화
    setCookie('login_failed_cnt', 0, 1);

    if (idsave_check.checked) {
        alert("쿠키를 저장합니다.", emailValue);
        setCookie("id", emailValue, 1);
        alert("쿠키 값 :" + emailValue);
    } else {
        setCookie("id", emailValue.value, 0);
    }

    console.log('이메일:', emailValue);
    console.log('비밀번호:', passwordValue);

    login_count(emailValue);
    session_set();
    loginForm.submit();
};

const loginOver = (obj) => {
    obj.src = "image/LOGO.png";
};

const loginOut = (obj) => {
    obj.src = "image/LOGO_2.jpg";
};

document.addEventListener('DOMContentLoaded', () => {
    const failCount = parseInt(getCookie('login_failed_cnt')) || 0;

    if (failCount >= 3) {
        const loginBtn = document.getElementById("login_btn");
        if (loginBtn) {
            loginBtn.disabled = true;
            alert(`현재 로그인 제한 상태입니다. 실패 횟수: ${failCount}`);
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
            const userId = document.getElementById("typeEmailX").value.trim();
            login_count(userId);
            check_input();
        }
    });
});
