import { encrypt_text_cbc, decrypt_text_cbc } from './crypto.js';
import { encrypt_text_gcm, decrypt_text_gcm } from './crypto2.js';

export async function session_set() {
    const id = document.querySelector("#typeEmailX");
    const password = document.querySelector("#typePasswordX");
    const random = new Date();
    const obj = {
        id: id.value,
        otp: random
    }

    if (sessionStorage) {
        try {
            const objString = JSON.stringify(obj);
            const en_text_gcm_obj = await encrypt_text_gcm(objString);
            const en_text_cbc = encrypt_text_cbc(password.value);
            const en_text_gcm_pass = await encrypt_text_gcm(password.value);

            sessionStorage.setItem("Session_Storage_id", id.value);
            sessionStorage.setItem("Session_Storage_object", objString);
            sessionStorage.setItem("Session_Storage_pass", en_text_cbc);
            sessionStorage.setItem("Session_Storage_pass2", en_text_gcm_pass);
            console.log("Session_Storage_object: ", JSON.parse(objString)); // 객체 출력
            console.log("복호화된 값 2: ", id.value); // 아이디 출력
        } catch (error) {
            console.error("암호화 오류: ", error);
            alert("암호화 중 오류 발생!");
        }
    } else {
        alert("세션 스토리지 지원 x");
    }
}

export async function init_logined() {
    if (sessionStorage) {
        const cbcResult = await decrypt_text_cbc(); // await 추가
        const gcmResult = await decrypt_text_gcm(); // await 추가
        console.log("(CBC) 복호화된 값: ", cbcResult);
        console.log("(GCM) 복호화된 값: ", gcmResult);
    } else {
        alert("세션 스토리지 지원 x");
    }
}

export function session_get() {
    if (sessionStorage) {
        return sessionStorage.getItem("Session_Storage_pass");
    } else {
        alert("세션 스토리지 지원 x");
    }
}

export function session_check() {
    if (sessionStorage.getItem("Session_Storage_id")) {
        alert("이미 로그인 되었습니다.");
        location.href = '../login/index_login.html';
    }
}

export function session_del() {
    if (sessionStorage) {
        sessionStorage.removeItem("Session_Storage_id");
        sessionStorage.removeItem("Session_Storage_pass");
        sessionStorage.removeItem("Session_Storage_object");
        sessionStorage.removeItem("Session_Storage_pass2");
    } else {
        alert("세션 스토리지 지원 x");
    }
}