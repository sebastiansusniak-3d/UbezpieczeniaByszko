// script.js - Interaktywność strony Uniqa Iwona Buszko-Byszewska
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Mobile hamburger menu (Sprawdzenie czy elementy istnieją przed dodaniem nasłuchiwania)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Przełączanie ikony burgera (opcjonalne, jeśli masz style dla .active)
            hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
    }

    // 2. Smooth scrolling dla linków kotwicowych (tylko wewnętrznych)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // Ignoruj linki typu "#" bez ID lub linki do innych podstron
            if (targetId === '#' || !targetId) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Walidacja formularza kontaktowego
    const contactForms = document.querySelectorAll('.contact-form');
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Wyczyść poprzednie błędy
            form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

            if (validateForm(form)) {
                // Symulacja wysyłania (tutaj normalnie fetch/AJAX)
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.textContent : 'Wyślij';
                
                if(submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Wysyłanie...';
                }

                setTimeout(() => {
                    showSuccessMessage(form);
                    if(submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }, 1500);
            }
        });
    });

    // 4. Lazy loading obrazków
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded'); // Klasa do ewentualnej animacji fade-in
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback dla starych przeglądarek - ładuj wszystko od razu
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // 5. Testimonial slider (tylko jeśli element istnieje)
    const testimonials = document.querySelector('.testimonial-slider');
    if (testimonials) {
        setInterval(() => {
            const scrollAmount = testimonials.clientWidth * 0.8; // Przewiń o 80% szerokości
            testimonials.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            // Pętla: jeśli przewinięto na koniec, wróć na początek
            if (testimonials.scrollLeft + testimonials.clientWidth >= testimonials.scrollWidth - 10) {
                setTimeout(() => {
                    testimonials.scrollTo({ left: 0, behavior: 'smooth' });
                }, 1000);
            }
        }, 6000);
    }

    // 6. Telefony z auto-dial (bezpieczne wywołanie gtag)
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'phone_click', {
                    'event_category': 'Kontakt',
                    'event_label': 'Iwona Buszko-Byszewska',
                    'value': 1
                });
            }
        });
    });

    // 7. Inicjalizacja Cookie Consent
    initCookieConsent();
});

// --- Funkcje pomocnicze ---

// Funkcja walidacji formularza (POPRAWIONE REGEXY)
function validateForm(form) {
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');
    const message = form.querySelector('#message');
    
    // Poprawiony regex: \\s zamiast s
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[0-9\s\-()]{9,}$/;
    
    let isValid = true;
    
    if (email && !emailRegex.test(email.value.trim())) {
        showFieldError(email, 'Proszę podać prawidłowy adres email.');
        isValid = false;
    }
    
    if (phone && !phoneRegex.test(phone.value.trim())) {
        showFieldError(phone, 'Proszę podać prawidłowy numer telefonu (min. 9 cyfr).');
        isValid = false;
    }
    
    if (message && message.value.trim().length < 10) {
        showFieldError(message, 'Wiadomość musi mieć minimum 10 znaków.');
        isValid = false;
    }
    
    return isValid;
}

// Wyświetlanie błędów
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Szukaj istniejącego elementu na komunikat lub utwórz nowy
    let errorSpan = field.nextElementSibling;
    if (!errorSpan || !errorSpan.classList.contains('error-message')) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        field.parentNode.insertBefore(errorSpan, field.nextSibling);
    }
    errorSpan.textContent = message;
    
    // Usuń błąd po wpisaniu tek