# 🏢 SmiloAI + IDURAR Muhasebe Sistemi

> **AI Destekli Muhasebe ve CRM Çözümü** - SmiloAI platformu ile entegre edilmiş IDURAR ERP/CRM sistemi

## 📋 Proje Hakkında

Bu proje, açık kaynak **IDURAR ERP/CRM** sisteminin SmiloAI platformu ile entegre edilmiş versiyonudur. Çok kiracılı (multi-tenant) mimari ile her SmiloAI kullanıcısı için izole muhasebe ortamı sağlar.

### ✨ Özellikler

#### 💰 **Muhasebe ve Finans**
- 📄 Fatura oluşturma ve yönetimi
- 💳 Ödeme takibi (tam/kısmi ödemeler)
- 📝 Teklif hazırlama ve faturaya dönüştürme
- 📊 Finansal raporlama ve analiz
- 💱 Çoklu para birimi desteği
- 📅 Tekrarlayan faturalar

#### 👥 **Müşteri Yönetimi (CRM)**
- 📇 Müşteri kartları ve iletişim bilgileri
- 📈 Müşteri bazlı satış analitiği
- 📧 E-mail ile fatura ve teklif gönderimi
- 📋 Müşteri işlem geçmişi

#### 🤖 **SmiloAI Entegrasyonu**
- 🎙️ **Sesli Muhasebe**: "Ali Veli'ye 5000 TL fatura kes"
- 💬 **WhatsApp Botu**: Otomatik fatura gönderimi
- 🔄 **Workflow Otomasyonu**: n8n ile iş akışları
- 🏢 **Multi-Tenant**: Her kullanıcı izole ortam
- 🔐 **SSO Giriş**: Tek tıkla güvenli giriş

## 🛠️ Teknoloji Stack'i

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB Atlas** - Veritabanı (Multi-tenant)
- **JWT Authentication** - Güvenlik
- **Mongoose** - ODM
- **PDF Generation** - Fatura/teklif PDF'leri
- **Email Integration** - Otomatik mail gönderimi

### Frontend
- **React.js + Vite** - Modern UI framework
- **Ant Design (AntD)** - UI component library
- **Redux** - State management
- **Axios** - API client
- **iframe Desteği** - SmiloAI entegrasyonu

## 🚀 Kurulum ve Çalıştırma

### 1. Repository'yi Klonlayın
\`\`\`bash
git clone https://github.com/usufefe/idurarmuhasebe.git
cd idurarmuhasebe
\`\`\`

### 2. Backend Kurulumu
\`\`\`bash
cd backend
npm install

# .env dosyasını oluşturun
cp .env.example .env
# MongoDB bağlantınızı ve diğer ayarları yapın

# İlk kurulum (admin user oluştur)
npm run setup

# Development modunda başlat
npm run dev
\`\`\`

### 3. Frontend Kurulumu
\`\`\`bash
cd frontend
npm install

# .env dosyasını oluşturun
# Backend URL'ini ayarlayın

# Development modunda başlat
npm run dev
\`\`\`

## 🔧 Environment Ayarları

### Backend (.env)
\`\`\`env
DATABASE=mongodb+srv://...
JWT_SECRET=your-super-secret-key
PORT=8888
ENABLE_MULTI_TENANT=false  # SmiloAI için true
SMILO_WEBHOOK_SECRET=webhook-secret
OPENAI_API_KEY=your-openai-key
\`\`\`

### Frontend (.env)
\`\`\`env
VITE_BACKEND_SERVER=http://localhost:8888/api/
VITE_FILE_BASE_URL=http://localhost:8888/uploads/
\`\`\`

## 📱 Kullanım Senaryoları

### 1. **Sesli Fatura Kesme**
\`\`\`
"Hey Smilo, Mehmet Özkan'a 2500 TL'lik fatura kes"
→ AI faturayı otomatik oluşturur
→ PDF gönderir
→ "Fatura kesildi, numarası: INV-2024-0156"
\`\`\`

### 2. **WhatsApp Muhasebe Botu**
\`\`\`
Müşteri: "Borcum ne kadar?"
Bot: "3 faturanız var, toplam 15.750 TL"
Bot: [PDF Fatura Gönder]
\`\`\`

### 3. **Lead'den Faturaya Otomasyon**
\`\`\`
Apollo/Apify → Lead bulma
→ SmiloAI → Müşteri kaydet
→ IDURAR → Teklif gönder
→ Onay → Faturaya çevir
\`\`\`

## 🏗️ Mimari Yapı

### Multi-Tenant Yapı
\`\`\`
SmiloAI User → Tenant Database → İzole Muhasebe Ortamı
     ↓              ↓                    ↓
User A    →    DB_tenant_A    →    A'nın Faturaları
User B    →    DB_tenant_B    →    B'nin Faturaları
\`\`\`

### API Endpoints
\`\`\`
POST   /api/invoice/create      # Fatura oluştur
GET    /api/invoice/list        # Faturaları listele
POST   /api/invoice/mail        # Fatura gönder
GET    /api/payment/summary     # Ödeme özeti
POST   /api/smilo/user-registered # SmiloAI webhook
\`\`\`

## 🧪 Test

### Unit Test
\`\`\`bash
npm test
\`\`\`

### API Test (Postman)
\`\`\`bash
# Webhook test
POST http://localhost:8888/api/smilo/user-registered
Headers: x-webhook-secret: your-secret
Body: {"userId": "test123", "email": "test@test.com"}
\`\`\`

## 🚀 Production Deployment

### 1. **Build Production**
\`\`\`bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run start:prod
\`\`\`

### 2. **Nginx Config**
\`\`\`nginx
server {
    server_name finance.smiloai.com;
    
    add_header X-Frame-Options "ALLOW-FROM https://console.smiloai.com";
    
    location / {
        root /var/www/idurar-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8888;
    }
}
\`\`\`

## 📊 Demo ve Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Fatura Oluşturma
![Invoice Create](docs/screenshots/invoice-create.png)

### SmiloAI iframe Entegrasyon
![SmiloAI Integration](docs/screenshots/smiloai-iframe.png)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (\`git checkout -b feature/amazing-feature\`)
3. Commit edin (\`git commit -m 'Add amazing feature'\`)
4. Push edin (\`git push origin feature/amazing-feature\`)
5. Pull Request açın

## 📄 Lisans

Bu proje Fair-code lisansı altında yayınlanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## 📞 İletişim

- **SmiloAI**: [https://smiloai.com](https://smiloai.com)
- **IDURAR**: [https://idurarapp.com](https://idurarapp.com)
- **E-mail**: info@smiloai.com

## 🔗 Faydalı Linkler

- [SmiloAI Platform](https://console.smiloai.com)
- [IDURAR Documentation](https://github.com/idurar/idurar-erp-crm)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Ant Design](https://ant.design/)

---

<div align="center">
  <strong>🚀 Made with ❤️ by SmiloAI Team</strong><br>
  <em>AI Powered Business Solutions</em>
</div>