const nominalOptions = Array.from(document.querySelectorAll("[data-nominal]"));
const usernameInput = document.querySelector("#roblox-username");
const orderEmpty = document.querySelector("[data-order-empty]");
const orderDetails = document.querySelector("[data-order-details]");
const selectedNominal = document.querySelector("[data-selected-nominal]");
const selectedUsername = document.querySelector("[data-selected-username]");
const selectedPassword = document.querySelector("[data-selected-password]");
const selectedPrice = document.querySelector("[data-selected-price]");
const selectedPayment = document.querySelector("[data-selected-payment]");
const checkoutMessage = document.querySelector("[data-checkout-message]");

const passwordInput = document.getElementById("roblox-password");
const togglePassword = document.getElementById("toggle-password");

if (passwordInput && togglePassword) {
  togglePassword.addEventListener("click", () => {
    const isPasswordHidden = passwordInput.type === "password";

    passwordInput.type = isPasswordHidden ? "text" : "password";

    togglePassword.setAttribute(
      "aria-label",
      isPasswordHidden ? "Sembunyikan password" : "Tampilkan password",
    );

    togglePassword.setAttribute("aria-pressed", String(isPasswordHidden));
  });
}

const noteInputs = [
  document.querySelector("#note-1"),
  document.querySelector("#note-2"),
  document.querySelector("#note-3"),
];

function getOrderNotes() {
  return noteInputs
    .map((input, index) => ({
      label: `Code ${index + 1}`,
      value: input?.value.trim() || "",
    }))
    .filter((note) => note.value !== "");
}

function updateOrderNotes() {
  const notes = getOrderNotes();
  const notesContainer = document.querySelector("[data-order-notes]");
  const notesContent = document.querySelector("[data-selected-notes]");

  if (!notesContainer || !notesContent) return;

  notesContainer.hidden = notes.length === 0;

  notesContent.innerHTML = notes
    .map(
      (note) => `
      <div>
        <strong>${note.label}:</strong>
        <span></span>
      </div>
    `,
    )
    .join("");

  notesContent.querySelectorAll("span").forEach((span, index) => {
    span.textContent = notes[index].value;
  });
}

noteInputs.forEach((input) => {
  input?.addEventListener("input", updateOrderNotes);
});

const paymentOptions = Array.from(
  document.querySelectorAll("[data-payment-option]"),
);
const providerOptions = Array.from(
  document.querySelectorAll("[data-provider-option]"),
);
const paymentPanels = Array.from(
  document.querySelectorAll("[data-payment-panel]"),
);
const orderConsent = document.querySelector("[data-order-consent]");
const checkoutButton = document.querySelector("[data-checkout]");
const confirmationDialog = document.querySelector(
  "[data-order-confirm-dialog]",
);
const confirmationSummary = document.querySelector("[data-confirm-summary]");
let selectedOption = null;

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const getUsername = () => usernameInput.value.trim().replace(/^@+/, "");
const formatUsername = () => `@${getUsername()}`;

const getSelectedPaymentOption = () =>
  paymentOptions.find((option) => option.checked);

const getSelectedProvider = () =>
  providerOptions.find(
    (option) =>
      option.checked && option.closest(".payment-detail:not([hidden])"),
  );

const getSelectedPayment = () => {
  const payment = getSelectedPaymentOption();
  if (!payment) return "";
  if (payment.value === "QRIS") return "QRIS";
  const provider = getSelectedProvider();
  return provider ? `${payment.value} - ${provider.value}` : "";
};

const isOrderComplete = () =>
  Boolean(
    selectedOption &&
    getUsername() &&
    passwordInput?.value.trim() &&
    getSelectedPayment() &&
    (!orderConsent || orderConsent.checked),
  );

const setPaymentPanels = () => {
  const selectedPaymentOption = getSelectedPaymentOption();
  paymentPanels.forEach((panel) => {
    panel.hidden = panel.dataset.paymentPanel !== selectedPaymentOption?.value;
  });
};

const updateOrderSummary = () => {
  const username = getUsername();
  const password = passwordInput?.value.trim();

  checkoutButton.disabled = !isOrderComplete();

  if (!selectedOption) {
    orderEmpty.hidden = false;
    orderDetails.hidden = true;
    return;
  }

  orderEmpty.hidden = true;
  orderDetails.hidden = false;

  selectedNominal.textContent = `${Number(selectedOption.dataset.nominal).toLocaleString("id-ID")} Robux`;

   selectedUsername.textContent = username ? formatUsername() : "Belum diisi";
  selectedPassword.textContent = password || "Belum diisi";

  selectedPrice.textContent = formatRupiah(
    Number(selectedOption.dataset.price),
  );

  if (selectedPayment) {
    selectedPayment.textContent =
      getSelectedPayment() || "Pilih metode pembayaran";
  }
};

const addConfirmationRow = (label, value) => {
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  confirmationSummary.append(term, description);
};

