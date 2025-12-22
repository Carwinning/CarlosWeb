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
    },
    DAYBREAK: {
        images: [
            '../assets/images/combat-robotics/DAYBREAK/1.jpeg',
            '../assets/images/combat-robotics/DAYBREAK/2.jpeg',
            '../assets/images/combat-robotics/DAYBREAK/3.jpeg',
            '../assets/images/combat-robotics/DAYBREAK/4.jpeg',
            '../assets/images/combat-robotics/DAYBREAK/5.jpeg',
            '../assets/images/combat-robotics/DAYBREAK/6.jpeg',
            '../assets/images/combat-robotics/DAYBREAK/7.jpeg',
            '../assets/images/combat-robotics/DAYBREAK/8.jpeg'
        ],
        description: 'description'
    },
    Maxydawg: {
        images: [
            '../assets/images/combat-robotics/Maxydawg/1.jpeg',
            '../assets/images/combat-robotics/Maxydawg/2.jpeg',
            '../assets/images/combat-robotics/Maxydawg/3.jpeg',
            '../assets/images/combat-robotics/Maxydawg/4.jpeg',
            '../assets/images/combat-robotics/Maxydawg/5.jpeg',
            '../assets/images/combat-robotics/Maxydawg/6.jpeg',
            '../assets/images/combat-robotics/Maxydawg/7.jpeg',
            '../assets/images/combat-robotics/Maxydawg/8.jpeg'
        ],
        description: 'description'
    },
    Lildawg: {
        images: [
            '../assets/images/combat-robotics/Lildawg/1.jpeg',
            '../assets/images/combat-robotics/Lildawg/2.jpeg',
            '../assets/images/combat-robotics/Lildawg/3.jpeg',
            '../assets/images/combat-robotics/Lildawg/4.jpeg'
        ],
        description: 'description'
    },
    GlassFlowers: {
        images: [
            '../assets/images/creativejuice/GlassFlowers/1.jpeg',
            '../assets/images/creativejuice/GlassFlowers/2.jpeg',
            '../assets/images/creativejuice/GlassFlowers/3.jpeg',
            '../assets/images/creativejuice/GlassFlowers/4.jpeg',
            '../assets/images/creativejuice/GlassFlowers/5.jpeg'
        ],
        description: 'description'
    },
    GlassCritters: {
        images: [
            '../assets/images/creativejuice/GlassCritters/1.jpeg',
            '../assets/images/creativejuice/GlassCritters/2.jpeg',
            '../assets/images/creativejuice/GlassCritters/3.jpeg'
        ],
        description: 'description'
    },
    CreativeMisc: {
        images: [
            '../assets/images/creativejuice/Misc/1.jpeg',
            '../assets/images/creativejuice/Misc/2.jpeg',
            '../assets/images/creativejuice/Misc/3.jpeg',
            '../assets/images/creativejuice/Misc/4.jpeg'
        ],
        description: 'description'
    },
    SauceathonBot: {
        images: [
            '../assets/images/smartjuice/SauceathonBot/1.jpeg',
            '../assets/images/smartjuice/SauceathonBot/2.jpg',
            '../assets/images/smartjuice/SauceathonBot/3.jpeg'
        ],
        description: 'description'
    },
    StrobeDemo: {
        images: [
            '../assets/images/smartjuice/StrobeDemo/1.jpeg',
            '../assets/images/smartjuice/StrobeDemo/2.jpeg',
            '../assets/images/smartjuice/StrobeDemo/3.jpeg'
        ],
        description: 'description'
    },
    Trident: {
        images: [
            '../assets/images/smartjuice/Trident/1.png',
            '../assets/images/smartjuice/Trident/2.jpeg',
            '../assets/images/smartjuice/Trident/3.png'
        ],
        description: 'description'
    },
    UnloadingShip: {
        images: [
            '../assets/images/smartjuice/UnloadingShip/1.jpeg',
            '../assets/images/smartjuice/UnloadingShip/2.jpeg',
            '../assets/images/smartjuice/UnloadingShip/3.jpeg',
            '../assets/images/smartjuice/UnloadingShip/4.png',
            '../assets/images/smartjuice/UnloadingShip/5.png',
            '../assets/images/smartjuice/UnloadingShip/6.jpeg',
            '../assets/images/smartjuice/UnloadingShip/7.jpeg',
            '../assets/images/smartjuice/UnloadingShip/8.jpeg',
            '../assets/images/smartjuice/UnloadingShip/9.jpeg',
        ],
        description: 'description'
    }
};

let currentGallery = null;
let currentIndex = 0;
const IMAGES_PER_VIEW = 5;

function openGallery(project) {
    currentGallery = galleries[project];
    currentIndex = 0;
    document.getElementById('galleryTitle').textContent = project;
    updateGalleryModal();
    document.getElementById('galleryModal').style.display = 'flex';
}

function updateGalleryModal() {
    const imagesDiv = document.getElementById('galleryImages');
    const descDiv = document.getElementById('galleryDescription');
    imagesDiv.innerHTML = '';

    for (let i = currentIndex; i < Math.min(currentIndex + IMAGES_PER_VIEW, currentGallery.images.length); i++) {
        const img = document.createElement('img');
        img.src = currentGallery.images[i];
        img.style.maxWidth = '260px';
        img.style.margin = '0 8px';
        img.style.borderRadius = '8px';
        imagesDiv.appendChild(img);
    }

    imagesDiv.insertAdjacentHTML('afterbegin', `<span class="arrow left" onclick="scrollGallery(-1)">&lt;</span>`);
    imagesDiv.insertAdjacentHTML('beforeend', `<span class="arrow right" onclick="scrollGallery(1)">&gt;</span>`);

    descDiv.textContent = currentGallery.description;
}

function scrollGallery(direction) {
    const maxIndex = Math.max(0, currentGallery.images.length - IMAGES_PER_VIEW);
    currentIndex += direction * IMAGES_PER_VIEW;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    updateGalleryModal();
}

function closeGallery() {
    document.getElementById('galleryModal').style.display = 'none';
}