
const galleries = {};
let pageData = null;

async function loadProjectData() {
    try {
        const response = await fetch('assets/data/projects.json');
        const data = await response.json();
        pageData = data;

        if (data.projects) {
            Object.entries(data.projects).forEach(([id, project]) => {
                galleries[id] = Object.assign({ name: project.title || id }, project);
            });
        }

        buildProjectSections();
        loadHomePhotos();
    } catch (error) {
        console.warn('Could not load project JSON', error);
    }
}

function getPageName() {
    return window.location.pathname.split('/').pop().split('.').shift();
}

function buildProjectSections() {
    if (!pageData || !pageData.pages) return;
    const pageName = getPageName();
    const pageConfig = pageData.pages[pageName];
    if (!pageConfig) return;

    const sectionsContainer = document.getElementById('project-sections');
    if (!sectionsContainer) return;

    sectionsContainer.innerHTML = '';

    pageConfig.sections.forEach(section => {
        const sectionEl = document.createElement('section');
        const heading = document.createElement('h1');
        heading.textContent = section.heading;
        sectionEl.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        section.projectIds.forEach(projectId => {
            const project = pageData.projects?.[projectId];
            if (!project) return;

            const thumb = document.createElement('div');
            thumb.className = 'project-thumb';
            thumb.addEventListener('click', () => openGallery(projectId));

            const container = document.createElement('div');
            container.className = 'thumb-container';

            const img = document.createElement('img');
            img.src = project.thumb || (project.images && project.images[0]) || '';
            img.alt = project.title || projectId;
            img.loading = 'lazy';
            container.appendChild(img);

            const overlay = document.createElement('div');
            overlay.className = 'thumb-overlay';
            const titleSpan = document.createElement('span');
            titleSpan.className = 'thumb-title';
            titleSpan.textContent = project.title || projectId;
            overlay.appendChild(titleSpan);
            container.appendChild(overlay);

            thumb.appendChild(container);
            grid.appendChild(thumb);
        });

        sectionEl.appendChild(grid);
        sectionsContainer.appendChild(sectionEl);
    });
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

galleries.Trident = Object.assign(galleries.Trident || {}, {
    videos: [
        'https://youtube.com/watch?v=RmS8dYewYpU?si=hax23ARUBnXjCTA1',
        'https://youtube.com/watch?v=fHIOsCBUF-Y?si=2_-Qd7uE1dGrtb7X'
    ]
});
galleries.SauceathonBot = Object.assign(galleries.SauceathonBot || {}, {
    videos: [
        'https://youtube.com/watch?v=ZlGhO-jDPcA?si=auYscJAhavUlpejI'
    ]
});
galleries.StrobeDemo = Object.assign(galleries.StrobeDemo || {}, {
    videos: [
        'https://www.youtube.com/watch?v=qJqM89YOtog'
    ]
});

let currentGallery = null;
let currentIndex = 0;
// const IMAGES_PER_VIEW = 5;

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

    if (fitByCap > 0 && perView > fitByCap) {
        perView = Math.min(perView, fitByCap);
    }

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
    left.setAttribute('role','button');
    left.setAttribute('aria-label','Previous');
    left.innerText = '◀';
    left.addEventListener('click', () => scrollGallery(-1));
    modal.appendChild(left);

    const right = document.createElement('span');
    right.className = 'arrow right';
    right.setAttribute('role','button');
    right.setAttribute('aria-label','Next');
    right.innerText = '▶';
    right.addEventListener('click', () => scrollGallery(1));
    modal.appendChild(right);
}

function openGallery(project) {
    currentGallery = galleries[project];
    if (!currentGallery) {
        console.warn('Gallery not found:', project);
        return;
    }
    currentIndex = 0;
    const titleEl = document.getElementById('galleryTitle');
    titleEl && (titleEl.textContent = project);

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
    if (!currentGallery || !imagesDiv) return;

    const perView = computeImagesPerView();

    const maxIndex = Math.max(0, currentGallery.images.length - perView);
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
    
    for (let i = currentIndex; i < Math.min(currentIndex + perView, currentGallery.images.length); i++) {
        const img = document.createElement('img');
        img.src = currentGallery.images[i];
        img.alt = currentGallery.titles ? (currentGallery.titles[i] || '') : '';
        img.loading = 'lazy';
        img.style.maxWidth = perImageWidth + 'px';
        img.style.maxHeight = 'calc(60vh - 40px)';
        img.style.objectFit = 'cover';
        img.style.flex = '0 0 auto';
        imagesDiv.appendChild(img);
    }

    ensureArrows();

    titleEl && (titleEl.textContent = currentGallery.name || titleEl.textContent);
    descDiv && (descDiv.textContent = currentGallery.description || '');

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
            iframe.setAttribute('title', (currentGallery.name || 'Gallery video'));

            wrap.appendChild(iframe);
            videosContainer.appendChild(wrap);
        });
    }
}

function scrollGallery(direction) {
    if (!currentGallery) return;
    const step = computeImagesPerView();
    const maxIndex = Math.max(0, currentGallery.images.length - step);
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

pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PDF_URL = 'assets/docs/resume.pdf';
const SCALE = 2; // render at 2x for sharpness, CSS scales it down

let pdfDoc = null;
let currentPage = 1;
let totalPages = 1;

const container   = document.getElementById('resume-container');
const pagesDiv    = document.getElementById('canvas-pages');
const loadingDiv  = document.getElementById('resume-loading');
const controls    = document.getElementById('page-controls');
const pageInfo    = document.getElementById('page-info');
const prevBtn     = document.getElementById('prev-btn');
const nextBtn     = document.getElementById('next-btn');

if (container && pagesDiv && loadingDiv && controls && pageInfo && prevBtn && nextBtn) {
    async function renderPage(num) {
        pagesDiv.innerHTML = '';

        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: SCALE });

        const wrap = document.createElement('div');
        wrap.className = 'resume-canvas-wrap';

        const canvas = document.createElement('canvas');
        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        wrap.appendChild(canvas);
        pagesDiv.appendChild(wrap);

        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport
        }).promise;

        pageInfo.textContent = `Page ${num} of ${totalPages}`;
        prevBtn.disabled = num <= 1;
        nextBtn.disabled = num >= totalPages;
    }

    pdfjsLib.getDocument(PDF_URL).promise.then(async (pdf) => {
        pdfDoc     = pdf;
        totalPages = pdf.numPages;

        loadingDiv.style.display = 'none';
        container.style.display  = 'flex';

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
} else {
    if (loadingDiv) {
        loadingDiv.textContent = '';
    }
}