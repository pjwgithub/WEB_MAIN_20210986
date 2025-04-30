const check_xss = (input) => {
    // DOMPurify 라이브러리 로드 (CDN 사용)
    const DOMPurify = window.DOMPurify;
    // 입력 값을 DOMPurify로 sanitize
    const sanitizedInput = DOMPurify.sanitize(input);
    // Sanitized된 값과 원본 입력 값 비교
    if (sanitizedInput !== input) {
    // XSS 공격 가능성 발견 시 에러 처리
    alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
    return false;
    }
    // Sanitized된 값 반환
    return sanitizedInput;
    };

    const check_input = () => {
        const loginForm = document.getElementById('login_form');
        const loginBtn = document.getElementById('login_btn');
        const emailInput = document.getElementById('typeEmailX');
        const passwordInput = document.getElementById('typePasswordX');
        const c = '아이디, 패스워드를 체크합니다';
        alert(c);
    
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        
        // DOM 요소 대신 실제 문자열을 전달
        const sanitizedEmail = check_xss(emailValue);
        const sanitizedPassword = check_xss(passwordValue);
    
        if (emailValue === '') {
            alert('이메일을 입력하세요.');
            return false;
        }
        if (passwordValue === '') {
            alert('비밀번호를 입력하세요.');
            return false;
        }
        
        if (emailValue.length < 5 || emailValue.length > 10) {
            alert('이메일은 5~10자 사이로 입력해야 합니다.');
            return false;
        }
        if (passwordValue.length < 12 || passwordValue.length > 15) {
            alert('비밀번호는 12~15자 사이로 입력해야 합니다.');
            return false;
        }
        
        const hasSpecialChar = passwordValue.match(/[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/) !== null;
        if (!hasSpecialChar) {
            alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
            return false;
        }
        
        const hasUpperCase = passwordValue.match(/[A-Z]+/) !== null;
        const hasLowerCase = passwordValue.match(/[a-z]+/) !== null;
        if (!hasUpperCase || !hasLowerCase) {
            alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
            return false;
        }
        
        const repeatedPattern = /(.{3,})\1+/;
        if (repeatedPattern.test(emailValue) || repeatedPattern.test(passwordValue)) {
            alert('같은 문자열이 3글자 이상 반복되었습니다.');
            return false;
        }
        
        const repeatTwoDigits = /(\d{2})\1+/;
        if (repeatTwoDigits.test(emailValue) || repeatTwoDigits.test(passwordValue)) {
            alert('2자리 숫자가 반복되는 입력은 허용되지 않습니다.');
            return false;
        }
        
        if (!sanitizedEmail) {
            return false;
        }
        if (!sanitizedPassword) {
            return false;
        }
        
        console.log('이메일:', emailValue);
        console.log('비밀번호:', passwordValue);
        loginForm.submit();
    };
    
    document.getElementById("login_btn").addEventListener('click', check_input);