M Fadhil Arkan 13317024 - Programmer HTML, CSS, dan JavaScript, pengatur IoT server dan node, serta troubleshooter seluruh program
Hans Kusuma R S 13317038 - Programmer Arduino IDE dan pembuat rangkaian elektronik, serta troubleshooter Arduino dan breadboard.
Daniel Beltsazar 13317080 - Pengatur IoT Server

---------------------------------------------------------------------
Kami membuat IoT Node dengan broker mosca untuk membuat server yang menampilkan data-data yang didapatkan pada rangkaian WEMOS secara interaktif.

Pada rangkaian WEMOS, terdapat input berupa Push Button (Digital), Sensor BME280 (Temperatur, Tekanan, Ketinggian, dan Kelembapan, analog), dan Sensor BH1750 (Cahaya, analog). Input-input ini disambungkan ke WEMOS bersamaan dengan LED (Merah digital dan RGB analog) sebagai indikator bagi data-data yang diterima.

IoT Node kami berfungsi sesuai keinginan kami:
1. Dalam mode Auto:
- LED RGB akan menyala dengan warna tergantung pada Temperatur, semakin tinggi temperaturnya maka akan semakin merah.
- kedua LED menyala ketika Intensitas Cahaya di bawah ambang batas, hal ini mempermudah memperkirakan lokasi rangkaian dan indikasi suhu pada ruangan gelap. (Nilai ambang batas juga dapat diatur sesuai keinginan pengguna melalui tampilan HTML).
- Peringatan intensitas cahaya rendah akan ditampilkan pada HTML ketika intensitas cahayanya di bawah ambang batas.

2. Dalam mode Manual:
- LED dapat dinyalakan atau dimatikan sesuai keinginan pengguna pada tampilan HTML.
- LED RGB bisa diatur warnanya sesuai keinginan pengguna pada tampilan HTML.
- Kemudahan mengganti mode Manual dengan Auto

3. Data:
- Data disajikan dalam bentuk histogram untuk memberi kenyamanan bagi pengguna dalam melihatnya.
- Selain itu, diberikan juga gauge untuk membuat tampilan menjadi lebih menarik bagi pengguna, dengan indikator warna tertentu untuk setiap rentang pada gauge tersebut.
- Rata-rata dari nilai temperatur, kelembapan, dan intensitas cahaya juga ditampilkan untuk 5 menit terakhir. Jika belum mencapai 5 menit sejak IoT Node diinisiasi, maka data rata-rata menghitung dari awal sampai waktu tersebut.

4. Tampilan keseluruhan:
Secara tampilan, kami membuat tampilan HTML dengan mengutamakan kesederhanaan dan kenyamanan. Maka dari itu, kami membuat tampilan semudah-dipahami mungkin bagi pengguna dengan background warna dasar agar pengguna nyaman melihatnya. Selain itu, dengan mengambil tema warna gelap, maka dalam keadaan apapun pengguna akan mudah melihat tulisan-tulisan dan indikator (dengan warna kontras terhadap background) yang terdapat pada tampilan.

---------------------------------------------------------------------
Komponen elektronik yang digunakan:
- Breadboard
- Kabel Jumper
- Kabel data USB-type-B
- Resistor 10k ohm (x1) dan 220 ohm (x3)
- Push Button 4 pin
- RGB LED
- LED Red
- Sensor BME280
- Sensor BH1750
- WEMOS Mini
- PC dan koneksi Internet sebagai IoT server

---------------------------------------------------------------------
Cara menjalankannya:
1. Buka Command Prompt (WINDOWS) dan buka directory file IoT Node.
2. Run mqtt.js dengan "node mqtt.js".
3. Hubungkan WEMOS Mini yang sudah terangkai dengan program pembacaan dan subskripsi topik pada PC, gunakan software Arduino IDE dan buka Serial Monitor untuk memastikan WEMOS Mini sudah terhubung.
4. Buka "localhost:3000" pada browser PC client yang sudah terhubung pada koneksi Internet yang sama dengan server.
5. Tampilan HTML akan muncul dan siap berinteraksi dengan pengguna.