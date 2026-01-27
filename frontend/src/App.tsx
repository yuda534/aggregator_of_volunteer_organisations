import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
function App() {
  return (<AuthProvider><div className="min-h-screen bg-gray-50"><Navbar /><main className="container mx-auto px-4 py-8"><Outlet /></main></div></AuthProvider>);
}
export default App;
