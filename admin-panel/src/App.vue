<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// URL Dinámica (local vs producción)
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.cambioseurodolar.com';

const CURRENCIES = [
  { code: 'USD', name: 'Dólar (USD)', flagUrl: 'https://flagcdn.com/w160/us.webp' },
  { code: 'EUR', name: 'Euro (EUR)', flagUrl: 'https://flagcdn.com/w160/eu.webp' },
  { code: 'CAD', name: 'Dólar Canadiense (CAD)', flagUrl: 'https://flagcdn.com/w160/ca.webp' },
  { code: 'MXN', name: 'Peso Mexicano (MXN)', flagUrl: 'https://flagcdn.com/w160/mx.webp' },
  { code: 'GBP', name: 'Libra Esterlina (GBP)', flagUrl: 'https://flagcdn.com/w160/gb.webp' },
  { code: 'CLP', name: 'Peso Chileno (CLP)', flagUrl: 'https://flagcdn.com/w160/cl.webp' },
  { code: 'PEN', name: 'Nuevo Sol Perú (PEN)', flagUrl: 'https://flagcdn.com/w160/pe.webp' },
  { code: 'BRL', name: 'Real Brasileño (BRL)', flagUrl: 'https://flagcdn.com/w160/br.webp' },
  { code: 'ARS', name: 'Peso Argentino (ARS)', flagUrl: 'https://flagcdn.com/w160/ar.webp' },
  { code: 'COP', name: 'Peso Colombiano (COP)', flagUrl: 'https://flagcdn.com/w160/co.webp' }
];
const stores = ref([]);
const loading = ref(true);
const newStoreName = ref('');
const createdCredentials = ref(null);

// Variables del Módulo de Gestión (Salvapantallas)
const managingStore = ref(null); // Tienda seleccionada para gestionar
const storeSettings = ref({ idleTimeoutSeconds: 15 });
const playlist = ref([]);
const newAdFile = ref(null);
const newAdDuration = ref(10);
const uploadingAd = ref(false);

// Variables Módulo de Usuarios
const managingUsersStore = ref(null);
const editEmisorUsername = ref('');
const editReceptorUsername = ref('');
const editNewPassword = ref('');
const savingCredentials = ref(false);

const emittingAmounts = ref({});
const activeInputs = ref({}); // Track if user is currently typing for a store
let emitDebounceTimer = null;

