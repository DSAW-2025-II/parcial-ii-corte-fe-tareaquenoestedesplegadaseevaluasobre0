//Contenido del DOM
let searchBtn, pokemonInput, resultsContainer;

//Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    searchBtn = document.getElementById('search-btn');
    pokemonInput = document.getElementById('pokemon-input');
    resultsContainer = document.getElementById('pokemon-results');
    
    setupPokemonEvents();
});

//Event listeners para buscar Pokemones
function setupPokemonEvents() {
    searchBtn.addEventListener('click', handleSearch);
    
    pokemonInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

//Manejo de búsqueda del Pokémon
async function handleSearch() {
    //Obtener el nombre del Pokémon
    const pokemonName = pokemonInput.value.trim();
    
    //Si el nombre está vacío se muestra un error
    if (!pokemonName) {
        showPokemonError('Por favor, ingresa el nombre de un Pokémon');
        return;
    }


    try {
        // Estado de carga
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="loading"></span> Consultando...';
        showPokemonLoading();

        //Token de autenticación
        const token = getToken();
        
        //Verificación del token de autenticación
        if (!token) {
            throw new Error('No autenticado. Inicia sesión primero.');
        }
        
        //Comunicación hacia el Backend para obtener detalles del Pokémon
        const response = await fetch(`${CONFIG.BASE_URL}/pokemonDetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` //Header de autenticación
            },
            body: JSON.stringify({ pokemonName: pokemonName })
        });

        //Parseo a JSON de la respuesta
        const data = await response.json();

        //Manejo de respuestas del backend
        if (response.status === 200) {
            if (data.name && data.species) {
                displayPokemonData(data);
            } else {
                showPokemonNotFound();
            }
        } else if (response.status === 403) {
            //Renovación de  autenticación
            try {
                // Intento de re-autenticación
                await handleLogin();
                const retryToken = getToken(); // Nuevo token
                //Reintento de la búsqueda con el nuevo token
                const retryRes = await fetch(`${CONFIG.BASE_URL}/pokemonDetails`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${retryToken}`
                    },
                    body: JSON.stringify({ pokemonName: pokemonName })
                });

                //Parseo a JSON de la respuesta nueva
                const retryData = await retryRes.json();

                //Manejo de respuestas del backend
                if (retryRes.status === 200) {
                    if (retryData.name && retryData.species) {
                        displayPokemonData(retryData); //Reintento exitoso
                    } else {
                        showPokemonNotFound(); //No se encontró el Pokémon
                    }
                } else if (retryRes.status === 400) {
                    showPokemonNotFound(); //No se encontró el Pokémon
                } else {
                    throw new Error(retryData.error || 'Error en la búsqueda');
                }
            } catch (e) {
                //Fallo en la re-autenticación
                throw new Error('User not authenticated');
            }
        } else if (response.status === 400) {
            showPokemonNotFound(); //No se encontró el Pokémon
        } else {
            throw new Error(data.error || 'Error en la búsqueda');
        }

    } catch (error) {
        console.error('Error en búsqueda:', error);
        
        // Manejo específico de errores de autenticación
        if (error.message === 'User not authenticated') {
            showPokemonError('Error: Usuario no autenticado. Token inválido o expirado.');
        } else {
            showPokemonError(`Error: ${error.message}`);
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Buscar';
    }
}

//Manipulación del DOM para mostrar los datos del Pokémon
function displayPokemonData(pokemon) {
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
        </div>
    `;
    
    // Actualización del contenedor de resultados
    resultsContainer.innerHTML = html;
}

//Mostrar mensaje de Pokémon no encontrado
function showPokemonNotFound() {
    //Manipulación del DOM para mostrar el error
    const html = `
        <div class="pokemon-card">
            <div style="text-align: center; padding: 30px;">
                <h3 style="color: #dc0a2d; margin-bottom: 15px;">Ups! Pokémon no encontrado</h3>
                <p>El Pokémon que buscas no existe en la Pokédex.</p>
                <p style="margin-top: 10px; color: #666; font-size: 0.9em;">
                    Verifica el nombre e intenta nuevamente.
                </p>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

//Mostrar estado de carga
function showPokemonLoading() {
    const html = `
        <div class="pokemon-card">
            <div style="text-align: center; padding: 40px;">
                <div class="loading" style="width: 40px; height: 40px; margin: 0 auto 20px;"></div>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

//Mostrar mensaje de error
function showPokemonError(message) {
    const html = `
        <div class="pokemon-card">
            <div style="text-align: center; padding: 30px;">
                <h3 style="color: #dc3545; margin-bottom: 15px;">Error de Búsqueda</h3>
                <p>${message}</p>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

//Limpieza del contenedor de resultados para reiniciar el estado
function clearPokemonResults() {
    resultsContainer.innerHTML = `
        <div class="placeholder">
            👆 Ingresa un nombre de Pokémon y haz clic en Buscar
        </div>
    `;
}

//Poner en mayúscula la primera letra del pokemon
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
