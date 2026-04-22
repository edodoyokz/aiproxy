# PRD: Aiproxy Fullstack Webapp

- Status: Draft v1
- Tanggal: 2026-04-16
- Produk: Aiproxy
- Base teknis: `router-for-me/CLIProxyAPIPlus`
- Bahasa dokumen: Indonesia

## 1. Ringkasan Eksekutif

Aiproxy adalah webapp fullstack berbentuk SaaS control plane yang dibangun di atas `CLIProxyAPIPlus`. Tujuannya adalah mengubah engine proxy berbasis file config, OAuth auth files, dan management API menjadi produk yang bisa dipakai user umum melalui dashboard web: signup, login, connect OAuth provider, generate API key, memonitor usage, upgrade plan, dan mengelola subscription tanpa harus menyentuh YAML atau mengoperasikan server secara manual.

Secara posisi produk, `CLIProxyAPIPlus` tetap menjadi proxy runtime inti, sedangkan Aiproxy menjadi lapisan produk komersial di atasnya:

- web onboarding
- multi-tenant workspace
- billing dan subscription tiers
- provisioning runtime
- rate limit dan quota per tenant
- usage analytics
- support/admin tooling

Target awal adalah pengguna individual dan tim kecil yang ingin memakai proxy berbasis OAuth provider seperti Gemini, Claude, Codex, Qwen, iFlow, GitHub Copilot, dan Kiro dengan pengalaman SaaS yang jauh lebih rapi daripada management center bawaan.

## 2. Latar Belakang

`CLIProxyAPIPlus` sudah kuat sebagai proxy engine karena:

- mendukung endpoint yang kompatibel dengan OpenAI/Gemini/Claude/Codex
- punya Management API
- punya management center berbasis Web UI
- mendukung beberapa provider OAuth/community provider
- bisa dipakai sebagai runtime proxy yang fleksibel

Namun produk resmi saat ini masih berfokus pada operasi runtime, bukan SaaS komersial multi-tenant. Celah produk yang masih terbuka:

- belum ada subscription packaging yang jelas
- belum ada user onboarding self-serve end-to-end
- belum ada tenant isolation yang siap untuk billing
- belum ada model workspace/team
- belum ada lifecycle plan upgrade, downgrade, suspend, re-activate
- belum ada rate limit per subscription tier yang menjadi fitur produk

Aiproxy mengisi celah tersebut.

## 3. Problem Statement

User yang tertarik memakai `CLIProxyAPIPlus` untuk kebutuhan pribadi atau tim kecil menghadapi friksi berikut:

- setup awal terlalu teknis
- manajemen OAuth proxy masih terasa operasional, bukan produk
- pemisahan akun, plan, usage, dan limit per pelanggan belum menjadi konsep first-class
- sulit menjual layanan sebagai SaaS karena belum ada billing dan packaging
- support menjadi mahal karena setiap tenant berpotensi perlu intervensi manual

## 4. Asumsi Produk

Dokumen ini dibuat dengan asumsi berikut:

- Aiproxy adalah SaaS publik, bukan panel internal self-hosted.
- Setiap customer minimal memiliki 1 workspace.
- Subscription terikat ke workspace, bukan ke user individual.
- `CLIProxyAPIPlus` dipakai sebagai proxy runtime utama.
- Integrasi awal ke runtime memanfaatkan Management API dan isolasi runtime per workspace.
- Pembayaran dilakukan secara self-serve untuk plan berbayar.
- Fokus MVP adalah webapp, bukan desktop app.

Jika asumsi ini berubah, PRD perlu direvisi terutama pada area arsitektur tenant, billing, dan permission model.

## 5. Tujuan Produk

### Tujuan Bisnis

- Mengemas `CLIProxyAPIPlus` menjadi SaaS yang bisa dimonetisasi.
- Mendorong konversi dari freemium ke paid tiers.
- Menurunkan biaya support melalui onboarding dan self-service tooling.
- Menjadikan subscription tiers sebagai pembeda nilai yang jelas.

### Tujuan Pengguna