// ---- LOGICA DE TIENDAS ----
const fetchStores = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/stores`);
    if (stores.value.length === 0) {
      // First load: setup default currencies if missing
      stores.value = res.data.map(s => ({
        ...s,
        monedaEntrega: s.monedaEntrega || CURRENCIES.find(c => c.code === 'COP'),
        monedaRecibe: s.monedaRecibe || CURRENCIES.find(c => c.code === 'USD')
      }));
    } else {
      res.data.forEach(serverStore => {
        const localStore = stores.value.find(s => s._id === serverStore._id);
        if (localStore) {
          localStore.name = serverStore.name;
          // Solo sobrescribir los números si el usuario NO está escribiendo actualmente
          if (!activeInputs.value[localStore._id]) {
            localStore.montoEntrega = serverStore.montoEntrega;
            localStore.montoRecibe = serverStore.montoRecibe;
            localStore.monedaEntrega = serverStore.monedaEntrega || CURRENCIES.find(c => c.code === 'COP');
            localStore.monedaRecibe = serverStore.monedaRecibe || CURRENCIES.find(c => c.code === 'USD');
          }
        } else {
          stores.value.push({
            ...serverStore,
            monedaEntrega: serverStore.monedaEntrega || CURRENCIES.find(c => c.code === 'COP'),
            monedaRecibe: serverStore.monedaRecibe || CURRENCIES.find(c => c.code === 'USD')
          });
        }
      });
    }
    loading.value = false;
  } catch (error) {
    console.error("Error fetching stores:", error);
    loading.value = false;
  }
};

const createStore = async () => {
  if (!newStoreName.value) return;
  
  try {
    const response = await axios.post(`${API_URL}/api/stores`, { name: newStoreName.value });
    if (response.data.success) {
      createdCredentials.value = {
        storeName: response.data.store.name,
        ...response.data.credentials
      };
      newStoreName.value = '';
      fetchStores();
    }
  } catch (error) {
    console.error("Error creating store:", error);
    alert("Error al crear la tienda");
  }
};

const closeCredentialsModal = () => {
  createdCredentials.value = null;
};

// ---- LOGICA DE SALVAPANTALLAS ----
const openManageModal = async (store) => {
  managingStore.value = store;
  await fetchSettings();
  await fetchPlaylist();
};

const closeManageModal = () => {
  managingStore.value = null;
  newAdFile.value = null;
};

const fetchSettings = async () => {
  if (!managingStore.value) return;
  try {
    const res = await axios.get(`${API_URL}/api/settings/${managingStore.value._id}`);
    if (res.data && res.data.settings) {
      storeSettings.value.idleTimeoutSeconds = res.data.settings.idleTimeoutSeconds || 15;
      storeSettings.value.defaultMonedaEntrega = res.data.settings.defaultMonedaEntrega || CURRENCIES.find(c => c.code === 'COP');
      storeSettings.value.defaultMonedaRecibe = res.data.settings.defaultMonedaRecibe || CURRENCIES.find(c => c.code === 'USD');
    } else {
      storeSettings.value.defaultMonedaEntrega = CURRENCIES.find(c => c.code === 'COP');
      storeSettings.value.defaultMonedaRecibe = CURRENCIES.find(c => c.code === 'USD');
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
};

const saveSettings = async () => {
  try {
    await axios.put(`${API_URL}/api/settings/${managingStore.value._id}`, {
      idleTimeoutSeconds: storeSettings.value.idleTimeoutSeconds
    });
    
    // Save default currencies
    await axios.put(`${API_URL}/api/stores/${managingStore.value._id}/currencies`, {
      defaultMonedaEntrega: storeSettings.value.defaultMonedaEntrega,
      defaultMonedaRecibe: storeSettings.value.defaultMonedaRecibe
    });
    
    alert("Configuración guardada correctamente.");
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("Error al guardar la configuración.");
  }
};

const fetchPlaylist = async () => {
  if (!managingStore.value) return;
  try {
    const res = await axios.get(`${API_URL}/api/ads/${managingStore.value._id}`);
    if (res.data) {
      playlist.value = res.data.playlist || [];
    }
  } catch (error) {
    console.error("Error fetching playlist:", error);
  }
};

const handleFileChange = (e) => {
  newAdFile.value = e.target.files[0];
};

const uploadAd = async () => {
  if (!newAdFile.value) {
    alert("Selecciona un archivo (imagen o video) primero.");
    return;
  }
  uploadingAd.value = true;
  const formData = new FormData();
  formData.append('adFile', newAdFile.value);
  formData.append('durationSeconds', newAdDuration.value);

  try {
    await axios.post(`${API_URL}/api/ads/${managingStore.value._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    // Limpiar formulario y recargar
    newAdFile.value = null;
    document.getElementById('fileUploadInput').value = ""; // Limpiar input file
    await fetchPlaylist();
  } catch (error) {
    console.error("Error uploading ad:", error);
    alert("Error al subir la publicidad. Verifica el tamaño y formato.");
  } finally {
    uploadingAd.value = false;
  }
};

const deleteAd = async (adId) => {
  if (!confirm("¿Seguro que deseas eliminar esta publicidad?")) return;
  try {
    await axios.delete(`${API_URL}/api/ads/${managingStore.value._id}/${adId}`);
    await fetchPlaylist();
  } catch (error) {
    console.error("Error deleting ad:", error);
    alert("Error al eliminar publicidad.");
  }
};

