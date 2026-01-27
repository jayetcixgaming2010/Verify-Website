const form = document.getElementById('verifyForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('code').value.trim().toUpperCase();
  if (!code) return;

  message.textContent = 'Đang kiểm tra mã...';
  message.className = '';
  message.classList.remove('hidden');

  try {
    const res = await fetch('/.netlify/functions/verify-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (data.success) {
      message.textContent = '✅ Verify thành công! Quay lại Discord để kiểm tra role.';
      message.className = 'success';
      form.reset();
    } else {
      message.textContent = data.message || '❌ Mã không hợp lệ hoặc đã hết hạn!';
      message.className = 'error';
    }
  } catch {
    message.textContent = '❌ Lỗi kết nối. Thử lại sau!';
    message.className = 'error';
  }
});