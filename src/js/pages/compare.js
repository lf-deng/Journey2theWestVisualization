(() => {
    const dataPath = encodeURI('../data/西游记-白话文.json');
    const select = document.getElementById('chapterSelect');
    const leftTitle = document.getElementById('leftTitle');
    const rightTitle = document.getElementById('rightTitle');
    const leftText = document.getElementById('leftText');
    const rightText = document.getElementById('rightText');
    const swapBtn = document.getElementById('swapBtn');

    let chapters = [];
    let leftIsOriginal = true;

    function populateSelect() {
        select.innerHTML = '';
        chapters.forEach((c, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${c.title.replace(/\s+/g, ' ').slice(0, 60)}`;
            select.appendChild(opt);
        });
    }

    function render(idx = 0) {
        const chap = chapters[idx];
        if (!chap) return;
        document.title = `第${idx + 1}章 — ${chap.title}`;
        if (leftIsOriginal) {
            leftTitle.textContent = '原文 — ' + chap.title;
            rightTitle.textContent = '白话译文 — ' + chap.title;
            leftText.textContent = "共" + chap.original.length + "字\n---\n\n" + chap.original || chap.text || '';
            rightText.textContent = "共" + chap.translation.length + "字\n---\n\n" + chap.translation || chap.translation_text || chap.trans || '';
        } else {
            leftTitle.textContent = '白话译文 — ' + chap.title;
            rightTitle.textContent = '原文 — ' + chap.title;
            leftText.textContent = chap.translation || chap.translation_text || chap.trans || '';
            rightText.textContent = chap.original || chap.text || '';
        }
    }

    function bindEvents() {
        select.addEventListener('change', () => render(Number(select.value)));
        swapBtn.addEventListener('click', () => {
            leftIsOriginal = !leftIsOriginal;
            render(Number(select.value) || 0);
        });
    }

    async function load() {
        try {
            const res = await fetch(dataPath);
            if (!res.ok) throw new Error(res.statusText || 'fetch error');
            chapters = await res.json();
            if (!Array.isArray(chapters)) {
                console.error('预期为数组，但收到：', chapters);
                chapters = [];
            }
            populateSelect();
            bindEvents();
            render(0);
        } catch (e) {
            leftText.textContent = '加载失败：' + e.message;
            rightText.textContent = '加载失败：' + e.message;
            console.error(e);
        }
    }

    load();
})();
