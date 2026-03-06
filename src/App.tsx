import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Wallets } from '@/pages/Wallets';
import { Transactions } from '@/pages/Transactions';
import { Categories } from '@/pages/Categories';
import { Budgets } from '@/pages/Budgets';
import { Analytics } from '@/pages/Analytics';
import { Calendar } from '@/pages/Calendar';
import { Templates } from '@/pages/Templates';
import { Ledgers } from '@/pages/Ledgers';
import { Scanner } from '@/pages/Scanner';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/ledgers" element={<Ledgers />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
