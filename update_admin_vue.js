const fs = require('fs');
let file = fs.readFileSync('admin-panel/src/App.vue', 'utf8');

// 1. In fetchStores, add operationType, tasaCompra, tasaVenta fallback
file = file.replace(/adUrl: state\.adUrl \|\| null,\n\s*adType: state\.adType \|\| null/g, "adUrl: state.adUrl || null,\n                adType: state.adType || null,\n                operationType: state.operationType || 'COMPRA'");

file = file.replace(/localStore\.name = serverStore\.name;/g, "localStore.name = serverStore.name;\n          localStore.operationType = serverStore.operationType || 'COMPRA';");

// 2. In emitAmounts
file = file.replace(/monedaRecibe: store\.monedaRecibe\n\s*}\);/, "monedaRecibe: store.monedaRecibe,\n      operationType: store.operationType\n    });");

// 3. In handleAmountInput
file = file.replace(/const rate = parseFloat\(store\.tasa\) \|\| 0;/, "const rate = parseFloat(store.operationType === 'COMPRA' ? store.tasaCompra : store.tasaVenta) || parseFloat(store.tasa) || 0;");

// 4. Update UI
const oldUI = `            <!-- Tasa de Cambio -->
            <div class="rate-input-group">
              <span class="rate-label">Tasa de Cambio:</span>
              <input type="number" v-model="store.tasa" class="rate-input" placeholder="Ej: 4050" />
            </div>`;

const newUI = `            <!-- Tasa de Cambio -->
            <div class="rate-input-group" style="flex-direction: column; gap: 0.5rem; align-items: stretch; border: 1px solid var(--card-border); padding: 0.5rem; border-radius: 8px;">
              <div style="display: flex; gap: 1rem;">
                <div style="flex:1;">
                  <span class="rate-label" style="font-size: 0.75rem;">COMPRA:</span>
                  <input type="number" v-model="store.tasaCompra" @input="handleAmountInput(store, true)" class="rate-input" placeholder="Ej: 4050" style="margin-top:0.25rem;" />
                </div>
                <div style="flex:1;">
                  <span class="rate-label" style="font-size: 0.75rem;">VENTA:</span>
                  <input type="number" v-model="store.tasaVenta" @input="handleAmountInput(store, true)" class="rate-input" placeholder="Ej: 4100" style="margin-top:0.25rem;" />
                </div>
              </div>
              <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; background: var(--bg-dark); padding: 0.5rem; border-radius: 6px;">
                <label style="color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; cursor:pointer; font-size:0.85rem;">
                  <input type="radio" :name="'op_'+store._id" value="COMPRA" v-model="store.operationType" @change="handleAmountInput(store, true)" /> Compra
                </label>
                <label style="color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; cursor:pointer; font-size:0.85rem;">
                  <input type="radio" :name="'op_'+store._id" value="VENTA" v-model="store.operationType" @change="handleAmountInput(store, true)" /> Venta
                </label>
              </div>
            </div>`;

file = file.replace(oldUI, newUI);

fs.writeFileSync('admin-panel/src/App.vue', file);
console.log("Updated admin-panel/src/App.vue");