- User bisa mulai memakai proxy dalam kurang dari 10 menit.
- User cukup login, connect provider, lalu langsung mendapatkan API key Aiproxy.
- User mengerti limit plan dan usage mereka tanpa harus membaca config file.
- Upgrade plan bisa dilakukan tanpa migrasi manual.

### Tujuan Teknis

- Menjaga `CLIProxyAPIPlus` sebagai core engine agar time-to-market cepat.
- Menambahkan control plane yang rapi untuk multi-tenant, billing, dan observability.
- Menjaga isolasi kredensial OAuth per workspace.
- Menyediakan fondasi untuk team plan dan enterprise plan di fase berikutnya.

## 6. Non-Goals

Hal-hal berikut tidak termasuk target MVP:

- membangun engine proxy baru dari nol
- mengganti protocol translation yang sudah dikerjakan oleh `CLIProxyAPIPlus`
- mendukung semua provider pihak ketiga sejak hari pertama
- membangun marketplace plugin/provider
- menyediakan mobile app native
- enterprise feature set penuh seperti SAML/SCIM di MVP awal

## 7. Persona Utama

### 1. Indie Developer

Butuh endpoint proxy cepat untuk tool coding/automation, tidak ingin repot setup infra, sensitif terhadap harga, cocok untuk freemium atau starter.

### 2. AI Power User

Menghubungkan beberapa provider sekaligus, ingin rate limit lebih tinggi, ingin monitoring usage, cocok untuk Pro.

### 3. Small Team / Agency

Butuh shared workspace, beberapa API keys, observability, role basic, dan kemungkinan dedicated runtime, cocok untuk Team/Business.

### 4. Admin Operasional Internal

Butuh view tenant, billing state, quota override, suspend/unlock account, dan troubleshooting runtime.

## 8. Prinsip Produk

- `CLIProxyAPIPlus` adalah engine, bukan dibuang.
- Aiproxy adalah control plane SaaS, bukan sekadar skin untuk management center.
- Subscription harus mempengaruhi kemampuan produk secara nyata.
- Isolation dan security lebih penting daripada efisiensi infra ekstrem.
- Free tier harus cukup berguna untuk aktivasi, tetapi tetap jelas batasannya.
- Paid tiers harus terasa naik kelas, bukan sekadar menaikkan angka limit.

## 9. Definisi Istilah

- Workspace: unit utama customer untuk mengelola koneksi, API keys, usage, dan subscription.
- OAuth Proxy Slot: jatah koneksi OAuth aktif yang bisa dipakai sebuah workspace.
- Provider Connection: satu koneksi upstream aktif ke provider tertentu, misalnya Gemini atau Copilot.
- Runtime: instance `CLIProxyAPIPlus` yang menjalankan routing untuk suatu workspace.
- Tenant API Key: API key yang diberikan Aiproxy ke customer untuk memanggil endpoint proxy Aiproxy.

## 10. Value Proposition

### Untuk Free User

- bisa mencoba Aiproxy tanpa setup server
- bisa menghubungkan 1 OAuth proxy
- bisa langsung memakai endpoint API untuk eksperimen ringan

### Untuk Paid User

- lebih banyak provider dan koneksi
- rate limit lebih tinggi
- observability lebih lengkap
- API keys lebih banyak
- team features dan reliability lebih baik
- support dan operasional yang lebih profesional

## 11. Packaging dan Subscription Tiers

Pricing final perlu divalidasi terpisah. Yang ditetapkan di PRD ini adalah packaging logika produk dan limit awal yang bisa diubah saat go-to-market.

| Tier | Target User | OAuth Proxy Slot | Workspace Member | Tenant API Keys | Rate Limit Awal | Fitur Utama |
|---|---|---:|---:|---:|---|---|
| Free | user individu coba produk | 1 | 1 | 1 | rendah, contoh: 5 RPM dan 200 request/hari | 1 provider aktif, dashboard dasar, test endpoint, log singkat |
| Starter | user individu aktif | 3 | 1 | 3 | menengah, contoh: 30 RPM dan 5.000 request/hari | multi-provider ringan, usage chart, 7 hari log, email alert dasar |
| Pro | power user / solo business | 10 | 3 | 10 | tinggi, contoh: 120 RPM dan 50.000 request/hari | load balancing multi-account, routing rule, 30 hari log, webhook dasar |
| Team / Business | tim kecil sampai menengah | 25+ / custom | 10+ | 25+ | sangat tinggi / custom | RBAC ringan, audit log, dedicated runtime option, SLA/support prioritas |