const showOrderConfirmation = () => {
  confirmationSummary.replaceChildren();
  addConfirmationRow("Metode", document.body.dataset.orderMethod);
  addConfirmationRow(
    "Nominal",
    `${Number(selectedOption.dataset.nominal).toLocaleString("id-ID")} Robux`,
  );
  addConfirmationRow("Username Roblox", formatUsername());
  addConfirmationRow(
    "Password Roblox",
    passwordInput?.value.trim() || "Tidak diisi",
  );
  addConfirmationRow(
    "Backup Code",
    getOrderNotes().length > 0
      ? getOrderNotes()
          .map((note) => `${note.label}: ${note.value}`)
          .join(", ")
      : "Tidak ada Backup Code",
  );
  addConfirmationRow("Pembayaran", getSelectedPayment());
  addConfirmationRow(
    "Total",
    formatRupiah(Number(selectedOption.dataset.price)),
  );
  confirmationDialog.showModal();
};

nominalOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedOption = option;
    nominalOptions.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === option)),
    );
    checkoutMessage.textContent = "";
    updateOrderSummary();
  });
});

usernameInput.addEventListener("input", () => {
  checkoutMessage.textContent = "";
  updateOrderSummary();
});

passwordInput?.addEventListener("input", () => {
  checkoutMessage.textContent = "";
  updateOrderSummary();
});

paymentOptions.forEach((option) => {
  option.addEventListener("change", () => {
    setPaymentPanels();
    checkoutMessage.textContent = "";
    updateOrderSummary();
  });
});

providerOptions.forEach((option) => {
  option.addEventListener("change", () => {
    checkoutMessage.textContent = "";
    updateOrderSummary();
  });
});

orderConsent?.addEventListener("change", () => {
  checkoutMessage.textContent = "";
  updateOrderSummary();
});

checkoutButton.addEventListener("click", () => {
  if (!isOrderComplete()) return;
  showOrderConfirmation();
});

confirmationDialog
  .querySelector("[data-confirm-cancel]")
  .addEventListener("click", () => {
    confirmationDialog.close();
  });

confirmationDialog
  .querySelector("[data-confirm-submit]")
  .addEventListener("click", () => {
    if (!isOrderComplete()) {
      confirmationDialog.close();
      return;
    }

    const payment = getSelectedPayment();
    const orderMethod = document.body.dataset.orderMethod;
    const username = formatUsername();
    const password = passwordInput?.value.trim();

    const backupCodes =
      getOrderNotes().length > 0
        ? getOrderNotes()
            .map((note) => `- ${note.label}: ${note.value}`)
            .join("\n")
        : "- Tidak ada Backup Code";

    const nominal = Number(selectedOption.dataset.nominal);
    const total = Number(selectedOption.dataset.price);

    const formatNumber = (value) => Number(value).toLocaleString("id-ID");

    const formatMoney = (value) => `Rp${formatNumber(value)}`;

    // Instruksi berdasarkan metode pembayaran yang dipilih.

    const paymentInstructions = {
      QRIS: [
        "୨୧ *PEMBAYARAN QRIS*",
        "Silakan scan QRIS pada halaman pembayaran.",
      ].join("\n"),

      "Transfer Bank - SeaBank": [
        "୨୧ *PEMBAYARAN SEABANK*",
        "Rekening: 901318468036",
        "a.n. MV",
      ].join("\n"),
    };

    const paymentInstruction =
      paymentInstructions[payment] ??
      [
        `୨୧ *PEMBAYARAN ${payment.toUpperCase()}*`,
        "Nomor: 0852-3649-6518",
        "a.n. MV",
      ].join("\n");

    const message = [
      "୨୧ 𓂃 🌙 𐙚",
      "*V E L U N A  S T U D I O*",
      "",
      "🧾 *PESANAN DIGITAL*",
      "Invoice & payment ♡",
      "",
      "━━━━━━━━━━━━━━",
      "",
      "Haii, Veluna! 🦢",
      "Mau pesen dung xixi ♡",
      "",
      "𓆩♡𓆪 *DETAIL PESANAN*",
      "",
      "୨୧ Produk: Roblox",
      `୨୧ Metode: ${orderMethod}`,
      `୨୧ Username:`,
      `- ${username}`,
      `୨୧ Password:`,
      `- ${password}`,
      `୨୧ Backup Code:`,
      backupCodes,
      `୨୧ Nominal: ${formatNumber(nominal)} Robux`,
      `୨୧ Pembayaran: ${payment}`,
      "",
      "💌 *TOTAL PEMBAYARAN*",
      `*${formatMoney(total)}*`,
      "",
      paymentInstruction,
      "",
      "━━━━━━━━━━━━━━",
      "",
      "୨୧ *Alternatif pembayaran*",
      "DANA / GoPay / ShopeePay",
      "Nomor: 0852-3649-6518",
      "SeaBank: 901318468036 a.n. MV",
      "",
      "━━━━━━━━━━━━━━",
      "",
      "🕊️ *PENTING, YAA!*",
      "",
      "♡ Kirim bukti pembayaran di chat ini.",
      "♡ Pesanan diproses setelah pembayaran",
      "dikonfirmasi oleh admin.",
      "",
      "Thank you for ordering at Veluna! 🎀",
      "With love, Veluna Studio 🌙",
    ]
      .filter((line) => line !== null && line !== undefined)
      .join("\n");

    const whatsappUrl = `https://wa.me/6738386518?text=${encodeURIComponent(message)}`;

    window.location.assign(whatsappUrl);
  });

setPaymentPanels();
updateOrderSummary();
