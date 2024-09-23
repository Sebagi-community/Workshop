$(document).ready(function() {
    const $chatbox = $('.chatbox');
    const $chatForm = $('#chatForm');
    const $messages = $('#messages');
    const $userInput = $('#userInput');
    const $chatButton = $('#chatButton');
    const $closeChatboxButton = $('#closeChatbox');
    const $voiceInputButton = $('#voiceInputButton');
    const $toggleChatboxSizeButton = $('#toggleChatboxSize');

    // 챗봇 박스 표시/숨기기 및 chat-button 숨기기
    $chatButton.on('click', function() {
        $chatbox.toggleClass('show');
        $chatButton.toggle(!$chatbox.hasClass('show'));
    });

    // 챗봇 박스 크기 변경
    $toggleChatboxSizeButton.on('click', function() {
        $('.chatbox, .chatbox-body').toggleClass('full');
    });

    // 챗봇 박스 닫기 및 chat-button 표시
    $closeChatboxButton.on('click', function() {
        $chatbox.removeClass('show');
        $chatButton.show();
    });

    // 채팅 폼 제출 시 동작
    $chatForm.on('submit', function(event) {
        event.preventDefault(); // 폼 제출 기본 동작 방지

        const message = $userInput.val().trim();
        if (message) {
            // 사용자 메시지를 채팅창에 추가
            addMessage('user-message', message);

            // 음성 인식 결과 서버에 전송
            $.post('/speech-to-text', { text: message }, function(response) {
                if (response.text) {
                    addMessage('bot-message', response.text);
                }
                if (response.titles && response.titles.length > 0) {
                    const titlesHtml = response.titles.map(title => `<li>${title}</li>`).join('');
                    addMessage('bot-message', `<ul>${titlesHtml}</ul>`);
                } else if (!response.titles) {
                    addMessage('bot-message', "검색 결과가 없습니다.");
                }
            }).fail(function() {
                addMessage('bot-message', "서버와의 통신 중 오류가 발생했습니다.");
            });

            // 입력 필드 초기화
            $userInput.val('');

            // 스크롤을 맨 아래로
            scrollToBottom();
        }
    });

    // 메시지 추가 함수
    function addMessage(className, text) {
        // 새로운 <div> 요소 생성
        const $messageDiv = $('<div>', {
            class: `message ${className}`
        });

        // 새로운 <span> 요소 생성 및 텍스트 삽입
        const $messageSpan = $('<span>').html(text);

        // <div>에 <span>을 추가
        $messageDiv.append($messageSpan);

        // <div>을 채팅창에 추가
        $messageDiv.appendTo($messages);

        // 새로운 메시지 추가 후 스크롤을 맨 아래로
        scrollToBottom();
    }

    // 스크롤을 맨 아래로 이동하는 함수
    function scrollToBottom() {
        $messages.scrollTop($messages[0].scrollHeight);
    }

    // 음성 인식 버튼 클릭 시 동작
    $voiceInputButton.on('click', function() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'ko-KR';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = function(event) {
                const voiceMessage = event.results[0][0].transcript;
                $userInput.val(voiceMessage);
                $chatForm.submit(); // 음성 입력 후 자동 제출
            };

            recognition.onerror = function(event) {
                console.error('음성 인식 오류:', event.error);
            };

            recognition.start();
        } else {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
        }
    });

	
});
