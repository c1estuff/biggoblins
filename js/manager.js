// Manager Portal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize manager portal if authenticated
    initializeManagerPortal();
});

function isAuthenticated() {
    return localStorage.getItem('managerToken') === 'authenticated';
}

function initializeManagerPortal() {
    // Load initial data
    loadAllData();
    // Setup form submissions
    setupFormHandlers();
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.manager-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');

    // Load section data
    loadSectionData(sectionName);
}

function loadAllData() {
    // Load data for all sections
    loadSectionData('announcements');
    loadSectionData('events');
    loadSectionData('members');
    loadSectionData('guides');
}

function loadSectionData(section) {
    // Fetch and display data for the specified section
    fetch(`/api/${section}`)
        .then(response => response.json())
        .then(data => {
            updateSectionDisplay(section, data);
        })
        .catch(error => console.error('Error loading data:', error));
}

function setupFormHandlers() {
    // Setup form submission handlers for each section
    const forms = {
        'announcement-form': handleAnnouncementSubmit,
        'event-form': handleEventSubmit,
        'member-form': handleMemberSubmit,
        'guide-form': handleGuideSubmit
    };

    Object.entries(forms).forEach(([formId, handler]) => {
        document.getElementById(formId)?.addEventListener('submit', handler);
    });
}

// Form submission handlers
function handleAnnouncementSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    submitData('announcements', formData);
}

function handleEventSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    submitData('events', formData);
}

function handleMemberSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    submitData('members', formData);
}

function handleGuideSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    submitData('guides', formData);
}

function submitData(section, formData) {
    const data = Object.fromEntries(formData.entries());
    
    fetch(`/api/${section}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('managerToken')}`
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            loadSectionData(section);
            event.target.reset();
        }
    })
    .catch(error => console.error('Error submitting data:', error));
}

function updateSectionDisplay(section, data) {
    const container = document.querySelector(`#${section}-section .current-items`);
    if (!container) return;

    container.innerHTML = data.map(item => createItemHTML(section, item)).join('');
}

function createItemHTML(section, item) {
    // Create HTML for different types of items
    const templates = {
        announcements: item => `
            <div class="item-card">
                <h4>${item.title}</h4>
                <p>${item.content}</p>
                <button onclick="deleteItem('announcements', ${item.id})">Delete</button>
            </div>
        `,
        events: item => `
            <div class="item-card">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <p>Type: ${item.type}</p>
                <p>Date: ${item.datetime}</p>
                <button onclick="deleteItem('events', ${item.id})">Delete</button>
            </div>
        `,
        // Add templates for other sections
    };

    return templates[section](item);
}

function deleteItem(section, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`/api/${section}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('managerToken')}`
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadSectionData(section);
            }
        })
        .catch(error => console.error('Error deleting item:', error));
    }
}

// Manager Authentication
let isAuthenticated = false;

