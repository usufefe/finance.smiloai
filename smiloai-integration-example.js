/**
 * SmiloAI Backend'inde kullanılacak IDURAR entegrasyon kodu
 * Bu kod SmiloAI projenize eklenecek
 */

// SmiloAI signup işleminde çağrılacak fonksiyon
async function createIdurarAccount(userData) {
  try {
    const response = await fetch('https://finance.smiloai.com/api/smilo/user-registered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.IDURAR_WEBHOOK_SECRET // Güvenlik için
      },
      body: JSON.stringify({
        userId: userData._id.toString(),
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        companyName: userData.companyName
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // IDURAR admin ID ve token'ı MongoDB'ye kaydet
      await User.findByIdAndUpdate(userData._id, {
        idurarAdminId: result.data.adminId,
        idurarToken: result.data.token
      });
      
      console.log('✅ IDURAR account created for user:', userData.email);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to create IDURAR account:', error);
    // Hata durumunda retry mekanizması eklenebilir
  }
}

// SmiloAI login işleminde iframe için token exchange
async function getIdurarSSOToken(smiloToken) {
  try {
    const response = await fetch('https://finance.smiloai.com/api/smilo/sso-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        smiloToken: smiloToken
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('IDURAR SSO failed:', error);
    throw error;
  }
}

// SmiloAI Frontend'inde iframe component
function IdurarFrame({ user }) {
  const [idurarToken, setIdurarToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SmiloAI token'ı ile IDURAR token'ı al
    const initIdurar = async () => {
      try {
        const smiloToken = localStorage.getItem('token');
        const response = await getIdurarSSOToken(smiloToken);
        
        if (response.success) {
          setIdurarToken(response.token);
        }
      } catch (error) {
        console.error('IDURAR initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initIdurar();
  }, []);

  if (loading) {
    return <div>Muhasebe modülü yükleniyor...</div>;
  }

  // iframe URL'ine token ve tenant ID ekle
  const iframeUrl = `https://finance.smiloai.com?token=${idurarToken}&tenant=${user.id}`;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="IDURAR Muhasebe"
        allow="camera; microphone; fullscreen"
      />
    </div>
  );
}

// SmiloAI API'den IDURAR verilerine erişim
async function getInvoicesFromIdurar(userId, filters = {}) {
  try {
    const response = await fetch('https://finance.smiloai.com/api/invoice/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userIdurarToken}`,
        'x-tenant-id': userId // Multi-tenant için
      }
    });

    const invoices = await response.json();
    return invoices;
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    throw error;
  }
}

// Voice AI entegrasyonu için intent handler
async function handleVoiceCommand(command, userId) {
  // Ses komutunu parse et
  if (command.includes('fatura') || command.includes('invoice')) {
    if (command.includes('oluştur') || command.includes('create')) {
      // Fatura oluştur
      const invoiceData = parseInvoiceFromVoice(command);
      
      const response = await fetch('https://finance.smiloai.com/api/invoice/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userIdurarToken}`,
          'x-tenant-id': userId
        },
        body: JSON.stringify(invoiceData)
      });
      
      const result = await response.json();
      return {
        text: `Fatura başarıyla oluşturuldu. Fatura numarası: ${result.data.number}`,
        audio: true
      };
    }
    
    if (command.includes('listele') || command.includes('list')) {
      // Faturaları listele
      const invoices = await getInvoicesFromIdurar(userId);
      return {
        text: `${invoices.result.length} adet fatura bulundu. Son fatura: ${invoices.result[0]?.client?.name} - ${invoices.result[0]?.total} TL`,
        audio: true
      };
    }
  }
}

module.exports = {
  createIdurarAccount,
  getIdurarSSOToken,
  IdurarFrame,
  getInvoicesFromIdurar,
  handleVoiceCommand
};
