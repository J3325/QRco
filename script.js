function generateQR() {
  const input = document.getElementById("qrInput").value;
  const qrResult = document.getElementById("qrResult");
  const downloadBtn = document.getElementById("downloadBtn");

  qrResult.innerHTML = "";
  downloadBtn.classList.add("hidden");

  if (!input.trim()) {
    alert("Isi dulu kocak datanya.");
    return;
  }

  new QRCode(qrResult, {
    text: input,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  setTimeout(() => {
    downloadBtn.classList.remove("hidden");
  }, 300);
}

function downloadQR() {
  const canvas = document.querySelector("#qrResult canvas");

  if (!canvas) return;

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "qrco.png";
  link.click();
}