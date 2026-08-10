import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from 'antd';
import './index.css' // ✅ global styles
import { Loader } from './components/Loader';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ConfigProvider
          theme={{
            components: {
              Form: {
                labelColor: "#000",
                labelFontSize: 12,
              },
            },
          }}
        >
        <Suspense fallback={<Loader/>}>
          <App />
        </Suspense>
      </ConfigProvider>

    </AuthProvider>
  </StrictMode>
);