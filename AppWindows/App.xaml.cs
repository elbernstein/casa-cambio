using System;
using System.IO;
using System.Windows;
using Newtonsoft.Json.Linq;

namespace AppWindows
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            bool hasValidStoreId = false;

            try
            {
                string appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "CasaCambioEmisor");
                string configPath = Path.Combine(appDataPath, "config.json");
                
                if (File.Exists(configPath))
                {
                    var config = JObject.Parse(File.ReadAllText(configPath));
                    string storeId = config["StoreId"]?.ToString();
                    if (!string.IsNullOrEmpty(storeId))
                    {
                        hasValidStoreId = true;
                    }
                }
            }
            catch { }

            if (hasValidStoreId)
            {
                new MainWindow().Show();
            }
            else
            {
                new LoginWindow().Show();
            }
        }
    }
}
