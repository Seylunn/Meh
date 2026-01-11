import { isBlacklisted, addToBlacklist, removeFromBlacklist, getAllBlacklist } from '../src/database.js';
import { ContainerBuilder, MessageFlags } from 'discord.js';

export async function handleOwnerCommands(ctx) {
  const { message, command, args, isOwner } = ctx;

  if (!isOwner) return false;

  // BLACKLIST
  if (command === 'blacklist') {
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply('Mention a user to blacklist.');
      return true;
    }

    await addToBlacklist(target.id, 'Blacklisted by owner');
    await message.reply(`Blacklisted <@${target.id}> globally.`);
    return true;
  }

  // UNBLACKLIST
  if (command === 'unblacklist') {
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply('Mention a user to unblacklist.');
      return true;
    }

    const targetBlacklisted = await isBlacklisted(target.id);
    if (!targetBlacklisted) {
      await message.reply('That user is not blacklisted.');
      return true;
    }

    await removeFromBlacklist(target.id);
    await message.reply(`Unblacklisted <@${target.id}> globally.`);
    return true;
  }

  // BLACKLISTCHECK
  if (command === 'blacklistcheck') {
    const blacklistMap = await getAllBlacklist();
    const ids = Array.from(blacklistMap.keys());

    if (ids.length === 0) {
      await message.reply('No users are currently blacklisted.');
      return true;
    }

    const list = ids.map((id) => `• <@${id}> (\`${id}\`)`).join('\n');
    const container = new ContainerBuilder()
      .setAccentColor(0x2b2d31)
      .addTextDisplayComponents(
        (text) => text.setContent('**🔒 Blacklisted Users**'),
        (text) => text.setContent(list)
      )
      .addSeparatorComponents((sep) => sep.setDivider(true));

    await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
    return true;
  }

  return false;
}
