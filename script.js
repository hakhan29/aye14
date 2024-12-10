const video = document.getElementById('video');
const expressionDiv = document.getElementById('expression');
const colorBox = document.getElementById('colorBox');
const clickText = document.getElementById('clickText');
const title = document.querySelector('h1');
const subtitle = document.querySelector('p');
const emotionResult = document.getElementById('emotionResult');
const mainEmotionText = document.getElementById('mainEmotion');
const finalColorBox = document.getElementById('finalColorBox');
const emotionReadingText = document.createElement('p'); // "감정 읽는 중..." 텍스트
let finalColor = '';
let mainEmotion = '';

// 감정별 추천 문구
const emotionMessages = {
    anger: "화가 날 땐 잠시 심호흡을 해보세요. 마음을 차분히 가다듬으면 새로운 시야가 열립니다.",
    happy: "행복한 순간을 마음껏 만끽하세요! 이 순간을 사진으로 남겨보는 건 어떨까요?",
    sad: "슬플 땐 감정을 충분히 느껴보세요. 하지만 곧 더 나은 날이 올 거예요.",
    neutral: "지금의 차분함을 유지하며 스스로에게 집중해보는 시간을 가져보세요.",
    surprised: "놀랐다면, 그 놀라움을 즐겨보세요! 새로운 경험이 당신을 기다리고 있어요.",
    fear: "두려움을 느낄 땐 스스로를 믿으세요. 당신은 충분히 이겨낼 수 있습니다.",
};

// 감정별 RGB 컬러 설정
const emotionColors = {
    anger: [255, 0, 0],        // 빨강
    happy: [255, 255, 0],      // 노랑
    sad: [0, 0, 255],          // 파랑
    neutral: [255, 255, 255],  // 흰색
    surprised: [255, 165, 0],  // 주황
    fear: [128, 0, 128],       // 보라
};

// 감정별 음악 객체 생성
const audioMap = {
    anger: new Audio('./audio/anger.mp3'),
    happy: new Audio('./audio/happy.mp3'),
    sad: new Audio('./audio/sad.mp3'),
    neutral: new Audio('./audio/neutral.mp3'),
    surprised: new Audio('./audio/surprised.mp3'),
    fear: new Audio('./audio/fear.mp3'),
};

// 초기 상태: 클릭 텍스트를 필요할 때만 표시
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        clickText.style.display = 'block';
    }, 2000);
});

// 클릭 시 이벤트
clickText.addEventListener('click', () => {
    clickText.style.display = 'none';

    // 모든 음악을 볼륨 0으로 재생
    Object.values(audioMap).forEach(audio => {
        audio.volume = 0;
        audio.loop = true;
        audio.play();
    });

    title.style.display = 'none';
    subtitle.textContent = "잠시 후 카메라가 켜집니다. 카메라를 보며 담고 싶은 감정을 표정으로 드러내주세요.";
    setTimeout(() => {
        subtitle.style.display = 'none';
        startVideo();
        video.style.display = 'block';
        colorBox.style.display = 'block';
        expressionDiv.style.display = 'block';

        // 감정 읽는 중... 메시지 표시
        emotionReadingText.textContent = "감정 읽는 중...";
        emotionReadingText.style.textAlign = 'center';
        emotionReadingText.style.marginTop = '20px';
        expressionDiv.appendChild(emotionReadingText);

        // 7초 후 컬러와 메인 감정을 저장하고 카메라 종료
        setTimeout(() => {
            stopVideo();
            showFinalResult();
        }, 7000); // 카메라 시간 7초로 설정
    }, 3000);
});

// 모델 파일 로드
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error(err));
}

function stopVideo() {
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());
    video.srcObject = null;
}

function showFinalResult() {
    video.style.display = 'none';
    colorBox.style.display = 'none';
    expressionDiv.style.display = 'none';
    emotionReadingText.style.display = 'none'; // "감정 읽는 중..." 메시지 숨기기

    emotionResult.style.display = 'block';
    finalColorBox.style.width = '400px';
    finalColorBox.style.height = '200px';
    finalColorBox.style.margin = '20px auto';
    finalColorBox.style.background = finalColor;

    mainEmotionText.textContent = mainEmotion;

    adjustMusicVolume(mainEmotion);

    setTimeout(() => {
        createInputSection();
    }, 1000);
}

