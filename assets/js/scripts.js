const galleries = {
    Underdawg: {
        images: [
            '../assets/images/combat-robotics/Underdawg/1.jpg',
            '../assets/images/combat-robotics/Underdawg/2.jpg',
            '../assets/images/combat-robotics/Underdawg/3.jpg',
            '../assets/images/combat-robotics/Underdawg/4.jpg',
            '../assets/images/combat-robotics/Underdawg/5.jpg',
            '../assets/images/combat-robotics/Underdawg/6.jpg',
            '../assets/images/combat-robotics/Underdawg/7.jpg',
            '../assets/images/combat-robotics/Underdawg/8.jpg'
        ],
        description: 'description'
    },
    Uppydawg: {
        images: [
            '../assets/images/combat-robotics/Uppydawg/1.jpg',
            '../assets/images/combat-robotics/Uppydawg/2.jpg',
            '../assets/images/combat-robotics/Uppydawg/3.jpg',
            '../assets/images/combat-robotics/Uppydawg/4.jpg',
            '../assets/images/combat-robotics/Uppydawg/5.jpg',
            '../assets/images/combat-robotics/Uppydawg/6.jpg',
            '../assets/images/combat-robotics/Uppydawg/7.jpg',
            '../assets/images/combat-robotics/Uppydawg/8.jpg',
            '../assets/images/combat-robotics/Uppydawg/9.jpg'
        ],
        description: 'description'
    }
};

let currentGallery = null;
let currentIndex = 0;
const IMAGES_PER_VIEW = 3;

function openGallery(project) {
    currentGallery = galleries[project];
    currentIndex = 0;
    document.getElementById('galleryTitle').textContent = project; // Set project name
    updateGalleryModal();
    document.getElementById('galleryModal').style.display = 'flex';
}

function updateGalleryModal() {
    const imagesDiv = document.getElementById('galleryImages');
    const descDiv = document.getElementById('galleryDescription');
    imagesDiv.innerHTML = '';

    // Show IMAGES_PER_VIEW images starting from currentIndex
    for (let i = currentIndex; i < Math.min(currentIndex + IMAGES_PER_VIEW, currentGallery.images.length); i++) {
        const img = document.createElement('img');
        img.src = currentGallery.images[i];
        img.style.maxWidth = '220px';
        img.style.margin = '0 8px';
        img.style.borderRadius = '8px';
        imagesDiv.appendChild(img);
    }

    // Add arrows
    imagesDiv.insertAdjacentHTML('afterbegin', `<span class="arrow left" onclick="scrollGallery(-1)">&lt;</span>`);
    imagesDiv.insertAdjacentHTML('beforeend', `<span class="arrow right" onclick="scrollGallery(1)">&gt;</span>`);

    descDiv.textContent = currentGallery.description;
}

function scrollGallery(direction) {
    const maxIndex = currentGallery.images.length - IMAGES_PER_VIEW;
    currentIndex += direction * IMAGES_PER_VIEW;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    updateGalleryModal();
}

function closeGallery() {
    document.getElementById('galleryModal').style.display = 'none';
}