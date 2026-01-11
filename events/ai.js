export async function handleAiMentions(message, BOT_OWNER_IDS) {
  const cleaned = message.content.replace(/<@!?(\d+)>/g, '').trim().toLowerCase();
  const greetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'heya', 'hiya', 'greetings'];

  const isOwner = BOT_OWNER_IDS.includes(message.author.id);

  if (isOwner && greetings.includes(cleaned)) {
    const responses = [
      `👑 Welcome back, ${message.author.username}.`,
      `🍓 The bot bows to you, ${message.author.username}.`,
      `⚡ Chaos awaits, ${message.author.username}.`,
      `🧠 Ready to execute your will, ${message.author.username}.`
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    return message.reply(response);
  }

  // Add your AI logic here if needed
  await message.reply("I'm here!");
}
