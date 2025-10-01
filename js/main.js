// CRM Integration and Main Functionality
class RealEstateCRM {
    constructor() {
        this.apiBase = 'https://your-crm-api.com/api'; // Replace with actual CRM API
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.init();
    }

    init() {
        this.loadFeaturedProperties();
        this.setupEventListeners();
        this.updateFavoritesCount();
    }

    // CRM Integration Methods
    async loadFeaturedProperties() {
        try {
            // Simulate API call - replace with actual CRM integration
            const response = await fetch(`${this.apiBase}/properties/featured`);
            const properties = await response.json();
            this.renderFeaturedProperties(properties);
        } catch (error) {
            console.error('Error loading properties:', error);
            // Fallback to demo data
            this.renderFeaturedProperties(this.getDemoProperties());
        }
    }

    async searchProperties(filters) {
        try {
            const response = await fetch(`${this.apiBase}/properties/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters)
            });
            return await response.json();
        } catch (error) {
            console.error('Error searching properties:', error);
            return this.getDemoProperties().filter(property => 
                this.matchesFilters(property, filters)
            );
        }
    }

    async submitLead(formData) {
        try {
            const response = await fetch(`${this.apiBase}/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error submitting lead:', error);
            // Fallback - store locally or send email
            this.storeLeadLocally(formData);
        }
    }

    async scheduleViewing(propertyId, dateTime, contactInfo) {
        try {
            const response = await fetch(`${this.apiBase}/viewings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    propertyId,
                    dateTime,
                    contactInfo
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error scheduling viewing:', error);
        }
    }

    // Favorites Management
    toggleFavorite(propertyId) {
        const index = this.favorites.indexOf(propertyId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(propertyId);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoritesCount();
    }

    isFavorite(propertyId) {
        return this.favorites.includes(propertyId);
    }

    updateFavoritesCount() {
        const countElement = document.querySelector('.favorites-count');
        if (countElement) {
            countElement.textContent = this.favorites.length;
        }
    }

    // Newsletter Subscription
    async subscribeToNewsletter(email, filters = {}) {
        try {
            const response = await fetch(`${this.apiBase}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, filters })
            });
            return await response.json();
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            this.storeSubscriptionLocally(email, filters);
        }
    }

    // Demo Data (remove when CRM is connected)
    getDemoProperties() {
        return [
            {
                id: 1,
                title: "3-комнатная квартира в центре Бишкека",
                price: 45000,
                type: "apartment",
                operation: "sale",
                location: "Бишкек, Центр",
                rooms: 3,
                area: 85,
                image: "images/objects/1.jpg",
                featured: true
            },
            {
                id: 2,
                title: "Коттедж в пригороде Бишкека",
                price: 120000,
                type: "cottage",
                operation: "sale",
                location: "Бишкек, Пригород",
                rooms: 5,
                area: 200,
                image: "images/objects/2.jpg",
                featured: true
            }
        ];
    }

    matchesFilters(property, filters) {
        // Implementation of filter matching logic
        return true;
    }

    renderFeaturedProperties(properties) {
        const container = document.getElementById('featured-properties');
        if (!container) return;

        container.innerHTML = properties.map(property => `
            <div class="property-card" data-id="${property.id}">
                <div class="property-image">
                    <div class="property-badge">${property.operation === 'sale' ? 'Продажа' : 'Аренда'}</div>
                    <img src="${property.image}" alt="${property.title}" onerror="this.src='images/placeholder-property.jpg'">
                </div>
                <div class="property-content">
                    <h3>${property.title}</h3>
                    <div class="property-price">${property.price.toLocaleString()} $</div>
                    <div class="property-features">
                        <span>${property.rooms} комн.</span>
                        <span>${property.area} м²</span>
                        <span>${property.location}</span>
                    </div>
                    <div class="property-actions">
                        <button class="btn-primary" onclick="crm.scheduleViewingModal(${property.id})">Запись на просмотр</button>
                        <button class="favorite-btn ${crm.isFavorite(property.id) ? 'active' : ''}" 
                                onclick="crm.toggleFavorite(${property.id})">
                            ♥
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Modal Methods
    openModal(id) {
        document.getElementById(id).style.display = 'block';
    }

    closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }

    scheduleViewingModal(propertyId) {
        this.openModal('schedule-modal');
        // Store property ID for form submission
        document.getElementById('schedule-form').dataset.propertyId = propertyId;
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Main search form
        const searchForm = document.getElementById('main-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(searchForm);
                const filters = Object.fromEntries(formData);
                window.location.href = `catalog.html?${new URLSearchParams(filters)}`;
            });
        }

        // Advanced filters toggle
        const advancedFiltersBtn = document.getElementById('advanced-filters-btn');
        if (advancedFiltersBtn) {
            advancedFiltersBtn.addEventListener('click', () => {
                const filters = document.getElementById('advanced-filters');
                filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                const result = await this.subscribeToNewsletter(email);
                if (result.success) {
                    alert('Спасибо за подписку!');
                    newsletterForm.reset();
                }
            });
        }

        // Callback form
        const callbackForm = document.getElementById('callback-form');
        if (callbackForm) {
            callbackForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(callbackForm);
                const leadData = Object.fromEntries(formData);
                const result = await this.submitLead(leadData);
                if (result.success) {
                    alert('Мы скоро вам перезвоним!');
                    this.closeModal('callback-modal');
                    callbackForm.reset();
                }
            });
        }

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Fallback methods for when CRM is not available
    storeLeadLocally(leadData) {
        const leads = JSON.parse(localStorage.getItem('leads')) || [];
        leads.push({...leadData, timestamp: new Date().toISOString()});
        localStorage.setItem('leads', JSON.stringify(leads));
    }

    storeSubscriptionLocally(email, filters) {
        const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions')) || [];
        subscriptions.push({email, filters, timestamp: new Date().toISOString()});
        localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
    }
}

// Initialize CRM when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crm = new RealEstateCRM();
});