// ---- LOGICA DE USUARIOS ----
const openUsersModal = async (store) => {
  managingUsersStore.value = store;
  editEmisorUsername.value = '';
  editReceptorUsername.value = '';
  editNewPassword.value = '';
  try {
    const res = await axios.get(`${API_URL}/api/stores/${store._id}/users`);
    if (res.data && res.data.users) {
      const emisor = res.data.users.find(u => u.role === 'emisor');
      const receptor = res.data.users.find(u => u.role === 'receptor');
      if (emisor) editEmisorUsername.value = emisor.username;
      if (receptor) editReceptorUsername.value = receptor.username;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const closeUsersModal = () => {
  managingUsersStore.value = null;
  editEmisorUsername.value = '';
  editReceptorUsername.value = '';
  editNewPassword.value = '';
};

const updateStoreCredentials = async () => {
  if (!editEmisorUsername.value || !editReceptorUsername.value) {
    alert("Los nombres de usuario no pueden estar vacíos.");
    return;
  }
  
  if (editNewPassword.value && !confirm("¿Seguro que deseas cambiar la contraseña de esta tienda? La contraseña anterior dejará de funcionar de inmediato.")) return;

  savingCredentials.value = true;
  try {
    const payload = {
      emisorUsername: editEmisorUsername.value,
      receptorUsername: editReceptorUsername.value,
      newPassword: editNewPassword.value || undefined
    };
    
    await axios.put(`${API_URL}/api/stores/${managingUsersStore.value._id}/users`, payload);
    alert("Credenciales guardadas correctamente.");
    editNewPassword.value = ''; // Limpiar el campo de contraseña
  } catch (error) {
    console.error("Error updating credentials:", error);
    if (error.response && error.response.data && error.response.data.error) {
      alert(error.response.data.error);
    } else {
      alert("Error al guardar credenciales.");
    }
  } finally {
    savingCredentials.value = false;
  }
};

const emitAmounts = async (store) => {
  emittingAmounts.value[store._id] = true;
  try {
    await axios.put(`${API_URL}/api/stores/${store._id}/amounts`, {
      montoEntrega: store.montoEntrega,
      montoRecibe: store.montoRecibe,
      monedaEntrega: store.monedaEntrega,
      monedaRecibe: store.monedaRecibe
    });
  } catch (error) {
    console.error("Error emitting amounts:", error);
  } finally {
    emittingAmounts.value[store._id] = false;
  }
};

const swapCurrencies = (store) => {
  const temp = store.monedaEntrega;
  store.monedaEntrega = store.monedaRecibe;
  store.monedaRecibe = temp;
  emitAmounts(store); // Auto-save after swap
};

const handleAmountInput = (store) => {
  activeInputs.value[store._id] = true;
  clearTimeout(emitDebounceTimer);
  
  emitDebounceTimer = setTimeout(() => {
    emitAmounts(store);
    // Desbloquear para permitir actualizaciones del servidor después de 2 segundos de inactividad
    setTimeout(() => { activeInputs.value[store._id] = false; }, 2000);
  }, 400); // 400ms delay tras teclear
};

onMounted(() => {
  fetchStores();
  setInterval(fetchStores, 3000);
});
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Panel Multi-Tienda (SaaS)</h1>
      <p>Gestión del Sistema de Casa de Cambio</p>
    </header>

    <div class="action-bar glass-card">
      <h2>Crear Nueva Tienda</h2>
      <div class="create-form">
        <input v-model="newStoreName" type="text" placeholder="Ej. Sucursal Centro" @keyup.enter="createStore" />
        <button @click="createStore" :disabled="!newStoreName">Crear Tienda</button>
      </div>
    </div>

    <!-- Modal de Credenciales -->
    <div v-if="createdCredentials" class="modal-overlay">
      <div class="glass-card modal-content">
        <h3>¡Tienda Creada Exitosamente!</h3>
        <p>Por favor, copia y guarda estas credenciales. <strong>La contraseña no se volverá a mostrar.</strong></p>
        
        <div class="credentials-box">
          <p><strong>Tienda:</strong> {{ createdCredentials.storeName }}</p>
          <hr>
          <p><strong>Usuario Windows (Emisor):</strong> <span class="highlight">{{ createdCredentials.emisor }}</span></p>
          <p><strong>Usuario iPad (Receptor):</strong> <span class="highlight">{{ createdCredentials.receptor }}</span></p>
          <p><strong>Contraseña (Compartida):</strong> <span class="highlight pass">{{ createdCredentials.password }}</span></p>
        </div>
        
        <button @click="closeCredentialsModal" class="btn-close">He copiado las credenciales</button>
      </div>
    </div>

    <!-- Modal de Gestión (Configuración y Salvapantallas) -->
    <div v-if="managingStore" class="modal-overlay manage-overlay">
      <div class="glass-card modal-content manage-modal">
        <div class="modal-header">
          <h3>Gestión: {{ managingStore.name }}</h3>
          <button @click="closeManageModal" class="btn-x">×</button>
        </div>
        
        <div class="manage-grid">
          <!-- Columna 1: Ajustes -->
          <div class="manage-section">
            <h4>⚙️ Configuración (Reposo & Monedas)</h4>
            <div class="form-group">
              <label>Moneda Entrega por defecto:</label>
              <select v-model="storeSettings.defaultMonedaEntrega" class="input-dark">
                <option v-for="c in CURRENCIES" :key="'ent_'+c.code" :value="c">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Moneda Recibe por defecto:</label>
              <select v-model="storeSettings.defaultMonedaRecibe" class="input-dark">
                <option v-for="c in CURRENCIES" :key="'rec_'+c.code" :value="c">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tiempo inactividad salvapantallas (Segundos):</label>
              <div class="flex-row">
                <input type="number" v-model="storeSettings.idleTimeoutSeconds" min="5" max="300" />
                <button @click="saveSettings" class="btn-save">Guardar Todo</button>
              </div>
            </div>
            
            <hr class="divider">
            
            <h4>📤 Subir Publicidad</h4>
            <div class="form-group upload-box">
              <input type="file" id="fileUploadInput" accept="image/*,video/mp4" @change="handleFileChange" />
              <label>Duración (segundos):</label>
              <input type="number" v-model="newAdDuration" min="1" max="60" />
              <button @click="uploadAd" class="btn-upload" :disabled="uploadingAd">
                {{ uploadingAd ? 'Subiendo...' : 'Subir Anuncio' }}
              </button>
            </div>
          </div>

          <!-- Columna 2: Playlist -->
          <div class="manage-section">
            <h4>📺 Lista de Reproducción (En vivo)</h4>
            <div class="playlist-container">
              <div v-if="playlist.length === 0" class="empty-state">
                No hay publicidad asignada a esta tienda.
              </div>
              <div v-for="(ad, index) in playlist" :key="ad._id" class="playlist-item">
                <div class="ad-preview">
                  <span class="ad-number">{{ index + 1 }}</span>
                  <div v-if="ad.type === 'video'" class="video-badge">🎬 Video</div>
                  <img v-else :src="API_URL + ad.url" alt="ad preview" />
                </div>
                <div class="ad-info">
                  <p class="ad-dur">⏱ {{ ad.durationSeconds }}s</p>
                </div>
                <button @click="deleteAd(ad._id)" class="btn-delete-ad">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Usuarios y Credenciales -->
    <div v-if="managingUsersStore" class="modal-overlay">
      <div class="glass-card modal-content">
        <div class="modal-header">
          <h3>Credenciales: {{ managingUsersStore.name }}</h3>
          <button @click="closeUsersModal" class="btn-x">×</button>
        </div>
        
        <div class="credentials-box form-credentials">
          <div class="form-group">
            <label>Usuario Windows (Emisor):</label>
            <input type="text" v-model="editEmisorUsername" class="input-dark" placeholder="Cargando..." />
          </div>
          <div class="form-group">
            <label>Usuario iPad (Receptor):</label>
            <input type="text" v-model="editReceptorUsername" class="input-dark" placeholder="Cargando..." />
          </div>
          <hr>
          <div class="form-group">
            <label>Nueva Contraseña (Opcional):</label>
            <input type="text" v-model="editNewPassword" class="input-dark" placeholder="Dejar en blanco para no cambiarla" />
            <small>Si escribes algo aquí, la contraseña anterior dejará de funcionar.</small>
          </div>
        </div>

        <button @click="updateStoreCredentials" class="btn-save-full" :disabled="savingCredentials">
          {{ savingCredentials ? 'Guardando...' : 'Guardar Credenciales' }}
        </button>
      </div>
    </div>

    <main class="content">
      <h2 class="section-title">Tiendas Activas</h2>
      <div class="card-container" v-if="!loading && stores.length > 0">
        <div class="glass-card pdv-card" v-for="store in stores" :key="store._id">
          <div class="card-header">
            <h3>{{ store.name }}</h3>
            <span class="status-indicator active">En Línea</span>
          </div>
          <div class="card-body">
            <!-- Selector de Divisas y Swap -->
            <div class="currency-selectors">
              <select v-model="store.monedaEntrega" @change="emitAmounts(store)" class="currency-select">
                <option v-for="c in CURRENCIES" :key="c.code" :value="c">{{ c.name }}</option>
              </select>
              <button @click="swapCurrencies(store)" class="btn-swap" title="Invertir Divisas">🔁</button>
              <select v-model="store.monedaRecibe" @change="emitAmounts(store)" class="currency-select">
                <option v-for="c in CURRENCIES" :key="c.code" :value="c">{{ c.name }}</option>
              </select>
            </div>
            
            <!-- Montos -->
            <div class="stat">
              <span class="label">Usted entrega ({{ store.monedaEntrega?.code || 'COP' }}):</span>
              <div class="amount-input-group">
                <img v-if="store.monedaEntrega" :src="store.monedaEntrega.flagUrl" class="input-flag" alt="flag">
                <input type="text" v-model="store.montoEntrega" @input="handleAmountInput(store)" class="amount-input" />
              </div>
            </div>
            <div class="stat">
              <span class="label">Usted recibe ({{ store.monedaRecibe?.code || 'USD' }}):</span>
              <div class="amount-input-group">
                <img v-if="store.monedaRecibe" :src="store.monedaRecibe.flagUrl" class="input-flag" alt="flag">
                <input type="text" v-model="store.montoRecibe" @input="handleAmountInput(store)" class="amount-input" />
              </div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; margin-bottom: 0.5rem; min-height: 18px;">
              <span v-if="emittingAmounts[store._id]" style="color: var(--success);">Enviando...</span>
            </div>
            <hr class="card-divider">
            <button @click="openManageModal(store)" class="btn-manage">⚙️ Gestionar Publicidad</button>
            <button @click="openUsersModal(store)" class="btn-users">👥 Usuarios y Credenciales</button>
          </div>
        </div>
      </div>
      <div v-else-if="loading" class="loading">Cargando...</div>
      <div v-else class="empty-state">
        <div class="glass-card">
          <p>No hay Tiendas creadas en este momento.</p>
          <small>Crea una tienda nueva en la parte superior para comenzar.</small>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Reset y variables */
:root {
  --bg-color: #0f172a;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --card-bg: rgba(30, 41, 59, 0.7);
  --accent: #3b82f6;
  --success: #10b981;
  --danger: #ef4444;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  background-image: radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 40%),
                    radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.15), transparent 40%);
  min-height: 100vh;
}

.admin-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.admin-header { text-align: center; margin-bottom: 2rem; }
.admin-header h1 {
  font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.admin-header p { color: var(--text-secondary); font-size: 1.1rem; }

.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.action-bar { margin-bottom: 3rem; display: flex; flex-direction: column; gap: 1rem; }
.action-bar h2 { margin: 0; font-size: 1.2rem; color: #e2e8f0; }
.create-form { display: flex; gap: 1rem; }
.create-form input {
  flex: 1; padding: 0.75rem 1rem; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: white;
  font-size: 1rem;
}
.create-form button {
  padding: 0.75rem 1.5rem; border-radius: 8px; border: none;
  background: var(--accent); color: white; font-weight: bold; cursor: pointer;
  transition: opacity 0.2s;
}
.create-form button:disabled { opacity: 0.5; cursor: not-allowed; }

.section-title { margin-bottom: 1.5rem; color: #e2e8f0; }
.card-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 1rem; }
.card-header h3 { margin: 0; font-size: 1.25rem; color: #e2e8f0; }
.status-indicator { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.status-indicator.active { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
.card-body .stat { margin-bottom: 1rem; display: flex; flex-direction: column; }
.stat .label { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem; }
.amount-input-group { display: flex; align-items: center; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; }
.input-flag { width: 32px; height: 24px; object-fit: cover; border-radius: 2px; margin-right: 0.5rem; }
.amount-input { background: transparent; border: none; color: white; font-size: 1.5rem; font-weight: bold; width: 100%; outline: none; }

.currency-selectors { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 8px;}
.currency-select { 
  flex: 1; padding: 0.5rem; background: rgba(255,255,255,0.1); color: white; 
  border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; outline: none; 
}
.currency-select option { color: black; }
.btn-swap { background: rgba(255,255,255,0.1); border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; transition: 0.2s; }
.btn-swap:hover { background: rgba(255,255,255,0.2); transform: rotate(180deg); }

.btn-emit {
  width: 100%; margin-top: 0.5rem; padding: 0.75rem; border-radius: 8px; border: none;
  background: var(--accent); color: white; cursor: pointer; font-weight: bold;
}
.btn-emit:hover { background: #2563eb; }
.btn-emit:disabled { opacity: 0.5; cursor: not-allowed; }

.card-divider { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0 1rem 0; }

.btn-manage {
  width: 100%; margin-top: 1rem; padding: 0.75rem; border-radius: 8px; border: none;
  background: rgba(255,255,255,0.1); color: white; cursor: pointer; font-weight: bold;
}
.btn-manage:hover { background: rgba(255,255,255,0.2); }

.btn-users {
  width: 100%; margin-top: 0.5rem; padding: 0.75rem; border-radius: 8px; border: none;
  background: rgba(16, 185, 129, 0.15); color: var(--success); cursor: pointer; font-weight: bold;
}
.btn-users:hover { background: rgba(16, 185, 129, 0.25); }

.btn-save-full {
  width: 100%; margin-top: 1rem; padding: 0.75rem; border-radius: 8px; border: none;
  background: var(--success); color: white; cursor: pointer; font-weight: bold;
}
.btn-save-full:hover { background: #059669; }
.btn-save-full:disabled { opacity: 0.5; cursor: not-allowed; }

.form-credentials .form-group { margin-bottom: 1rem; }
.input-dark { 
  width: 100%; padding: 0.75rem; border-radius: 6px; 
  border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.4); 
  color: white; margin-top: 0.5rem; box-sizing: border-box; font-family: monospace; font-size: 1rem;
}
.input-dark:focus { outline: 2px solid var(--accent); }

/* Modales */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-content { max-width: 500px; width: 90%; text-align: center; }
.manage-modal { max-width: 900px; text-align: left; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h3 { margin: 0; font-size: 1.5rem; color: white; }
.btn-x { background: transparent; border: none; color: white; font-size: 2rem; cursor: pointer; }

.manage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 768px) { .manage-grid { grid-template-columns: 1fr; } }
.manage-section { background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; }
.manage-section h4 { margin-top: 0; color: #a78bfa; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.form-group label { font-size: 0.9rem; color: var(--text-secondary); }
.flex-row { display: flex; gap: 1rem; }
.flex-row input { flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; }
.btn-save { background: var(--success); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.divider { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0; }

.upload-box { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; border: 1px dashed rgba(255,255,255,0.3); }
.upload-box input[type="file"] { margin-bottom: 0.5rem; width: 100%; color: white; }
.btn-upload { background: var(--accent); color: white; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer; margin-top: 0.5rem; font-weight: bold; }

.playlist-container { display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem; }
.playlist-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 8px; }
.ad-preview { display: flex; align-items: center; gap: 0.5rem; }
.ad-number { background: var(--accent); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; }
.ad-preview img { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
.video-badge { background: #475569; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
.ad-info { flex: 1; margin-left: 1rem; }
.ad-dur { margin: 0; font-size: 0.9rem; color: var(--text-secondary); }
.btn-delete-ad { background: rgba(239, 68, 68, 0.2); color: var(--danger); border: none; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; }
.btn-delete-ad:hover { background: var(--danger); color: white; }

.credentials-box { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: left; }
.credentials-box p { margin: 0.5rem 0; }
.credentials-box hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0; }
.highlight { font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; }
.highlight.pass { color: #facc15; font-weight: bold; font-size: 1.2rem; }
.btn-close { background: var(--success); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; }
</style>
