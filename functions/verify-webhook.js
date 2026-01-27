const codes = new Map(); // Lưu tạm trong memory (Netlify reset mỗi ~15 phút, đủ cho mã 10 phút)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  const data = JSON.parse(event.body);

  // Bot gửi mã để lưu
  if (data.user_id && data.code && data.guild_id) {
    const expireAt = Date.now() + 10 * 60 * 1000; // 10 phút
    codes.set(data.code, { user_id: data.user_id, guild_id: data.guild_id, expireAt });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  // Người dùng nhập mã
  if (data.code) {
    const record = codes.get(data.code);
    if (!record || Date.now() > record.expireAt) {
      codes.delete(data.code);
      return { statusCode: 200, body: JSON.stringify({ success: false, message: 'Mã hết hạn hoặc không tồn tại' }) };
    }

    // Gửi lệnh cấp role về bot qua một webhook Discord (tạo channel webhook trong server)
    const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/...'; // <<< THAY BẰNG WEBHOOK THẬT

    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `VERIFY_USER ${record.user_id} ${record.guild_id}`
      })
    });

    codes.delete(data.code);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 400 };
};
