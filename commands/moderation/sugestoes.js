const { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

const CANAL_PAINEL = '1497764687406956654';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sugestoes')
    .setDescription('Enviar painel de sugestões')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    const canal = interaction.client.channels.cache.get(CANAL_PAINEL);

    if (!canal) {
      return interaction.reply({
        content: '❌ Canal não encontrado.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setAuthor({
        name: '💡 Sistema de Sugestões',
        iconURL: interaction.guild.iconURL()
      })
      .setDescription(
`Envie suas ideias para melhorar o servidor!

Clique no botão abaixo e preencha o formulário com sua sugestão.

> Sua opinião é importante para nós 🚀`
      )
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({
        text: `${interaction.guild.name} • Sistema de Sugestões`
      })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('abrir_sugestao')
      .setLabel('Enviar sugestão')
      .setEmoji('💡')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await canal.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: '✅ Painel enviado com sucesso!',
      ephemeral: true
    });
  }
};