function openManagerPortal() {
    const overlay = document.querySelector('.modal-overlay');
    const authModal = document.createElement('div');
    authModal.className = 'auth-modal';
    authModal.innerHTML = `
        <h3>Manager Portal Login</h3>
        <form id="managerLoginForm">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="managerUsername" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="managerPassword" class="form-input" required>
            </div>
            <button type="submit" class="submit-button">Login</button>
        </form>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(authModal);
    overlay.style.display = 'flex';

    document.getElementById('managerLoginForm').addEventListener('submit', handleManagerLogin);
}

function handleManagerLogin(e) {
    e.preventDefault();
    const username = document.getElementById('managerUsername').value;
    const password = document.getElementById('managerPassword').value;

    // For demo purposes - replace with your actual authentication
    if (username === "admin" && password === "admin123") {
        isAuthenticated = true;
        document.querySelector('.modal-overlay').style.display = 'none';
        showManagerDashboard();
    } else {
        alert('Invalid credentials');
    }
}

function showManagerDashboard() {
    if (!isAuthenticated) return;
    
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active-section'));
    document.getElementById('manager').classList.add('active-section');
}

// Event Management
function showEventManager() {
    if (!isAuthenticated) {
        openManagerPortal();
        return;
    }

    const managerContainer = document.querySelector('.manager-container');
    managerContainer.innerHTML = `
        <div class="manager-header">
            <button class="back-button" onclick="showManagerDashboard()">← Back</button>
            <h2>Event Manager</h2>
        </div>
        <form id="eventForm" class="manager-form">
            <div class="form-group">
                <label>Event Title</label>
                <input type="text" class="form-input" id="eventTitle" required>
            </div>
            <div class="form-group">
                <label>Event Type</label>
                <select class="form-input" id="eventType" required>
                    <option value="pvm">PvM</option>
                    <option value="pvp">PvP</option>
                    <option value="skilling">Skilling</option>
                    <option value="social">Social</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" class="form-input" id="eventDateTime" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-input" id="eventDescription" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label>Requirements</label>
                <input type="text" class="form-input" id="eventRequirements" placeholder="Comma-separated list">
            </div>
            <button type="submit" class="submit-button">Create Event</button>
        </form>
        <div class="existing-events">
            <h3>Existing Events</h3>
            <div id="eventsList"></div>
        </div>
    `;

    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
    loadExistingEvents();
}

// Announcement Management
function showAnnouncementManager() {
    if (!isAuthenticated) {
        openManagerPortal();
        return;
    }

    const managerContainer = document.querySelector('.manager-container');
    managerContainer.innerHTML = `
        <div class="manager-header">
            <button class="back-button" onclick="showManagerDashboard()">← Back</button>
            <h2>Announcement Manager</h2>
        </div>
        <form id="announcementForm" class="manager-form">
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="form-input" id="announcementTitle" required>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea class="form-input" id="announcementContent" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select class="form-input" id="announcementType">
                    <option value="normal">Normal</option>
                    <option value="warning">Warning</option>
                    <option value="important">Important</option>
                </select>
            </div>
            <button type="submit" class="submit-button">Post Announcement</button>
        </form>
        <div class="existing-announcements">
            <h3>Existing Announcements</h3>
            <div id="announcementsList"></div>
        </div>
    `;

    document.getElementById('announcementForm').addEventListener('submit', handleAnnouncementSubmit);
    loadExistingAnnouncements();
}

// Event Handlers
function handleEventSubmit(e) {
    e.preventDefault();
    const eventData = {
        title: document.getElementById('eventTitle').value,
        type: document.getElementById('eventType').value,
        dateTime: document.getElementById('eventDateTime').value,
        description: document.getElementById('eventDescription').value,
        requirements: document.getElementById('eventRequirements').value.split(',').map(r => r.trim())
    };

    // For demo - store in localStorage
    const events = JSON.parse(localStorage.getItem('clanEvents') || '[]');
    events.push(eventData);
    localStorage.setItem('clanEvents', JSON.stringify(events));

    alert('Event created successfully!');
    loadExistingEvents();
}

function handleAnnouncementSubmit(e) {
    e.preventDefault();
    const announcementData = {
        title: document.getElementById('announcementTitle').value,
        content: document.getElementById('announcementContent').value,
        type: document.getElementById('announcementType').value,
        date: new Date().toISOString()
    };

    // For demo - store in localStorage
    const announcements = JSON.parse(localStorage.getItem('clanAnnouncements') || '[]');
    announcements.push(announcementData);
    localStorage.setItem('clanAnnouncements', JSON.stringify(announcements));

    alert('Announcement posted successfully!');
    loadExistingAnnouncements();
}

// Utility Functions
function loadExistingEvents() {
    const events = JSON.parse(localStorage.getItem('clanEvents') || '[]');
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = events.map((event, index) => `
        <div class="event-item">
            <div class="event-info">
                <h4>${event.title}</h4>
                <p>${event.description}</p>
                <small>${new Date(event.dateTime).toLocaleString()}</small>
            </div>
            <button class="delete-button" onclick="deleteEvent(${index})">Delete</button>
        </div>
    `).join('');
}

function loadExistingAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('clanAnnouncements') || '[]');
    const announcementsList = document.getElementById('announcementsList');
    announcementsList.innerHTML = announcements.map((announcement, index) => `
        <div class="announcement-item ${announcement.type}">
            <div class="announcement-info">
                <h4>${announcement.title}</h4>
                <p>${announcement.content}</p>
                <small>${new Date(announcement.date).toLocaleString()}</small>
            </div>
            <button class="delete-button" onclick="deleteAnnouncement(${index})">Delete</button>
        </div>
    `).join('');
}

function deleteEvent(index) {
    const events = JSON.parse(localStorage.getItem('clanEvents') || '[]');
    events.splice(index, 1);
    localStorage.setItem('clanEvents', JSON.stringify(events));
    loadExistingEvents();
}

function deleteAnnouncement(index) {
    const announcements = JSON.parse(localStorage.getItem('clanAnnouncements') || '[]');
    announcements.splice(index, 1);
    localStorage.setItem('clanAnnouncements', JSON.stringify(announcements));
    loadExistingAnnouncements();
} 