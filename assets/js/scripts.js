/* ---------- Page content config ----------
   Project data (titles, images, descriptions, videos) still lives in projects.json.
   This file controls which projects appear on which page and their short taglines. */

const TAGLINES = {
    Trident: 'WIP 3D-printed robotic arm with cycloidal, harmonic, and planetary gearboxes.',
    Hotdawwg: 'Flamethrower multibot combat robot with a mecanum drive.',
    Underdawg: '3lb beetle combat robot. Placed 2nd at Build Fight Fun!',
    GlassFlowers: 'Glass lampworked flowers, my favorite way to practice new techniques.',
    Uppydawg: '1lb plastic antweight that lifts opponents from underneath.',
    DAYBREAK: '30lb melty brain robot designed and built in two weeks.',
    Maxydawg: '1lb full combat antweight designed and built in 13 hours.',
    Lildawg: 'My first 1lb plastic antweight and first multi-bot.',
    SauceathonBot: 'First-person-view robot built in 24 hours at Sauceathon 2025.',
    StrobeDemo: 'Adjustable strobe light and turntable enclosures for an MIT imaging class.',
    GlassCritters: 'Glass spiders and other small critters, in progress.',
    CreativeMisc: 'Random projects and gifts.'
};

const SELECTED_WORK = ['Hotdawwg', 'Underdawg'];

const OTHER_WORK_SECTIONS = [
    { heading: 'Combat Robotics', projectIds: ['Uppydawg', 'DAYBREAK', 'Maxydawg', 'Lildawg'] },
    { heading: 'Engineering', projectIds: ['Trident', 'SauceathonBot', 'StrobeDemo'] },
    { heading: 'Glass & Creative', projectIds: ['GlassFlowers', 'GlassCritters', 'CreativeMisc'] }
];

/* ---------- Media order on project pages ----------
   Keys are "image:N" or "video:N" (0-based, in the order they appear in projects.json).
   Anything you don't list is added afterward: images first, then videos.
   Example: videos and pictures mixed at the top of Trident. */
const MEDIA_ORDER = {
    Trident: [
        'video:0',
        'image:0',
        'image:1',
        'video:1',
        'image:2',
        'video:2',
        'video:3',
        'video:4'
    ]
    // Hotdawwg: ['image:0', 'video:0', 'image:1', 'image:2', 'video:1'],
};

// Extra videos that were previously added in code. They're merged with the JSON videos.
const EXTRA_VIDEOS = {
    Trident: [
        'https://youtube.com/watch?v=RmS8dYewYpU?si=hax23ARUBnXjCTA1',
        'https://youtube.com/watch?v=fHIOsCBUF-Y?si=2_-Qd7uE1dGrtb7X'
    ]
};



let data = null;

const $ = (selector) => document.querySelector(selector);

/* ---------- Helpers ---------- */

function toEmbedUrl(raw) {
    const s = String(raw).trim();
    if (!s) return null;

    let id = null;
    const match = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{6,})/);
    if (match) {
        id = match[1];
    } else {
        // Bare ID, possibly followed by stray query params like "?si=..."
        const bare = s.split(/[?&]/)[0];
        if (/^[\w-]{11}$/.test(bare)) id = bare;
    }
    return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
}

function getAllVideos(id, project) {
    const combined = [...(project.videos || []), ...(EXTRA_VIDEOS[id] || [])];
    const seen = new Set();
    return combined
        .map(toEmbedUrl)
        .filter(url => {
            if (!url || seen.has(url)) return false;
            seen.add(url);
            return true;
        });
}

function buildCard(id, extraClass = '') {
    const project = data.projects[id];
    if (!project) return null;

    const link = document.createElement('a');
    link.className = `card ${extraClass}`.trim();
    link.href = `project.html?id=${encodeURIComponent(id)}`;

    const thumbSrc = project.thumb || (project.images && project.images[0]) || '';
    link.innerHTML = `
        <div class="card-media">
            <img src="${thumbSrc}" alt="${project.title}" loading="lazy">
        </div>
        <div class="card-info">
            <h3>${project.title}</h3>
            <p>${TAGLINES[id] || ''}</p>
        </div>
    `;
    return link;
}

/* ---------- Renderers ---------- */

function renderSelectedWork() {
    const grid = $('#selected-work');
    if (!grid) return;
    grid.innerHTML = '';
    SELECTED_WORK.forEach(id => {
        const card = buildCard(id);
        if (card) grid.appendChild(card);
    });
}

function renderOtherWork() {
    const container = $('#other-work-sections');
    if (!container) return;
    container.innerHTML = '';

    OTHER_WORK_SECTIONS.forEach(section => {
        const heading = document.createElement('h2');
        heading.className = 'section-head';
        heading.textContent = section.heading;
        container.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'work-grid three';
        section.projectIds.forEach(id => {
            const card = buildCard(id);
            if (card) grid.appendChild(card);
        });
        container.appendChild(grid);
    });
}

