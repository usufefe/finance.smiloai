import { lazy, Suspense, useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { AppContextProvider } from '@/context/appContext';
import PageLoader from '@/components/PageLoader';
import AuthRouter from '@/router/AuthRouter';
import Localization from '@/locale/Localization';
import { notification } from 'antd';
import { handleSSOLogin, setupIframeSecurityHeaders } from '@/auth/ssoAuth';
import { loginSuccess } from '@/redux/auth/actions';

const ErpApp = lazy(() => import('./ErpApp'));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <ErpApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

export default function IdurarOs() {
  const { isLoggedIn } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [ssoChecking, setSsoChecking] = useState(true);

  console.log(
    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
  );

  // SSO Login Handler
  useEffect(() => {
    const initSSO = async () => {
      try {
        // SSO token'ı kontrol et
        const ssoResult = await handleSSOLogin();
        
        if (ssoResult && ssoResult.success) {
          // SSO başarılı, kullanıcıyı login yap
          dispatch(loginSuccess({
            token: ssoResult.token,
            tenantId: ssoResult.tenantId
          }));
          
          notification.success({
            message: 'SSO Login Successful',
            description: 'Connected via SmiloAI',
            placement: 'topRight'
          });
        }
        
        // iframe güvenlik ayarlarını yap
        setupIframeSecurityHeaders();
      } catch (error) {
        console.error('SSO initialization error:', error);
      } finally {
        setSsoChecking(false);
      }
    };

    initSSO();
  }, [dispatch]);

  // // Online state
  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // useEffect(() => {
  //   // Update network status
  //   const handleStatusChange = () => {
  //     setIsOnline(navigator.onLine);
  //     if (!isOnline) {
  //       console.log('🚀 ~ useEffect ~ navigator.onLine:', navigator.onLine);
  //       notification.config({
  //         duration: 20,
  //         maxCount: 1,
  //       });
  //       // Code to execute when there is internet connection
  //       notification.error({
  //         message: 'No internet connection',
  //         description: 'Cannot connect to the Internet, Check your internet network',
  //       });
  //     }
  //   };

  //   // Listen to the online status
  //   window.addEventListener('online', handleStatusChange);

  //   // Listen to the offline status
  //   window.addEventListener('offline', handleStatusChange);

  //   // Specify how to clean up after this effect for performance improvment
  //   return () => {
  //     window.removeEventListener('online', handleStatusChange);
  //     window.removeEventListener('offline', handleStatusChange);
  //   };
  // }, [navigator.onLine]);

  // SSO kontrolü devam ediyorsa bekle
  if (ssoChecking) {
    return <PageLoader />;
  }

  if (!isLoggedIn)
    return (
      <Localization>
        <AuthRouter />
      </Localization>
    );
  else {
    return <DefaultApp />;
  }
}
