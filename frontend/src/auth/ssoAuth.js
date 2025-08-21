/**
 * SSO Authentication Handler for SmiloAI Integration
 */

import { API_BASE_URL } from '@/config/serverApiConfig';

/**
 * URL'den SSO token'ı alır ve otomatik giriş yapar
 */
export const handleSSOLogin = async () => {
  try {
    // URL parametrelerinden token ve tenant ID al
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('token');
    const tenantId = urlParams.get('tenant');

    if (!ssoToken || !tenantId) {
      return null;
    }

    // Token'ı localStorage'a kaydet
    localStorage.setItem('auth_token', ssoToken);
    localStorage.setItem('tenant_id', tenantId);

    // API isteklerine tenant ID eklemek için axios interceptor
    if (window.axios) {
      window.axios.defaults.headers.common['x-tenant-id'] = tenantId;
    }

    // URL'den parametreleri temizle
    window.history.replaceState({}, document.title, window.location.pathname);

    return {
      success: true,
      token: ssoToken,
      tenantId: tenantId
    };
  } catch (error) {
    console.error('SSO Login failed:', error);
    return null;
  }
};

/**
 * iframe içinde çalışıp çalışmadığını kontrol eder
 */
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

/**
 * Parent window'a mesaj gönderir (SmiloAI'ya)
 */
export const sendMessageToParent = (message) => {
  if (isInIframe() && window.parent) {
    window.parent.postMessage(
      {
        source: 'idurar',
        ...message
      },
      '*' // Production'da bunu 'https://console.smiloai.com' yapın
    );
  }
};

/**
 * Parent'tan gelen mesajları dinler
 */
export const listenToParentMessages = (callback) => {
  window.addEventListener('message', (event) => {
    // Production'da origin kontrolü yapın
    // if (event.origin !== 'https://console.smiloai.com') return;
    
    if (event.data && event.data.source === 'smiloai') {
      callback(event.data);
    }
  });
};

/**
 * iframe güvenlik ayarlarını yapar
 */
export const setupIframeSecurityHeaders = () => {
  if (isInIframe()) {
    // iframe içindeyken bazı özellikleri devre dışı bırak
    document.body.classList.add('in-iframe');
    
    // SmiloAI ile iletişim için event listener
    listenToParentMessages((data) => {
      console.log('Message from SmiloAI:', data);
      
      // Gelen komutları işle
      if (data.action === 'createInvoice') {
        // Fatura oluşturma komutu
        window.dispatchEvent(new CustomEvent('smiloai-create-invoice', { detail: data }));
      } else if (data.action === 'refreshData') {
        // Veri yenileme komutu
        window.location.reload();
      }
    });

    // iframe yüklendiğini parent'a bildir
    sendMessageToParent({
      type: 'ready',
      timestamp: Date.now()
    });
  }
};

export default {
  handleSSOLogin,
  isInIframe,
  sendMessageToParent,
  listenToParentMessages,
  setupIframeSecurityHeaders
};
