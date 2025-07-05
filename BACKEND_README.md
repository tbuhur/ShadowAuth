# ShadowAuth Backend 🛡️

Bu dokümantasyon ShadowAuth projesinin backend implementasyonunu detaylandırır. Backend, Next.js App Router kullanılarak geliştirilmiş ve Oasis Sapphire ParaTime ile entegre edilmiştir.

## 🏗️ Mimari Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # World ID doğrulama ve oturum oluşturma
│   │   │   ├── register/route.ts       # Uygulama kaydı
│   │   │   └── session/
│   │   │       ├── verify/route.ts     # Oturum doğrulama
│   │   │       └── revoke/route.ts     # Oturum iptali
│   │   └── health/route.ts             # Sağlık kontrolü
│   └── globals.css
├── lib/
│   ├── worldid.ts                      # World ID entegrasyonu
│   ├── session.ts                      # Oturum yönetimi
│   ├── logger.ts                       # Loglama sistemi
│   ├── rate-limit.ts                   # Rate limiting
│   ├── blockchain.ts                   # Blockchain entegrasyonu
│   ├── app-registration.ts             # Uygulama kayıt sistemi
│   └── utils.ts                        # Yardımcı fonksiyonlar
└── middleware.ts                       # Next.js middleware
```

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama
- **World ID Entegrasyonu**: Zero-knowledge proof tabanlı kimlik doğrulama
- **Oturum Yönetimi**: Geçici, anonim oturum anahtarları
- **Güvenlik**: Rate limiting, input validation, güvenlik başlıkları

### 🛡️ Güvenlik
- **Rate Limiting**: API endpoint'leri için istek sınırlama
- **Input Validation**: Tüm giriş verilerinin doğrulanması
- **Security Headers**: XSS, CSRF koruması
- **CORS**: Cross-origin request kontrolü

### 📊 Monitoring
- **Structured Logging**: Pino ile yapılandırılmış loglama
- **Health Checks**: Sistem durumu kontrolü
- **Performance Metrics**: İstek süreleri ve performans metrikleri

### 🔗 Blockchain Entegrasyonu
- **Oasis Sapphire ParaTime**: Confidential smart contract execution
- **Session Key Management**: Blockchain üzerinde oturum yönetimi
- **Gas Optimization**: Optimize edilmiş gas kullanımı

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Oasis Sapphire ParaTime erişimi
- World ID hesabı

### Adım Adım Kurulum

1. **Bağımlılıkları Yükleyin**
   ```bash
   npm install
   ```

2. **Ortam Değişkenlerini Yapılandırın**
   ```bash
   cp env.example .env.local
   ```

3. **Gerekli Değişkenleri Doldurun**
   ```env
   # World ID Configuration
   NEXT_PUBLIC_WORLD_ID_APP_ID=app_staging_your_app_id
   WORLD_ID_ACTION_NAME=shadowauth-login
   
   # Oasis Network
   PRIVATE_KEY=your_private_key
   NETWORK=sapphire_testnet
   
   # Application
   SESSION_SECRET=your_session_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Geliştirme Sunucusunu Başlatın**
   ```bash
   npm run dev
   ```

## 🔧 API Endpoints

### Kimlik Doğrulama

#### POST `/api/auth/login`
World ID doğrulaması yapar ve oturum anahtarı oluşturur.

**Request Body:**
```json
{
  "proof": "world_id_proof_string",
  "nullifierHash": "nullifier_hash",
  "merkleRoot": "merkle_root",
  "credentialType": "orb"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "key": "session_key_64_chars",
    "expiresAt": "2024-01-01T00:00:00.000Z",
    "maxUsage": 100,
    "permissions": ["read", "write"]
  }
}
```

#### POST `/api/auth/session/verify`
Oturum anahtarının geçerliliğini doğrular.

**Request Body:**
```json
{
  "sessionKey": "session_key_64_chars",
  "requiredPermissions": ["read"]
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "isValid": true,
    "expiresAt": "2024-01-01T00:00:00.000Z",
    "usageCount": 5,
    "maxUsage": 100,
    "permissions": ["read", "write"]
  }
}
```

#### POST `/api/auth/session/revoke`
Oturum anahtarını iptal eder.

