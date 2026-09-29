const fs = require('fs');
let file = fs.readFileSync('admin-panel/src/App.vue', 'utf8');

// 1. Add computed to import
file = file.replace(/import \{ ref, onMounted \} from 'vue';/, "import { ref, computed, onMounted } from 'vue';");

// 2. Compute activeCurrencies
file = file.replace(/const CURRENCIES = ref\(\[\]\);/, "const CURRENCIES = ref([]);\nconst activeCurrencies = computed(() => CURRENCIES.value.filter(c => c.isActive !== false));");

// 3. fetchCurrencies: map isActive
file = file.replace(/_id: c\._id/g, "_id: c._id,\n      isActive: c.isActive");

// 4. Add toggleCurrency logic
const deleteCurrencyFn = `const deleteCurrency = async (id) => {`;
const newDelete = `const toggleCurrency = async (c) => {
  try {
    await axios.put(\`\${API_URL}/api/currencies/\${c._id}/toggle\`);
    await fetchCurrencies();
  } catch (err) {
    console.error(err);
    alert("Error al cambiar estado de moneda");
  }
};
const deleteCurrency = async (id) => {`;
file = file.replace(deleteCurrencyFn, newDelete);

// 5. Replace CURRENCIES in <template> selects with activeCurrencies
file = file.replace(/<option v-for="c in CURRENCIES"/g, `<option v-for="c in activeCurrencies"`);

// 6. Add toggle switch in Modal
const oldPlaylistItem = `<div v-for="c in CURRENCIES" :key="c._id" class="playlist-item">
                <div class="ad-preview">
                  <img :src="c.flagUrl" alt="flag" />
                  <div class="ad-info">
                    <p style="margin:0; color: #fff; font-weight: 600;">{{ c.code }}</p>
                    <small style="color: var(--text-secondary)">Fuerza: {{ c.strength }}</small>
                  </div>
                </div>
                <button @click="deleteCurrency(c._id)" class="btn-delete-ad">🗑️</button>
              </div>`;
const newPlaylistItem = `<div v-for="c in CURRENCIES" :key="c._id" class="playlist-item" :style="c.isActive === false ? 'opacity: 0.5' : ''">
                <div class="ad-preview">
                  <img :src="c.flagUrl" alt="flag" />
                  <div class="ad-info">
                    <p style="margin:0; color: #fff; font-weight: 600;">
                      {{ c.code }} <span v-if="c.isActive === false" style="color: #ef4444; font-size: 0.8em;">(Inactiva)</span>
                    </p>
                    <small style="color: var(--text-secondary)">Fuerza: {{ c.strength }}</small>
                  </div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <button @click="toggleCurrency(c)" class="btn-manage" style="font-size: 0.8rem; padding: 0.3rem 0.6rem; min-width: 80px;">
                    {{ c.isActive !== false ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button @click="deleteCurrency(c._id)" class="btn-delete-ad">🗑️</button>
                </div>
              </div>`;
file = file.replace(oldPlaylistItem, newPlaylistItem);

fs.writeFileSync('admin-panel/src/App.vue', file);
