let pageData = null;
let activeFilter = 'all';

async function loadProjectData() {
    try {
        const response = await fetch('assets/data/projects.json');
        const data = await response.json();
        pageData = data;

        buildFilters();
        buildProjectGrid();
        loadHomePhotos();
    } catch (error) {
        console.warn('Could not load project JSON', error);
    }
}

function getOrderedProjects() {
    if (!pageData) return [];
    const order = pageData.projectOrder || Object.keys(pageData.projects);
    return order.map(id => pageData.projects[id]).filter(Boolean);
}

function buildFilters() {
    const bar = document.getElementById('filters');
    if (!bar || !pageData) return;

    const tagSet = new Set();
    getOrderedProjects().forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));

    bar.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.tag = 'all';
    allBtn.textContent = 'All';
    bar.appendChild(allBtn);

    const ongoingBtn = document.createElement('button');
    ongoingBtn.className = 'filter-btn ongoing';
    ongoingBtn.dataset.tag = 'ongoing';
    ongoingBtn.textContent = 'Ongoing';
    bar.appendChild(ongoingBtn);

    Array.from(tagSet).sort().forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.tag = tag;
        btn.textContent = tag;
        bar.appendChild(btn);
    });

    bar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        activeFilter = btn.dataset.tag;
        bar.querySelectorAll('.filter-btn').forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        applyFilter();
    });
}

function applyFilter() {
    document.querySelectorAll('.project-thumb').forEach(card => {
        const tags = (card.dataset.tags || '').split('|').filter(Boolean);
        const ongoing = card.dataset.ongoing === 'true';
        let show = true;
        if (activeFilter === 'ongoing') show = ongoing;
        else if (activeFilter !== 'all') show = tags.includes(activeFilter);
        card.classList.toggle('hidden', !show);
    });
}

function buildProjectGrid() {
    const grid = document.getElementById('project-sections');
    if (!grid || !pageData) return;

    grid.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-grid';

    getOrderedProjects().forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-thumb';
        card.dataset.tags = (project.tags || []).join('|');
        card.dataset.ongoing = project.ongoing ? 'true' : 'false';
        card.tabIndex = 0;
        card.addEventListener('click', () => openGallery(project.id));
        card.addEventListener('keypress', (e) => { if (e.key === 'Enter') openGallery(project.id); });

        const thumbWrap = document.createElement('div');
        thumbWrap.className = 'thumb-container';

        const img = document.createElement('img');
        img.src = project.thumb || (project.images && project.images[0]) || '';
        img.alt = project.title || project.id;
        img.loading = 'lazy';
        thumbWrap.appendChild(img);

        if (project.ongoing) {
            const badge = document.createElement('span');
            badge.className = 'ongoing-badge';
            badge.textContent = 'Ongoing';
            thumbWrap.appendChild(badge);
        }

        const body = document.createElement('div');
        body.className = 'thumb-body';

        const title = document.createElement('div');
        title.className = 'thumb-title';
        title.textContent = project.title || project.id;
        body.appendChild(title);

        const tagRow = document.createElement('div');
        tagRow.className = 'tag-row';
        (project.tags || []).forEach(t => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.textContent = t;
            tagRow.appendChild(chip);
        });
        body.appendChild(tagRow);

        card.appendChild(thumbWrap);
        card.appendChild(body);
        wrapper.appendChild(card);
    });

    grid.appendChild(wrapper);
}

