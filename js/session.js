import {encrypt_text as encrypt_text_cbc} from './crypto.js';
import {decrypt_text as decrypt_text_cbc} from './crypto.js';
import {encrypt_text as encrypt_text_gcm} from './crypto2.js';
import {decrypt_text as decrypt_text_gcm} from './crypto2.js';

// 로그인 후 세션 저장 (회원가입 정보 배열과 비교 후 로그인 처리)
async function session_set() {
    try {
        console.log("session_set 시작");
        const id = document.querySelector("#typeEmailX");
        const password = document.querySelector("#typePasswordX");
        if (! id || ! password) {
            console.warn("ID 또는 비밀번호 입력 필드가 없습니다. 세션 저장 중단");
            return false;
        }
        const encryptedSignupList = sessionStorage.getItem("signup_data_list_cbc");
        if (! encryptedSignupList) {
            alert("회원가입 정보가 없습니다. 먼저 회원가입을 해주세요.");
            return false;
        }
        const decryptedListStr = decrypt_text_cbc(encryptedSignupList);
        const signupList = JSON.parse(decryptedListStr);
        const match = signupList.find(user => user.email === id.value && user.password === password.value);
        if (! match) {
            alert("아이디(이메일) 또는 비밀번호가 일치하지 않습니다.");
            return false;
        }
        const obj = {
            id: id.value,
            otp: new Date()
        };
        const objString = JSON.stringify(obj);
        const encrypted_cbc = encrypt_text_cbc(objString);
        const encrypted_gcm = await encrypt_text_gcm(objString);
        sessionStorage.setItem("Session_Storage_id", id.value);
        sessionStorage.setItem("Session_Storage_object", objString);
        sessionStorage.setItem("Session_Storage_pass_cbc", encrypted_cbc);
        sessionStorage.setItem("Session_Storage_pass_gcm", encrypted_gcm);
        console.log("세션 저장 완료: Session_Storage_id =", id.value);
        return true;
    } catch (error) {
        console.error("session_set 오류:", error);
        return false;
    }
}
// 회원가입 시 정보 리스트에 추가
async function session_set2(signUpObj) {
    try {
        const newUser = signUpObj.getUserInfo();
        let signupList = [];
        const encryptedOldList = sessionStorage.getItem("signup_data_list_cbc");
        if (encryptedOldList) {
            const decryptedOldList = decrypt_text_cbc(encryptedOldList);
            signupList = JSON.parse(decryptedOldList);
            const exists = signupList.some(user => user.email === newUser.email);
            if (exists) {
                alert("이미 등록된 이메일입니다.");
                return;
            }
        }
        signupList.push(newUser);
        const listStr = JSON.stringify(signupList);
        const encrypted_cbc = encrypt_text_cbc(listStr);
        const encrypted_gcm = await encrypt_text_gcm(listStr);
        sessionStorage.setItem("signup_data_list_cbc", encrypted_cbc);
        sessionStorage.setItem("signup_data_list_gcm", encrypted_gcm);
        console.log("회원 리스트 CBC 암호화:", encrypted_cbc);
        console.log("회원 리스트 GCM 암호화:", encrypted_gcm);
    } catch (error) {
        console.error("session_set2 오류:", error);
    }
}
// 회원가입 전체 목록 복호화 확인용
async function decrypt_signup_info_if_exists() {
    console.log("회원가입 복호화 시작");
    const encrypted_cbc = sessionStorage.getItem("signup_data_list_cbc");
    const encrypted_gcm = sessionStorage.getItem("signup_data_list_gcm");
    if (! encrypted_cbc || ! encrypted_gcm) {
        console.warn("세션에 회원가입 정보 없음. 복호화 생략");
        return;
    }
    try {
        const decrypted_cbc = decrypt_text_cbc(encrypted_cbc);
        const decrypted_gcm = await decrypt_text_gcm(encrypted_gcm);
        console.log("회원가입 CBC 복호화:", decrypted_cbc);
        console.log("회원가입 GCM 복호화:", decrypted_gcm);
    } catch (error) {
        console.error("회원가입 복호화 실패:", error);
    }
}
function session_get() {
    if (sessionStorage) {
        return sessionStorage.getItem("Session_Storage_pass_cbc");
    } else {
        alert("세션 스토리지 지원 x");
    }
}
function session_check() {
    if (sessionStorage.getItem("Session_Storage_id")) {
        alert("이미 로그인 되었습니다.");
        location.href = '../index_login.html';
    }
}
export {
    session_set,
    session_set2,
    session_get,
    session_check,
    decrypt_signup_info_if_exists
};