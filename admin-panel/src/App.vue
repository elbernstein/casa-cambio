<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// URL Dinámica (local vs producción)
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.cambioseurodolar.com';

const CURRENCIES = [
  { code: 'USD', name: 'DÓLAR AMERICANO (USD)', flagUrl: 'https://flagcdn.com/w160/us.webp' },
  { code: 'EUR', name: 'EURO (EUR)', flagUrl: 'https://flagcdn.com/w160/eu.webp' },
  { code: 'COP', name: 'Peso Colombiano (COP)', flagUrl: 'https://flagcdn.com/w160/co.webp' },
  { code: 'CAD', name: 'Dólar Canadiense (CAD)', flagUrl: 'https://flagcdn.com/w160/ca.webp' },
  { code: 'MXN', name: 'Peso Mexicano (MXN)', flagUrl: 'https://flagcdn.com/w160/mx.webp' },
  { code: 'GBP', name: 'Libra Esterlina (GBP)', flagUrl: 'https://flagcdn.com/w160/gb.webp' },
  { code: 'BSD', name: 'Dólar Bahamas (BSD)', flagUrl: 'https://flagcdn.com/w160/bs.webp' },
  { code: 'NZD', name: 'Dólar Nueva Zelanda (NZD)', flagUrl: 'https://flagcdn.com/w160/nz.webp' },
  { code: 'CLP', name: 'Peso Chileno (CLP)', flagUrl: 'https://flagcdn.com/w160/cl.webp' },
  { code: 'JPY', name: 'Yen Japonés (JPY)', flagUrl: 'https://flagcdn.com/w160/jp.webp' },
  { code: 'PEN', name: 'Nuevo Sol Perú (PEN)', flagUrl: 'https://flagcdn.com/w160/pe.webp' },
  { code: 'AUD', name: 'Dólar Australiano (AUD)', flagUrl: 'https://flagcdn.com/w160/au.webp' },
  { code: 'BRL', name: 'Real Brasileño (BRL)', flagUrl: 'https://flagcdn.com/w160/br.webp' },
  { code: 'CHF', name: 'Franco Suizo (CHF)', flagUrl: 'https://flagcdn.com/w160/ch.webp' },
  { code: 'ARS', name: 'Peso Argentino (ARS)', flagUrl: 'https://flagcdn.com/w160/ar.webp' },
  { code: 'GTQ', name: 'Quetzal Guatemala (GTQ)', flagUrl: 'https://flagcdn.com/w160/gt.webp' },
  { code: 'NIO', name: 'Cordoba Nicaragua (NIO)', flagUrl: 'https://flagcdn.com/w160/ni.webp' },
  { code: 'DOP', name: 'Peso Dominicano (DOP)', flagUrl: 'https://flagcdn.com/w160/do.webp' },
  { code: 'CNY', name: 'Yuan Chino (CNY)', flagUrl: 'https://flagcdn.com/w160/cn.webp' },
  { code: 'AWG', name: 'Florin Aruba (AWG)', flagUrl: 'https://flagcdn.com/w160/aw.webp' },
  { code: 'DKK', name: 'Corona Danesa (DKK)', flagUrl: 'https://flagcdn.com/w160/dk.webp' },
  { code: 'ANG', name: 'Florin Caribeño (ANG)', flagUrl: 'https://flagcdn.com/w160/cw.webp' },
  { code: 'BOB', name: 'Peso Bolivia (BOB)', flagUrl: 'https://flagcdn.com/w160/bo.webp' },
  { code: 'TRY', name: 'Lira Turca (TRY)', flagUrl: 'https://flagcdn.com/w160/tr.webp' },
  { code: 'SEK', name: 'Corona Sueca (SEK)', flagUrl: 'https://flagcdn.com/w160/se.webp' },
  { code: 'THB', name: 'Baht Tailandia (THB)', flagUrl: 'https://flagcdn.com/w160/th.webp' },
  { code: 'CRC', name: 'Colón Costa Rica (CRC)', flagUrl: 'https://flagcdn.com/w160/cr.webp' },
  { code: 'KRW', name: 'Won Corea del Sur (KRW)', flagUrl: 'https://flagcdn.com/w160/kr.webp' },
  { code: 'UYU', name: 'Peso Uruguay (UYU)', flagUrl: 'https://flagcdn.com/w160/uy.webp' },
  { code: 'AED', name: 'Dirham Emiratos (AED)', flagUrl: 'https://flagcdn.com/w160/ae.webp' },
  { code: 'HKD', name: 'Dólar Hong Kong (HKD)', flagUrl: 'https://flagcdn.com/w160/hk.webp' },
  { code: 'NOK', name: 'Corona Noruega (NOK)', flagUrl: 'https://flagcdn.com/w160/no.webp' },
  { code: 'HNL', name: 'Lempira Honduras (HNL)', flagUrl: 'https://flagcdn.com/w160/hn.webp' },
  { code: 'INR', name: 'Rupia India (INR)', flagUrl: 'https://flagcdn.com/w160/in.png' },
  { code: 'JMD', name: 'Dólar Jamaica (JMD)', flagUrl: 'https://flagcdn.com/w160/jm.png' },
  { code: 'TTD', name: 'Dólar Trinidad y Tobago (TTD)', flagUrl: 'https://flagcdn.com/w160/tt.png' },
  { code: 'HUF', name: 'Forinto Hungria (HUF)', flagUrl: 'https://flagcdn.com/w160/hu.png' },
  { code: 'EGP', name: 'Libra Egipto (EGP)', flagUrl: 'https://flagcdn.com/w160/eg.png' },
  { code: 'MYR', name: 'Ringgit Malaysia (MYR)', flagUrl: 'https://flagcdn.com/w160/my.png' },
  { code: 'RUB', name: 'Rublo Rusia (RUB)', flagUrl: 'https://flagcdn.com/w160/ru.png' },
  { code: 'SRD', name: 'Dólar Surinam (SRD)', flagUrl: 'https://flagcdn.com/w160/sr.png' },
  { code: 'KYD', name: 'Dólar Isla Caiman (KYD)', flagUrl: 'https://flagcdn.com/w160/ky.png' },
  { code: 'GYD', name: 'Dólar Guyana (GYD)', flagUrl: 'https://flagcdn.com/w160/gy.png' },
  { code: 'IDR', name: 'Rupia Indonesia (IDR)', flagUrl: 'https://flagcdn.com/w160/id.png' },
  { code: 'ILS', name: 'Sequel Israel (ILS)', flagUrl: 'https://flagcdn.com/w160/il.png' },
  { code: 'MAD', name: 'Dirham Marruecos (MAD)', flagUrl: 'https://flagcdn.com/w160/ma.png' },
  { code: 'PYG', name: 'Guarani Paraguay (PYG)', flagUrl: 'https://flagcdn.com/w160/py.png' },
  { code: 'SGD', name: 'Dólar Singapur (SGD)', flagUrl: 'https://flagcdn.com/w160/sg.png' },
  { code: 'TWD', name: 'Dólar Taiwan (TWD)', flagUrl: 'https://flagcdn.com/w160/tw.png' }
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
        monedaEntrega: CURRENCIES.find(c => c.code === s.monedaEntrega?.code) || CURRENCIES.find(c => c.code === 'COP'),
        monedaRecibe: CURRENCIES.find(c => c.code === s.monedaRecibe?.code) || CURRENCIES.find(c => c.code === 'USD')
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
            localStore.monedaEntrega = CURRENCIES.find(c => c.code === serverStore.monedaEntrega?.code) || CURRENCIES.find(c => c.code === 'COP');
            localStore.monedaRecibe = CURRENCIES.find(c => c.code === serverStore.monedaRecibe?.code) || CURRENCIES.find(c => c.code === 'USD');
          }
        } else {
          stores.value.push({
            ...serverStore,
            monedaEntrega: CURRENCIES.find(c => c.code === serverStore.monedaEntrega?.code) || CURRENCIES.find(c => c.code === 'COP'),
            monedaRecibe: CURRENCIES.find(c => c.code === serverStore.monedaRecibe?.code) || CURRENCIES.find(c => c.code === 'USD')
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
      storeSettings.value.defaultMonedaEntrega = CURRENCIES.find(c => c.code === res.data.settings.defaultMonedaEntrega?.code) || CURRENCIES.find(c => c.code === 'COP');
      storeSettings.value.defaultMonedaRecibe = CURRENCIES.find(c => c.code === res.data.settings.defaultMonedaRecibe?.code) || CURRENCIES.find(c => c.code === 'USD');
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
  
  // Validar tamaño de archivo (50MB para video, 5MB para imágenes)
  const isVideo = newAdFile.value.type.startsWith('video');
  const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (newAdFile.value.size > maxSize) {
    alert(`El archivo es demasiado grande. Máximo permitido: ${isVideo ? '50MB' : '5MB'}`);
    return;
  }

  uploadingAd.value = true;
  const formData = new FormData();
  formData.append('ad_file', newAdFile.value);
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
  activeInputs.value[store._id] = true;
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
    setTimeout(() => { activeInputs.value[store._id] = false; }, 1500);
  }
};

const swapCurrencies = (store) => {
  const temp = store.monedaEntrega;
  store.monedaEntrega = store.monedaRecibe;
  store.monedaRecibe = temp;
  emitAmounts(store); // Auto-save after swap
};

const handleAmountInput = (store, isEntrega) => {
  activeInputs.value[store._id] = true;
  clearTimeout(emitDebounceTimer);
  
  // LÓGICA DE TASA AUTOMÁTICA
  const rate = parseFloat(store.tasa) || 0;
  if (rate > 0) {
    const codeEnt = store.monedaEntrega?.code || 'USD';
    const codeRec = store.monedaRecibe?.code || 'COP';
    const strongCurrencies = ['USD', 'EUR', 'GBP', 'CHF'];
    const entregaIsStrong = strongCurrencies.includes(codeEnt);
    const recibeIsStrong = strongCurrencies.includes(codeRec);
    
    if (isEntrega) {
      const num = parseFloat(store.montoEntrega) || 0;
      if (entregaIsStrong && !recibeIsStrong) {
        store.montoRecibe = (num * rate).toFixed(2);
      } else if (!entregaIsStrong && recibeIsStrong) {
        store.montoRecibe = (num / rate).toFixed(2);
      } else {
        store.montoRecibe = (num * rate).toFixed(2);
      }
    } else {
      const num = parseFloat(store.montoRecibe) || 0;
      if (entregaIsStrong && !recibeIsStrong) {
        store.montoEntrega = (num / rate).toFixed(2);
      } else if (!entregaIsStrong && recibeIsStrong) {
        store.montoEntrega = (num * rate).toFixed(2);
      } else {
        store.montoEntrega = (num / rate).toFixed(2);
      }
    }
  }

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
              <div class="upload-instructions">
                <p><strong>Imágenes:</strong> Formato horizontal (ej. 1024x768 o 2048x1536). Max 5 MB.</p>
                <p><strong>Videos:</strong> Formato MP4 horizontal (720p o 1080p). Max 50 MB.</p>
              </div>
              <input type="file" id="fileUploadInput" accept="image/jpeg,image/png,image/webp,video/mp4" @change="handleFileChange" />
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
                  <img v-else :src="ad.url.startsWith('http') ? ad.url.replace('http://', 'https://') : API_URL + ad.url" alt="ad preview" />
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
              <button @click="swapCurrencies(store)" class="btn-swap" title="Invertir Divisas">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="14" x2="21" y2="3"></line><polyline points="8 21 3 21 3 16"></polyline><line x1="20" y1="10" x2="3" y2="21"></line></svg>
              </button>
              <select v-model="store.monedaRecibe" @change="emitAmounts(store)" class="currency-select">
                <option v-for="c in CURRENCIES" :key="c.code" :value="c">{{ c.name }}</option>
              </select>
            </div>
            
            <!-- Tasa de Cambio -->
            <div class="rate-input-group">
              <span class="rate-label">Tasa de Cambio:</span>
              <input type="number" v-model="store.tasa" class="rate-input" placeholder="Ej: 4050" />
            </div>
            
            <!-- Montos -->
            <div class="stat">
              <span class="label">Usted entrega ({{ store.monedaEntrega?.code || 'COP' }}):</span>
              <div class="amount-input-group">
                <img v-if="store.monedaEntrega" :src="store.monedaEntrega.flagUrl" class="input-flag" alt="flag">
                <input type="text" v-model="store.montoEntrega" @input="handleAmountInput(store, true)" class="amount-input" />
              </div>
            </div>
            <div class="stat">
              <span class="label">Usted recibe ({{ store.monedaRecibe?.code || 'USD' }}):</span>
              <div class="amount-input-group">
                <img v-if="store.monedaRecibe" :src="store.monedaRecibe.flagUrl" class="input-flag" alt="flag">
                <input type="text" v-model="store.montoRecibe" @input="handleAmountInput(store, false)" class="amount-input" />
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --bg-color: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --card-bg: #ffffff;
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --success: #10b981;
  --success-bg: #d1fae5;
  --danger: #ef4444;
  --border-color: #e2e8f0;
  --input-bg: #f1f5f9;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  min-height: 100vh;
}

.admin-container { max-width: 1280px; margin: 0 auto; padding: 2rem; }
.admin-header { text-align: center; margin-bottom: 2rem; margin-top: 1rem; }
.admin-header h1 {
  font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.5px;
  color: #1e293b;
}
.admin-header p { color: var(--text-secondary); font-size: 1.1rem; font-weight: 400; }

.glass-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px; padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pdv-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.action-bar { margin-bottom: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: center; text-align: center; max-width: 600px; margin-left: auto; margin-right: auto;}
.action-bar h2 { margin: 0; font-size: 1.25rem; color: #334155; font-weight: 600; }
.create-form { display: flex; gap: 1rem; width: 100%; }
.create-form input {
  flex: 1; padding: 0.875rem 1.25rem; border-radius: 8px;
  border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary);
  font-size: 1rem; font-family: 'Inter';
  transition: all 0.2s;
}
.create-form input:focus {
  outline: none; border-color: var(--accent); background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.create-form button {
  padding: 0.875rem 1.5rem; border-radius: 8px; border: none;
  background: var(--accent); color: white; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'Inter'; font-size: 1rem;
}
.create-form button:hover:not(:disabled) { background: var(--accent-hover); }
.create-form button:disabled { opacity: 0.5; cursor: not-allowed; }

.section-title { margin-bottom: 2rem; color: #1e293b; font-size: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 1rem;}
.section-title::after { content: ''; flex: 1; height: 1px; background: var(--border-color); }

.card-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
.card-header h3 { margin: 0; font-size: 1.25rem; color: #0f172a; font-weight: 600;}
.status-indicator { padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;}
.status-indicator.active { background: var(--success-bg); color: #065f46; border: 1px solid #a7f3d0; }

.card-body .stat { margin-bottom: 1.25rem; display: flex; flex-direction: column; }
.stat .label { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem; font-weight: 500;}

.amount-input-group { 
  display: flex; align-items: center; background: var(--input-bg); 
  border-radius: 8px; border: 1px solid var(--border-color); 
  padding: 0.75rem 1rem; transition: all 0.2s;
}
.amount-input-group:focus-within { border-color: var(--accent); background: #ffffff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.input-flag { width: 32px; height: 24px; object-fit: cover; border-radius: 4px; margin-right: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.amount-input { background: transparent; border: none; color: var(--text-primary); font-size: 1.5rem; font-weight: 600; width: 100%; outline: none; font-family: 'Inter'; }

.currency-selectors { 
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; 
  margin-bottom: 1.25rem; background: var(--input-bg); padding: 0.5rem; 
  border-radius: 8px; border: 1px solid var(--border-color);
}
.currency-select { 
  flex: 1; padding: 0.6rem; background: #ffffff; color: var(--text-primary); 
  border: 1px solid var(--border-color); border-radius: 6px; outline: none; 
  font-family: 'Inter'; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
}
.currency-select:focus { border-color: var(--accent); }
.btn-swap { 
  background: #ffffff; border: 1px solid var(--border-color); 
  border-radius: 6px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; color: var(--text-secondary);
}
.btn-swap:hover { background: #f1f5f9; color: var(--text-primary); }

/* Rate Input */
.rate-input-group {
  display: flex; align-items: center; justify-content: space-between;
  background: #f8fafc;
  padding: 0.75rem 1rem; border-radius: 8px; border: 1px dashed #cbd5e1;
  margin-bottom: 1.5rem;
}
.rate-label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }
.rate-input {
  background: #ffffff; border: 1px solid var(--border-color);
  color: var(--text-primary); font-family: 'Inter'; font-size: 1rem; padding: 0.4rem 0.75rem;
  border-radius: 6px; width: 120px; text-align: right; font-weight: 600; outline: none; transition: 0.2s;
}
.rate-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

.btn-manage, .btn-users {
  width: 100%; margin-top: 0.75rem; padding: 0.875rem; border-radius: 8px; border: 1px solid var(--border-color);
  cursor: pointer; font-weight: 500; font-family: 'Inter'; font-size: 0.95rem;
  transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #ffffff; color: var(--text-secondary);
}
.btn-manage:hover { background: #f8fafc; color: var(--text-primary); border-color: #cbd5e1; }

.btn-users:hover { background: #f8fafc; color: var(--text-primary); border-color: #cbd5e1; }

.btn-save-full {
  width: 100%; margin-top: 1.5rem; padding: 1rem; border-radius: 8px; border: none;
  background: var(--success); color: white; cursor: pointer; font-weight: 600;
  font-family: 'Inter'; font-size: 1rem; transition: 0.2s;
}
.btn-save-full:hover { background: #059669; }

.card-divider { border: 0; border-top: 1px solid var(--border-color); margin: 1.5rem 0; }

.form-credentials .form-group { margin-bottom: 1.5rem; }
.input-dark { 
  width: 100%; padding: 0.875rem; border-radius: 8px; 
  border: 1px solid var(--border-color); background: #ffffff; 
  color: var(--text-primary); margin-top: 0.5rem; box-sizing: border-box; font-family: 'Inter'; font-size: 1rem;
  transition: 0.2s;
}
.input-dark:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

/* Modales */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 100;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-content { max-width: 500px; width: 90%; text-align: center; border-radius: 16px; padding: 2.5rem; border: none; background: #ffffff; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.manage-modal { max-width: 900px; text-align: left; max-height: 90vh; overflow-y: auto; }
.manage-modal::-webkit-scrollbar { width: 8px; }
.manage-modal::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
.modal-header h3 { margin: 0; font-size: 1.25rem; color: #0f172a; font-weight: 600;}
.btn-x { background: #f1f5f9; border: none; color: #64748b; width: 32px; height: 32px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;}
.btn-x:hover { background: #e2e8f0; color: #0f172a; }

.manage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 768px) { .manage-grid { grid-template-columns: 1fr; } }
.manage-section { background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); }
.manage-section h4 { margin-top: 0; color: #334155; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1.25rem; font-size: 1rem; font-weight: 600;}
.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
.form-group label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500;}
.flex-row { display: flex; gap: 1rem; align-items: center;}
.flex-row input { flex: 1; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); background: #ffffff; color: var(--text-primary); font-family: 'Inter'; font-size: 0.875rem;}
.btn-save { background: var(--success); color: white; border: none; padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; transition: 0.2s;}
.btn-save:hover { background: #059669; }
.divider { border: 0; border-top: 1px solid var(--border-color); margin: 2rem 0; }

.upload-box { background: #ffffff; padding: 1.5rem; border-radius: 8px; border: 1px dashed #94a3b8; transition: 0.2s; }
.upload-box:hover { border-color: var(--accent); }
.upload-box input[type="file"] { margin-bottom: 1rem; width: 100%; color: var(--text-primary); font-family: 'Inter'; font-size: 0.875rem; }
.upload-instructions { font-size: 0.8rem; color: var(--text-secondary); background: #f1f5f9; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; line-height: 1.4;}
.upload-instructions p { margin: 0.25rem 0; }
.btn-upload { background: var(--accent); color: white; border: none; padding: 0.875rem; border-radius: 6px; cursor: pointer; margin-top: 1rem; font-weight: 500; font-family: 'Inter'; font-size: 0.95rem; transition: 0.2s; }
.btn-upload:hover:not(:disabled) { background: var(--accent-hover); }

.playlist-container { display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem; }
.playlist-container::-webkit-scrollbar { width: 6px; }
.playlist-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.playlist-item { display: flex; align-items: center; justify-content: space-between; background: #ffffff; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); transition: 0.2s;}
.playlist-item:hover { border-color: #94a3b8; }
.ad-preview { display: flex; align-items: center; gap: 0.75rem; }
.ad-number { background: #f1f5f9; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
.ad-preview img { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);}
.video-badge { background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;}
.ad-info { flex: 1; margin-left: 0.75rem; }
.ad-dur { margin: 0; font-size: 0.875rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;}
.btn-delete-ad { background: #fee2e2; color: var(--danger); border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;}
.btn-delete-ad:hover { background: var(--danger); color: white; }

.credentials-box { background: #f8fafc; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: left; border: 1px solid var(--border-color); }
.credentials-box p { margin: 0.5rem 0; font-size: 0.95rem; color: var(--text-primary); }
.credentials-box hr { border: 0; border-top: 1px solid var(--border-color); margin: 1.5rem 0; }
.highlight { font-family: monospace; background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; color: var(--text-primary); }
.highlight.pass { color: var(--accent); font-weight: 700; font-size: 1.2rem; }
.btn-close { background: var(--text-primary); color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; width: 100%; font-family: 'Inter'; font-size: 1rem; transition: 0.2s;}
.btn-close:hover { background: #334155; }
</style>
