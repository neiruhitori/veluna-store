const userIdInput = document.querySelector("#ml-user-id");
const serverIdInput = document.querySelector("#ml-server-id");
const productOptions = Array.from(document.querySelectorAll("[data-ml-product]"));
const packageOptions = Array.from(document.querySelectorAll("[data-ml-package]"));
const packageSections = Array.from(
  document.querySelectorAll("[data-package-section]"),
);
const paymentOptions = Array.from(
  document.querySelectorAll("[data-payment-option]"),
);
const providerOptions = Array.from(
  document.querySelectorAll("[data-provider-option]"),
);
const paymentPanels = Array.from(
  document.querySelectorAll("[data-payment-panel]"),
);
const orderEmpty = document.querySelector("[data-order-empty]");
const orderDetails = document.querySelector("[data-order-details]");
const selectedUserId = document.querySelector("[data-selected-user-id]");
const selectedServerId = document.querySelector("[data-selected-server-id]");
const selectedProduct = document.querySelector("[data-selected-product]");
const selectedPayment = document.querySelector("[data-selected-payment]");
const checkoutButton = document.querySelector("[data-checkout]");
const confirmationDialog = document.querySelector(
  "[data-order-confirm-dialog]",
);
const confirmationSummary = document.querySelector("[data-confirm-summary]");

const getSelectedProduct = () =>
  productOptions.find((option) => option.checked);

const getSelectedPackage = () =>
  packageOptions.find((option) => option.getAttribute("aria-pressed") === "true");

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

const isValidAccountId = (value) => /^\d+$/.test(value.trim());

const isOrderComplete = () =>
  Boolean(
    isValidAccountId(userIdInput.value) &&
      isValidAccountId(serverIdInput.value) &&
      getSelectedProduct() &&
      getSelectedPackage() &&
      getSelectedPayment(),
  );

const setPaymentPanels = () => {
  const selectedPaymentOption = getSelectedPaymentOption();
  paymentPanels.forEach((panel) => {
    panel.hidden = panel.dataset.paymentPanel !== selectedPaymentOption?.value;
  });
};

const updateOrderSummary = () => {
  const product = getSelectedProduct();
  const selectedPackage = getSelectedPackage();
  const productSelectionComplete = Boolean(product && selectedPackage);

  checkoutButton.disabled = !isOrderComplete();
  orderEmpty.hidden = productSelectionComplete;
  orderDetails.hidden = !productSelectionComplete;

  if (!productSelectionComplete) return;
  selectedUserId.textContent = userIdInput.value.trim() || "Belum diisi";
  selectedServerId.textContent = serverIdInput.value.trim() || "Belum diisi";
  selectedProduct.textContent = selectedPackage.dataset.packageName;
  selectedPayment.textContent =
    getSelectedPayment() || "Pilih metode pembayaran";
};

const addConfirmationRow = (label, value) => {
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  confirmationSummary.append(term, description);
};

const showOrderConfirmation = () => {
  const product = getSelectedProduct();
  const selectedPackage = getSelectedPackage();
  confirmationSummary.replaceChildren();
  addConfirmationRow("Game", "Mobile Legends");
  addConfirmationRow("User ID", userIdInput.value.trim());
  addConfirmationRow("Zone ID (Server)", serverIdInput.value.trim());
  addConfirmationRow("Jenis produk", product.value);
  addConfirmationRow("Paket", selectedPackage.dataset.packageName);
  addConfirmationRow("Pembayaran", getSelectedPayment());
  addConfirmationRow("Total", "Dikonfirmasi admin melalui WhatsApp");
  confirmationDialog.showModal();
};

productOptions.forEach((option) => {
  option.addEventListener("change", () => {
    packageOptions.forEach((packageOption) => {
      packageOption.setAttribute("aria-pressed", "false");
    });
    packageSections.forEach((section) => {
      section.hidden = section.dataset.packageSection !== option.value;
    });
    updateOrderSummary();
  });
});

packageOptions.forEach((option) => {
  option.setAttribute("aria-pressed", "false");
  option.addEventListener("click", () => {
    packageOptions.forEach((packageOption) => {
      packageOption.setAttribute(
        "aria-pressed",
        String(packageOption === option),
      );
    });
    updateOrderSummary();
  });
});

[userIdInput, serverIdInput].forEach((input) => {
  input.addEventListener("input", updateOrderSummary);
});

paymentOptions.forEach((option) => {
  option.addEventListener("change", () => {
    setPaymentPanels();
    updateOrderSummary();
  });
});

providerOptions.forEach((option) => {
  option.addEventListener("change", updateOrderSummary);
});

checkoutButton.addEventListener("click", () => {
  if (isOrderComplete()) showOrderConfirmation();
});

confirmationDialog
  .querySelector("[data-confirm-cancel]")
  .addEventListener("click", () => confirmationDialog.close());

confirmationDialog
  .querySelector("[data-confirm-submit]")
  .addEventListener("click", () => {
    if (!isOrderComplete()) {
      confirmationDialog.close();
      return;
    }

    const product = getSelectedProduct();
    const selectedPackage = getSelectedPackage();
    const payment = getSelectedPayment();
    const paymentInstructions = {
      QRIS: [
        "୨୧ *PEMBAYARAN QRIS*",
        "Silakan scan QRIS pada halaman pembayaran setelah total dikonfirmasi admin.",
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
        "Nomor: +62 852-3649-6518",
        "a.n. MV",
      ].join("\n");
    const message = [
      "୨୧ 𓂃 🌙 𐙚",
      "*V E L U N A  S T U D I O*",
      "",
      "🧾 *PESANAN DIGITAL*",
      "",
      "𓆩♡𓆪 *DETAIL PESANAN*",
      "",
      "୨୧ Game: Mobile Legends",
      `୨୧ User ID: ${userIdInput.value.trim()}`,
      `୨୧ Zone ID (Server): ${serverIdInput.value.trim()}`,
      `୨୧ Jenis produk: ${product.value}`,
      `୨୧ Paket: ${selectedPackage.dataset.packageName}`,
      `୨୧ Pembayaran: ${payment}`,
      "୨୧ Total: Mohon konfirmasi harga",
      "",
      paymentInstruction,
      "",
      "♡ Mohon konfirmasi total pembayaran dan pesanan saya.",
      "♡ Setelah membayar, saya akan mengirim bukti pembayaran di chat ini.",
      "",
      "Terima kasih, Veluna! 🎀",
    ].join("\n");

    window.location.assign(
      `https://wa.me/6738386518?text=${encodeURIComponent(message)}`,
    );
  });

setPaymentPanels();
packageSections.forEach((section) => {
  section.hidden = true;
});
updateOrderSummary();
