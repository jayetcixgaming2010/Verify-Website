const codes = new Map();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405 };
  }

  const data = JSON.parse(event.body || "{}");

  // Bot gửi mã
  if (data.user_id && data.guild_id && data.code) {
    codes.set(data.code, {
      user_id: data.user_id,
      guild_id: data.guild_id,
      expireAt: Date.now() + 10 * 60 * 1000
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  // User nhập mã
  if (data.code) {
    const record = codes.get(data.code);

    if (!record || Date.now() > record.expireAt) {
      codes.delete(data.code);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: "Mã không hợp lệ hoặc đã hết hạn"
        })
      };
    }

    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1465721602032537681/pgc4NJbIoYSYkuX-b6MNBPfwwBGyV3bIMt9wOCdyasbvxM8Hm6BFC145cCJVB_DrivhE";
    // ⚠️ THAY BẰNG WEBHOOK THẬT

    await fetch(DISCORD_WEBHOOK, {
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
