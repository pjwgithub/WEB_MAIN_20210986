async function session_set() {
    let session_id = document.querySelector("#typeEmailX");
    let session_pass = document.querySelector("#typePasswordX");
    if (sessionStorage) {
        const en_text2 = await encrypt_text_gcm(session_pass.value);
        const en_text1 = encrypt_text_cbc(session_pass.value);

        sessionStorage.setItem("Session_Storage_id", session_id.value);
        sessionStorage.setItem("Session_Storage_pass", en_text1);  // CBC
        sessionStorage.setItem("Session_Storage_pass2", en_text2); // GCM
    } else {
        alert("로컬 스토리지 지원 x");
    }
}

async function init_logined() {
    if (sessionStorage) {
        decrypt_text_cbc();
        await decrypt_text_gcm();
    } else {
        alert("세션 스토리지 지원 x");
    }
}

// function session_get() { //세션 읽기
//     if (sessionStorage) {
//     return sessionStorage.getItem("Session_Storage_test");
//     } else {
//     alert("세션 스토리지 지원 x");
//     }
//     }
function session_get() { //세션 읽기
if (sessionStorage) {
return sessionStorage.getItem("Session_Storage_pass");
} else {
alert("세션 스토리지 지원 x");
}
}
function session_check() { //세션 검사
if (sessionStorage.getItem("Session_Storage_id")) {
alert("이미 로그인 되었습니다.");
location.href='../login/index_login.html'; // 로그인된 페이지로 이동
}
}