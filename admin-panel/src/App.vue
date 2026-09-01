<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const stores = ref([]);
const loading = ref(true);
const newStoreName = ref('');
const createdCredentials = ref(null);

const fetchStores = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/stores');
    stores.value = response.data;
  } catch (error) {
    console.error("Error fetching Stores:", error);
  } finally {
    loading.value = false;
  }
};

const createStore = async () => {
  if (!newStoreName.value) return;
  
  try {
    const response = await axios.post('http://localhost:3000/api/stores', { name: newStoreName.value });
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

    <main class="content">
      <h2 class="section-title">Tiendas Activas</h2>
      <div class="card-container" v-if="!loading && stores.length > 0">
        <div class="glass-card pdv-card" v-for="store in stores" :key="store.id">
          <div class="card-header">
            <h3>{{ store.name }}</h3>
            <span class="status-indicator active">En Línea</span>
          </div>
          <div class="card-body">
            <div class="stat">
              <span class="label">Monto Entrega (COP):</span>
              <span class="value monto">${{ store.montoEntrega }}</span>
            </div>
            <div class="stat">
              <span class="label">Monto Recibe (USD):</span>
              <span class="value monto">${{ store.montoRecibe }}</span>
            </div>
            <div class="stat">
              <span class="label">Publicidad:</span>
              <span class="value" v-if="store.adUrl">
                <a :href="store.adUrl" target="_blank">Ver Archivo</a> ({{ store.adType }})
              </span>
              <span class="value empty" v-else>No asignada</span>
            </div>
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
.stat .value { font-size: 1.1rem; font-weight: 500; }
.stat .value.monto { font-size: 1.5rem; color: var(--accent); font-weight: 700; }
.stat .value a { color: #60a5fa; text-decoration: none; }
.stat .value.empty { color: #64748b; font-style: italic; }

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-content { max-width: 500px; width: 90%; text-align: center; }
.credentials-box {
  background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1.5rem;
  margin: 1.5rem 0; text-align: left;
}
.credentials-box p { margin: 0.5rem 0; }
.credentials-box hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0; }
.highlight { font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; }
.highlight.pass { color: #facc15; font-weight: bold; font-size: 1.2rem; }
.btn-close {
  background: var(--success); color: white; border: none; padding: 0.75rem 1.5rem;
  border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%;
}
</style>
