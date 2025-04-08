function addMyPRsLink() {
    const navBar = document.querySelector('nav[aria-label="Repository"]');
    if (!navBar || document.getElementById('my-prs-link')) return;

    const pullRequestsLink = navBar.querySelector('a[href$="/pulls"]');
    if (!pullRequestsLink) return;

    const myPRsLink = document.createElement('a');

    myPRsLink.id = 'my-prs-link';
    const repoMatch = window.location.pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
    if (!repoMatch) return;

    const [, owner, repo] = repoMatch;
    myPRsLink.href = `https://github.com/${owner}/${repo}/pulls?q=is:pr+is:open+author:@me`;
    myPRsLink.textContent = "My PR's";
    myPRsLink.style.padding = '5px 10px';
    myPRsLink.style.color = 'rgb(31, 35, 40)';
    myPRsLink.style.textDecoration = 'none';

    myPRsLink.addEventListener('mouseover', ()=>{
        myPRsLink.style.background = '#818b981a';
        myPRsLink.style.borderRadius= '5px';
    })
    myPRsLink.addEventListener('mouseout', ()=>{
        myPRsLink.style.background = 'none';
    })

    // Вставляем ссылку "My Open PR's"
    pullRequestsLink.parentNode.insertBefore(myPRsLink, pullRequestsLink.nextSibling);

    // Создаем кнопку "Go to My Last PR"
    const lastPRButton = document.createElement('button');
    lastPRButton.id = 'my-last-pr-button';
    lastPRButton.style.padding = '5px 10px';
    lastPRButton.style.color = '#7e48e1'; // Цвет текста
    lastPRButton.textContent = "Go to My Latest PR";
    lastPRButton.style.background = 'none';
    lastPRButton.style.border = 'none';

    // Функция для проверки и открытия списка PR в фоне
    async function checkLastPR() {
        const lastPRUrl = `https://github.com/${owner}/${repo}/pulls?q=is:pr+is:open+author:@me`;

        // Открываем страницу PR'ов в фоне
        const response = await fetch(lastPRUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html', // Запрашиваем HTML
            }
        });

        if (response.ok) {
            const html = await response.text();

            // Создаем временный DOM для анализа HTML страницы
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Ищем первый пулл-реквест на странице
            const firstPR = doc.querySelector('.js-issue-row a');
            if (firstPR) {
                // Если PR найден, активируем кнопку
                lastPRButton.disabled = false;
                lastPRButton.addEventListener('mouseover', ()=>{
                    lastPRButton.style.background = '#818b981a';
                    lastPRButton.style.borderRadius= '5px';
                })
                lastPRButton.addEventListener('mouseout', ()=>{
                    lastPRButton.style.background = 'none';
                })
                lastPRButton.addEventListener('click', () => {
                    lastPRButton.style.cursor = 'progress';
                    document.body.style.cursor = 'progress';
                    window.location.href = firstPR.href; // Перенаправляем на первый PR
                });
            } else {
                // Если PR не найден, делаем кнопку неактивной и меняем текст
                lastPRButton.textContent = "There's no open PRs on your name!";
                lastPRButton.style.cursor = 'auto'
                // lastPRButton.stye.
                // lastPRButton.disabled = true;
            }
        } else {
            alert('Failed to load PR page.');
        }
    }
    // Вставляем кнопку рядом с "My Open PR's"
    pullRequestsLink.parentNode.insertBefore(lastPRButton, myPRsLink.nextSibling);

    // Проверяем последний PR при загрузке страницы
    checkLastPR();

}

function observeDOM() {
    if (!document.body) {
        setTimeout(observeDOM, 50);
        return;
    }
    const observer = new MutationObserver(addMyPRsLink);
    observer.observe(document.body, { childList: true, subtree: true });
    addMyPRsLink();
}

observeDOM();
