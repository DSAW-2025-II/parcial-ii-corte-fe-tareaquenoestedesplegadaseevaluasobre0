// ARCHIVO PRINCIPAL - Coordinación y utilidades
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Verificar que no haya comunicación directa con PokeAPI
    if (typeof fetch === 'function') {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            // BLOQUEAR cualquier intento de comunicación directa con PokeAPI
            if (typeof url === 'string' && url.includes('pokeapi.co')) {
                throw new Error('El frontend no se puede comunicar con la API');
            }
            return originalFetch.apply(this, args);
        };
    }   
    
    setupGlobalEvents();
}

function setupGlobalEvents() {
    // Limpiar resultados cuando el input esté vacío
    const pokemonInput = document.getElementById('pokemon-input');
    if (pokemonInput) {
        pokemonInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                clearPokemonResults();
            }
        });
    }
    
    console.log('✅ App inicializada correctamente');
}

// Función global para obtener token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}