import SwiftUI
import AVKit

struct ContentView: View {
    @StateObject private var socketObj = SocketManagerObj.shared
    
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
                    VStack(alignment: .leading, spacing: 40) {
                        Text("OPERACIÓN ACTUAL")
                            .font(.system(size: 40, weight: .medium))
                            .foregroundColor(textGray)
                            .padding(.leading, 10)
                        
                        // Tarjeta Blanca con Sombra
                        HStack(alignment: .center, spacing: 60) {
                            
                            // Lado Izquierdo: Usted entrega
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Usted entrega / You send")
                                    .font(.system(size: 30))
                                    .foregroundColor(textGray)
                                HStack(alignment: .center, spacing: 10) {
                                    if let flagUrlString = socketObj.monedaEntrega?["flagUrl"],
                                       let url = URL(string: flagUrlString) {
                                        AsyncImage(url: url) { phase in
                                            switch phase {
                                            case .empty:
                                                ProgressView()
                                            case .success(let image):
                                                image.resizable().aspectRatio(contentMode: .fit)
                                            case .failure:
                                                Text("🇨🇴").font(.system(size: 30))
                                            @unknown default:
                                                EmptyView()
                                            }
                                        }
                                        .frame(width: 45, height: 30)
                                        .cornerRadius(4)
                                    } else {
                                        Text("🇨🇴").font(.system(size: 30))
                                    }
                                    
                                    Text(socketObj.monedaEntrega?["code"] ?? "COP")
                                        .font(.system(size: 30, weight: .bold))
                                        .foregroundColor(topBarBlue)
                                }
                                Text(socketObj.montoEntrega)
                                    .font(.system(size: 140, weight: .bold))
                                    .foregroundColor(textTeal)
                            }
                            
                            // Flecha central
                            Image(systemName: "chevron.right")
                                .font(.system(size: 100, weight: .light))
                                .foregroundColor(textTeal)
                                .padding(.horizontal, 40)
                            
                            // Lado Derecho: Usted recibe
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Usted recibe / You get")
                                    .font(.system(size: 30))
                                    .foregroundColor(textGray)
                                HStack(alignment: .center, spacing: 10) {
                                    if let flagUrlString = socketObj.monedaRecibe?["flagUrl"],
                                       let url = URL(string: flagUrlString) {
                                        AsyncImage(url: url) { phase in
                                            switch phase {
                                            case .empty:
                                                ProgressView()
                                            case .success(let image):
                                                image.resizable().aspectRatio(contentMode: .fit)
                                            case .failure:
                                                Text("🇺🇸").font(.system(size: 30))
                                            @unknown default:
                                                EmptyView()
                                            }
                                        }
                                        .frame(width: 45, height: 30)
                                        .cornerRadius(4)
                                    } else {
                                        Text("🇺🇸").font(.system(size: 30))
                                    }
                                    
                                    Text(socketObj.monedaRecibe?["code"] ?? "USD")
                                        .font(.system(size: 30, weight: .bold))
                                        .foregroundColor(topBarBlue)
                                }
                                Text(socketObj.montoRecibe)
                                    .font(.system(size: 140, weight: .bold))
                                    .foregroundColor(textDark)
                            }
                            
                        }
                        .padding(.vertical, 80)
                        .padding(.horizontal, 100)
                        .background(Color.white)
                        .cornerRadius(40)
                        .shadow(color: Color.black.opacity(0.08), radius: 30, x: 0, y: 15)
                        
                    }
                    .padding(.horizontal, 60)
                    
                    Spacer()
                }
                
                // PANTALLA DE PUBLICIDAD (INACTIVIDAD) - Sobre todo
                if socketObj.isIdle && !socketObj.playlist.isEmpty {
                    let currentAd = socketObj.playlist[socketObj.currentAdIndex]
                    if let adUrlStringRaw = currentAd["url"] as? String, let adType = currentAd["type"] as? String {
                        let adUrlString = adUrlStringRaw.replacingOccurrences(of: "http://", with: "https://")
                        if let adUrl = URL(string: adUrlString) {
                            ZStack {
                                Color.black.edgesIgnoringSafeArea(.all)
                                if adType == "video" {
                                    VideoPlayer(player: AVPlayer(url: adUrl))
                                        .edgesIgnoringSafeArea(.all)
                                        .disabled(true) // Deshabilita controles para que el tap pase
                                } else {
                                    AsyncImage(url: adUrl) { image in
                                        image.resizable().aspectRatio(contentMode: .fit)
                                    } placeholder: {
                                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    }
                                    .edgesIgnoringSafeArea(.all)
                                }
                            }
                            .contentShape(Rectangle())
                            .onTapGesture {
                                socketObj.resetIdleTimer()
                            }
                            .transition(.opacity)
                            .zIndex(2)
                        }
                    }
                }
            }
        }
        .animation(.easeInOut(duration: 0.8), value: socketObj.isIdle)
    }
}
