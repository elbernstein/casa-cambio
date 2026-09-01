using System;
using System.Windows;
using System.Windows.Input;
using Quobject.SocketIoClientDotNet.Client;

namespace AppWindows
{
    public partial class MainWindow : Window
    {
        private Socket socket;
        private string pdvID = "pdv-1"; // ID del punto de venta local

        public MainWindow()
        {
            InitializeComponent();
            socket = IO.Socket("https://api.cambioseurodolar.com");
            InitializeSocket();
        }

        private void InitializeSocket()
        {
            // Conectar al servidor Node local (o la URL de producción)
            socket = IO.Socket("https://api.cambioseurodolar.com");

            socket.On(Socket.EVENT_CONNECT, () =>
            {
                Dispatcher.Invoke(() =>
                {
                    Console.WriteLine("Conectado al servidor desde Windows App.");
                });
                socket.Emit("join_room", pdvID);
            });
        }

        // Permite arrastrar la ventana transparente
        private void Window_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
                this.DragMove();
        }

        // Muestra el menú cuando pasas el mouse
        private void BtnAssistive_MouseEnter(object sender, MouseEventArgs e)
        {
            BtnAssistive.Visibility = Visibility.Collapsed;
            MenuOpciones.Visibility = Visibility.Visible;
        }

        // Oculta el menú si el mouse sale del área
        protected override void OnMouseLeave(MouseEventArgs e)
        {
            base.OnMouseLeave(e);
            MenuOpciones.Visibility = Visibility.Collapsed;
            BtnAssistive.Visibility = Visibility.Visible;
        }

        private void BtnEnviar_Click(object sender, RoutedEventArgs e)
        {
            string monto = TxtMonto.Text;
            if (!string.IsNullOrEmpty(monto))
            {
                // Emitir el monto a la pantalla a través del socket
                var data = new { pdv_id = pdvID, monto = monto };
                // SocketIoClientDotNet maneja objetos anónimos pasándolos a JSON
                socket.Emit("enviar_monto", Newtonsoft.Json.JsonConvert.SerializeObject(data));
                
                // Ocultar menú tras enviar
                TxtMonto.Text = "";
                MenuOpciones.Visibility = Visibility.Collapsed;
                BtnAssistive.Visibility = Visibility.Visible;
            }
        }
    }
}
