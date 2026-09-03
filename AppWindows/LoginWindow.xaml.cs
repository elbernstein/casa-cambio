using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AppWindows
{
    public partial class LoginWindow : Window
    {
        private readonly HttpClient _client = new HttpClient();
        private const string ApiUrl = "https://api.cambioseurodolar.com";

        public LoginWindow()
        {
            InitializeComponent();
        }

        private async void BtnLogin_Click(object sender, RoutedEventArgs e)
        {
            string email = TxtEmail.Text.Trim();
            string password = TxtPassword.Password.Trim();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                ShowError("Por favor, ingresa correo y contraseña.");
                return;
            }

            BtnLogin.IsEnabled = false;
            BtnLogin.Content = "Iniciando...";
            LblError.Visibility = Visibility.Collapsed;

            try
            {
                var payload = new { email, password };
                var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

                var response = await _client.PostAsync($"{ApiUrl}/api/auth/login", content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var data = JObject.Parse(responseString);
                    string token = data["token"]?.ToString();
                    string storeId = data["user"]?["storeId"]?.ToString();

                    if (!string.IsNullOrEmpty(token) && !string.IsNullOrEmpty(storeId))
                    {
                        SaveConfig(token, storeId);
                        
                        // Abrir ventana principal
                        MainWindow mainWindow = new MainWindow();
                        mainWindow.Show();
                        this.Close();
                    }
                    else
                    {
                        ShowError("El usuario no tiene una tienda asignada.");
                    }
                }
                else
                {
                    ShowError("Credenciales incorrectas.");
                }
            }
            catch (Exception ex)
            {
                ShowError("Error de conexión: " + ex.Message);
            }
            finally
            {
                BtnLogin.IsEnabled = true;
                BtnLogin.Content = "Iniciar Sesión";
            }
        }

        private void ShowError(string message)
        {
            LblError.Text = message;
            LblError.Visibility = Visibility.Visible;
        }

        private void SaveConfig(string token, string storeId)
        {
            try
            {
                string appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "CasaCambioEmisor");
                if (!Directory.Exists(appDataPath))
                {
                    Directory.CreateDirectory(appDataPath);
                }

                string configPath = Path.Combine(appDataPath, "config.json");
                var config = new { Token = token, StoreId = storeId };
                File.WriteAllText(configPath, JsonConvert.SerializeObject(config));
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error saving config: " + ex.Message);
            }
        }
    }
}