function loadHomePhotos() {
    if (!pageData || !Array.isArray(pageData.homePhotos)) return;
    const gallery = document.getElementById('home-photo-gallery');
    if (!gallery) return;

    gallery.innerHTML = '';
    pageData.homePhotos.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Photo ${index + 1}`;
        img.loading = 'lazy';
        gallery.appendChild(img);
    });
}

loadProjectData();

/* ---------------- Timeline ---------------- */

async function loadTimeline() {
    const container = document.getElementById('timeline');
    if (!container) return;

    try {
        const response = await fetch('assets/data/timeline.json');
        const entries = await response.json();

        container.innerHTML = '';
        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'timeline-item' + (entry.ongoing ? ' ongoing' : '');

            const date = document.createElement('div');
            date.className = 'timeline-date';
            date.textContent = `${entry.start} \u2013 ${entry.end}`;
            item.appendChild(date);

            const title = document.createElement('div');
            title.className = 'timeline-title';
            title.textContent = entry.title;
            item.appendChild(title);

            if (entry.org) {
                const org = document.createElement('div');
                org.className = 'timeline-org';
                org.textContent = entry.org;
                item.appendChild(org);
            }

            if (entry.description) {
                const desc = document.createElement('p');
                desc.className = 'timeline-desc';
                desc.textContent = entry.description;
                item.appendChild(desc);
            }

            container.appendChild(item);
        });
    } catch (error) {
        console.warn('Could not load timeline JSON', error);
    }
}

loadTimeline();

/* ---------------- Gallery modal ---------------- */

let currentGallery = null;
let currentIndex = 0;

function computeImagesPerView() {
    const modal = document.querySelector('.modal-content');
    const imagesDiv = document.getElementById('galleryImages');
    if (!modal || !imagesDiv) return 3;

    const gap = 16;
    const arrowReserve = 64 + 64;
    const modalStyle = getComputedStyle(modal);
    const paddingLeft = parseFloat(modalStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(modalStyle.paddingRight) || 0;

    const availableWidth = Math.max(0, modal.clientWidth - paddingLeft - paddingRight - arrowReserve);

    const MAX_IMAGES = 5;
    const MIN_PER_IMAGE = 120;
    const CAP_PER_IMAGE = 220;

    const fitByMin = Math.floor((availableWidth + gap) / (MIN_PER_IMAGE + gap));
    const fitByCap = Math.floor((availableWidth + gap) / (CAP_PER_IMAGE + gap));

    let perView = Math.min(MAX_IMAGES, Math.max(1, fitByMin || 1));
    if (fitByCap > 0 && perView > fitByCap) perView = Math.min(perView, fitByCap);
    perView = Math.min(MAX_IMAGES, Math.max(1, perView));
    return perView;
}

function ensureArrows() {
    const modal = document.querySelector('.modal-content');
    if (!modal) return;
    const oldLeft = modal.querySelector('.arrow.left');
    const oldRight = modal.querySelector('.arrow.right');
    if (oldLeft) oldLeft.remove();
    if (oldRight) oldRight.remove();

    const left = document.createElement('span');
    left.className = 'arrow left';
    left.setAttribute('role', 'button');
    left.setAttribute('aria-label', 'Previous');
    left.innerText = '◀';
    left.addEventListener('click', () => scrollGallery(-1));
    modal.appendChild(left);

    const right = document.createElement('span');
    right.className = 'arrow right';
    right.setAttribute('role', 'button');
    right.setAttribute('aria-label', 'Next');
    right.innerText = '▶';
    right.addEventListener('click', () => scrollGallery(1));
    modal.appendChild(right);
}

function openGallery(projectId) {
    currentGallery = pageData && pageData.projects ? pageData.projects[projectId] : null;
    if (!currentGallery) {
        console.warn('Gallery not found:', projectId);
        return;
    }
    currentIndex = 0;

    const modalEl = document.getElementById('galleryModal');
    modalEl.style.display = 'flex';

    ensureArrows();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            updateGalleryModal();
        });
    });

    window.addEventListener('resize', updateGalleryModal);
}

function updateGalleryModal() {
    const imagesDiv = document.getElementById('galleryImages');
    const descDiv = document.getElementById('galleryDescription');
    const titleEl = document.getElementById('galleryTitle');
    const tagsEl = document.getElementById('modalTags');
    if (!currentGallery || !imagesDiv) return;

    const perView = computeImagesPerView();
    const images = currentGallery.images || [];

    const maxIndex = Math.max(0, images.length - perView);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    imagesDiv.innerHTML = '';

    const modal = document.querySelector('.modal-content');
    const modalStyle = modal ? getComputedStyle(modal) : null;
    const paddingLeft = modalStyle ? parseFloat(modalStyle.paddingLeft) || 0 : 0;
    const paddingRight = modalStyle ? parseFloat(modalStyle.paddingRight) || 0 : 0;
    const arrowReserve = 64 + 64;
    const availableWidth = Math.max(0, (modal ? modal.clientWidth : window.innerWidth) - paddingLeft - paddingRight - arrowReserve);
    const gap = 16;

    let perImageWidth = Math.floor((availableWidth - gap * (perView - 1)) / perView);
    perImageWidth = Math.max(80, Math.min(220, perImageWidth));

    for (let i = currentIndex; i < Math.min(currentIndex + perView, images.length); i++) {
        const img = document.createElement('img');
        img.src = images[i];
        img.alt = currentGallery.title ? `${currentGallery.title} ${i + 1}` : '';
        img.loading = 'lazy';
        img.style.maxWidth = perImageWidth + 'px';
        img.style.maxHeight = 'calc(60vh - 40px)';
        img.style.objectFit = 'cover';
        img.style.flex = '0 0 auto';
        imagesDiv.appendChild(img);
    }

    ensureArrows();

    titleEl && (titleEl.textContent = currentGallery.title || '');
    descDiv && (descDiv.textContent = currentGallery.description || '');

    if (tagsEl) {
        tagsEl.innerHTML = '';
        if (currentGallery.ongoing) {
            const badge = document.createElement('span');
            badge.className = 'tag-chip';
            badge.style.color = 'var(--orange)';
            badge.style.borderColor = 'var(--orange)';
            badge.textContent = 'Ongoing';
            tagsEl.appendChild(badge);
        }
        (currentGallery.tags || []).forEach(t => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.textContent = t;
            tagsEl.appendChild(chip);
        });
    }

    let videosContainer = document.getElementById('galleryVideos');
    if (!videosContainer) {
        videosContainer = document.createElement('div');
        videosContainer.id = 'galleryVideos';
        descDiv.parentNode.insertBefore(videosContainer, descDiv.nextSibling);
    }
    videosContainer.innerHTML = '';

    if (currentGallery.videos && currentGallery.videos.length) {
        currentGallery.videos.forEach(raw => {
            let src = String(raw).trim();
            if (!src) return;
            if (!src.includes('youtube.com') && !src.includes('youtu.be') && !src.startsWith('http')) {
                src = 'https://www.youtube.com/embed/' + encodeURIComponent(src);
            } else if (src.includes('youtu.be/')) {
                const id = src.split('youtu.be/').pop().split(/[?&]/)[0];
                src = 'https://www.youtube.com/embed/' + encodeURIComponent(id);
            } else if (src.includes('watch?v=')) {
                const id = src.split('watch?v=').pop().split(/[?&]/)[0];
                src = 'https://www.youtube.com/embed/' + encodeURIComponent(id);
            } else if (src.includes('youtube.com') && !src.includes('/embed/')) {
                const m = src.match(/[?&]v=([^&]+)/);
                if (m && m[1]) src = 'https://www.youtube.com/embed/' + encodeURIComponent(m[1]);
            }

            const wrap = document.createElement('div');
            wrap.className = 'video-wrap';

            const iframe = document.createElement('iframe');
            iframe.src = src + (src.includes('?') ? '&' : '?') + 'rel=0';
            iframe.loading = 'lazy';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.setAttribute('title', currentGallery.title || 'Gallery video');

            wrap.appendChild(iframe);
            videosContainer.appendChild(wrap);
        });
    }
}

function scrollGallery(direction) {
    if (!currentGallery) return;
    const step = computeImagesPerView();
    const images = currentGallery.images || [];
    const maxIndex = Math.max(0, images.length - step);
    currentIndex += direction * step;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    updateGalleryModal();
}

function closeGallery() {
    document.getElementById('galleryModal').style.display = 'none';
    window.removeEventListener('resize', updateGalleryModal);
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        const l = modalContent.querySelector('.arrow.left');
        const r = modalContent.querySelector('.arrow.right');
        if (l) l.remove();
        if (r) r.remove();
    }
}

/* ---------------- Resume viewer ---------------- */

if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const PDF_URL = 'assets/docs/resume.pdf';
    const SCALE = 2;

    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 1;

    const container = document.getElementById('resume-container');
    const pagesDiv = document.getElementById('canvas-pages');
    const loadingDiv = document.getElementById('resume-loading');
    const controls = document.getElementById('page-controls');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (container && pagesDiv && loadingDiv && controls && pageInfo && prevBtn && nextBtn) {
        async function renderPage(num) {
            pagesDiv.innerHTML = '';
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: SCALE });

            const wrap = document.createElement('div');
            wrap.className = 'resume-canvas-wrap';

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            wrap.appendChild(canvas);
            pagesDiv.appendChild(wrap);

            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

            pageInfo.textContent = `Page ${num} of ${totalPages}`;
            prevBtn.disabled = num <= 1;
            nextBtn.disabled = num >= totalPages;
        }

        pdfjsLib.getDocument(PDF_URL).promise.then(async (pdf) => {
            pdfDoc = pdf;
            totalPages = pdf.numPages;

            loadingDiv.style.display = 'none';
            container.style.display = 'flex';
            if (totalPages > 1) controls.style.display = 'flex';

            await renderPage(currentPage);
        }).catch(() => {
            loadingDiv.textContent = 'Could not load resume. Make sure resume.pdf is at assets/docs/resume.pdf';
        });

        prevBtn.addEventListener('click', async () => {
            if (currentPage > 1) { currentPage--; await renderPage(currentPage); }
        });

        nextBtn.addEventListener('click', async () => {
            if (currentPage < totalPages) { currentPage++; await renderPage(currentPage); }
        });
    }
}
