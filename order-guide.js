const orderGuideMarkup = `
  <dialog class="order-guide-dialog" aria-labelledby="order-guide-title" data-order-guide-dialog>
    <button class="method-dialog-close" type="button" aria-label="Tutup panduan cara order" data-order-guide-close>×</button>
    <div class="order-guide-content">
      <div class="order-guide-heading">
        <span class="order-guide-brand-mark" aria-hidden="true">♡</span>
        <p class="eyebrow">PANDUAN VÉLUNAID</p>
      </div>
      <h2 id="order-guide-title">Cara Pemesanan Mudah &amp; Manis</h2>
      <p class="order-guide-tagline">“Belanja digital jadi lebih mudah, aman, dan nyaman ♡”</p>
      <p class="order-guide-intro">Setiap pesanan dikirim melalui WhatsApp agar admin Veluna dapat memeriksa detail dan mengonfirmasi pesananmu secara personal.</p>
      <div class="order-guide-progress" role="group" aria-label="Langkah pemesanan"></div>
      <section class="order-guide-step" aria-live="polite">
        <div class="order-guide-step-icon" aria-hidden="true"></div>
        <p class="order-guide-step-count"></p>
        <h3 class="order-guide-step-title"></h3>
        <p class="order-guide-step-copy"></p>
      </section>
      <p class="order-guide-security"><strong>Catatan keamanan:</strong> pastikan username, User ID, dan Server sudah benar. Visend dan Mobile Legends tidak meminta kata sandi; Vilog memakai metode via login. Pertimbangkan risikonya dan jangan pernah membagikan kode OTP atau kode pemulihan akun.</p>
      <div class="order-guide-actions">
        <button class="order-guide-previous" type="button" data-order-guide-previous>← Sebelumnya</button>
        <button class="button button-dark" type="button" data-order-guide-next>Langkah berikutnya <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </dialog>`;

const orderGuideSteps = [
  {
    icon: "🎀",
    title: "Pilih Produk Favoritmu",
    copy: "Pilih Robux Visend atau Vilog, maupun Mobile Legends. Tentukan nominal Robux, Diamond, atau Weekly Diamond Pass yang tersedia, lalu pilih paket yang kamu inginkan. Informasi layanan Gift in Game akan tersedia setelah halaman layanannya siap.",
  },
  {
    icon: "📝",
    title: "Isi Data Pesanan dengan Benar",
    copy: "Masukkan username Roblox untuk Visend atau Vilog. Vilog menggunakan metode via login, sedangkan Visend tidak memerlukan login. Untuk Mobile Legends, isi User ID dan Zone ID (Server). Jangan pernah membagikan kode OTP atau kode pemulihan; jika tidak nyaman dengan metode login, pilih Visend.",
  },
  {
    icon: "🔍",
    title: "Periksa Nominal, ID, dan Server",
    copy: "Tinjau ringkasan pesanan sebelum melanjutkan. Pastikan pilihan paket, username, User ID, Zone ID, dan metode pembayaran sudah tepat agar pesanan tidak salah tujuan.",
  },
  {
    icon: "💬",
    title: "Lanjutkan Pesanan melalui WhatsApp",
    copy: "Tekan tombol buat/konfirmasi pesanan pada halaman produk. WhatsApp akan terbuka dengan detail pesanan yang sudah disiapkan. Periksa kembali isinya, lalu kirim pesan kepada admin Veluna.",
  },
  {
    icon: "✨",
    title: "Tunggu Konfirmasi Admin",
    copy: "Admin Veluna akan mengecek ketersediaan dan mengonfirmasi total harga serta langkah pembayaran melalui WhatsApp. Lakukan pembayaran hanya setelah menerima instruksi resmi, lalu tunggu pesanan diproses.",
  },
];

document.body.insertAdjacentHTML("beforeend", orderGuideMarkup);

const orderGuideDialog = document.querySelector("[data-order-guide-dialog]");
const orderGuideTriggers = document.querySelectorAll("[data-order-guide]");
const orderGuideClose = orderGuideDialog.querySelector("[data-order-guide-close]");
const orderGuidePrevious = orderGuideDialog.querySelector("[data-order-guide-previous]");
const orderGuideNext = orderGuideDialog.querySelector("[data-order-guide-next]");
const orderGuideProgress = orderGuideDialog.querySelector(".order-guide-progress");
const orderGuideIcon = orderGuideDialog.querySelector(".order-guide-step-icon");
const orderGuideCount = orderGuideDialog.querySelector(".order-guide-step-count");
const orderGuideTitle = orderGuideDialog.querySelector(".order-guide-step-title");
const orderGuideCopy = orderGuideDialog.querySelector(".order-guide-step-copy");
let activeOrderStep = 0;

const renderOrderGuideStep = () => {
  const step = orderGuideSteps[activeOrderStep];
  orderGuideIcon.textContent = step.icon;
  orderGuideCount.textContent = `LANGKAH ${activeOrderStep + 1} DARI ${orderGuideSteps.length}`;
  orderGuideTitle.textContent = step.title;
  orderGuideCopy.textContent = step.copy;
  orderGuidePrevious.disabled = activeOrderStep === 0;
  orderGuideNext.innerHTML =
    activeOrderStep === orderGuideSteps.length - 1
      ? 'Selesai <span aria-hidden="true">♡</span>'
      : 'Langkah berikutnya <span aria-hidden="true">→</span>';

  Array.from(orderGuideProgress.children).forEach((item, index) => {
    item.classList.toggle("is-current", index === activeOrderStep);
    item.setAttribute("aria-current", index === activeOrderStep ? "step" : "false");
  });
};

orderGuideSteps.forEach((step, index) => {
  const indicator = document.createElement("span");
  indicator.setAttribute("aria-label", `Langkah ${index + 1}: ${step.title}`);
  orderGuideProgress.append(indicator);
});

orderGuideTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    activeOrderStep = 0;
    renderOrderGuideStep();
    orderGuideDialog.showModal();
  });
});

orderGuideClose.addEventListener("click", () => orderGuideDialog.close());
orderGuidePrevious.addEventListener("click", () => {
  if (activeOrderStep > 0) {
    activeOrderStep -= 1;
    renderOrderGuideStep();
  }
});
orderGuideNext.addEventListener("click", () => {
  if (activeOrderStep === orderGuideSteps.length - 1) {
    orderGuideDialog.close();
    return;
  }

  activeOrderStep += 1;
  renderOrderGuideStep();
});
orderGuideDialog.addEventListener("click", (event) => {
  if (event.target === orderGuideDialog) orderGuideDialog.close();
});

renderOrderGuideStep();
