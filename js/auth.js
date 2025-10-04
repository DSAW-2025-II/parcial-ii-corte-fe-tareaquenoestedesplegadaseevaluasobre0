//Variables de entorno
const BASE_URL = CONFIG.BASE_URL;
const TOKEN_KEY = CONFIG.TOKEN_KEY; 

//Elementos del DOM
let loginBtn, loginStatus;

//Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    loginBtn = document.getElementById('login-btn');
    loginStatus = document.getElementById('login-status');
    setupAuthEvents();
    checkExistingToken();
});

//Event listeners para la autenticación
function setupAuthEvents() {
    loginBtn.addEventListener('click', handleLogin);
}

//Manejo del login
async function handleLogin() {

    try {
        // Estado de carga
        loginBtn.disabled = true;
        loginBtn.textContent = 'Autenticando...';
        showStatus('Conectando con el backend...', 'info');

        //Credenciales guardadas en .env y config.js
        const credentials = CONFIG.CREDENTIALS;

        // Petición al endpoint de autenticación
        const response = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        //Respuesta del Backend en JSON
        const data = await response.json();

        //Manejo de las respuestas
        if (response.ok && data.token) {
            //Guardado del token en localStorage
            localStorage.setItem(TOKEN_KEY, data.token);
            
            //Estado de éxito
            showStatus('Autenticación exitosa', 'success');
            
            //Display nulo del botón de login
            loginBtn.style.display = 'none';
            
            // Mostrar secciones protegidas
            showProtectedSections();
            
        } else if (response.status === 400) { //Manejo de errores
            //Credenciales inválidas
            throw new Error('invalid credentials');
        } else {
            //Errores en autenticación
            throw new Error(data.error || 'Error en la autenticación');
        }

    } catch (error) {
        // Manejo de errores
        if (error.message === 'invalid credentials') {
            showStatus('Error: Credenciales inválidas', 'error');
        } else {
            showStatus(`Error: ${error.message}`, 'error');
        }
        
        //Habilitación del botón de login
        loginBtn.disabled = false;
        loginBtn.textContent = 'Iniciar Sesión';
    }
}

//Verificación de token
function checkExistingToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        console.log('✅ Token existente encontrado en localStorage');
        showProtectedSections();
        loginBtn.style.display = 'none';
    }
}

//Mostrar el resto del contenido
function showProtectedSections() {
    document.getElementById('search-section').classList.remove('hidden');
    document.getElementById('results-section').classList.remove('hidden');
}

//Get para el token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

//Mostrar estado
function showStatus(message, type) {
    loginStatus.classList.remove('hidden');
    loginStatus.textContent = message;
    loginStatus.className = `status ${type}`;
}