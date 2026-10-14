# Security Specification: DevOrder Firestore Security

## 1. Data Invariants
1. Pesanan (`/orders/{orderId}`) hanya dapat dibuat, dibaca, diperbarui, atau dihapus oleh pemiliknya (`ownerId == request.auth.uid`).
2. Setiap operasi `create` wajib memvalidasi struktur data lengkap pesanan (`appName`, `clientName`, `credential`, `status`, dsb.) dan membatasi ukuran teks untuk mencegah DoS.
3. Kredensial sensitif pemesan (email dan password) hanya boleh diakses oleh developer pemilik proyek.
4. Nilai `ownerId` bersifat abadi (*immutable*) setelah dibuat dan tidak boleh diubah oleh pembaruan apa pun.

## 2. Dirty Dozen Test Payloads
1. **Unauthenticated Read**: Request membaca `/orders/ORD-001` tanpa autentikasi. Expected: `PERMISSION_DENIED`.
2. **Unauthenticated Create**: Request membuat dokumen baru tanpa `request.auth`. Expected: `PERMISSION_DENIED`.
3. **Spoofed OwnerId on Create**: Request membuat pesanan dengan `ownerId: "hacker-uid"` berbeda dari `request.auth.uid`. Expected: `PERMISSION_DENIED`.
4. **Foreign Document Read**: User A mencoba membaca pesanan milik User B (`ownerId == "user-B"`). Expected: `PERMISSION_DENIED`.
5. **Foreign Document Update**: User A mencoba mengubah data pesanan milik User B. Expected: `PERMISSION_DENIED`.
6. **Foreign Document Delete**: User A mencoba menghapus pesanan milik User B. Expected: `PERMISSION_DENIED`.
7. **Owner Mutation Attack**: User mengubah `ownerId` pada pesanan yang sudah ada. Expected: `PERMISSION_DENIED`.
8. **Oversized Field Attack**: User mengirim `clientName` dengan panjang lebih dari 200 karakter. Expected: `PERMISSION_DENIED`.
9. **Invalid Status Transition**: User mengirim status yang tidak ada dalam enum `["baru", "pengerjaan", "revisi", "selesai", "dibatalkan"]`. Expected: `PERMISSION_DENIED`.
10. **Ghost Field Injection**: User mengirim `evilField: true` saat melakukan create atau update. Expected: `PERMISSION_DENIED`.
11. **Negative Price Attack**: User mengirim `totalPrice: -500000`. Expected: `PERMISSION_DENIED`.
12. **Blanket Query Scraping**: User menjalankan query list tanpa filter `where("ownerId", "==", auth.uid)`. Expected: `PERMISSION_DENIED`.