### Aturan Produk per Tier

#### Free

- hanya boleh 1 OAuth proxy aktif
- hanya 1 workspace owner
- hanya 1 tenant API key
- tidak ada multi-account load balancing
- log retention sangat pendek
- support hanya dokumentasi/community

#### Starter

- bisa menghubungkan beberapa provider
- bisa membuat beberapa API key
- memiliki usage dashboard yang lebih lengkap
- dapat reconnect/check health otomatis untuk koneksi
- cocok untuk user yang sudah punya penggunaan rutin

#### Pro

- mendukung beberapa koneksi per provider
- mendukung rule-based routing dan fallback
- memiliki observability dan retention yang lebih panjang
- cocok untuk power user dan automation workload

#### Team / Business

- multi-seat workspace
- audit log dan permission
- opsi runtime yang lebih terisolasi
- billing invoice/manual approval bisa ditambahkan

## 12. User Journey Utama

### Journey 1: Signup sampai First Successful Call

1. User membuka landing page Aiproxy.
2. User membuat akun atau login.
3. User membuat workspace.
4. User memilih Free atau trial paid tier.
5. User connect 1 provider via OAuth.
6. Sistem memprovision runtime workspace.
7. User generate tenant API key.
8. User copy endpoint + API key.
9. User melakukan test request.
10. Dashboard menampilkan success state dan usage awal.

### Journey 2: Upgrade karena Free Limit

1. User mencapai rate limit atau butuh provider kedua.
2. UI menampilkan paywall yang spesifik ke kebutuhan user.
3. User upgrade ke Starter/Pro.
4. Billing webhook mengubah entitlement.
5. Workspace langsung memperoleh slot tambahan dan limit baru.

### Journey 3: Team Expansion

1. Owner upgrade ke Team/Business.
2. Owner mengundang member.
3. Member dapat akses dashboard sesuai role.
4. Team memakai shared API keys atau membuat key per environment.

## 13. Scope MVP

### In Scope

- landing page, pricing page, auth page
- user authentication
- workspace creation
- subscription selection
- connect OAuth provider via web flow
- runtime provisioning per workspace
- tenant API key management
- usage dashboard
- rate limit dan quota enforcement per plan
- billing integration
- admin dashboard internal dasar
- support tools internal dasar

### Out of Scope untuk MVP

- SSO enterprise
- SCIM
- custom domain per tenant
- white-label
- advanced team permission matrix
- marketplace provider
- billing seat-based kompleks

## 14. Fitur Utama

### 14.1 Marketing Site

- halaman landing yang menjelaskan use case Aiproxy
- halaman pricing yang jelas per plan
- CTA menuju signup atau connect provider
- FAQ untuk batasan OAuth/community provider

### 14.2 Authentication dan Identity

- email/password atau social login
- email verification
- password reset
- session management
- support untuk multiple workspaces di masa depan

### 14.3 Workspace Management

- create workspace
- rename workspace
- lihat plan aktif
- lihat usage summary
- upgrade/downgrade plan

### 14.4 OAuth Provider Connection

- pilih provider yang didukung
- memulai OAuth/device flow dari dashboard
- polling status koneksi
- menampilkan status sehat / error / expired
- reconnect / disconnect provider
- menampilkan slot tersisa sesuai tier

### 14.5 Runtime Provisioning

- saat workspace dibuat, sistem menyiapkan runtime `CLIProxyAPIPlus`
- runtime harus memiliki config, auth dir, dan management key yang terisolasi
- health status runtime terlihat di dashboard internal
- provisioner harus idempotent

### 14.6 API Key Management

- generate tenant API key
- label environment untuk key
- revoke key
- rotasi key
- masked display

