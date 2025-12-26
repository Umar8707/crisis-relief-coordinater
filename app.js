// Data Store
const incidents = [
    { coords: [40.7128, -74.0060], type: 'Fire', severity: 'high' },
    { coords: [40.7200, -74.0100], type: 'Medical', severity: 'medium' },
    { coords: [40.7050, -73.9900], type: 'Supply Drop', severity: 'low' },
    { coords: [40.7350, -73.9950], type: 'Flood', severity: 'high' },
    { coords: [40.7100, -73.9500], type: 'Structure Fail', severity: 'medium' }
];

document.addEventListener('DOMContentLoaded', () => {
    initMaps();
    renderResources();
    renderVolunteers();
});

// Volunteer Data
const volunteers = [
    { id: 1, name: 'Sarah Jenkins', role: 'Paramedic', status: 'Busy', location: 'Sector 4', avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random' },
    { id: 2, name: 'Mike Ross', role: 'Logistics', status: 'Online', location: 'Base Alpha', avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=random' },
    { id: 3, name: 'David Kim', role: 'Search & Rescue', status: 'Offline', location: '-', avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=random' },
    { id: 4, name: 'Elena Rodriguez', role: 'Medical', status: 'Online', location: 'Mobile Unit 2', avatar: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random' },
    { id: 5, name: 'Tom Hardy', role: 'Driver', status: 'Busy', location: 'Route 9', avatar: 'https://ui-avatars.com/api/?name=Tom+Hardy&background=random' }
];

function renderVolunteers() {
    const grid = document.getElementById('volunteer-grid');
    if (!grid) return;

    grid.innerHTML = volunteers.map(vol => {
        let statusColor = 'var(--status-success)';
        if (vol.status === 'Busy') statusColor = 'var(--status-warning)';
        if (vol.status === 'Offline') statusColor = 'var(--text-secondary)';

        return `
        <div class="resource-card glass-panel" style="display: flex; align-items: center; gap: 1rem;">
            <img src="${vol.avatar}" alt="${vol.name}" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid ${statusColor};">
            <div style="flex: 1;">
                <h4 style="font-size: 1rem; margin-bottom: 2px;">${vol.name}</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">${vol.role}</p>
            </div>
            <div style="text-align: right;">
                <span style="display: block; font-size: 0.8rem; color: ${statusColor}; font-weight: 600;">${vol.status}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary);"><i class="fa-solid fa-location-dot"></i> ${vol.location}</span>
            </div>
        </div>
        `;
    }).join('');
}

// Resources Data
const resources = [
    { id: 1, name: 'Bottled Water', category: 'Hydration', quantity: 2400, unit: 'Liters', status: 'Adequate' },
    { id: 2, name: 'MRE Packs', category: 'Food', quantity: 150, unit: 'Box', status: 'Low' },
    { id: 3, name: 'First Aid Kits', category: 'Medical', quantity: 500, unit: 'Kits', status: 'Surplus' },
    { id: 4, name: 'Blankets', category: 'Shelter', quantity: 800, unit: 'Pcs', status: 'Adequate' },
    { id: 5, name: 'Generators', category: 'Power', quantity: 5, unit: 'Units', status: 'Critical' },
    { id: 6, name: 'Flashlights', category: 'Equipment', quantity: 200, unit: 'Pcs', status: 'Adequate' }
];

function renderResources() {
    const grid = document.getElementById('resource-grid');
    if (!grid) return;

    grid.innerHTML = resources.map(item => {
        let statusClass = 'status-ok';
        let borderClass = 'resource-status-ok';

        if (item.status === 'Low' || item.status === 'Critical') {
            statusClass = 'status-low';
            borderClass = 'resource-status-low';
        }
        if (item.status === 'Surplus') {
            statusClass = 'status-surplus';
            borderClass = 'resource-status-surplus';
        }

        return `
        <div class="resource-card glass-panel ${borderClass}">
            <div class="res-header">
                <span class="res-category">${item.category}</span>
                <i class="fa-solid fa-ellipsis-vertical" style="color: var(--text-secondary); cursor: pointer;"></i>
            </div>
            <h3 class="res-name">${item.name}</h3>
            <div class="res-details">
                <div class="res-qty-box">
                    <div class="res-quantity">${item.quantity.toLocaleString()}</div>
                    <div class="res-unit">${item.unit}</div>
                </div>
                <span class="res-status-badge ${statusClass}">${item.status}</span>
            </div>
        </div>
        `;
    }).join('');
}

function initMaps() {
    // Map Config
    const mapConfig = {
        center: [40.7128, -74.0060],
        zoom: 13,
        tiles: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    };

    // Initialize Mini Map (Dashboard)
    if (document.getElementById('mini-map')) {
        const miniMap = L.map('mini-map', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false
        }).setView(mapConfig.center, 12);

        L.tileLayer(mapConfig.tiles, { maxZoom: 20 }).addTo(miniMap);
        addMarkers(miniMap);
    }

    // Initialize Full Map
    if (document.getElementById('full-map')) {
        window.fullMap = L.map('full-map').setView(mapConfig.center, mapConfig.zoom);
        L.tileLayer(mapConfig.tiles, { attribution: mapConfig.attr, maxZoom: 20 }).addTo(window.fullMap);
        addMarkers(window.fullMap);
    }
}

function addMarkers(map) {
    incidents.forEach(incident => {
        let color = '#3b82f6'; // blue
        if (incident.severity === 'high') color = '#ef4444'; // red
        if (incident.severity === 'medium') color = '#f59e0b'; // orange

        const circleMarker = L.circleMarker(incident.coords, {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        circleMarker.bindPopup(`
            <div style="font-family: 'Outfit', sans-serif;">
                <strong style="color: ${color}; text-transform: uppercase; font-size: 0.8rem;">${incident.severity} Priority</strong>
                <h3 style="margin: 4px 0; font-size: 1rem;">${incident.type}</h3>
                <span style="font-size: 0.8rem; color: #666;">Coords: ${incident.coords[0].toFixed(3)}, ${incident.coords[1].toFixed(3)}</span>
            </div>
        `);
    });
}

// Navigation Logic
const navLinks = document.querySelectorAll('.nav-links li a, .view-all');
const sections = document.querySelectorAll('.view-section');
const pageTitle = document.querySelector('.top-bar h1');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);

        // Update Nav State
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        if (link.parentElement.tagName === 'LI') {
            link.parentElement.classList.add('active');
        }

        // Update View
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });

        // Update Title
        const titleMap = {
            'dashboard': 'Overview',
            'map': 'Global Incident Map',
            'resources': 'Resource Management',
            'volunteers': 'Volunteer Coordination',
            'settings': 'Settings'
        };
        if (titleMap[targetId]) pageTitle.textContent = titleMap[targetId];

        // Re-size map if entering map view (Leaflet quirk)
        if (targetId === 'map' && window.fullMap) {
            setTimeout(() => window.fullMap.invalidateSize(), 100);
        }
    });
});
