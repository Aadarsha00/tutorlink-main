import { AuthProvider } from "./context/auth-context";
import PageRoutes from "./routes/routes";
import { Toaster } from "sonner";

export function App() {
  return (
    <AuthProvider>
      <Toaster />
      <PageRoutes />
    </AuthProvider>
  );
}

export default App;
