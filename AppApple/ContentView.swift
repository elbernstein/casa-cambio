import SwiftUI
import AVKit

struct ContentView: View {
    @StateObject private var socketObj = SocketManagerObj()
    
    // Estados para Login
    @State private var username = ""
    @State private var password = ""
    
    // Colores basados en la imagen
    let topBarBlue = Color(red: 0.05, green: 0.2, blue: 0.45)
    let textTeal = Color(red: 0.2, green: 0.6, blue: 0.65)
    let textDark = Color(red: 0.1, green: 0.1, blue: 0.15)
    let textGray = Color(red: 0.4, green: 0.4, blue: 0.45)
    
    var body: some View {
        Group {
            if !socketObj.isAuthenticated {
                loginView
            } else {
                mainView
            }
        }
        .edgesIgnoringSafeArea(.all)
    }
    
    // MARK: - Login View
    var loginView: some View {
        VStack(spacing: 20) {
            Image("logo")
                .resizable()
                .scaledToFit()
                .frame(height: 80)
                .padding(.bottom, 20)
            
            Text("Iniciar Sesión (Receptor)")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(topBarBlue)
            
            VStack(spacing: 15) {
                TextField("Usuario de Tienda", text: $username)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(.none)
                
                SecureField("Contraseña", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                if let error = socketObj.loginError {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }
                
                Button(action: {
                    socketObj.login(username: username, pass: password)
                }) {
                    Text("Conectar")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(topBarBlue)
                        .cornerRadius(10)
                }
                .padding(.top, 10)
            }
            .padding(30)
            .background(Color.white)
            .cornerRadius(15)
            .shadow(radius: 10)
            .frame(maxWidth: 400)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(white: 0.95))
    }
    
    // MARK: - Main View
    var mainView: some View {
        GeometryReader { geometry in
            ZStack {
                Color.white.edgesIgnoringSafeArea(.all)
                
                VStack(spacing: 0) {
                    
                    // Barra superior Azul Oscuro
                    HStack {
                        Image("logo")
                            .resizable()
                            .scaledToFit()
                            .frame(height: 50)
                        
                        Spacer()
                        
                        Text("Cambie más y\nconsiga más beneficios")
                            .font(.system(size: 16))
                            .multilineTextAlignment(.center)
                            .foregroundColor(.white)
                            .padding(.trailing, 20)
                        
                        Spacer()
                        
                        // Selector de idioma falso
                        HStack(spacing: 5) {
                            Text("Idioma")
                            Text("🇪🇸")
                            Image(systemName: "chevron.down")
                        }
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 15)
                        .padding(.vertical, 8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.white.opacity(0.5), lineWidth: 1)
                        )
                        
                        // Botón Logout
                        Button(action: { socketObj.logout() }) {
                            Image(systemName: "power")
                                .foregroundColor(.white)
                                .padding(.leading, 15)
                        }
                    }
                    .padding(.horizontal, 30)
                    .padding(.vertical, 20)
                    .background(topBarBlue)
                    
                    Spacer()
                    
                    // Contenido Central
                    VStack(alignment: .leading, spacing: 20) {
                        Text("OPERACIÓN ACTUAL")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(textGray)
                            .padding(.leading, 10)
                        
                        // Tarjeta Blanca con Sombra
                        HStack(alignment: .center, spacing: 40) {
                            
                            // Lado Izquierdo: Usted entrega
                            VStack(alignment: .leading, spacing: 5) {
                                Text("Usted entrega")
                                    .font(.subheadline)
                                    .foregroundColor(textGray)
                                HStack {
                                    Text("🇨🇴")
                                    Text("COP")
                                        .fontWeight(.bold)
                                        .foregroundColor(topBarBlue)
                                }
                                Text(socketObj.montoEntrega)
                                    .font(.system(size: 70, weight: .bold))
                                    .foregroundColor(textTeal)
                            }
                            
                            // Flecha central
                            Image(systemName: "chevron.right")
                                .font(.system(size: 50, weight: .light))
                                .foregroundColor(textTeal)
                                .padding(.horizontal, 20)
                            
                            // Lado Derecho: Usted recibe
                            VStack(alignment: .leading, spacing: 5) {
                                Text("Usted recibe")
                                    .font(.subheadline)
                                    .foregroundColor(textGray)
                                HStack {
                                    Text("🇺🇸")
                                    Text("USD")
                                        .fontWeight(.bold)
                                        .foregroundColor(topBarBlue)
                                }
                                Text(socketObj.montoRecibe)
                                    .font(.system(size: 70, weight: .bold))
                                    .foregroundColor(textDark)
                            }
                            
                        }
                        .padding(.vertical, 40)
                        .padding(.horizontal, 50)
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(color: Color.black.opacity(0.08), radius: 20, x: 0, y: 10)
                        
                        // Botón Continuar Falso
                        HStack {
                            Spacer()
                            Button(action: {}) {
                                HStack {
                                    Text("CONTINUAR")
                                        .fontWeight(.bold)
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.white)
                                .padding(.horizontal, 30)
                                .padding(.vertical, 15)
                                .background(Color(red: 0.35, green: 0.65, blue: 0.90))
                                .cornerRadius(30)
                            }
                            Spacer()
                        }
                        .padding(.top, 20)
                    }
                    .padding(.horizontal, 60)
                    
                    Spacer()
                }
                
                // PANTALLA DE PUBLICIDAD (INACTIVIDAD) - Sobre todo
                if socketObj.isIdle && !socketObj.playlist.isEmpty {
                    let currentAd = socketObj.playlist[socketObj.currentAdIndex]
                    if let adUrlString = currentAd["url"] as? String, let adUrl = URL(string: adUrlString), let adType = currentAd["type"] as? String {
                        ZStack {
                            Color.black.edgesIgnoringSafeArea(.all)
                            if adType == "video" {
                                VideoPlayer(player: AVPlayer(url: adUrl))
                                    .edgesIgnoringSafeArea(.all)
                            } else {
                                AsyncImage(url: adUrl) { image in
                                    image.resizable().aspectRatio(contentMode: .fit)
                                } placeholder: {
                                    ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .white))
                                }
                                .edgesIgnoringSafeArea(.all)
                            }
                        }
                        .transition(.opacity)
                        .zIndex(2)
                    }
                }
            }
        }
        .animation(.easeInOut(duration: 0.8), value: socketObj.isIdle)
    }
}