### 14.7 Usage Dashboard

- request count
- token count jika tersedia
- usage per provider/model
- rate limit usage
- historical chart
- error rate overview

### 14.8 Billing dan Subscription

- subscribe ke paid plan
- upgrade
- downgrade
- cancel at period end
- payment status
- invoice history dasar
- entitlement update otomatis via webhook

### 14.9 Admin Dashboard Internal

- lihat daftar tenant
- lihat plan dan subscription state
- lihat runtime status
- override quota
- suspend / unsuspend workspace
- bantu troubleshooting koneksi

### 14.10 Inventaris Screen Webapp

Screen minimum yang perlu ada pada MVP:

- landing page
- pricing page
- login/register/forgot password
- onboarding workspace
- dashboard overview
- provider connections
- API keys
- usage analytics
- billing & subscription
- workspace settings
- admin tenant list
- admin tenant detail

## 15. Functional Requirements

### FR-1 Account dan Workspace

- Sistem harus mengizinkan user membuat akun dan login via web.
- Sistem harus mengizinkan setiap user membuat minimal 1 workspace.
- Sistem harus mengaitkan subscription ke workspace aktif.
- Sistem harus mendukung status workspace: active, past_due, suspended, cancelled.

### FR-2 Subscription Entitlement

- Sistem harus membaca entitlement berdasarkan plan aktif.
- Sistem harus menghitung slot OAuth proxy, API key limit, log retention, dan rate limit dari entitlement.
- Sistem harus mengubah entitlement secara near-real-time setelah webhook pembayaran diterima.

### FR-3 OAuth Connection Management

- Sistem harus mengizinkan workspace menghubungkan provider sesuai slot plan.
- Sistem harus memblokir koneksi baru bila slot habis.
- Sistem harus menampilkan error state yang actionable saat OAuth gagal.
- Sistem harus mendukung disconnect dan reconnect tanpa menghapus workspace.

### FR-4 Runtime Provisioning

- Sistem harus menyiapkan runtime terisolasi untuk setiap workspace.
- Runtime harus dapat dikelola secara otomatis oleh control plane.
- Runtime harus expose health dan usage metrics minimum.
- Runtime harus bisa menerima update config dari control plane tanpa intervensi manual.

### FR-5 API Access

- Sistem harus memberikan endpoint API tunggal Aiproxy ke tenant.
- Tenant harus dapat menggunakan API key Aiproxy untuk request ke proxy.
- Sistem harus menolak request jika quota/rate limit plan terlampaui.
- Sistem harus menyimpan usage event minimum per workspace dan API key.

### FR-6 Billing

- Sistem harus mendukung subscribe, renew, upgrade, downgrade, cancel.
- Sistem harus menyimpan history transaksi dan status invoice minimum.
- Sistem harus menangani payment failure dengan grace period yang jelas.

### FR-7 Analytics

- Dashboard harus menampilkan usage harian dan periode berjalan.
- Dashboard harus menampilkan provider/model breakdown sejauh data tersedia dari runtime.
- Dashboard harus menampilkan limit consumption agar user tahu kapan perlu upgrade.

### FR-8 Internal Support

- Admin harus bisa mencari workspace.
- Admin harus bisa melihat status runtime, plan, usage ringkas, dan koneksi provider.
- Admin harus bisa melakukan quota override sementara untuk support case.

## 16. Non-Functional Requirements

### Security

- OAuth credentials harus dienkripsi saat disimpan.
- API key tenant harus disimpan dalam bentuk hash, bukan plaintext.
- Setiap runtime harus memiliki management key unik.
- Akses admin harus diaudit.

### Reliability

- Target availability MVP: 99.5% untuk control plane.
- Health check runtime harus berjalan berkala.
- Provisioning runtime harus retryable dan idempotent.

### Performance

- Dashboard first load p95 < 2 detik untuk workspace normal.
- Provisioning runtime baru target < 90 detik.
- Overhead proxy yang ditambahkan control plane sebaiknya minimal.

### Observability

