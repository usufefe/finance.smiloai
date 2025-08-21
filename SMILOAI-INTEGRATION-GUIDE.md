# 🚀 SmiloAI + IDURAR Muhasebe Entegrasyon Rehberi

## ✅ Tamamlanan Entegrasyon Özellikleri

### 1. **Multi-Tenant Mimari**
- Her SmiloAI kullanıcısı için ayrı MongoDB database
- Tam veri izolasyonu
- Otomatik tenant oluşturma

### 2. **SSO (Single Sign-On)**
- Token exchange sistemi
- URL parametreleri ile otomatik giriş
- iframe güvenlik ayarları

### 3. **Webhook Entegrasyonu**
- Kullanıcı kaydında otomatik IDURAR hesabı
- Güvenli webhook authentication
- Tenant database otomatik setup

### 4. **iframe Desteği**
- Header/sidebar otomatik gizleme
- Parent-child window mesajlaşma
- Responsive iframe tasarımı

## 📝 ENV Dosyası Ayarları

### Backend `.env` (Development)
```env
# Temel Ayarlar
DATABASE=mongodb+srv://utkutekin73:JVPi262k7qZfht14@armenabot.gah5c8l.mongodb.net/idurar-muhasebe?retryWrites=true&w=majority&appName=armenabot
JWT_SECRET=idurar-super-secret-jwt-key-2024-muhasebe
PORT=8888
PUBLIC_SERVER_FILE=http://localhost:8888
NODE_ENV=development

# Multi-tenant (SmiloAI entegrasyonu için)
ENABLE_MULTI_TENANT=false  # SmiloAI ile kullanırken true yapın

# SmiloAI Integration
SMILO_WEBHOOK_SECRET=smilo-idurar-webhook-secret-2024
SMILO_API_URL=https://console.smiloai.com/api

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
```

### Backend `.env.production`
```env
# Production ayarları
DATABASE=mongodb+srv://utkutekin73:JVPi262k7qZfht14@armenabot.gah5c8l.mongodb.net/idurar-muhasebe-prod?retryWrites=true&w=majority&appName=armenabot
JWT_SECRET=production-super-secret-key-change-this-immediately
PORT=8888
PUBLIC_SERVER_FILE=https://finance.smiloai.com
NODE_ENV=production

# Multi-tenant AÇIK
ENABLE_MULTI_TENANT=true

# SmiloAI Integration
SMILO_WEBHOOK_SECRET=production-webhook-secret-2024
SMILO_API_URL=https://console.smiloai.com/api
```

### Frontend `.env` (Development)
```env
VITE_BACKEND_SERVER=http://localhost:8888/api/
VITE_FILE_BASE_URL=http://localhost:8888/uploads/
VITE_PARENT_ORIGIN=https://console.smiloai.com,http://localhost:8080,http://localhost:3000
VITE_DEV_MODE=true
```

### Frontend `.env.production`
```env
VITE_BACKEND_SERVER=https://finance.smiloai.com/api/
VITE_FILE_BASE_URL=https://finance.smiloai.com/uploads/
VITE_PARENT_ORIGIN=https://console.smiloai.com,https://smiloai.com
VITE_DEV_MODE=false
VITE_PROD=true
```

## 🧪 Test Senaryoları

### 1. **Webhook Test (Postman)**

```http
POST http://localhost:8888/api/smilo/user-registered
Headers:
  Content-Type: application/json
  x-webhook-secret: smilo-idurar-webhook-secret-2024

Body:
{
  "userId": "test_user_123",
  "email": "test@example.com",
  "name": "Test",
  "surname": "User",
  "companyName": "Test Company"
}
```

Beklenen Yanıt:
```json
{
  "success": true,
  "message": "IDURAR account created successfully",
  "data": {
    "adminId": "...",
    "token": "..."
  }
}
```

### 2. **SSO Login Test**

URL ile giriş:
```
http://localhost:3001?token=YOUR_JWT_TOKEN&tenant=test_user_123
```

### 3. **iframe Test (HTML)**

