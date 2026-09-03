using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NHotkey;
using NHotkey.Wpf;

namespace AppWindows
{
    public partial class MainWindow : Window
    {
        private readonly HttpClient _client = new HttpClient();
        private const string ApiUrl = "https://api.cambioseurodolar.com";
        private string currentStoreId = null;

        public MainWindow()
        {
            InitializeComponent();
            LoadConfig();
            RegisterShortcuts();
        }

        private void LoadConfig()
        {
            try
            {
                string appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "CasaCambioEmisor");
                string configPath = Path.Combine(appDataPath, "config.json");
                
                if (File.Exists(configPath))
                {
                    var config = JObject.Parse(File.ReadAllText(configPath));
                    currentStoreId = config["StoreId"]?.ToString();
                    
                    string token = config["Token"]?.ToString();
                    if (!string.IsNullOrEmpty(token))
                    {
                        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error loading config: " + ex.Message);
            }
        }

        private void RegisterShortcuts()
        {
            try
            {
                HotkeyManager.Current.AddOrReplace("Entrega", Key.D1, ModifierKeys.Control | ModifierKeys.Shift, OnEntregaPressed);
                HotkeyManager.Current.AddOrReplace("Recibe", Key.D2, ModifierKeys.Control | ModifierKeys.Shift, OnRecibePressed);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error registrando atajos: " + ex.Message);
            }
        }

        private async void OnEntregaPressed(object sender, HotkeyEventArgs e)
        {
            if (string.IsNullOrEmpty(currentStoreId)) return;
            string clipboardText = Clipboard.GetText().Trim();
            string cleanText = CleanNumber(clipboardText);
            
            if (!string.IsNullOrEmpty(cleanText))
            {
                await SendAmountUpdate(new { montoEntrega = cleanText });
            }
        }

        private async void OnRecibePressed(object sender, HotkeyEventArgs e)
        {
            if (string.IsNullOrEmpty(currentStoreId)) return;
            string clipboardText = Clipboard.GetText().Trim();
            string cleanText = CleanNumber(clipboardText);
            
            if (!string.IsNullOrEmpty(cleanText))
            {
                await SendAmountUpdate(new { montoRecibe = cleanText });
            }
        }

        private string CleanNumber(string input)
        {
            string cleaned = Regex.Replace(input, "[^0-9,.-]", "");
            return cleaned.Replace(",", ".");
        }

        private async System.Threading.Tasks.Task SendAmountUpdate(object payload)
        {
            try
            {
                var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
                await _client.PutAsync($"{ApiUrl}/api/stores/{currentStoreId}/amounts", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating amount: " + ex.Message);
            }
        }

        private void Window_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
                this.DragMove();
        }

        private void BtnAssistive_MouseEnter(object sender, MouseEventArgs e)
        {
            BtnAssistive.Visibility = Visibility.Collapsed;
            MenuOpciones.Visibility = Visibility.Visible;
        }

        protected override void OnMouseLeave(MouseEventArgs e)
        {
            base.OnMouseLeave(e);
            MenuOpciones.Visibility = Visibility.Collapsed;
            BtnAssistive.Visibility = Visibility.Visible;
        }

        private void BtnLogout_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "CasaCambioEmisor");
                string configPath = Path.Combine(appDataPath, "config.json");
                if (File.Exists(configPath))
                {
                    File.Delete(configPath);
                }
                
                HotkeyManager.Current.Remove("Entrega");
                HotkeyManager.Current.Remove("Recibe");
            }
            catch { }

            LoginWindow login = new LoginWindow();
            login.Show();
            this.Close();
        }
    }
}
