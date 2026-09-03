function showPopup(msg) {
  const existing = document.querySelector(".popup-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.innerHTML = '<div class="popup-card">'
    + '<span class="popup-icon">!</span>'
    + '<span class="popup-msg">' + msg + '</span>'
    + '<button class="popup-btn" onclick="this.closest(\'.popup-overlay\').remove()">Isi dulu</button>'
    + '</div>';
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) overlay.remove();
  });

  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 4000);
}

function hideDownloadBtn() {
  document.getElementById("downloadBtn").classList.add("hidden");
}

function showDownloadBtn() {
  document.getElementById("downloadBtn").classList.remove("hidden");
}

function hideHelper() {
  const h = document.getElementById("helperText");
  if (h) h.classList.add("hidden");
}

function showHelper() {
  const h = document.getElementById("helperText");
  if (h) h.classList.remove("hidden");
}

function selectShape(btn) {
  document.querySelectorAll(".shape-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function getSelectedShape() {
  const active = document.querySelector(".shape-btn.active");
  return active ? active.dataset.shape : "square";
}

function showLoader(qrResult) {
  const loader = document.createElement("div");
  loader.className = "loader-wrapper";
  loader.innerHTML = '<div class="loader"></div><span class="loader-text">Generating...</span>';
  const frame = document.createElement("div");
  frame.className = "qr-frame";
  frame.appendChild(loader);
  qrResult.appendChild(frame);
  return frame;
}

function generateQR() {
  const input = document.getElementById("qrInput").value;
  const qrResult = document.getElementById("qrResult");
  const shape = getSelectedShape();

  qrResult.innerHTML = "";
  hideDownloadBtn();
  showHelper();

  if (!input.trim()) {
    showPopup("Isi dulu kocak datanya.");
    return;
  }

  hideHelper();

  const frame = showLoader(qrResult);

  if (shape === "square") {
    const tempDiv = document.createElement("div");
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    new QRCode(tempDiv, {
      text: input,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
      const srcCanvas = tempDiv.querySelector("canvas");
      if (!srcCanvas) { tempDiv.remove(); return; }
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      canvas.getContext("2d").drawImage(srcCanvas, 0, 0);
      frame.innerHTML = "";
      frame.appendChild(canvas);
      tempDiv.remove();
    }, 350);
  } else {
    const tempDiv = document.createElement("div");
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    new QRCode(tempDiv, {
      text: input,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
      const srcCanvas = tempDiv.querySelector("canvas");
      if (!srcCanvas) { tempDiv.remove(); return; }

      const size = 256;
      const srcCtx = srcCanvas.getContext("2d");
      const imgData = srcCtx.getImageData(0, 0, size, size);
      const pixels = imgData.data;

      let minR = size, maxR = 0, minC = size, maxC = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const i = (r * size + c) * 4;
          if (pixels[i] < 128) {
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
            if (c < minC) minC = c;
            if (c > maxC) maxC = c;
          }
        }
      }

      const qrWidth = maxC - minC + 1;
      const qrHeight = maxR - minR + 1;
      const moduleSize = Math.floor(Math.min(qrWidth, qrHeight) / 25);
      const modules = Math.floor(qrWidth / moduleSize);
      const offsetX = minC + Math.floor((qrWidth - modules * moduleSize) / 2);
      const offsetY = minR + Math.floor((qrHeight - modules * moduleSize) / 2);

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          const cx = offsetX + c * moduleSize + moduleSize / 2;
          const cy = offsetY + r * moduleSize + moduleSize / 2;
          const pi = ((offsetY + r * moduleSize + Math.floor(moduleSize / 2)) * size + (offsetX + c * moduleSize + Math.floor(moduleSize / 2))) * 4;
          if (pixels[pi] < 128) {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(cx, cy, moduleSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      frame.innerHTML = "";
      frame.appendChild(canvas);
      tempDiv.remove();
    }, 400);
  }

  const shapeDelay = shape === "square" ? 450 : 500;
  setTimeout(() => { showDownloadBtn(); }, shapeDelay);
}

function downloadQR() {
  const qrCanvas = document.querySelector("#qrResult canvas");
  if (!qrCanvas) return;

  const padding = 20;
  const borderWidth = 4;
  const totalSize = 256 + (padding + borderWidth) * 2;

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = totalSize;
  exportCanvas.height = totalSize;
  const ctx = exportCanvas.getContext("2d");

  // border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.roundRect(borderWidth / 2, borderWidth / 2, totalSize - borderWidth, totalSize - borderWidth, 12);
  ctx.stroke();

  // white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(padding + borderWidth, padding + borderWidth, 256, 256);

  // QR image
  ctx.drawImage(qrCanvas, padding + borderWidth, padding + borderWidth);

  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL("image/png");
  link.download = "qrco.png";
  link.click();
}