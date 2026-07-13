# Dokumentasi Teknis Proyek WarnetArcade

## Pendahuluan
WarnetArcade adalah sebuah platform distribusi permainan web yang dirancang khusus sebagai proyek utama portofolio pengembangan perangkat lunak. Sistem ini berfokus murni pada kinerja tinggi, arsitektur yang bersih, dan waktu muat yang sangat cepat. Proyek ini berfungsi sebagai galeri permainan pemain tunggal tanpa adanya fitur interaksi sosial, papan peringkat, atau sistem masuk akun pengguna.

## Tumpukan Teknologi Terpilih
Antarmuka web dibangun memanfaatkan React dan TypeScript yang dikompilasi menggunakan perkakas Vite. Pengaturan tata letak antarmuka mengandalkan kerangka kerja Tailwind CSS versi tiga untuk mempercepat penulisan gaya. Perpindahan antar halaman diatur sepenuhnya oleh pustaka React Router DOM agar pengguna tidak mengalami muat ulang peramban.

Peladen belakang ditenagai oleh lingkungan Node.js dengan menggunakan kerangka kerja Fastify. Prisma ORM bertugas menjembatani logika peladen dengan pangkalan data SQLite yang dipilih karena ukurannya yang ringan dan kemudahannya untuk ditingkatkan ke PostgreSQL di masa mendatang. Perangkat lunak Nginx akan digunakan pada tahap penyebaran untuk menyajikan berkas statis permainan secara mandiri.

## Arsitektur Sistem dan Alur Kerja
Sistem dibagi menjadi tiga lapisan utama yang beroperasi secara terpisah demi mencapai kinerja maksimal.

Saat pengguna membuka halaman utama, aplikasi React akan mengirimkan permintaan ke peladen Fastify. Peladen kemudian melakukan kueri ke pangkalan data SQLite untuk mengambil metadata seperti daftar judul dan gambar sampul permainan. Antarmuka web hanya akan menampilkan informasi ringan ini beserta gambar pratayang kepada pengguna. Berkas permainan sama sekali tidak diunduh pada tahap ini.

Ketika pengguna menekan tombol main pada salah satu permainan, aplikasi akan membuka halaman pemutar khusus secara dinamis. Halaman ini menggunakan elemen iframe yang mengarah langsung ke berkas utama permainan. Peladen proksi kemudian mengambil alih tugas dengan mengirimkan berkas mesin permainan seperti WebAssembly atau WebGL langsung ke peramban pengguna. Pendekatan iframe ini memastikan bahwa mesin permainan yang berat tidak mengganggu atau membocorkan memori pada aplikasi utama React.

## Struktur Direktori Proyek
Semua kode dan aset disimpan dalam satu repositori terpusat dengan pembagian tugas yang sangat ketat.

Direktori frontend
Menyimpan seluruh logika antarmuka React, pengaturan rute dinamis, dan konfigurasi Tailwind CSS.

Direktori backend
Menyimpan skema pangkalan data Prisma dan titik akhir antarmuka pemrograman aplikasi Fastify yang bertugas mengirimkan metadata.

Direktori games
Menyimpan seluruh aset permainan yang sudah diekspor menjadi HTML5 atau WebGL. Berkas di dalam direktori ini dikelompokkan secara ketat berdasarkan mesin pembuatnya seperti unity, scratch, dan wasm untuk mencegah bentrok nama pada berkas utama setiap permainan.

Direktori docs
Menyimpan seluruh dokumentasi teknis, catatan perencanaan, dan rancangan arsitektur proyek.

Direktori scripts
Menyimpan kode bantu untuk keperluan otomasi, pengisian data awal pangkalan data, atau pengaturan peladen.

## Standar Pengembangan
Seluruh penulisan kode harus dilakukan tanpa menggunakan komentar di dalam berkas kode untuk menjaga kebersihan baris dan kepadatan berkas. Setiap permainan harus dimuat sesuai dengan mesin pembuatnya dan diisolasi dengan ketat demi menjaga stabilitas proyek utama.