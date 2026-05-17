const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Envia o painel de tickets")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {

    const TICKET_CHANNEL = "1497583571693473823";

    try {
      const channel = await client.channels.fetch(TICKET_CHANNEL).catch(() => null);

      if (!channel) {
        return interaction.reply({
          content: "❌ Canal de ticket não encontrado. Verifique o ID.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎫 Sistema de Tickets")
        .setDescription(
          "📌 Clique no botão abaixo para abrir um ticket.\n\n" +
          "💬 Use este sistema apenas para suporte ou dúvidas."
        )
        .setColor(0x2ba5fb)
        .setFooter({ text: "Sistema de Atendimento" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("open_ticket")
          .setLabel("Abrir Ticket")
          .setEmoji("🎫")
          .setStyle(ButtonStyle.Success)
      );

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: "✅ Painel de ticket enviado com sucesso!",
        ephemeral: true
      });

    } catch (err) {
      console.error("Erro no comando ticket:", err);

      return interaction.reply({
        content: "❌ Ocorreu um erro ao enviar o painel de ticket.",
        ephemeral: true
      });
    }
  }
};