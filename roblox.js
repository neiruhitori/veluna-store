const nominalOptions = Array.from(document.querySelectorAll("[data-nominal]"));
const usernameInput = document.querySelector("#roblox-username");
const orderEmpty = document.querySelector("[data-order-empty]");
const orderDetails = document.querySelector("[data-order-details]");
const selectedNominal = document.querySelector("[data-selected-nominal]");
const selectedUsername = document.querySelector("[data-selected-username]");
const selectedPrice = document.querySelector("[data-selected-price]");
const selectedPayment = document.querySelector("[data-selected-payment]");
const checkoutMessage = document.querySelector("[data-checkout-message]");
const paymentOptions = Array.from(document.querySelectorAll("[data-payment-option]"));
const providerOptions = Array.from(document.querySelectorAll("[data-provider-option]"));
const paymentPanels = Array.from(document.querySelectorAll("[data-payment-panel]"));
const orderConsent = document.querySelector("[data-order-consent]");
const checkoutButton = document.querySelector("[data-checkout]");
const confirmationDialog = document.querySelector("[data-order-confirm-dialog]");
const confirmationSummary = document.querySelector("[data-confirm-summary]");
let selectedOption = null;

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const getSelectedPaymentOption = () => paymentOptions.find((option) => option.checked);

const getSelectedProvider = () =>
  providerOptions.find((option) => option.checked && option.closest(".payment-detail:not([hidden])"));

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
      usernameInput.value.trim() &&
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
  const username = usernameInput.value.trim();
  checkoutButton.disabled = !isOrderComplete();

  if (!selectedOption) {
    orderEmpty.hidden = false;
    orderDetails.hidden = true;
    return;
  }

  orderEmpty.hidden = true;
  orderDetails.hidden = false;
  selectedNominal.textContent = `${Number(selectedOption.dataset.nominal).toLocaleString("id-ID")} Robux`;
  selectedUsername.textContent = username || "Belum diisi";
  selectedPrice.textContent = formatRupiah(Number(selectedOption.dataset.price));
  if (selectedPayment) selectedPayment.textContent = getSelectedPayment() || "Pilih metode pembayaran";
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
  addConfirmationRow("Username Roblox", usernameInput.value.trim());
  addConfirmationRow("Pembayaran", getSelectedPayment());
  addConfirmationRow("Total contoh", formatRupiah(Number(selectedOption.dataset.price)));
  confirmationDialog.showModal();
};

nominalOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedOption = option;
    nominalOptions.forEach((item) => item.setAttribute("aria-pressed", String(item === option)));
    checkoutMessage.textContent = "";
    updateOrderSummary();
  });
});

usernameInput.addEventListener("input", () => {
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

confirmationDialog.querySelector("[data-confirm-cancel]").addEventListener("click", () => {
  confirmationDialog.close();
});

confirmationDialog.querySelector("[data-confirm-submit]").addEventListener("click", () => {
  if (!isOrderComplete()) {
    confirmationDialog.close();
    return;
  }

  const payment = getSelectedPayment();
  const paymentInstruction =
    payment === "QRIS"
      ? "Saya akan membayar dengan memindai QRIS yang ditampilkan di halaman, lalu mengirim bukti pembayaran di chat ini."
      : payment === "Transfer Bank - SeaBank"
        ? "Saya akan transfer ke SeaBank rekening 901318468036 dan mengirim bukti pembayaran di chat ini."
        : `Saya akan membayar dengan ${payment} ke nomor +62 852-3649-6518 dan mengirim bukti pembayaran di chat ini.`;
  const message = [
    `Halo Veluna, saya ingin konfirmasi pesanan Roblox (${document.body.dataset.orderMethod}).`,
    `Metode produk: ${document.body.dataset.orderMethod}`,
    `Nominal: ${Number(selectedOption.dataset.nominal).toLocaleString("id-ID")} Robux`,
    `Username Roblox: ${usernameInput.value.trim()}`,
    `Pembayaran: ${payment}`,
    `Total contoh: ${formatRupiah(Number(selectedOption.dataset.price))}`,
    paymentInstruction,
    "",
    "Mohon konfirmasi pesanan saya. Saya tidak menyertakan kata sandi atau kode OTP.",
  ].join("\n");
  const whatsappUrl = `https://wa.me/6738386518?text=${encodeURIComponent(message)}`;
  window.location.assign(whatsappUrl);
});

confirmationDialog.addEventListener("click", (event) => {
  if (event.target === confirmationDialog) confirmationDialog.close();
});

setPaymentPanels();
updateOrderSummary();
