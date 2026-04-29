const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const path = require('path');
const fs = require('fs');

const client = new Client({
  authStrategy: new LocalAuth()
});

// ==================== EVENTS ====================

client.on('qr', qr => {
  console.log('\n📱 Scan QR Code untuk login WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log(`\n✅ Bot ${config.botName} siap digunakan!`);
  console.log(`📌 Owner: ${config.owner}`);
  console.log(`🤖 Bot Number: ${config.botNumber}`);
  console.log(`⚙️ Prefix: ${config.prefix}\n`);
});

client.on('message', async msg => {
  try {
    await handleMessage(msg);
  } catch (error) {
    console.error('Error:', error);
  }
});

// ==================== MESSAGE HANDLER ====================

async function handleMessage(msg) {
  const chat = await msg.getChat();
  const isGroupChat = chat.isGroup;
  const sender = msg.from;
  
  // Parse command
  if (!msg.body.startsWith(config.prefix)) return;
  
  const args = msg.body.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  console.log(`📨 [${isGroupChat ? 'GROUP' : 'PRIVATE'}] ${sender}: ${msg.body}`);
  
  // ==================== COMMANDS ====================
  
  // Sticker Command
  if (command === 'sticker' || command === 'stk') {
    try {
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const stickerMedia = new MessageMedia(media.mimetype, media.data, media.filename);
        await chat.sendMessage(stickerMedia, { 
          sendMediaAsSticker: true,
          stickerAuthor: config.owner,
          stickerName: config.botName
        });
        await msg.reply('✅ Sticker berhasil dibuat!');
      } else {
        await msg.reply(`❌ Balas gambar/video dengan ${config.prefix}sticker`);
      }
    } catch (error) {
      await msg.reply('❌ Error membuat sticker: ' + error.message);
    }
  }
  
  // Jadibot (Pairing) Command
  else if (command === 'jadibot' || command === 'pairing') {
    try {
      const pairingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await msg.reply(`
🤖 *JADIBOT - PAIRING MODE*
━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Pairing Code: \`${pairingCode}\`
⏱️ Berlaku: 5 menit
📌 Hubungi owner untuk bantuan

*Cara Pairing:*
1. Buka WhatsApp Anda
2. Masuk Settings → Linked Devices
3. Masukkan kode di atas

👤 Owner: ${config.owner}
      `);
    } catch (error) {
      await msg.reply('❌ Error pairing: ' + error.message);
    }
  }
  
  // Speed Command
  else if (command === 'speed') {
    const start = Date.now();
    const speedMsg = await msg.reply('⏱️ Testing speed...');
    const speed = Date.now() - start;
    await speedMsg.edit(`⚡ Response Time: ${speed}ms`);
  }
  
  // Bot Info Command
  else if (command === 'botinfo' || command === 'info') {
    await msg.reply(`
╔══════════════════════════════════════════════════════════╗
║                    🤖 ASANO BOT INFO 🤖                    ║
╚══════════════════════════════════════════════════════════╝

📌 *Bot Name:* ${config.botName}
👤 *Owner:* ${config.owner}
📞 *Bot Number:* ${config.botNumber}
⚙️ *Prefix:* ${config.prefix}
🌍 *Languages:* ${config.languages.join(', ')}

👥 *GROUP LINK:*
${config.groupLink}

╔══════════════════════════════════════════════════════════╗
║      Type ${config.prefix}help untuk melihat semua command       ║
╚══════════════════════════════════════════════════════════╝
    `);
  }
  
  // Help Command
  else if (command === 'help') {
    await msg.reply(`
╔══════════════════════════════════════════════════════════╗
║                  📚 ASANO BOT COMMANDS 📚                 ║
╚══════════════════════════════════════════════════════════╝

🖼️ *STICKER COMMANDS:*
  ${config.prefix}sticker - Buat stiker dari gambar/video
  ${config.prefix}stk - Alias sticker

👥 *GROUP COMMANDS:*
  ${config.prefix}group - Info group
  ${config.prefix}kick - Kick member
  ${config.prefix}promote - Jadikan admin
  ${config.prefix}demote - Hapus admin

🎮 *GAME COMMANDS:*
  ${config.prefix}game - Daftar game
  ${config.prefix}tictactoe - Permainan TicTacToe
  ${config.prefix}lottery - Undian

🤖 *BOT COMMANDS:*
  ${config.prefix}jadibot - Mode pairing
  ${config.prefix}speed - Test kecepatan bot
  ${config.prefix}botinfo - Info bot
  ${config.prefix}help - Bantuan ini

🎵 *MUSIC COMMANDS:*
  ${config.prefix}music - Search musik
  ${config.prefix}play - Play musik
  ${config.prefix}stop - Stop musik

╚══════════════════════════════════════════════════════════╝
    `);
  }
  
  // Group Command
  else if (command === 'group' && isGroupChat) {
    const groupMetadata = await chat.getGroupMetadata();
    await msg.reply(`
📊 *GROUP INFO*
━━━━━━━━━━━━━━━━━━━━━━
👥 Nama: ${groupMetadata.subject}
👤 Members: ${groupMetadata.participants.length}
📋 ID: ${chat.id._serialized}
    `);
  }
  
  // Game Command
  else if (command === 'game') {
    await msg.reply(`
🎮 *AVAILABLE GAMES*
━━━━━━━━━━━━━━━━━━━━━━
1️⃣ ${config.prefix}tictactoe - Tic Tac Toe
2️⃣ ${config.prefix}lottery - Lottery
3️⃣ ${config.prefix}quiz - Quiz
    `);
  }
  
  // Lottery Command
  else if (command === 'lottery') {
    const result = Math.floor(Math.random() * 1000) + 1;
    await msg.reply(`
🎰 *LOTTERY RESULT*
━━━━━━━━━━━━━━━━━━━━━━
🎲 Nomor: ${result}
💰 Prize: ${result % 2 === 0 ? 'Menang!' : 'Coba lagi!'}
    `);
  }
  
  // Music Command
  else if (command === 'music') {
    await msg.reply(`
🎵 *MUSIC FEATURES*
━━━━━━━━━━━━━━━━━━━━━━
${config.prefix}music <query> - Cari musik
${config.prefix}play <url> - Play musik
${config.prefix}stop - Stop musik
    `);
  }
}

// ==================== INITIALIZE BOT ====================

client.initialize();

process.on('SIGINT', () => {
  console.log('\n👋 Bot sedang logout...');
  client.destroy();
  process.exit();
});