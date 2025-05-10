import "./App.css";
import { CartProvider } from "./context/CartContext";
import { StyleProvider } from "@ant-design/cssinjs";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <StyleProvider layer>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </StyleProvider>
  );
}

export default App;
