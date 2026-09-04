<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { io } from 'socket.io-client';

const pdvID = 'pdv-1';
const socket = ref(null);
const monto = ref('0.00');

// Playlist y rotación
const playlist = ref([]);
const currentAdIndex = ref(0);
let adRotationTimer = null;

const adData = computed(() => {
  if (playlist.value.length === 0) return { url: null, type: null };
  const currentAd = playlist.value[currentAdIndex.value];
  if (!currentAd || !currentAd.url) return { url: null, type: null };
  
  const filename = currentAd.url.split('/').pop();
  return {
    url: `https://api.cambioseurodolar.com/uploads/${filename}`,
    type: currentAd.type
  };
});

// Asesino de videos global para garantizar que se calle el audio
const forceKillVideos = () => {
  const videos = document.querySelectorAll('video');
  videos.forEach(v => {
    try {
      v.pause();
      v.volume = 0;
      v.removeAttribute('src');
      v.load();
      v.remove();
    } catch (e) { console.error(e); }
  });
};

// Estado de inactividad
const isIdle = ref(true);
let idleTimer = null;
const IDLE_TIMEOUT = 10000;

const startAdRotation = () => {
  if (adRotationTimer) clearInterval(adRotationTimer);
  adRotationTimer = setInterval(() => {
    if (isIdle.value && playlist.value.length > 0) {
      currentAdIndex.value = (currentAdIndex.value + 1) % playlist.value.length;
    }
  }, 10000); // Rota cada 10s
};

const resetIdleTimer = () => {
  isIdle.value = false;
  forceKillVideos(); // Mata el video al instante
  
  if (idleTimer) clearTimeout(idleTimer);
  
  if (playlist.value.length > 0) {
    idleTimer = setTimeout(() => {
      isIdle.value = true;
      startAdRotation();
    }, IDLE_TIMEOUT);
  }
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    forceKillVideos();
  } else if (isIdle.value && playlist.value.length > 0) {
    // Al volver, si estaba inactivo, forzamos un refresco simulando reset
    const temp = isIdle.value;
    isIdle.value = false;
    setTimeout(() => isIdle.value = temp, 50);
  }
};

onMounted(() => {
  socket.value = io('http://localhost:3000'); // NOTA: Esto debería apuntar a tu servidor remoto en prod

  socket.value.on('connect', () => {
    socket.value.emit('join_room', pdvID);
  });

  socket.value.on('estado_inicial', (data) => {
    if (data.montoEntrega) monto.value = data.montoEntrega;
    if (data.playlist && data.playlist.length > 0) {
      playlist.value = data.playlist;
      isIdle.value = true;
      startAdRotation();
    }
  });

  socket.value.on('nuevo_monto', (data) => {
    if (data.montoEntrega) monto.value = data.montoEntrega;
    resetIdleTimer();
  });

  socket.value.on('playlist_updated', (data) => {
    if (Array.isArray(data) && data.length > 0) {
      playlist.value = data[0];
      currentAdIndex.value = 0;
    }
  });

  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  if (socket.value) socket.value.disconnect();
  if (idleTimer) clearTimeout(idleTimer);
  if (adRotationTimer) clearInterval(adRotationTimer);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div class="receptor-container">
    
    <!-- PANTALLA PRINCIPAL DE MONTO -->
    <transition name="fade">
      <div v-if="!isIdle || !adData.url" class="monto-screen">
        <div class="monto-box">
          <h2>TOTAL A PAGAR</h2>
          <div class="monto-display">
            <span class="currency">$</span>
            <span class="value">{{ monto }}</span>
          </div>
          <div class="brand">
            <img src="/logo.jpg" alt="Casa Cambio" class="brand-logo" />
            <span>CASA DE CAMBIO</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- PANTALLA DE PUBLICIDAD (INACTIVIDAD) -->
    <transition name="slide-up">
      <div v-if="isIdle && adData.url" class="ad-screen" @click="resetIdleTimer">
        <video 
          v-if="adData.type === 'video'" 
          ref="videoPlayer"
          :src="adData.url" 
          autoplay 
          loop 
          muted 
          class="ad-media"
        ></video>
        <img 
          v-else 
          :src="adData.url" 
          class="ad-media" 
          alt="Publicidad" 
        />
      </div>
    </transition>

  </div>
</template>

<style>
:root {
  --bg-dark: #0a0f1d;
  --accent-gold: #fbbf24;
  --text-light: #f8fafc;
}

body {
  margin: 0;
  font-family: 'Outfit', 'Inter', sans-serif;
  overflow: hidden; /* App de quiosco, sin scroll */
  background-color: var(--bg-dark);
  color: var(--text-light);
}

.receptor-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Pantalla de Monto */
.monto-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1e293b 0%, var(--bg-dark) 100%);
  z-index: 10;
}

.monto-box {
  text-align: center;
  padding: 4rem 6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
              inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.monto-box h2 {
  font-size: 2rem;
  letter-spacing: 0.2em;
  color: #94a3b8;
  margin-bottom: 2rem;
  font-weight: 500;
}

.monto-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 40px rgba(251, 191, 36, 0.4);
}

.currency {
  font-size: 4rem;
  color: var(--accent-gold);
  margin-right: 0.5rem;
  font-weight: 300;
}

.value {
  font-size: 8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  letter-spacing: 0.4em;
  color: #475569;
  text-transform: uppercase;
  margin-top: 2rem;
}

.brand-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(74, 222, 128, 0.2);
}

/* Pantalla de Publicidad */
.ad-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-media {
  width: 100%;
  height: 100%;
  object-fit: contain; /* o cover, dependiendo del diseño preferido */
}

/* Animaciones y Transiciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
