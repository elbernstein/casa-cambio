import Foundation
import SocketIO
import Combine
import SwiftUI

class SocketManagerObj: ObservableObject {
    static let shared = SocketManagerObj()
    
    @Published var montoEntrega: String = "0.00"
    @Published var montoRecibe: String = "0.00"
    @Published var monedaEntrega: [String: String]? = nil
    @Published var monedaRecibe: [String: String]? = nil
    @Published var isAuthenticated: Bool = false
    @Published var loginError: String? = nil
    @Published var isIdle: Bool = true
    @Published var playlist: [[String: Any]] = []
    @Published var currentAdIndex: Int = 0
    @Published var idleTimeout: Double = 15.0
    
    private var manager: SocketManager?
    private var socket: SocketIOClient?
    private let pdvID = "pdv-1"
    
    // Timer para el idle
    private var idleTimer: Timer?
    
    private init() {
        if let savedToken = UserDefaults.standard.string(forKey: "jwtToken") {
            self.isAuthenticated = true
            setupSocket(token: savedToken)
        }
    }
    
    func setupSocket(token: String) {
        self.manager = SocketManager(socketURL: URL(string: "https://api.cambioseurodolar.com")!, config: [.log(true), .compress, .connectParams(["token": token])])
        self.socket = self.manager?.defaultSocket
        
        setupSocketEvents()
        self.socket?.connect()
    }
    
    private func setupSocketEvents() {
        socket?.on(clientEvent: .connect) { [weak self] data, ack in
            print("\n==================================")
            print("🟢 SWIFT: Conectado al servidor Socket.IO")
            print("🟢 SWIFT: Emitiendo join_room para: \(self?.pdvID ?? "")")
            print("==================================\n")
            self?.socket?.emit("join_room", self?.pdvID ?? "")
        }
        
        socket?.on("estado_inicial") { [weak self] dataArray, ack in
            print("\n📥 SWIFT: Evento 'estado_inicial' recibido!")
            if let data = dataArray.first as? [String: Any] {
                DispatchQueue.main.async {
                    var amountsChanged = false
                    
                    if let me = data["montoEntrega"] as? String {
                        if self?.montoEntrega != me { amountsChanged = true }
                        self?.montoEntrega = me
                    }
                    
                    if let mr = data["montoRecibe"] as? String {
                        if self?.montoRecibe != mr { amountsChanged = true }
                        self?.montoRecibe = mr
                    }
                    
                    if let cEntrega = data["monedaEntrega"] as? [String: String] {
                        self?.monedaEntrega = cEntrega
                    }
                    if let cRecibe = data["monedaRecibe"] as? [String: String] {
                        self?.monedaRecibe = cRecibe
                    }
                    
                    if let settings = data["settings"] as? [String: Any],
                       let timeout = (settings["idleTimeoutSeconds"] as? NSNumber)?.doubleValue {
                        self?.idleTimeout = timeout
                    }
                    
                    if let playlist = data["playlist"] as? [[String: Any]] {
                        self?.playlist = playlist
                    }
                    
                    // Solo resetear el timer de inactividad si los montos cambiaron o es el primer inicio
                    if amountsChanged || self?.idleTimer == nil {
                        self?.resetIdleTimer()
                    }
                }
            } else {
                print("❌ SWIFT: Error - 'estado_inicial' no contiene un Diccionario válido.")
            }
        }
        
        socket?.on("playlist_updated") { [weak self] data, ack in
            if let newPlaylist = data.first as? [[String: Any]] {
                DispatchQueue.main.async {
                    self?.playlist = newPlaylist
                    self?.currentAdIndex = 0
                }
            }
        }
        
        socket?.on("settings_updated") { [weak self] data, ack in
            if let settings = data.first as? [String: Any],
               let timeout = (settings["idleTimeoutSeconds"] as? NSNumber)?.doubleValue {
                DispatchQueue.main.async {
                    self?.idleTimeout = timeout
                    self?.resetIdleTimer()
                }
            }
        }
        
        socket?.on("nuevo_monto") { [weak self] dataArray, ack in
            print("\n🚀 SWIFT: Evento 'nuevo_monto' recibido en tiempo real!")
            print("🚀 SWIFT: Datos crudos: \(dataArray)")
            if let data = dataArray.first as? [String: Any] {
                DispatchQueue.main.async {
                    if let newMontoEntrega = data["montoEntrega"] as? String {
                        print("✅ SWIFT: UI - Actualizando montoEntrega a = \(newMontoEntrega)")
                        self?.montoEntrega = newMontoEntrega
                    } else {
                        print("❌ SWIFT: Error - No se pudo extraer 'montoEntrega' como String")
                    }
                    
                    if let newMontoRecibe = data["montoRecibe"] as? String {
                        print("✅ SWIFT: UI - Actualizando montoRecibe a = \(newMontoRecibe)")
                        self?.montoRecibe = newMontoRecibe
                    } else {
                        print("❌ SWIFT: Error - No se pudo extraer 'montoRecibe' como String")
                    }
                    
                    if let cEntrega = data["monedaEntrega"] as? [String: String] {
                        self?.monedaEntrega = cEntrega
                    }
                    if let cRecibe = data["monedaRecibe"] as? [String: String] {
                        self?.monedaRecibe = cRecibe
                    }
                    
                    self?.resetIdleTimer()
                }
            } else {
                print("❌ SWIFT: Error - Los datos de 'nuevo_monto' no son un Diccionario válido.")
            }
        }
        

    }
    
    func resetIdleTimer() {
        self.isIdle = false
        NotificationCenter.default.post(name: NSNotification.Name("StopVideoPlayback"), object: nil)
        idleTimer?.invalidate()
        idleTimer = Timer.scheduledTimer(withTimeInterval: self.idleTimeout, repeats: false) { [weak self] _ in
            DispatchQueue.main.async {
                self?.isIdle = true
                self?.startAdRotation()
            }
        }
    }
    
    func login(username: String, pass: String) {
        guard let url = URL(string: "https://api.cambioseurodolar.com/api/login") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: String] = ["username": username, "password": pass]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let data = data,
                   let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let token = json["token"] as? String {
                    UserDefaults.standard.set(token, forKey: "jwtToken")
                    self.loginError = nil
                    self.isAuthenticated = true
                    self.setupSocket(token: token)
                } else {
                    self.loginError = "Credenciales incorrectas o error de red."
                }
            }
        }.resume()
    }
    
    func logout() {
        socket?.disconnect()
        UserDefaults.standard.removeObject(forKey: "jwtToken")
        self.isAuthenticated = false
        self.montoEntrega = "0.00"
        self.montoRecibe = "0.00"
    }
    
    // Timer para rotar publicidad
    private var adRotationTimer: Timer?
    
    private func startAdRotation() {
        adRotationTimer?.invalidate()
        // Rotar cada 10 segundos
        adRotationTimer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            if self.isIdle && !self.playlist.isEmpty {
                self.currentAdIndex = (self.currentAdIndex + 1) % self.playlist.count
            }
        }
    }
}
