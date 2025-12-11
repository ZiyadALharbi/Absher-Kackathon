const svgContainer = document.getElementById('saudi-arabia-map-svg');
const kiosksContainer = document.querySelector('.kiosks-list');
if (svgContainer.children.length === 0) {
    kiosksContainer.style.transform = 'translateY(0px)';
} else {
    kiosksContainer.style.transform = 'translateY(-90px)';
}
const svgPath = svgContainer.dataset.svgSrc;
// kiosksContainer.classList.add('d-none');
if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver

    loadSVG(svgContainer, svgPath);
} else {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadSVG(svgContainer, svgPath);
            observer.disconnect();
        }
    }, {
        threshold: 0.1
    });

    observer.observe(svgContainer);
}

function loadSVG(container, path) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(svgContent => {
            container.innerHTML = svgContent;
            const svgElement = container.querySelector('svg');
            if (svgElement) {
                container.dispatchEvent(new CustomEvent('svgLoaded', {
                    detail: {
                        container,
                        svgElement
                    }
                }));
                kiosksContainer.removeAttribute('style')
                // kiosksContainer.style.transform = 'translateY(-90px)';
                // if (scriptPath) {
                return loadScript('/portal/individuals/assets/scripts/map.js');
                // }
            } else {
                throw new Error('No SVG element found in the loaded content');
            }
        })
        .catch(error => {
            console.error('Failed to load SVG:', error);
            container.textContent = 'Failed to load SVG';
        });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {

        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = () => {
            console.log('Script loaded successfully');

            // Dispatch event when script is loaded
            svgContainer.dispatchEvent(new CustomEvent('scriptLoaded', {
                detail: {
                    container: svgContainer
                }
            }));
            resolve();
        };

        script.onerror = (error) => {
            console.error('Script failed to load:', error);
            reject(error);
        };
        document.body.appendChild(script);
    });
}