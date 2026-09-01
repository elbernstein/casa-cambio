<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

const monto = ref('');
const pdvID = 'taquilla_principal';
let socket;

onMounted(() => {
  // Conecta al servidor Node.js local
  socket = io('http://localhost:3000');
  
  socket.on('connect', () => {
    console.log('🟢 Conectado al servidor desde Vue');
    socket.emit('join_room', pdvID);
  });
});

const enviarMonto = () => {
  if (monto.value !== '') {
    socket.emit('enviar_monto', { pdv_id: pdvID, monto: monto.value });
    monto.value = ''; // Limpia el input después de enviar
  }
};
</script>

<template>
  <div class="panel">
    <h2>Panel de Emisor (Vue)</h2>
    <div class="controles">
      <input 
        v-model="monto" 
        type="number" 
        placeholder="Monto a mostrar" 
        @keyup.enter="enviarMonto"
      />
      <button @click="enviarMonto">Enviar a Pantalla</button>
    </div>
  </div>
</template>

<style scoped>
.panel {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
.controles {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}
input {
  padding: 10px;
  font-size: 1.2rem;
  width: 150px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover { background-color: #33a06f; }
</style>