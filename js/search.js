// function search_message(){
//     let m = "검색을 수행합니다!"
//     alert(m);
// }
const search_message = () => {
    const c = "검색을 수행합니다";
    alert(c);
}

document.getElementById("search_button_msg").addEventListener('click', search_message);

/*

function search_message(){
    alert("검색을 수행합니다!2222");
} 
// 같은 이름의 함수를 중첩하면 에러가 아닌 더 나중에 선언된 함수가 실행됨

*/

function googleSearch() {
    const searchTerm = document.getElementById("search_input").value; // 검색어로 설정

    let word = ["바보", "멍청이", "병신", "미친", "지랄"]; // 비속어 배열

    if (searchTerm === "") {
        alert("문자를 입력해주세요.");
        return false;
    } // 공백 검사

    for (let i = 0; i < word.length; i++) {
        if (searchTerm.includes(word[i])) {
            alert("비속어가 포함되어있습니다.");
            return false;
        }
    } // 비속어 검사

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    // 새 창에서 구글 검색을 수행
    window.open(googleSearchUrl, "_blank"); // 새로운 창에서 열기
    return false;
}