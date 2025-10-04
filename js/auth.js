const BASE_URL = CONFIG.BASE_URL;
const TOKEN_KEY = 'sessionToken'; 

let loginBtn, loginStatus;

document.addEventListener('DOMContentLoaded', function() {
    loginBtn = document.getElementById('login-btn');
    loginStatus = document.getElementById('login-status');
      
    setupAuthEvents();
    checkExistingToken();
});

function setupAuthEvents() {
    loginBtn.addEventListener('click', handleLogin);
}

async function handleLogin() {
    try {
        // Estado de carga
        loginBtn.disabled = true;
        loginBtn.textContent = 'Autenticando...';
        showStatus('Conectando con el backend...', 'info');

        // CREDENCIALES EXACTAS como pide el examen
        const credentials = {
            email: 'admin@admin.com',
            password: 'admin'
        };

        const response = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        // MANEJO DE RESPUESTAS SEGÚN RÚBRICA
        if (response.ok && data.token) {
            // ✅ LOGIN EXITOSO - Guardar token como pide el examen
            localStorage.setItem(TOKEN_KEY, data.token);
            
            // UI para éxito
            showStatus('Autenticación exitosa', 'success');
            
            // Ocultar botón de login
            loginBtn.style.display = 'none';
            
            // Mostrar secciones protegidas
            showProtectedSections();
            
            console.log('✅ Login exitoso. Token almacenado como:', TOKEN_KEY);
            
        } else if (response.status === 400) {
            // ❌ CREDENCIALES INVÁLIDAS - Como especifica el examen
            throw new Error('invalid credentials');
        } else {
            throw new Error(data.error || 'Error en la autenticación');
        }

    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        
        // Manejo específico de errores según rúbrica
        if (error.message === 'invalid credentials') {
            showStatus('❌ Error: Credenciales inválidas', 'error');
        } else {
            showStatus(`❌ Error: ${error.message}`, 'error');
        }
        
        loginBtn.disabled = false;
        loginBtn.textContent = 'Iniciar Sesión';
    }
}

// VERIFICAR TOKEN EXISTENTE
function checkExistingToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        console.log('✅ Token existente encontrado en localStorage');
        showProtectedSections();
        loginBtn.style.display = 'none';
    }
}

// MOSTRAR SECCIONES PROTEGIDAS
function showProtectedSections() {
    document.getElementById('search-section').classList.remove('hidden');
    document.getElementById('results-section').classList.remove('hidden');
}

// OBTENER TOKEN (para uso en otros módulos)
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// MOSTRAR ESTATUS
function showStatus(message, type) {
    loginStatus.classList.remove('hidden');
    loginStatus.textContent = message;
    loginStatus.className = `status ${type}`;
}