**Request Body:**
```json
{
  "sessionKey": "session_key_64_chars"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

#### POST `/api/auth/register`
Yeni uygulama kaydı oluşturur.

**Request Body:**
```json
{
  "appName": "My App",
  "appUrl": "https://myapp.com",
  "description": "My application description",
  "contactEmail": "contact@myapp.com",
  "redirectUrls": ["https://myapp.com/callback"],
  "permissions": ["read", "write"]
}
```

### Monitoring

#### GET `/api/health`
Sistem sağlık durumunu kontrol eder.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "checks": {
    "memory": {
      "used": 128,
      "total": 512,
      "healthy": true
    },
    "disk": { "healthy": true },
    "database": { "healthy": true },
    "blockchain": { "healthy": true }
  }
}
```

## 🔒 Güvenlik Özellikleri

### Rate Limiting
- **Login**: 5 istek/dakika
- **Verify**: 100 istek/dakika
- **Revoke**: 10 istek/dakika
- **Register**: 3 istek/5 dakika

### Input Validation
- Email format kontrolü
- URL format kontrolü
- Session key format kontrolü
- App ID format kontrolü

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📝 Loglama

### Log Seviyeleri
- **debug**: Geliştirme ortamında detaylı loglar
- **info**: Genel bilgi logları
- **warn**: Uyarı logları
- **error**: Hata logları

### Log Formatı
```json
{
  "level": "info",
  "time": "2024-01-01T00:00:00.000Z",
  "module": "authentication",
  "message": "Login successful",
  "sessionKey": "abcd1234...",
  "nullifierHash": "efgh5678..."
}
```

## 🔗 Blockchain Entegrasyonu

### Oasis Sapphire ParaTime
- Confidential smart contract execution
- Zero-knowledge proof verification
- Session key management on-chain

### Smart Contract Functions
- `createSession`: Oturum oluşturma
- `verifySession`: Oturum doğrulama
- `revokeSession`: Oturum iptali
- `incrementUsage`: Kullanım sayısı artırma

## 🧪 Test

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
# Health check
curl http://localhost:3000/api/health

# Login (with World ID proof)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"proof":"...","nullifierHash":"...","merkleRoot":"..."}'
```

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
NETWORK=sapphire_mainnet
ENABLE_SECURITY_HEADERS=true
ENABLE_RATE_LIMITING=true
LOG_LEVEL=info
```

### Build ve Deploy
```bash
npm run build
npm run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Konfigürasyon

### Rate Limiting
```typescript
export const RATE_LIMITS = {
  login: { maxRequests: 5, windowSeconds: 60 },
  verify: { maxRequests: 100, windowSeconds: 60 },
  revoke: { maxRequests: 10, windowSeconds: 60 },
  register: { maxRequests: 3, windowSeconds: 300 }
};
```

### Session Configuration
```typescript
const sessionConfig = {
  expiryHours: 24,
  maxUsage: 100,
  cleanupInterval: 3600000 // 1 hour
};
```

## 📊 Monitoring ve Alerting

### Health Checks
- Memory usage monitoring
- Disk space monitoring
- Database connection monitoring
- Blockchain connection monitoring

### Metrics
- Request count
- Response time
- Error rate
- Session creation/verification count

## 🔍 Troubleshooting

### Yaygın Hatalar

1. **World ID Verification Failed**
   - App ID'nin doğru olduğundan emin olun
   - Action name'in doğru olduğundan emin olun
   - Proof'un geçerli olduğundan emin olun

2. **Rate Limit Exceeded**
   - İstek sıklığını azaltın
   - Rate limit konfigürasyonunu kontrol edin

3. **Session Expired**
   - Yeni oturum oluşturun
   - Session expiry süresini kontrol edin

### Debug Mode
```env
ENABLE_DEBUG_MODE=true
LOG_LEVEL=debug
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

- **Documentation**: [docs.shadowauth.com](https://docs.shadowauth.com)
- **Discord**: [discord.gg/shadowauth](https://discord.gg/shadowauth)
- **Email**: support@shadowauth.com
- **GitHub Issues**: [github.com/SweetieBirdX/shadowauth/issues](https://github.com/SweetieBirdX/shadowauth/issues) 