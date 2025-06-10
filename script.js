document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 선택
    const anonymousTabButton = document.querySelector('.tab-button[data-tab="anonymous"]');
    const memberTabButton = document.querySelector('.tab-button[data-tab="member"]');
    const anonymousPostForm = document.getElementById('anonymous-post-form');
    const memberPostForm = document.getElementById('member-post-form');

    const submitAnonymousPostButton = document.getElementById('submit-anonymous-post');
    const submitMemberPostButton = document.getElementById('submit-member-post');
    const bestPostListContainer = document.getElementById('best-post-list'); // 베스트 게시물 컨테이너
    const allPostListContainer = document.getElementById('all-post-list');   // 전체 게시물 컨테이너

    const BEST_THRESHOLD = 10; // 베스트 게시물 기준 (추천수 10개 이상)

    // 게시물 데이터 (임시 저장소, 실제 서비스에서는 서버 DB를 사용해야 합니다.)
    // 새로고침 시 데이터가 사라지므로, localStorage에 저장하여 유지합니다.
    let posts = JSON.parse(localStorage.getItem('galleryPosts')) || [];

    // 게시물 데이터를 localStorage에 저장하는 함수
    function savePosts() {
        localStorage.setItem('galleryPosts', JSON.stringify(posts));
    }

    // 탭 전환 기능
    anonymousTabButton.addEventListener('click', () => {
        anonymousTabButton.classList.add('active');
        memberTabButton.classList.remove('active');
        anonymousPostForm.classList.add('active');
        memberPostForm.classList.remove('active');
    });

    memberTabButton.addEventListener('click', () => {
        memberTabButton.classList.add('active');
        anonymousTabButton.classList.remove('active');
        memberPostForm.classList.add('active');
        anonymousPostForm.classList.remove('active');
    });

    // 단일 게시물 아이템을 생성하는 함수
    function createPostElement(post, index) {
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');
        postItem.dataset.id = index; // 게시물 고유 ID

        // 추천수가 베스트 기준을 넘으면 'best-post' 클래스 추가
        if (post.recommendations >= BEST_THRESHOLD) {
            postItem.classList.add('best-post');
        }

        let mediaHtml = '';
        if (post.media) {
            const mediaType = post.media.type.startsWith('image/') ? 'img' : 'video';
            mediaHtml = `
                <div class="media-container">
                    <${mediaType} src="${post.media.src}" ${mediaType === 'video' ? 'controls' : ''}></${mediaType}>
                </div>
            `;
        }

        postItem.innerHTML = `
            <h3>${post.title}</h3>
            <p class="author">${post.author}</p>
            ${mediaHtml}
            <p class="content">${post.content}</p>
            <div class="reactions">
                <button class="recommend-button">👍 추천 ${post.recommendations}</button>
                <button class="disrecommend-button">👎 비추천 ${post.disrecommendations}</button>
            </div>
            <div class="comments-section">
                <h4>댓글</h4>
                <div class="comment-list">
                    ${post.comments.map(comment => `
                        <div class="comment-item">
                            <p class="comment-author">${comment.author}:</p>
                            <p class="comment-content">${comment.content}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="comment-form">
                    <input type="text" class="comment-input" placeholder="댓글을 입력하세요.">
                    <button class="add-comment-button">댓글 달기</button>
                </div>
            </div>
        `;

        // 추천/비추천 이벤트 리스너 추가
        postItem.querySelector('.recommend-button').addEventListener('click', () => {
            post.recommendations++;
            savePosts(); // 변경사항 저장
            renderPosts(); // 다시 렌더링하여 베스트 글 여부 업데이트
        });

        postItem.querySelector('.disrecommend-button').addEventListener('click', () => {
            post.disrecommendations++;
            savePosts(); // 변경사항 저장
            renderPosts(); // 다시 렌더링하여 베스트 글 여부 업데이트
        });

        // 댓글 달기 이벤트 리스너 추가
        postItem.querySelector('.add-comment-button').addEventListener('click', (event) => {
            const commentInput = event.target.previousElementSibling;
            const commentContent = commentInput.value.trim();
            if (commentContent) {
                const commentAuthor = post.isMemberPost ? post.username : '익명'; // 게시물 유형에 따라 작성자 설정
                post.comments.push({ author: commentAuthor, content: commentContent });
                commentInput.value = '';
                savePosts(); // 변경사항 저장
                renderPosts();
            }
        });

        return postItem;
    }


    // 게시물 렌더링 함수
    function renderPosts() {
        bestPostListContainer.innerHTML = ''; // 베스트 게시물 컨테이너 비우기
        allPostListContainer.innerHTML = '';  // 전체 게시물 컨테이너 비우기

        // 게시물을 추천수 기준으로 정렬 (내림차순)
        const sortedPosts = [...posts].sort((a, b) => b.recommendations - a.recommendations);

        sortedPosts.forEach((post, index) => {
            const postElement = createPostElement(post, index); // 게시물 요소 생성

            // 베스트 게시물 기준을 충족하면 베스트 리스트에, 아니면 전체 리스트에 추가
            if (post.recommendations >= BEST_THRESHOLD) {
                bestPostListContainer.appendChild(postElement); // 베스트 게시물은 append
            } else {
                allPostListContainer.prepend(postElement); // 일반 게시물은 최신순 (prepend)
            }
        });
    }

    // 파일 읽기 및 게시물 추가 함수 (중복 코드 방지를 위해 함수화)
    function addPost(title, content, author, mediaFile, isMemberPost, username = null) {
        let mediaData = null;
        if (mediaFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mediaData = { src: e.target.result, type: mediaFile.type };
                posts.push({
                    title,
                    content,
                    author,
                    media: mediaData,
                    recommendations: 0,
                    disrecommendations: 0,
                    comments: [],
                    isMemberPost,
                    username // 회원 게시물일 경우 사용자명 저장
                });
                savePosts(); // 게시물 추가 후 저장
                renderPosts();
            };
            reader.readAsDataURL(mediaFile);
        } else {
            posts.push({
                title,
                content,
                author,
                media: null,
                recommendations: 0,
                disrecommendations: 0,
                comments: [],
                isMemberPost,
                username
            });
            savePosts(); // 게시물 추가 후 저장
            renderPosts();
        }
    }

    // 익명 게시물 제출
    submitAnonymousPostButton.addEventListener('click', () => {
        const title = document.getElementById('anonymous-title').value;
        const content = document.getElementById('anonymous-content').value;
        const mediaFile = document.getElementById('anonymous-media').files[0];

        if (title && content) {
            addPost(title, content, '익명', mediaFile, false);
            // 입력 필드 초기화
            document.getElementById('anonymous-title').value = '';
            document.getElementById('anonymous-content').value = '';
            document.getElementById('anonymous-media').value = '';
        } else {
            alert('제목과 내용을 입력해주세요.');
        }
    });

    // 회원 게시물 제출
    submitMemberPostButton.addEventListener('click', () => {
        const username = document.getElementById('member-username').value;
        const password = document.getElementById('member-password').value; // 현재 사용하지 않지만, 향후 서버 연동 시 필요
        const title = document.getElementById('member-title').value;
        const content = document.getElementById('member-content').value;
        const mediaFile = document.getElementById('member-media').files[0];

        if (username && password && title && content) {
            // 실제 서비스에서는 서버에서 아이디/비밀번호 유효성 검사 및 인증을 수행해야 합니다.
            // 여기서는 간단히 입력 여부만 확인합니다.
            addPost(title, content, username, mediaFile, true, username);
            // 입력 필드 초기화
            document.getElementById('member-username').value = '';
            document.getElementById('member-password').value = '';
            document.getElementById('member-title').value = '';
            document.getElementById('member-content').value = '';
            document.getElementById('member-media').value = '';
        } else {
            alert('아이디, 비밀번호, 제목, 내용을 모두 입력해주세요.');
        }
    });

    // 페이지 로드 시 게시물 렌더링
    renderPosts();
});