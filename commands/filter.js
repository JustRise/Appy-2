const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
name: "filter",
description: "Adds audio filter to ongoing music.",
permissions: "0x0000000000000800",
options: [{
name: 'filtre',
description: 'Type the filter you want to apply. (bassboost, 8D, nightcore, mono, karaoke)',
type: ApplicationCommandOptionType.String,
required: true
}],
  voiceChannel: true,
run: async (client, interaction) => {
let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
lang = lang?.language || client.language
lang = require(`../languages/${lang}.js`);
try {

  const queue = client.player.getQueue(interaction.guild.id);

if (!queue || !queue.playing) return interaction.reply({ content: `${lang.msg5}`, ephemeral: true }).catch(e => { })
const filtre = interaction.options.getString('filtre')

if (!filtre) return interaction.reply({ content: lang.msg29, ephemeral: true }).catch(e => { })


const filters = ["bassboost", "8D", "nightcore", "mono", "karaoke"];
//other filters: https://discord-player.js.org/docs/main/master/class/AudioFilters

const filter = filters.find((x) => x.toLowerCase() === filtre.toLowerCase());

if (!filter) return interaction.reply({ content: lang.msg30, ephemeral: true }).catch(e => { })
const filtersUpdated = {};
filtersUpdated[filter] = queue["_activeFilters"].includes(filter) ? false : true;
await queue.setFilters(filtersUpdated);

interaction.reply({ content: lang.msg31.replace("{filter}", filter).replace("{status}", queue["_activeFilters"].includes(filter) ? '✅' : '❌') }).catch(e => { })

} catch (e) {
  if(client.errorLog){
let embed = new EmbedBuilder()
.setColor(client.config.embedColor)
.setTimestamp()
.addFields([
      { name: "Command", value: `${interaction?.commandName}` },
      { name: "Error", value: `${e.stack}` },
      { name: "User", value: `${interaction?.user?.tag} \`(${interaction?.user?.id})\``, inline: true },
      { name: "Guild", value: `${interaction?.guild?.name} \`(${interaction?.guild?.id})\``, inline: true },
      { name: "Time", value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
      { name: "Command Usage Channel", value: `${interaction?.channel?.name} \`(${interaction?.channel?.id})\``, inline: true },
      { name: "User Voice Channel", value: `${interaction?.member?.voice?.channel?.name} \`(${interaction?.member?.voice?.channel?.id})\``, inline: true },
  ])
  await client.errorLog.send({ embeds: [embed] }).catch(e => { })
  } else {
  console.log(`
  Command: ${interaction?.commandName}
  Error: ${e}
  User: ${interaction?.user?.tag} (${interaction?.user?.id})
  Guild: ${interaction?.guild?.name} (${interaction?.guild?.id})
  Command Usage Channel: ${interaction?.channel?.name} (${interaction?.channel?.id})
  User Voice Channel: ${interaction?.member?.voice?.channel?.name} (${interaction?.member?.voice?.channel?.id})
  `)
  }
  return interaction.reply({ content: `${lang.error7}\n\`${e}\``, ephemeral: true }).catch(e => { })
  }
},
};
