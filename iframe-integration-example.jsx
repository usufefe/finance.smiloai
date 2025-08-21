// Smiloai projenizde kullanmak için örnek iframe entegrasyon komponenti

import React, { useState, useEffect } from 'react';

const IdurarFinanceIntegration = () => {
  const [iframeUrl, setIframeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Development ve Production için URL ayarı
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://finance.smiloai.com'
      : 'http://localhost:3000';
    
    setIframeUrl(baseUrl);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // iframe'e mesaj gönderme (gelecekte auth token paylaşımı için)
  const sendMessageToIframe = (message) => {
    const iframe = document.getElementById('idurar-finance-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, iframeUrl);
    }
  };

  // iframe'den mesaj alma
  useEffect(() => {
    const handleMessage = (event) => {
      // Güvenlik kontrolü - sadece güvenilir origin'lerden mesaj kabul et
      const trustedOrigins = [
        'http://localhost:3000',
        'https://finance.smiloai.com'
      ];
      
      if (!trustedOrigins.includes(event.origin)) {
        return;
      }

      // iframe'den gelen mesajları işle
      console.log('Message from iframe:', event.data);
      
      // Örnek: iframe'den logout mesajı gelirse
      if (event.data.type === 'logout') {
        // Ana uygulamada da logout işlemi yap
        handleLogout();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeUrl]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      position: 'relative',
      backgroundColor: '#f0f2f5'
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '18px',
          color: '#666'
        }}>
          Muhasebe modülü yükleniyor...
        </div>
      )}
      
      <iframe
        id="idurar-finance-iframe"
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: isLoading ? 'none' : 'block'
        }}
        onLoad={handleIframeLoad}
        title="IDURAR Finance Module"
        allow="camera; microphone; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
      />
    </div>
  );
};

export default IdurarFinanceIntegration;

// Smiloai'de kullanım örneği:
// import IdurarFinanceIntegration from './components/IdurarFinanceIntegration';
// 
// function App() {
//   return (
//     <div>
//       {/* Diğer Smiloai komponenetleri */}
//       <IdurarFinanceIntegration />
//     </div>
//   );
// }