```html
<!DOCTYPE html>
<html>
<head>
    <title>IDURAR iframe Test</title>
</head>
<body>
    <iframe 
        src="http://localhost:3001?token=TOKEN&tenant=TENANT_ID"
        style="width: 100%; height: 600px; border: none;"
        allow="camera; microphone; fullscreen">
    </iframe>
    
    <script>
        // iframe'den gelen mesajları dinle
        window.addEventListener('message', (event) => {
            if (event.data.source === 'idurar') {
                console.log('IDURAR Message:', event.data);
            }
        });

        // iframe'e mesaj gönder
        function sendToIdurar(action, data) {
            const iframe = document.querySelector('iframe');
            iframe.contentWindow.postMessage({
                source: 'smiloai',
                action: action,
                ...data
            }, '*');
        }
    </script>
</body>
</html>
```

## 🔌 API Endpoints

### SmiloAI Integration Endpoints
- `POST /api/smilo/user-registered` - Yeni kullanıcı webhook'u
- `POST /api/smilo/user-deleted` - Kullanıcı silme webhook'u
- `POST /api/smilo/sso-login` - SSO token exchange

### Multi-tenant API Çağrıları
```javascript
// Header'a tenant ID ekle
headers: {
  'Authorization': 'Bearer YOUR_TOKEN',
  'x-tenant-id': 'USER_TENANT_ID'
}
```

## 🚀 Deployment Checklist

### Backend Deployment:
- [ ] `.env.production` dosyasını oluştur
- [ ] `ENABLE_MULTI_TENANT=true` yap
- [ ] Webhook secret'ı güncelle
- [ ] MongoDB connection string'i kontrol et
- [ ] CORS ayarlarında `finance.smiloai.com` var mı?
- [ ] PM2 veya forever ile başlat

### Frontend Deployment:
- [ ] `.env.production` dosyasını oluştur
- [ ] Backend URL'ini güncelle
- [ ] Parent origin'leri kontrol et
- [ ] `npm run build` ile production build al
- [ ] Nginx config'de iframe headers ekle

### Nginx Config Örneği:
```nginx
server {
    listen 80;
    server_name finance.smiloai.com;
    
    # iframe için güvenlik headers
    add_header X-Frame-Options "ALLOW-FROM https://console.smiloai.com";
    add_header Content-Security-Policy "frame-ancestors 'self' https://console.smiloai.com https://smiloai.com";
    
    location / {
        root /var/www/idurar-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🔧 Sorun Giderme

### 1. **CORS Hatası**
- Backend'de allowed origins kontrol et
- Frontend'de proxy ayarlarını kontrol et

### 2. **Multi-tenant Hatası**
- `ENABLE_MULTI_TENANT` env değişkenini kontrol et
- x-tenant-id header'ının gönderildiğinden emin ol

### 3. **SSO Login Başarısız**
- Token'ın geçerli olduğunu kontrol et
- URL parametrelerinin doğru parse edildiğini kontrol et

### 4. **iframe Görünmüyor**
- Browser console'da hata var mı kontrol et
- CSP header'larını kontrol et
- Parent origin ayarlarını kontrol et

## 📱 Voice AI Entegrasyonu

```javascript
// SmiloAI Voice Assistant'a eklenecek kod
async function handleInvoiceCommand(command, userId) {
  if (command.includes('fatura oluştur')) {
    const response = await fetch('https://finance.smiloai.com/api/invoice/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'x-tenant-id': userId
      },
      body: JSON.stringify({
        client: clientId,
        items: [...],
        total: amount
      })
    });
    
    const result = await response.json();
    return `Fatura oluşturuldu. Numara: ${result.number}`;
  }
}
```

## 📞 Destek

- **Teknik Destek**: hello@idurarapp.com
- **SmiloAI Integration**: info@smiloai.com

---

**Not**: Bu döküman development ortamı için hazırlanmıştır. Production'a geçerken tüm secret key'leri ve şifreleri değiştirmeyi unutmayın!