function renderAboutPhotos() {
    const grid = $('#photo-grid');
    if (!grid || !Array.isArray(data.homePhotos)) return;
    grid.innerHTML = '';
    data.homePhotos.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Photo of Carlos ${i + 1}`;
        img.loading = 'lazy';
        grid.appendChild(img);
    });
}

function getMediaItems(id, project) {
    const images = (project.images || []).map((src, i) => ({
        key: `image:${i}`,
        type: 'image',
        src,
        alt: `${project.title} ${i + 1}`
    }));

    const videos = getAllVideos(id, project).map((src, i) => ({
        key: `video:${i}`,
        type: 'video',
        src,
        alt: `${project.title} video ${i + 1}`
    }));

    const defaultOrder = [...images, ...videos];
    const byKey = new Map(defaultOrder.map(item => [item.key, item]));

    const ordered = [];
    const used = new Set();

    (MEDIA_ORDER[id] || []).forEach(key => {
        const item = byKey.get(key);
        if (item && !used.has(key)) {
            ordered.push(item);
            used.add(key);
        }
    });

    defaultOrder.forEach(item => {
        if (!used.has(item.key)) {
            ordered.push(item);
            used.add(item.key);
        }
    });

    return ordered;
}

function createMediaElement(item) {
    if (item.type === 'video') {
        const wrap = document.createElement('div');
        wrap.className = 'media-item video';

        const iframe = document.createElement('iframe');
        iframe.src = item.src;
        iframe.title = item.alt;
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        wrap.appendChild(iframe);
        return wrap;
    }

    const link = document.createElement('a');
    link.className = 'media-item';
    link.href = item.src;
    link.target = '_blank';
    link.rel = 'noopener';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';

    link.appendChild(img);
    return link;
}

function getMediaItems(id, project) {
    const images = (project.images || []).map((src, i) => ({
        key: `image:${i}`,
        type: 'image',
        src,
        alt: `${project.title} ${i + 1}`
    }));

    const videos = getAllVideos(id, project).map((src, i) => ({
        key: `video:${i}`,
        type: 'video',
        src,
        alt: `${project.title} video ${i + 1}`
    }));

    const defaultOrder = [...images, ...videos];
    const byKey = new Map(defaultOrder.map(item => [item.key, item]));

    const ordered = [];
    const used = new Set();

    (MEDIA_ORDER[id] || []).forEach(key => {
        const item = byKey.get(key);
        if (item && !used.has(key)) {
            ordered.push(item);
            used.add(key);
        }
    });

    defaultOrder.forEach(item => {
        if (!used.has(item.key)) {
            ordered.push(item);
            used.add(item.key);
        }
    });

    return ordered;
}

function createMediaElement(item) {
    if (item.type === 'video') {
        const wrap = document.createElement('div');
        wrap.className = 'media-item video';

        const iframe = document.createElement('iframe');
        iframe.src = item.src;
        iframe.title = item.alt;
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        wrap.appendChild(iframe);
        return wrap;
    }

    const link = document.createElement('a');
    link.className = 'media-item';
    link.href = item.src;
    link.target = '_blank';
    link.rel = 'noopener';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';

    link.appendChild(img);
    return link;
}

function getMediaItems(id, project) {
    const images = (project.images || []).map((src, i) => ({
        key: `image:${i}`,
        type: 'image',
        src,
        alt: `${project.title} ${i + 1}`
    }));

    const videos = getAllVideos(id, project).map((src, i) => ({
        key: `video:${i}`,
        type: 'video',
        src,
        alt: `${project.title} video ${i + 1}`
    }));

    const defaultOrder = [...images, ...videos];
    const byKey = new Map(defaultOrder.map(item => [item.key, item]));

    const ordered = [];
    const used = new Set();

    (MEDIA_ORDER[id] || []).forEach(key => {
        const item = byKey.get(key);
        if (item && !used.has(key)) {
            ordered.push(item);
            used.add(key);
        }
    });

    defaultOrder.forEach(item => {
        if (!used.has(item.key)) {
            ordered.push(item);
            used.add(item.key);
        }
    });

    return ordered;
}

function createMediaElement(item) {
    if (item.type === 'video') {
        const wrap = document.createElement('div');
        wrap.className = 'media-item video';

        const iframe = document.createElement('iframe');
        iframe.src = item.src;
        iframe.title = item.alt;
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        wrap.appendChild(iframe);
        return wrap;
    }

    const link = document.createElement('a');
    link.className = 'media-item';
    link.href = item.src;
    link.target = '_blank';
    link.rel = 'noopener';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';

    link.appendChild(img);
    return link;
}

function getMediaItems(id, project) {
    const images = (project.images || []).map((src, i) => ({
        key: `image:${i}`,
        type: 'image',
        src,
        alt: `${project.title} ${i + 1}`
    }));

    const videos = getAllVideos(id, project).map((src, i) => ({
        key: `video:${i}`,
        type: 'video',
        src,
        alt: `${project.title} video ${i + 1}`
    }));

    const defaultOrder = [...images, ...videos];
    const byKey = new Map(defaultOrder.map(item => [item.key, item]));

    const ordered = [];
    const used = new Set();

    (MEDIA_ORDER[id] || []).forEach(key => {
        const item = byKey.get(key);
        if (item && !used.has(key)) {
            ordered.push(item);
            used.add(key);
        }
    });

    defaultOrder.forEach(item => {
        if (!used.has(item.key)) {
            ordered.push(item);
            used.add(item.key);
        }
    });

    return ordered;
}

function createMediaElement(item) {
    if (item.type === 'video') {
        const wrap = document.createElement('div');
        wrap.className = 'media-item video';

        const iframe = document.createElement('iframe');
        iframe.src = item.src;
        iframe.title = item.alt;
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        wrap.appendChild(iframe);
        return wrap;
    }

    const link = document.createElement('a');
    link.className = 'media-item';
    link.href = item.src;
    link.target = '_blank';
    link.rel = 'noopener';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';

    link.appendChild(img);
    return link;
}

function getMediaItems(id, project) {
    const images = (project.images || []).map((src, i) => ({
        key: `image:${i}`,
        type: 'image',
        src,
        alt: `${project.title} ${i + 1}`
    }));

    const videos = getAllVideos(id, project).map((src, i) => ({
        key: `video:${i}`,
        type: 'video',
        src,
        alt: `${project.title} video ${i + 1}`
    }));

    const defaultOrder = [...images, ...videos];
    const byKey = new Map(defaultOrder.map(item => [item.key, item]));

    const ordered = [];
    const used = new Set();

    (MEDIA_ORDER[id] || []).forEach(key => {
        const item = byKey.get(key);
        if (item && !used.has(key)) {
            ordered.push(item);
            used.add(key);
        }
    });

    defaultOrder.forEach(item => {
        if (!used.has(item.key)) {
            ordered.push(item);
            used.add(item.key);
        }
    });

    return ordered;
}

function createMediaElement(item) {
    if (item.type === 'video') {
        const wrap = document.createElement('div');
        wrap.className = 'media-item video';

        const iframe = document.createElement('iframe');
        iframe.src = item.src;
        iframe.title = item.alt;
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        wrap.appendChild(iframe);
        return wrap;
    }

    const link = document.createElement('a');
    link.className = 'media-item';
    link.href = item.src;
    link.target = '_blank';
    link.rel = 'noopener';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';

    link.appendChild(img);
    return link;
}

function renderProject() {
    const id = new URLSearchParams(window.location.search).get('id');
    const project = data.projects[id];

    if (!project) {
        $('#project-title').textContent = 'Project not found';
        $('#project-desc').textContent = 'Head back to my work to see what\'s available.';
        return;
    }

    document.title = `${project.title} | Carlos Lopez`;
    $('#project-title').textContent = project.title;
    $('#project-tagline').textContent = TAGLINES[id] || '';
    const descEl = $('#project-desc');
    descEl.innerHTML = '';

    const paragraphs = Array.isArray(project.description)
        ? project.description
        : String(project.description || '').split(/\n\s*\n/);

    paragraphs
        .map(text => text.trim())
        .filter(Boolean)
        .forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            descEl.appendChild(p);
        });

    // Send the back button to the page the visitor came from, if it was Other Work
    const backLink = $('#back-link');
    if (backLink && document.referrer.includes('other-work.html')) {
        backLink.href = 'other-work.html';
        backLink.textContent = '← Back to other work';
    }

    const mediaContainer = $('#project-media');
    if (!mediaContainer) return;
    mediaContainer.innerHTML = '';

    getMediaItems(id, project).forEach(item => {
        mediaContainer.appendChild(createMediaElement(item));
    });
}
/* ---------- Init ---------- */

async function init() {
    try {
        const response = await fetch('assets/data/projects.json');
        data = await response.json();
    } catch (error) {
        console.warn('Could not load projects.json', error);
        return;
    }

    switch (document.body.dataset.page) {
        case 'index':
            renderSelectedWork();
            break;
        case 'other-work':
            renderOtherWork();
            break;
        case 'about':
            renderAboutPhotos();
            break;
        case 'project':
            renderProject();
            break;
    }
}

document.addEventListener('DOMContentLoaded', init);