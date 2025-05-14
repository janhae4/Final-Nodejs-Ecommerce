import "./App.css";
import { CartProvider } from "./context/CartContext";
import { StyleProvider } from "@ant-design/cssinjs";

import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

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
