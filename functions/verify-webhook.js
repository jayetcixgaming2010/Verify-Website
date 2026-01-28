const codes = new Map();

// 🔴 WEBHOOK TỔNG – CHỦ BOT QUẢN LÝ
const MASTER_DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1465721602032537681/pgc4NJbIoYSYkuX-b6MNBPfwwBGyV3bIMt9wOCdyasbvxM8Hm6BFC145cCJVB_DrivhE";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405 };
  }

  const data = JSON.parse(event.body || "{}");

  // ===============================
  // BOT gửi mã
  // ===============================
  if (data.user_id && data.guild_id && data.code) {
    codes.set(data.code, {
      user_id: data.user_id,
      guild_id: data.guild_id,
      expire: Date.now() + 5 * 60 * 1000
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  // ===============================
  // USER nhập mã
  // ===============================
  if (data.code && data.guild_id) {
    const record = codes.get(data.code);

    if (!record || record.guild_id != data.guild_id) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: "❌ Mã không hợp lệ"
        })
      };
    }

    if (Date.now() > record.expire) {
      codes.delete(data.code);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: "⏰ Mã đã hết hạn"
        })
      };
    }

    // 👉 GỬI VỀ WEBHOOK TỔNG
    await fetch(MASTER_DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `VERIFY_USER ${record.user_id} ${record.guild_id}`
      })
    });

    codes.delete(data.code);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  return { statusCode: 400 };
};
