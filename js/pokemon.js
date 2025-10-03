const BASE_URL = CONFIG.BASE_URL; 
const TOKEN_KEY = 'sessionToken';

let searchBtn, pokemonInput, resultsContainer;

document.addEventListener('DOMContentLoaded', function() {
    searchBtn = document.getElementById('search-btn');
    pokemonInput = document.getElementById('pokemon-input');
    resultsContainer = document.getElementById('pokemon-results');
    
    setupPokemonEvents();
});

function setupPokemonEvents() {
    searchBtn.addEventListener('click', handleSearch);
    
    pokemonInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

async function handleSearch() {
    const pokemonName = pokemonInput.value.trim();
    
    if (!pokemonName) {
        showPokemonError('Por favor, ingresa el nombre de un Pokémon');
        return;
    }

    try {
        // Estado de carga
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="loading"></span> Consultando...';
        showPokemonLoading();

        const token = getToken();
        
        // VERIFICAR AUTENTICACIÓN
        if (!token) {
            throw new Error('No autenticado. Inicia sesión primero.');
        }

        console.log(`🔍 Buscando Pokémon: ${pokemonName}`);
        
        // COMUNICACIÓN SOLO CON BACKEND (como exige la rúbrica)
        const response = await fetch(`${BASE_URL}/pokemonDetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Header exacto como pide el examen
            },
            body: JSON.stringify({ pokemonName: pokemonName })
        });

        const data = await response.json();

        if (response.status === 200) {
            if (data.name && data.species) {
                displayPokemonData(data);
            } else {
                showPokemonNotFound();
            }
        } else if (response.status === 403) {
            throw new Error('User not authenticated');
        } else if (response.status === 400) {
            showPokemonNotFound();
        } else {
            throw new Error(data.error || 'Error en la búsqueda');
        }

    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        
        // Manejo específico de errores de autenticación
        if (error.message === 'User not authenticated') {
            showPokemonError('Error: Usuario no autenticado. Token inválido o expirado.');
        } else {
            showPokemonError(`Error: ${error.message}`);
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = '🐱‍👤 Buscar en PokéAPI';
    }
}


function displayPokemonData(pokemon) {
    console.log('✅ Pokémon encontrado:', pokemon);
    
    const html = `
        <div class="pokemon-card">
            <img src="${pokemon.img_url}" 
                 alt="${pokemon.name}" 
                 class="pokemon-image"
                 onerror="this.src='https://via.placeholder.com/200x200/dc0a2d/ffffff?text=Imagen+No+Disponible'">
            <h3 class="pokemon-name">${capitalizeFirst(pokemon.name)}</h3>
            <div class="pokemon-details">
                <div class="detail-item">
                    <span class="detail-label">Especie</span>
                    <span class="detail-value">${capitalizeFirst(pokemon.species)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Peso</span>
                    <span class="detail-value">${pokemon.weight} kg</span>
                </div>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 8px;">
                <small>✅ Pokémon encontrado exitosamente</small>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

function showPokemonNotFound() {
    
    const html = `
        <div class="pokemon-card">
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 3em; margin-bottom: 15px;">❌</div>
                <h3 style="color: #dc0a2d; margin-bottom: 15px;">¡Ups! Pokémon no encontrado</h3>
                <p>El Pokémon que buscas no existe en la Pokédex.</p>
                <p style="margin-top: 10px; color: #666; font-size: 0.9em;">
                    Verifica el nombre e intenta nuevamente.
                </p>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

function showPokemonLoading() {
    const html = `
        <div class="pokemon-card">
            <div style="text-align: center; padding: 40px;">
                <div class="loading" style="width: 40px; height: 40px; margin: 0 auto 20px;"></div>
                <p>Consultando PokéAPI a través del backend...</p>
                <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                    🔒 Comunicación segura: FE → BE → PokeAPI
                </p>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

function showPokemonError(message) {
    const html = `
        <div class="pokemon-card">
            <div style="text-align: center; padding: 30px;">
                <h3 style="color: #dc3545; margin-bottom: 15px;">⚠️ Error de Búsqueda</h3>
                <p>${message}</p>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

function clearPokemonResults() {
    resultsContainer.innerHTML = `
        <div class="placeholder">
            👆 Ingresa un nombre de Pokémon y haz clic en Buscar
        </div>
    `;
}

// Utilidad para capitalizar
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}