- Sistem harus memiliki log terstruktur untuk control plane.
- Sistem harus memiliki metrics minimum: signup, provisioning success, runtime unhealthy, upgrade success, payment failure, request rejected by quota.

## 17. Pilihan Arsitektur

### Opsi A: Shared Monolithic Proxy Cluster

Semua tenant masuk ke satu cluster `CLIProxyAPIPlus` yang berbagi config dan auth orchestration.

#### Kelebihan

- paling cepat dibuat
- biaya infra rendah
- operasional sederhana di awal

#### Kekurangan

- isolasi tenant lemah
- lebih sulit menjaga security auth files
- entitlement dan quota enforcement lebih rawan bocor
- risiko blast radius besar

### Opsi B: Dedicated Runtime per Workspace

Setiap workspace mendapat runtime `CLIProxyAPIPlus` sendiri.

#### Kelebihan

- isolasi tenant paling kuat
- mudah memetakan quota, auth, dan provider connection
- debugging lebih jelas per customer

#### Kekurangan

- biaya infra lebih tinggi
- provisioning dan orchestration lebih kompleks

### Opsi C: Hybrid Control Plane + Isolated Runtime on Shared Nodes

Control plane tunggal untuk webapp dan billing, tetapi runtime `CLIProxyAPIPlus` tetap terisolasi per workspace sebagai container/instance ringan di node bersama.

#### Kelebihan

- seimbang antara isolasi dan efisiensi biaya
- cocok untuk Free/Starter di pooled nodes
- bisa naik ke dedicated node untuk Pro/Business
- paling realistis untuk base `CLIProxyAPIPlus`

#### Kekurangan

- butuh platform orchestration sejak awal
- perlu observability yang lebih baik

### Rekomendasi

Gunakan **Opsi C**.

Alasan:

- tetap menghormati karakter `CLIProxyAPIPlus` yang paling aman bila runtime dan auth dipisah per tenant
- subscription tier lebih mudah diterjemahkan ke entitlement runtime
- upgrade ke dedicated tier lebih mudah nanti
- tidak memaksa rewrite besar pada proxy core

## 18. Rekomendasi Stack Fullstack

Stack ini adalah rekomendasi implementasi, bukan keputusan final yang mengikat.

### Frontend

- Next.js + TypeScript
- App Router
- component library modern
- dashboard SSR/streaming untuk auth dan billing pages

### Control Plane Backend

- Go service terpisah untuk API internal/public
- alasan: selaras dengan base repo `CLIProxyAPIPlus` yang berbasis Go
- expose REST API untuk dashboard dan admin

### Proxy Runtime

- `CLIProxyAPIPlus` sebagai container/service runtime per workspace
- komunikasi control plane ke runtime melalui Management API
- evaluasi embedding SDK di fase berikutnya jika perlu

### Data Layer

- PostgreSQL untuk data utama
- Redis untuk rate limit counter, queue, dan short-lived cache
- object storage terenkripsi untuk artefak sensitif bila diperlukan

### Billing

- provider billing self-serve via webhook
- provider final TBD sesuai market target

### Infrastructure

- container orchestration
- secret management
- centralized logs + metrics
- reverse proxy/load balancer

### Service Boundaries yang Direkomendasikan

- `web-frontend`: rendering UI, auth session, dashboard pages
- `control-plane-api`: workspace, plan, billing, entitlement, API key metadata
- `runtime-provisioner`: create/update/delete runtime `CLIProxyAPIPlus`
- `usage-ingestor`: ingest usage dari runtime ke analytics store
- `notification-worker`: email billing, warning quota, runtime health alert
- `admin-backoffice`: akses internal untuk support dan operasional

## 19. Model Data Awal

Entitas inti yang dibutuhkan:

- `users`
- `workspaces`
- `memberships`
- `plans`
- `subscriptions`
- `oauth_connections`
- `proxy_runtimes`
- `tenant_api_keys`
- `usage_events`
- `rate_limit_counters`
- `billing_transactions`
- `audit_logs`

## 20. Admin dan Permission Model

### MVP Roles

- Owner
- Member
- Internal Admin

