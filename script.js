// =============================================
// SCRIPT.JS — BPM FT UNMA
// =============================================


// ── ① BURGER MENU ────────────────────────────
const burger   = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links .list-nav-links');
const dropdown = document.querySelector('.dropdown');
const header   = document.querySelector('#main-header');

function getHeaderHeight() {
    return header ? header.offsetHeight : 72;
}

function setMenuPosition() {
    if (window.innerWidth <= 768) {
        const h = getHeaderHeight();
        navLinks.style.top    = h + 'px';
        navLinks.style.height = `calc(100dvh - ${h}px)`;
    }
}

function openMenu() {
    setMenuPosition();
    navLinks.classList.add('nav-active');
    burger.classList.add('burger-active');
    burger.setAttribute('aria-expanded', 'true');
    navItems.forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.animation = `navItemFade 0.4s ease forwards ${i * 0.07 + 0.05}s`;
    });
}

function closeMenu() {
    navLinks.classList.remove('nav-active');
    burger.classList.remove('burger-active');
    burger.setAttribute('aria-expanded', 'false');
    if (dropdown) dropdown.classList.remove('dropdown-active');
    navItems.forEach(i => { i.style.animation = ''; i.style.opacity = ''; });
}

if (burger) {
    burger.addEventListener('click', () => {
        navLinks.classList.contains('nav-active') ? closeMenu() : openMenu();
    });
}

if (dropdown) {
    dropdown.querySelector('.dropbtn').addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('dropdown-active');
        }
    });
}

document.addEventListener('click', (e) => {
    if (!burger) return;
    if (!navLinks.contains(e.target) && !burger.contains(e.target)) {
        if (navLinks.classList.contains('nav-active')) closeMenu();
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMenu();
        navLinks.style.top = '';
        navLinks.style.height = '';
    } else if (navLinks.classList.contains('nav-active')) {
        setMenuPosition();
    }
});

window.addEventListener('scroll', () => {
    if (navLinks.classList.contains('nav-active')) setMenuPosition();
}, { passive: true });


// ── ② SCROLL ANIMATIONS ───────────────────────

// Scroll-reveal untuk kartu
const revealEls = document.querySelectorAll('.vm-card, .fungsi-card, .about-main, .footer-col');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            entry.target.style.animation = `revealUp 0.55s ease ${i * 0.08}s both`;
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    revealObserver.observe(el);
});


// ── ③ SEARCH ─────────────────────────────────
const searchBox    = document.querySelector('.search-box');
const searchButton = document.querySelector('.search-button');

const SEARCHABLE = 'section p, section h1, section h2, section h3, section h4, section li';

function saveOriginalText() {
    document.querySelectorAll(SEARCHABLE).forEach(el => {
        if (!el.dataset.originalHtml) el.dataset.originalHtml = el.innerHTML;
    });
}

function clearHighlights() {
    document.querySelectorAll(SEARCHABLE).forEach(el => {
        if (el.dataset.originalHtml !== undefined) el.innerHTML = el.dataset.originalHtml;
    });
    removeSearchModal();
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    let total = 0;
    document.querySelectorAll(SEARCHABLE).forEach(el => {
        const original = el.dataset.originalHtml;
        if (regex.test(el.textContent)) {
            el.innerHTML = original.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
                if (tag) return tag;
                return text.replace(regex, '<mark class="search-highlight">$1</mark>');
            });
            total += el.querySelectorAll('.search-highlight').length;
        }
    });
    return total;
}

function removeSearchModal() {
    const m = document.getElementById('search-modal');
    if (m) m.remove();
}

