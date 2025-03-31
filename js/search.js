document.addEventListener("DOMContentLoaded", function() {
    const searchBtn = document.getElementById("search_btn_msg");
    const searchInput = document.querySelector("input[type='search']");

    function search_message() {
        let message = "검색을 수행합니다!"; // let 변수를 활용하여 문자열 저장
        alert(message); // 변수를 출력
    }
    /*
    function search_message() {
        alert("검색 시작!");
    }

    function search_message() {
        alert("검색 고고!");
    }
    //함수가 중첩될 시 에러가 나는 것이 아닌 나중에 입력된 함수가 실행됨
    //(나중에 입력된 함수가 우선순위임)
    */

    // 버튼 클릭 시 실행
    if (searchBtn) {
        searchBtn.addEventListener('click', search_message);
    }

    // 엔터 키 입력 시 실행
    if (searchInput) {
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                event.preventDefault(); // 폼 제출 방지
                search_message();
            }
        });
    }
});