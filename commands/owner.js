import { isBlacklisted, addToBlacklist, removeFromBlacklist, getAllBlacklist } from '../src/database.js';
import { ContainerBuilder, MessageFlags, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActivityType } from 'discord.js';

export async function handleOwnerCommands(ctx) {
  const { message, command, args, isOwner, client } = ctx;

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

  // SERVERS
  if (command === 'servers') {
    const guilds = [...client.guilds.cache.values()];

    if (guilds.length === 0) {
      await message.reply("I'm not in any servers.");
      return true;
    }

    let description = '';

    for (const guild of guilds) {
      let inviteText = 'No permissions or channel to create invite';

      try {
        const channel = guild.channels.cache
          .filter((c) => {
            if (typeof c.isTextBased === 'function') return c.isTextBased();
            return c.isTextBased;
          })
          .find((c) => {
            const perms = c.permissionsFor(guild.members.me || client.user.id);
            return perms && perms.has('CreateInstantInvite');
          });

        if (channel) {
          const invite = await channel.createInvite({
            maxAge: 0,
            maxUses: 0,
            reason: `Requested by owner ${message.author.tag}`
          });
          inviteText = invite.url;
        }
      } catch {
        inviteText = 'Failed to create invite';
      }

      description += `**${guild.name}**\nID: \`${guild.id}\`\nInvite: ${inviteText}\n\n`;
    }

    if (!description.length) {
      description = "I couldn't create invites for any servers.";
    }

    const container = new ContainerBuilder()
      .setAccentColor(0x2b2d31)
      .addTextDisplayComponents(
        (text) => text.setContent("**📡 Servers I'm In**"),
        (text) => text.setContent(description.slice(0, 3900))
      )
      .addSeparatorComponents((sep) => sep.setDivider(true))
      .addTextDisplayComponents((text) => text.setContent('-# Owner Only Command'));

    await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
    return true;
  }

  // RESTART
  if (command === 'restart') {
    const components = [
      new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("## 🔄 Restarting Bot")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "The bot is now restarting safely..."
          )
        )
    ];

    await message.channel.send({
      components,
      flags: MessageFlags.IsComponentsV2 | MessageFlags.IsPersistent
    });

    console.log("Bot restart triggered by owner.");

    setTimeout(() => {
      process.exit(0);
    }, 1500);

    return true;
  }

  // DM COMMAND
  if (command === 'dm') {
    const target = args[0];

    if (!target) {
      const usageEmbed = [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## 📬 DM Command Usage")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "**Usage:**\n" +
              "`,dm @user your message` — DM a specific user\n" +
              "`,dm USER_ID your message` — DM a user by ID\n" +
              "`,dm all your message` — DM all server owners"
            )
          )
      ];

      await message.channel.send({
        components: usageEmbed,
        flags: MessageFlags.IsComponentsV2 | MessageFlags.IsPersistent
      });
      return true;
    }

    const dmText = args.slice(1).join(" ");

    const dmContainer = [
      new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("## 📩 Message from the Bot Owner")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`### ${dmText}`)
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent("*This message cannot be replied to*")
        )
    ];

    // DM all server owners
    if (target === "all") {
      let sent = 0;
      for (const guild of client.guilds.cache.values()) {
        try {
          const owner = await guild.fetchOwner();
          await owner.send({
            components: dmContainer,
            flags: MessageFlags.IsComponentsV2 | MessageFlags.IsPersistent
          });
          sent++;
        } catch { }
      }
      await message.reply(`DM sent to ${sent} server owners.`);
      return true;
    }

    // DM by mention
    const mention = message.mentions.users.first();
    if (mention) {
      try {
        await mention.send({
          components: dmContainer,
          flags: MessageFlags.IsComponentsV2 | MessageFlags.IsPersistent
        });
        await message.reply(`DM sent to ${mention.tag}.`);
        return true;
      } catch {
        await message.reply("I couldn't DM that user.");
        return true;
      }
    }

    // DM by raw user ID
    try {
      const user = await client.users.fetch(target);
      await user.send({
        components: dmContainer,
        flags: MessageFlags.IsComponentsV2 | MessageFlags.IsPersistent
      });
      await message.reply(`DM sent to user ID **${target}**.`);
      return true;
    } catch {
      await message.reply("Invalid user ID or user cannot be DMed.");
      return true;
    }
  }

  // FORCEBAN
  if (command === 'forceban') {
    const idOrMention = args[0];
    if (!idOrMention) {
      await message.reply('Provide a user ID or mention to forceban.');
      return true;
    }

    const userId = idOrMention.replace(/\D/g, '');
    if (!userId) {
      await message.reply('Invalid user ID.');
      return true;
    }

    await message.guild.members.ban(userId, {
      reason: `Forcebanned by owner ${message.author.tag}`
    }).catch(() => {});

    await message.reply(`Forcebanned <@${userId}> from this server.`);
    return true;
  }

  // FORCEKICK
  if (command === 'forcekick') {
    const member = message.mentions.members.first();
    if (!member) {
      await message.reply('Mention a user to forcekick.');
      return true;
    }

    await member.kick(`Forcekicked by owner ${message.author.tag}`).catch(() => {});
    await message.reply(`Forcekicked **${member.user.tag}**.`);
    return true;
  }

  // CHANGEMOOD
  if (command === 'changemood') {
    const mood = args.join(' ') || 'Neutral';
    // Store mood in ctx.state or global if needed
    await message.reply(`Mood set to **${mood}**`);
    return true;
  }

  // SETSTATUS
  if (command === 'setstatus') {
    const status = args.shift()?.toLowerCase();
    const text = args.join(' ') || '';

    if (!['online', 'idle', 'dnd'].includes(status)) {
      await message.reply('Status must be: `online`, `idle`, `dnd`.');
      return true;
    }

    client.user.setPresence({
      activities: [{ name: text, type: ActivityType.Playing }],
      status
    });

    await message.reply(`Status updated to **${status}**`);
    return true;
  }

  return false;
}
