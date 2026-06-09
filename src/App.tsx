import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/ToastProvider';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Worried } from './pages/Worried';
import { GetHelp } from './pages/GetHelp';
import { Report } from './pages/Report';
import { Learn } from './pages/Learn';
import { Parents } from './pages/Parents';
import { Screening } from './pages/Screening';
import { About } from './pages/About';
import { Resources } from './pages/Resources';
import { Rights } from './pages/Rights';
import { Emergency } from './pages/Emergency';
import { NotFound } from './pages/NotFound';

function App() {
 return (
  <ThemeProvider>
   <DataProvider>
   <BrowserRouter>
    <ToastProvider>
     <Layout>
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/worried" element={<Worried />} />
      <Route path="/get-help" element={<GetHelp />} />
      <Route path="/report" element={<Report />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/parents" element={<Parents />} />
      <Route path="/screening" element={<Screening />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/rights" element={<Rights />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
     </Routes>
     </Layout>
    </ToastProvider>
   </BrowserRouter>
   </DataProvider>
  </ThemeProvider>
 );
}

export default App;
