import { ContainerBuilder, MessageFlags, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getAfkData, setAfkData, getAfkActive, setAfkActive, deleteAfkActive, getAllAfkData } from '../src/database.js';

function formatDuration(ms) {
  const units = [
    { label: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { label: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { label: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { label: 'day', ms: 1000 * 60 * 60 * 24 },
    { label: 'hour', ms: 1000 * 60 * 60 },
    { label: 'minute', ms: 1000 * 60 },
    { label: 'second', ms: 1000 }
  ];

  let remaining = ms;
  const parts = [];

  for (const u of units) {
    if (remaining >= u.ms) {
      const value = Math.floor(remaining / u.ms);
      remaining -= value * u.ms;
      parts.push(`${value} ${u.label}${value !== 1 ? 's' : ''}`);
    }
  }

  return parts.length ? parts.join(', ') : '0 seconds';
}

export async function handleAfkCommands(ctx) {
  const { message, command, args, state } = ctx;

  // AFK
  if (command === 'afk') {
    const reason = args.join(' ') || 'AFK';
    const now = Date.now();
    const userId = message.author.id;

    if (state.afkActive.has(userId) || await getAfkActive(userId)) {
      await message.reply('You are already marked as AFK.');
      return true;
    }

    const afkSession = { since: now, reason };
    state.afkActive.set(userId, afkSession);
    await setAfkActive(userId, afkSession);

    const container = new ContainerBuilder()
      .setAccentColor(0x2b2d31)
      .addTextDisplayComponents(
        (text) => text.setContent('**🕒 AFK Enabled**'),
        (text) => text.setContent(`You are now marked as AFK.\n**Reason:** ${reason}`)
      )
      .addSeparatorComponents((sep) => sep.setDivider(true))
      .addTextDisplayComponents((text) => text.setContent('-# AFK System'));

    await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
    return true;
  }

  // AFKLB
  if (command === 'afklb') {
    const afkTotals = await getAllAfkData();
    const entries = Array.from(afkTotals.entries())
      .filter(([_, ms]) => ms > 0)
      .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      await message.reply('No AFK data recorded yet.');
      return true;
    }

    const pageSize = 10;
    const totalPages = Math.ceil(entries.length / pageSize);
    const page = 0;

    const start = page * pageSize;
    const pageEntries = entries.slice(start, start + pageSize);

    const lines = pageEntries.map(([userId, totalMs], i) => {
      const rank = start + i + 1;
      return `**${rank}.** <@${userId}> — ${formatDuration(totalMs)}`;
    });

    const container = new ContainerBuilder()
      .setAccentColor(0x2b2d31)
      .addTextDisplayComponents(
        (text) => text.setContent('**🏆 AFK Leaderboard**'),
        (text) => text.setContent(lines.join('\n') + `\n\nPage **1** of **${totalPages}**`)
      )
      .addSeparatorComponents((sep) => sep.setDivider(true))
      .addActionRowComponents((row) =>
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('afk_prev:0')
            .setLabel('Prev')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('afk_next:0')
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(totalPages <= 1)
        )
      );

    const sent = await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
    if (sent) state.leaderboardPages.set(sent.id, { type: 'afk', page: 0, isAfk: true });
    return true;
  }

  return false;
}
