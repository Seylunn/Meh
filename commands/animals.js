import { ContainerBuilder, MessageFlags, MediaGalleryBuilder, MediaGalleryItemBuilder } from 'discord.js';

export async function handleAnimalCommands(ctx) {
  const { message, command } = ctx;

  // CAT
  if (command === 'cat') {
    try {
      const res = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await res.json();
      const image = data[0]?.url;

      if (!image) {
        await message.reply("Couldn't fetch a cat right now.");
        return true;
      }

      const gallery = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(image));
      const container = new ContainerBuilder()
        .setAccentColor(0x2b2d31)
        .addTextDisplayComponents(text => text.setContent("## 🐱 Random Cat"))
        .addMediaGalleryComponents(gallery);

      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
      return true;
    } catch (err) {
      await message.reply("Cat API failed.");
      return true;
    }
  }

  // DOG
  if (command === 'dog') {
    try {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const data = await res.json();
      const image = data.message;

      if (!image) {
        await message.reply("Couldn't fetch a dog right now.");
        return true;
      }

      const gallery = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(image));
      const container = new ContainerBuilder()
        .setAccentColor(0x2b2d31)
        .addTextDisplayComponents(text => text.setContent("## 🐶 Random Dog"))
        .addMediaGalleryComponents(gallery);

      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
      return true;
    } catch (err) {
      await message.reply("Dog API failed.");
      return true;
    }
  }

  // BIRD
  if (command === 'bird') {
    try {
      const res = await fetch("https://some-random-api.com/img/birb");
      const data = await res.json();
      const image = data.link;

      if (!image) {
        await message.reply("Couldn't fetch a bird right now.");
        return true;
      }

      const gallery = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(image));
      const container = new ContainerBuilder()
        .setAccentColor(0x2b2d31)
        .addTextDisplayComponents(text => text.setContent("## 🐦 Random Bird"))
        .addMediaGalleryComponents(gallery);

      await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
      return true;
    } catch (err) {
      await message.reply("Bird API failed.");
      return true;
    }
  }

  // FOX
  if (command === 'fox') {
    try {
      const res = await fetch("https://randomfox.ca/floof/");
      const data = await res.json();
      const image = data.image;

      if (!image) {
        await message.reply("Couldn't fetch a fox right now.");
        return true;
      }

      const gallery = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(image));
      const container = new ContainerBuilder()
        .setAccentColor(0xffa500)
        .addTextDisplayComponents(text => text.setContent("## 🦊 Random Fox"))
        .addMediaGalleryComponents(gallery);

      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false }
      });
      return true;
    } catch (err) {
      console.error(err);
      await message.reply("Fox API failed.");
      return true;
    }
  }

  return false;
}
