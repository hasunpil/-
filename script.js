const cells = document.querySelectorAll('.cell');
const scoreDisplay = document.getElementById('score');
const timeLeftDisplay = document.getElementById('time-left');
const startButton = document.getElementById('start-button');

let score = 0;
let timeLeft = 30;
let gameInterval; // 표정 변경 타이머
let countdownInterval; // 카운트다운 타이머
let isGameRunning = false;
const commonEmoji = '😊'; // 일반적인 표정
const oddEmoji = '😝';   // 엉뚱한 표정 (찾아야 할 것)

// 무작위로 하나의 칸에 엉뚱한 표정 배치
function placeOddOneOut() {
    if (!isGameRunning) return;

    // 모든 칸 초기화
    cells.forEach(cell => {
        cell.textContent = commonEmoji; // 모든 칸을 일반 표정으로 채움
        cell.classList.remove('odd-one-out');
        cell.style.cursor = 'default'; // 커서 초기화
        cell.onclick = null; // 기존 클릭 이벤트 제거
    });

    const randomIndex = Math.floor(Math.random() * cells.length);
    const oddCell = cells[randomIndex];

    oddCell.textContent = oddEmoji; // 엉뚱한 표정 배치
    oddCell.classList.add('odd-one-out');
    oddCell.style.cursor = 'pointer'; // 클릭 가능하게 커서 변경

    oddCell.onclick = function() {
        if (isGameRunning && this.classList.contains('odd-one-out')) {
            score++;
            scoreDisplay.textContent = score;
            placeOddOneOut(); // 맞추면 바로 다음 엉뚱한 표정 배치
        }
    };
}

// 게임 시작 함수
function startGame() {
    if (isGameRunning) return; // 이미 게임 중이면 다시 시작하지 않음

    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    isGameRunning = true;
    startButton.disabled = true; // 게임 시작 버튼 비활성화

    placeOddOneOut(); // 첫 엉뚱한 표정 배치

    // 게임 진행 타이머 (일정 시간마다 새로운 엉뚱한 표정 배치)
    gameInterval = setInterval(() => {
        // 만약 플레이어가 엉뚱한 표정을 제때 클릭하지 못했다면
        // 벌점을 주거나 그냥 다음 표정을 배치하도록 할 수 있습니다.
        // 여기서는 그냥 다음 표정을 배치하도록 합니다.
        placeOddOneOut();
    }, 1500); // 1.5초마다 새로운 엉뚱한 표정 등장

    // 카운트다운 타이머
    countdownInterval = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            clearInterval(gameInterval);
            isGameRunning = false;
            startButton.disabled = false; // 게임 시작 버튼 활성화
            cells.forEach(cell => { // 게임 종료 시 모든 칸 초기화
                cell.textContent = '';
                cell.classList.remove('odd-one-out');
                cell.style.cursor = 'default';
                cell.onclick = null;
            });
            alert(`게임 종료! 당신의 점수는 ${score}점 입니다!`);
        }
    }, 1000); // 1초마다 시간 감소
}

// 시작 버튼 클릭 이벤트
startButton.addEventListener('click', startGame);

// 초기 게임 로드 시 모든 칸 비우기
cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('odd-one-out');
    cell.style.cursor = 'default';
    cell.onclick = null;
});