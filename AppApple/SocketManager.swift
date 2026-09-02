import Foundation
import SocketIO
import Combine
import SwiftUI

class SocketManagerObj: ObservableObject {
    static let shared = SocketManagerObj()
    
    @Published var montoEntrega: String = "0.00"
    @Published var montoRecibe: String = "0.00"
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
            print("🟢 Conectado al servidor Socket.IO")
            self?.socket?.emit("join_room", self?.pdvID ?? "")
        }
        
        socket?.on("estado_inicial") { [weak self] dataArray, ack in
            if let data = dataArray.first as? [String: Any] {
                DispatchQueue.main.async {
                    if let me = data["montoEntrega"] as? String { self?.montoEntrega = me }
                    if let mr = data["montoRecibe"] as? String { self?.montoRecibe = mr }
                    
                    if let settings = data["settings"] as? [String: Any],
                       let timeout = settings["idleTimeoutSeconds"] as? Double {
                        self?.idleTimeout = timeout
                    }
                    
                    if let playlist = data["playlist"] as? [[String: Any]] {
                        self?.playlist = playlist
                    }
                    self?.isIdle = true
                }
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
               let timeout = settings["idleTimeoutSeconds"] as? Double {
                DispatchQueue.main.async {
                    self?.idleTimeout = timeout
                    self?.resetIdleTimer()
                }
            }
        }
        
        socket?.on("nuevo_monto") { [weak self] dataArray, ack in
            if let data = dataArray.first as? [String: Any] {
                DispatchQueue.main.async {
                    if let newMontoEntrega = data["montoEntrega"] as? String { self?.montoEntrega = newMontoEntrega }
                    if let newMontoRecibe = data["montoRecibe"] as? String { self?.montoRecibe = newMontoRecibe }
                    self?.resetIdleTimer()
                }
            }
        }
        

    }
    
    private func resetIdleTimer() {
        self.isIdle = false
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
