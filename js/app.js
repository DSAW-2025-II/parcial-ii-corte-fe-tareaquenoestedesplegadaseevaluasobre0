//Se ejecuta al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

//Inicialización de la aplicación
function initializeApp() {
    //Verificación para bloquear fetch directo a la APi
    if (typeof fetch === 'function') {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            //Bloqueo de llamadas directas a la API
            if (typeof url === 'string' && url.includes('pokeapi.co')) {
                throw new Error('El frontend no se puede comunicar con la API');
            }
            return originalFetch.apply(this, args);
        };
    }   
    
    //Inicialización de módulos
    setupGlobalEvents();
}

function setupGlobalEvents() {
    //Limpieza de resultados al modificar el input
    const pokemonInput = document.getElementById('pokemon-input');
    if (pokemonInput) {
        pokemonInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                clearPokemonResults();
            }
        });
    }
    
}

// Función global para obtener token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}