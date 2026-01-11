import { HELP_CATEGORIES } from './help.js';

export async function handleInteractions(interaction, state) {

  // BUTTONS
  if (interaction.isButton()) {
    return interaction.reply({
      content: 'Button clicked!',
      ephemeral: true
    });
  }

  // SELECT MENUS
  if (interaction.isStringSelectMenu()) {

    // HELP MENU
    if (interaction.customId === 'help-menu') {
      const category = interaction.values[0];
      const data = HELP_CATEGORIES[category];

      if (!data) {
        return interaction.reply({
          content: 'Category not found.',
          ephemeral: true
        });
      }

      const commandList = data.commands
        .map(cmd => `\`${cmd.name}\` — ${cmd.desc}`)
        .join('\n');

      return interaction.reply({
        content: `**${data.emoji} ${data.title}**\n\n${commandList}`,
        ephemeral: true
      });
    }

    // OTHER MENUS (if you add more later)
    return interaction.reply({
      content: 'Menu selected!',
      ephemeral: true
    });
  }
}

