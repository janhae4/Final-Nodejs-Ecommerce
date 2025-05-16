import "./App.css";
import '@ant-design/v5-patch-for-react-19';
import { CartProvider } from "./context/CartContext";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { StyleProvider } from "@ant-design/cssinjs";


function App() {
  return (
    <StyleProvider layer>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </StyleProvider>
  );
}

export default App;