### Owner

- manage billing
- manage provider connections
- manage API keys
- invite/remove member pada paid tier yang mendukung

### Member

- lihat dashboard
- pakai API keys yang diberikan
- akses terbatas ke workspace

### Internal Admin

- akses backoffice
- suspend/unsuspend tenant
- lihat support diagnostics

## 21. Metrics Keberhasilan

### Product Metrics

- signup to first successful call conversion
- free to paid conversion
- average connected providers per paid workspace
- churn rate paid workspace
- weekly active workspace

### Operational Metrics

- provisioning success rate
- runtime unhealthy rate
- payment webhook success rate
- support ticket volume per 100 workspace
- request reject rate karena quota

## 22. Risiko Produk dan Mitigasi

### Risiko 1: Provider OAuth berubah atau rusak

Karena sebagian support provider di `CLIProxyAPIPlus` bersifat community-maintained, perubahan upstream bisa mematahkan flow.

Mitigasi:

- feature flag per provider
- status page per provider
- disclaimer support tier
- fast rollback dan disable provider

### Risiko 2: Abuse dari Free Tier

Free tier bisa menarik abuse traffic.

Mitigasi:

- low rate limit
- signup verification
- abuse detection
- hard daily cap

### Risiko 3: Tenant Isolation Lemah

Jika auth files dan runtime tidak terisolasi dengan baik, risiko kebocoran sangat tinggi.

Mitigasi:

- runtime per workspace
- encryption at rest
- secret rotation
- audit access internal

### Risiko 4: Billing Entitlement Tidak Sinkron

Upgrade/downgrade yang gagal sinkron akan menyebabkan support burden.

Mitigasi:

- webhook retry
- entitlement event log
- admin override panel

### Risiko 5: Risiko Legal / ToS Upstream

Beberapa provider OAuth/community provider dapat memiliki perubahan kebijakan atau batasan penggunaan yang memengaruhi produk.

Mitigasi:

- tampilkan disclaimer per provider
- klasifikasikan provider sebagai stable/beta/community
- sediakan fallback provider untuk tier berbayar
- hindari menjanjikan SLA yang tidak didukung upstream

## 23. Roadmap Rilis

### Phase 1: MVP Public Beta

- signup/login
- workspace
- free + starter tiers
- 1 sampai beberapa provider inti
- tenant API key
- usage dashboard dasar
- billing dasar

### Phase 2: Paid Growth

- pro tier
- multi-account load balancing
- routing rules
- team member
- log retention lebih panjang

### Phase 3: Business Readiness

- audit log
- dedicated runtime
- support tooling lebih matang
- invoice/manual sales flow

## 24. Open Questions

- provider mana yang wajib ada di MVP hari pertama
- provider billing mana yang paling cocok untuk target market awal
- apakah team feature perlu masuk MVP atau ditunda ke Phase 2
- apakah trial berbayar perlu diberikan sejak awal
- apakah Free tier boleh punya 1 API key saja atau 2 untuk dev/prod split

## 25. Rekomendasi Keputusan Produk Awal

- Mulai dengan 3 tier publik: Free, Starter, Pro.
- Team/Business tetap ada di PRD, tetapi bisa dibuka via waitlist terlebih dahulu.
- Free tier benar-benar dibatasi ke **1 OAuth proxy slot** dan **rate limit rendah** agar tetap sesuai requirement produk.
- Prioritaskan pengalaman onboarding dan first successful call karena itu titik aktivasi utama.
- Pertahankan `CLIProxyAPIPlus` sebagai runtime, jangan rewrite.
- Bangun control plane yang kuat dari awal karena di situlah nilai komersial Aiproxy.

## 26. Lampiran Sumber Acuan

Dokumen ini diturunkan dari kapabilitas publik yang disebutkan pada:

- `CLIProxyAPIPlus`: https://github.com/router-for-me/CLIProxyAPIPlus
- `CLIProxyAPI`: https://github.com/router-for-me/CLIProxyAPI
- `CLI Proxy API Management Center`: https://github.com/router-for-me/Cli-Proxy-API-Management-Center