function showSearchModal(query, count) {
    removeSearchModal();
    const modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-inner">
            <span class="search-modal-icon">${count > 0 ? '🔍' : '😕'}</span>
            <p class="search-modal-text">
                ${count > 0
                    ? `Ditemukan <strong>${count}</strong> hasil untuk "<strong>${query}</strong>"`
                    : `Tidak ada hasil untuk "<strong>${query}</strong>"`}
            </p>
            <button class="search-modal-close">✕</button>
        </div>
        ${count > 1 ? `<div class="search-nav-buttons">
            <button id="prev-result">&#8592;</button>
            <span id="result-counter">1 / ${count}</span>
            <button id="next-result">&#8594;</button>
        </div>` : ''}
    `;
    document.body.appendChild(modal);
    modal.querySelector('.search-modal-close').addEventListener('click', () => {
        clearHighlights(); searchBox.value = '';
    });
    if (count > 1) {
        let idx = 0;
        const hl = document.querySelectorAll('.search-highlight');
        const ctr = document.getElementById('result-counter');
        hl[0].classList.add('search-highlight-active');
        function goTo(i) {
            hl[idx].classList.remove('search-highlight-active');
            idx = (i + count) % count;
            hl[idx].classList.add('search-highlight-active');
            hl[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
            ctr.textContent = `${idx + 1} / ${count}`;
        }
        document.getElementById('next-result').addEventListener('click', () => goTo(idx + 1));
        document.getElementById('prev-result').addEventListener('click', () => goTo(idx - 1));
    }
    modal.style.opacity = '0';
    modal.style.transform = 'translateX(-50%) translateY(20px)';
    requestAnimationFrame(() => {
        modal.style.transition = 'opacity .3s ease, transform .3s ease';
        modal.style.opacity = '1';
        modal.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        const m = document.getElementById('search-modal');
        if (m) { m.style.opacity = '0'; m.style.transform = 'translateX(-50%) translateY(20px)'; setTimeout(removeSearchModal, 400); }
    }, 7000);
}

function doSearch() {
    const query = searchBox.value.trim();
    if (!query) { clearHighlights(); return; }
    if (navLinks.classList.contains('nav-active')) closeMenu();
    saveOriginalText();
    clearHighlights();
    saveOriginalText();
    const count = highlightText(query);
    showSearchModal(query, count);
    if (count > 0) document.querySelector('.search-highlight')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

if (searchButton) searchButton.addEventListener('click', doSearch);
if (searchBox) {
    searchBox.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    searchBox.addEventListener('input', () => { if (!searchBox.value.trim()) clearHighlights(); });
}


// ── ④ INJECT STYLES ──────────────────────────
const style = document.createElement('style');
style.textContent = `
    @keyframes navItemFade {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes revealUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .search-highlight {
        background: #ffdd00; color: #550000;
        border-radius: 3px; padding: 0 2px; font-weight: 600;
    }
    .search-highlight-active {
        background: #ff6600 !important; color: #fff !important;
        outline: 2px solid #ff6600; border-radius: 3px;
    }
    #search-modal {
        position: fixed; bottom: 28px; left: 50%;
        transform: translateX(-50%);
        background: #2a0000; color: #e3caaf;
        border-radius: 14px; padding: 14px 20px;
        box-shadow: 0 8px 40px rgba(0,0,0,.5);
        z-index: 99999; min-width: 260px; max-width: 90vw;
        font-family: 'Poppins', sans-serif; font-size: 13px;
        border: 1px solid rgba(227,202,175,.15);
    }
    .search-modal-inner { display: flex; align-items: center; gap: 10px; }
    .search-modal-icon  { font-size: 18px; flex-shrink: 0; }
    .search-modal-text  { flex: 1; line-height: 1.5; }
    .search-modal-text strong { color: #ffdd00; }
    .search-modal-close {
        background: none; border: none; color: rgba(227,202,175,.5);
        font-size: 15px; cursor: pointer; padding: 2px 6px;
        border-radius: 6px; transition: all .2s; flex-shrink: 0;
    }
    .search-modal-close:hover { color: #e3caaf; background: rgba(255,255,255,.08); }
    .search-nav-buttons {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; margin-top: 10px; padding-top: 10px;
        border-top: 1px solid rgba(227,202,175,.1);
    }
    .search-nav-buttons button {
        background: rgba(227,202,175,.1); border: 1px solid rgba(227,202,175,.2);
        color: #e3caaf; font-family: 'Poppins',sans-serif;
        font-size: 13px; width: 32px; height: 32px; border-radius: 8px;
        cursor: pointer; transition: background .2s;
    }
    .search-nav-buttons button:hover { background: rgba(227,202,175,.2); }
    #result-counter { font-size: 11px; color: rgba(227,202,175,.6); min-width: 42px; text-align: center; }
`;
document.head.appendChild(style);