function adjustMusicVolume(emotion) {
    Object.values(audioMap).forEach(audio => {
        audio.volume = 0;
    });

    const targetAudio = audioMap[emotion];
    if (targetAudio) {
        targetAudio.volume = 1.0;
    }
}

function createInputSection() {
    const inputSection = document.createElement('div');
    inputSection.style.textAlign = 'center';
    inputSection.style.marginTop = '20px';

    const dateNow = new Date();
    const formattedDate = `${dateNow.getFullYear()}년 ${dateNow.getMonth() + 1}월 ${dateNow.getDate()}일`;

    const dateText = document.createElement('p');
    dateText.textContent = formattedDate;
    inputSection.appendChild(dateText);

    const inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.placeholder = '이름을 입력하세요';
    inputBox.style.marginRight = '10px';

    const inputButton = document.createElement('button');
    inputButton.textContent = '입력하기';
    inputButton.addEventListener('click', () => handleInputSubmit(inputBox.value, formattedDate));

    inputSection.appendChild(inputBox);
    inputSection.appendChild(inputButton);

    const guideText = document.createElement('p');
    guideText.textContent = "이름을 입력하여 이 감정을 기록해보세요.";
    guideText.style.marginTop = '10px';

    inputSection.appendChild(guideText);

    emotionResult.appendChild(inputSection);
}

function resetToStart() {
    emotionResult.innerHTML = '';
    clickText.style.display = 'block';
    title.style.display = 'block';
    subtitle.style.display = 'block';
    subtitle.textContent = '당신의 감정을 확인해보세요.';

    Object.values(audioMap).forEach(audio => {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
    });

    finalColor = '';
    mainEmotion = '';

    // 감정 색상과 메인 감정 초기화
    colorBox.style.background = '#FFFFFF';
    expressionDiv.textContent = '';
}

function handleInputSubmit(name, date) {
    emotionResult.innerHTML = '';

    const recordSection = document.createElement('div');
    recordSection.style.textAlign = 'center';

    const dateText = document.createElement('p');
    dateText.textContent = date;
    dateText.style.marginBottom = '20px';
    recordSection.appendChild(dateText);

    const emotionTitle = document.createElement('h2');
    emotionTitle.textContent = `${name}의 감정`;
    emotionTitle.style.marginBottom = '20px';
    recordSection.appendChild(emotionTitle);

    const colorBox = document.createElement('div');
    colorBox.style.width = '400px';
    colorBox.style.height = '200px';
    colorBox.style.background = finalColor;
    colorBox.style.margin = '0 auto 20px';
    recordSection.appendChild(colorBox);

    const emotionText = document.createElement('p');
    emotionText.textContent = mainEmotion;
    emotionText.style.fontSize = '1.5rem';
    emotionText.style.marginBottom = '10px';
    recordSection.appendChild(emotionText);

    const messageText = document.createElement('p');
    messageText.textContent = emotionMessages[mainEmotion] || "감정과 관련된 추천 문구가 없습니다.";
    recordSection.appendChild(messageText);

    const resetButton = document.createElement('button');
    resetButton.textContent = '처음으로 돌아가기';
    resetButton.style.marginTop = '20px';
    resetButton.addEventListener('click', resetToStart);

    recordSection.appendChild(resetButton);

    emotionResult.appendChild(recordSection);
}

video.addEventListener('play', () => {
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        if (detections.length > 0) {
            const expressions = detections[0].expressions;
            const colors = { r: 0, g: 0, b: 0 };

            // 비율에 따른 RGB 값 조합
            for (const [emotion, value] of Object.entries(expressions)) {
                if (emotionColors[emotion]) {
                    const [r, g, b] = emotionColors[emotion];
                    colors.r += r * value;
                    colors.g += g * value;
                    colors.b += b * value;
                }
            }

            finalColor = `rgb(${Math.round(colors.r)}, ${Math.round(colors.g)}, ${Math.round(colors.b)})`;
            mainEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            colorBox.style.background = finalColor;
            expressionDiv.textContent = `현재 감정: ${mainEmotion}`;
        }
    }, 100);
});
