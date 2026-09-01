const { io } = require("socket.io-client");

// Conectarnos al servidor local
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("✅ Conectado al servidor como Emisor de prueba");

    // Datos que enviará la aplicación de Windows
    const pdv_id = "pdv-1";
    const nuevoEntrega = "338.000,00";
    const nuevoRecibe = "100,00";

    console.log(`📤 Enviando nueva operación a la pantalla del ${pdv_id}...`);
    
    // Emitir el evento de Socket.io tal cual lo hará C#
    socket.emit("enviar_monto", { pdv_id: pdv_id, montoEntrega: nuevoEntrega, montoRecibe: nuevoRecibe });

    // Esperamos un segundito y cerramos el script
    setTimeout(() => {
        console.log("👋 Simulación terminada.");
        process.exit(0);
    }, 1000);
});
