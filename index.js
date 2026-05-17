require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');

const transcript = require('discord-html-transcripts');
const chalk = require('chalk');

// ================= CONFIG =================
const CANAL_STAFF = '1497349683771740261';
const CANAL_RESULTADO = '1497349704466567302';
const CANAL_LOG = '1497357133342179490';
const ID_CARGO = '1479902109028843630';
const CANAL_BUGS = '1497752334619508888';
const CANAL_SUGESTOES = '1497775083131895838';


// TICKET
const CANAL_TICKET_PAINEL = '1497583571693473823';
const CATEGORIA_TICKET = '1497675491551875113';
const TICKET_TRANSCRIPT = '1497587309481164931';
const CARGOS_SUPORTE = [
  '1499068977098522724', // suporte 1
  '1476575310479622307',      // suporte 2 (se quiser)
];

const CANAL_WELCOME = '1497747609094197338';
const CANAL_GOODBYE = '1488360716472811530';
const COR = 0x09e872;
const COR_SUCESSO = 0x05ff00;
const COR_ERRO = 0xff0000;

const BANNER = 'https://i.imgur.com/p7JBJOq.png';
const LOG_FILE = './allowlist_logs.json';

// ================= LOG =================
function log(type, message, color) {
  const time = new Date().toLocaleTimeString();
  console.log(chalk[color](`[${time}] [${type}] ${message}`));
}

// ================= SALVAR JSON =================
function salvarLog(dados) {
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
    logs.push(dados);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Erro ao salvar log:', err);
  }
}

// ================= TOKEN =================
if (!process.env.TOKEN) {
  log('ERRO', 'TOKEN não encontrado', 'red');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();
client.allowlistData = new Map();

// ================= LOAD COMMANDS =================
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      log('LOAD', `Comando: ${command.data.name}`, 'green');
    }
  }
}

// ================= READY =================
client.on(Events.ClientReady, () => {
  log('BOT', `${client.user.tag} ONLINE`, 'green');
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const canal = member.guild.channels.cache.get(CANAL_WELCOME);
    if (!canal) return;

    const embed = new EmbedBuilder()
      .setTitle('👋 Bem-vindo(a) ao servidor!')
      .setColor(COR)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage(BANNER)
      .setDescription(`Olá ${member}, seja bem-vindo(a) ao **${member.guild.name}**! 🚀`)
      .addFields(
        { name: '📌 Regras', value: 'Leia as regras para evitar punições.', inline: true },
        { name: '🎮 Comunidade', value: 'Interaja e aproveite!', inline: true },
        { name: '👥 Membros', value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: `ID: ${member.id}` })
      .setTimestamp();

    await canal.send({
      content: `👋 ${member}`,
      embeds: [embed]
    });

  } catch (err) {
    console.error('Erro no welcome:', err);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const canal = member.guild.channels.cache.get(CANAL_GOODBYE);
    if (!canal) return;

    const embed = new EmbedBuilder()
      .setTitle('😢 Saiu do servidor')
      .setColor(0x8c46db)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`O usuário **${member.user.tag}** saiu do servidor.`)
      .addFields(
        { name: '👥 Membros restantes', value: `${member.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: `ID: ${member.id}` })
      .setTimestamp();

    await canal.send({
      embeds: [embed]
    });

  } catch (err) {
    console.error('Erro no goodbye:', err);
  }
});

// ================= INTERAÇÕES =================
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    // ===== SLASH =====
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, client);
      return;
    }

    if (interaction.isButton() && interaction.customId === 'abrir_report_bug') {

  const modal = new ModalBuilder()
    .setCustomId('modal_bug')
    .setTitle('Reportar Bug');

  const perguntas = [
    { id: 'como', label: 'Como aconteceu?' },
    { id: 'onde', label: 'Onde aconteceu?' },
    { id: 'detalhe', label: 'Detalhe como aconteceu' },
    { id: 'link', label: 'Link (img/video)' }
  ];

  modal.addComponents(
    ...perguntas.map(p =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(p.id)
          .setLabel(p.label)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      )
    )
  );

  return interaction.showModal(modal);
}

if (interaction.isModalSubmit() && interaction.customId === 'modal_bug') {

  const respostas = {
    como: interaction.fields.getTextInputValue('como'),
    onde: interaction.fields.getTextInputValue('onde'),
    detalhe: interaction.fields.getTextInputValue('detalhe'),
    link: interaction.fields.getTextInputValue('link')
  };

  const canal = client.channels.cache.get(CANAL_BUGS);

  const embed = new EmbedBuilder()
    .setTitle('🐞 NOVO BUG')
    .setColor(0xff0000)
    .addFields(
      { name: '👤 Usuário', value: `<@${interaction.user.id}>` },
      { name: '📍 Onde', value: respostas.onde },
      { name: '⚙️ Como', value: respostas.como },
      { name: '🧠 Detalhe', value: respostas.detalhe },
      { name: '🔗 Link', value: respostas.link },
      { name: '📊 Status', value: '🔴 Não Avaliado' }
    )
    .setFooter({ text: `ID: ${interaction.user.id}` })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('bug_nao_avaliado')
      .setLabel('Não Avaliado')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId('bug_testando')
      .setLabel('Testando')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('bug_corrigido')
      .setLabel('Corrigido')
      .setStyle(ButtonStyle.Success)
  );

  await canal.send({
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content: '✅ Bug enviado com sucesso!',
    flags: 64
  });
}


if (interaction.isButton() && interaction.customId.startsWith('bug_')) {

  const embed = EmbedBuilder.from(interaction.message.embeds[0]);

  let status = '';
  let cor = 0xff0000;

  if (interaction.customId === 'bug_nao_avaliado') {
    status = '🔴 Não Avaliado';
    cor = 0xff0000;
  }

  if (interaction.customId === 'bug_testando') {
    status = '🟡 Testando';
    cor = 0xffff00;
  }

  if (interaction.customId === 'bug_corrigido') {
    status = '🟢 Corrigido';
    cor = 0x00ff00;
  }

  const fields = embed.data.fields.map(f => {
    if (f.name === '📊 Status') {
      return { name: '📊 Status', value: status };
    }
    return f;
  });

  embed.setFields(fields);
  embed.setColor(cor);

  await interaction.update({
    embeds: [embed]
  });
}

const { MessageFlags } = require('discord.js');

const FILE = './votos.json';

function carregar() {
  if (fs.existsSync(FILE)) {
    return new Map(JSON.parse(fs.readFileSync(FILE)));
  }
  return new Map();
}

function salvar() {
  fs.writeFileSync(FILE, JSON.stringify([...votos]));
}

const votos = carregar();



// =====================
// 📌 COMANDO /sugestoes
// =====================
client.on(Events.InteractionCreate, async (interaction) => {

  try {

    // SLASH COMMAND
    if (interaction.isChatInputCommand() && interaction.commandName === 'sugestoes') {

      const canal = interaction.client.channels.cache.get(CANAL_PAINEL);

      if (!canal) {
        return interaction.reply({
          content: '❌ Canal não encontrado.',
          flags: MessageFlags.Ephemeral
        });
      }

      const embed = new EmbedBuilder()
        .setColor(COR)
        .setAuthor({
          name: '💡 Sistema de Sugestões',
          iconURL: interaction.guild.iconURL()
        })
        .setDescription(
`Envie suas ideias para melhorar o servidor!

Clique no botão abaixo para enviar sua sugestão.`
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

      await canal.send({ embeds: [embed], components: [row] });

      return interaction.reply({
        content: '✅ Painel enviado!',
        flags: MessageFlags.Ephemeral
      });
    }

    // =====================
    // 🔘 ABRIR MODAL
    // =====================
    if (interaction.isButton() && interaction.customId === 'abrir_sugestao') {

      const modal = new ModalBuilder()
        .setCustomId('modal_sugestao')
        .setTitle('Nova Sugestão');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('titulo')
            .setLabel('Título')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('descricao')
            .setLabel('Descrição')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('imagem')
            .setLabel('URL da imagem (opcional)')
            .setStyle(TextInputStyle.Short)
        )
      );

      return interaction.showModal(modal);
    }

    // =====================
    // 📨 ENVIAR SUGESTÃO
    // =====================
    if (interaction.isModalSubmit() && interaction.customId === 'modal_sugestao') {

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const titulo = interaction.fields.getTextInputValue('titulo');
      const descricao = interaction.fields.getTextInputValue('descricao');
      const imagem = interaction.fields.getTextInputValue('imagem');

      const embed = new EmbedBuilder()
        .setColor(COR)
        .setAuthor({
          name: '💡 Nova sugestão enviada!',
          iconURL: interaction.user.displayAvatarURL()
        })
        .setDescription(
`**Título:** \`${titulo}\`

\`\`\`
${descricao}
\`\`\``
        )
        .addFields({
          name: '👤 Autor',
          value: `${interaction.user}`,
          inline: true
        })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      if (imagem && imagem.startsWith('http')) {
        embed.setImage(imagem);
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('upvote').setLabel('✅ 0 (0%)').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('downvote').setLabel('❌ 0 (0%)').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('info').setEmoji('❓').setStyle(ButtonStyle.Secondary)
      );

      const canal = interaction.client.channels.cache.get(CANAL_SUGESTOES);

      const msg = await canal.send({ embeds: [embed], components: [row] });

      votos.set(msg.id, { up: 0, down: 0, users: [] });
      salvar();

      return interaction.editReply({ content: '✅ Sugestão enviada!' });
    }

    // =====================
    // 👍 VOTAÇÃO
    // =====================
    if (interaction.isButton() && ['upvote', 'downvote', 'info'].includes(interaction.customId)) {

      const msgId = interaction.message.id;

      // fallback
      if (!votos.has(msgId)) {
        votos.set(msgId, { up: 0, down: 0, users: [] });
      }

      const data = votos.get(msgId);

      if (interaction.customId === 'info') {
        return interaction.reply({
          content: '💡 Você só pode votar uma vez.',
          flags: MessageFlags.Ephemeral
        });
      }

      if (data.users.includes(interaction.user.id)) {
        return interaction.reply({
          content: '❌ Você já votou.',
          flags: MessageFlags.Ephemeral
        });
      }

      if (interaction.customId === 'upvote') data.up++;
      if (interaction.customId === 'downvote') data.down++;

      data.users.push(interaction.user.id);

      const total = data.up + data.down || 1;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('upvote')
          .setLabel(`✅ ${data.up} (${((data.up / total) * 100).toFixed(1)}%)`)
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('downvote')
          .setLabel(`❌ ${data.down} (${((data.down / total) * 100).toFixed(1)}%)`)
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId('info')
          .setEmoji('❓')
          .setStyle(ButtonStyle.Secondary)
      );

      votos.set(msgId, data);
      salvar();

      return interaction.update({ components: [row] });
    }

  } catch (err) {
    console.error(err);

    if (interaction.deferred || interaction.replied) {
      interaction.followUp({
        content: '❌ Erro.',
        flags: MessageFlags.Ephemeral
      }).catch(() => {});
    } else {
      interaction.reply({
        content: '❌ Erro.',
        flags: MessageFlags.Ephemeral
      }).catch(() => {});
    }
  }
});

    // ================= TICKET: ABRIR =================
    if (interaction.isButton() && interaction.customId === 'open_ticket') {


      const guild = interaction.guild;
        const username = interaction.user.username.toLowerCase();

  // 🔍 VERIFICA SE JÁ EXISTE UM TICKET
  const ticketExistente = guild.channels.cache.find(c =>
    c.parentId === CATEGORIA_TICKET &&
    (
    c.name === `ticket-${username}` ||
    c.name === `ticket-doação-${username}`||
    c.name === `ticket-denuncia-${username}`
    )
  );

  if (ticketExistente) {
    return interaction.reply({
      content: `❌ Você já possui um ticket aberto: ${ticketExistente}`,
      flags: 64
    });
  }

const channel = await guild.channels.create({
  name: `ticket-${interaction.user.username.toLowerCase()}`,
  type: ChannelType.GuildText,
  parent: CATEGORIA_TICKET,
  permissionOverwrites: [
    {
      id: guild.id,
      deny: ['ViewChannel']
    },
    {
      id: interaction.user.id,
      allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
    },
    // 👇 LIBERA SUPORTE
    ...CARGOS_SUPORTE.map(roleId => ({
      id: roleId,
      allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
    }))
  ]
});
      

      const embed = new EmbedBuilder()
        .setTitle('🎫 Ticket Aberto')
        .setDescription('Use os botões abaixo para gerenciar o ticket.')
        .setColor(COR);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fechar Ticket')
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId('open_call')
          .setLabel('Abrir Call')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('add_user')
          .setLabel('Adicionar Usuário')
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: `Ticket criado: ${channel}`,
        flags: 64
      });
    }
     // ================= TICKET: DENUNCIA =================
        if (interaction.isButton() && interaction.customId === 'denuncia_ticket') {

      const guild = interaction.guild;
        const username = interaction.user.username.toLowerCase();

  // 🔍 VERIFICA SE JÁ EXISTE UM TICKET
  const ticketExistente = guild.channels.cache.find(c =>
    c.parentId === CATEGORIA_TICKET &&
    (
    c.name === `ticket-${username}` ||
    c.name === `ticket-doação-${username}`||
    c.name === `ticket-denuncia-${username}`
    )
  );

  if (ticketExistente) {
    return interaction.reply({
      content: `❌ Você já possui um ticket aberto: ${ticketExistente}`,
      flags: 64
    });
  }
const channel = await guild.channels.create({
  name: `ticket-denuncia-${interaction.user.username.toLowerCase()}`,
  type: ChannelType.GuildText,
  parent: CATEGORIA_TICKET,
  permissionOverwrites: [
    {
      id: guild.id,
      deny: ['ViewChannel']
    },
    {
      id: interaction.user.id,
      allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
    },
    // 👇 LIBERA SUPORTE
    ...CARGOS_SUPORTE.map(roleId => ({
      id: roleId,
      allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
    }))
  ]
});
      

      const embed = new EmbedBuilder()
        .setTitle('🎫 Ticket Aberto')
        .setDescription('Use os botões abaixo para gerenciar o ticket.')
        .setColor(COR);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fechar Ticket')
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId('open_call')
          .setLabel('Abrir Call')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('add_user')
          .setLabel('Adicionar Usuário')
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: `Ticket Denuncia criado: ${channel}`,
        flags: 64
      });
    }
         // ================= TICKET: FINANCEIRO =================
        if (interaction.isButton() && interaction.customId === 'financeiro_ticket') {

      const guild = interaction.guild;
        const username = interaction.user.username.toLowerCase();

  // 🔍 VERIFICA SE JÁ EXISTE UM TICKET
  const ticketExistente = guild.channels.cache.find(c =>
    c.parentId === CATEGORIA_TICKET &&
    (
    c.name === `ticket-${username}` ||
    c.name === `ticket-doação-${username}`||
    c.name === `ticket-denuncia-${username}`
    )
  );

  if (ticketExistente) {
    return interaction.reply({
      content: `❌ Você já possui um ticket aberto: ${ticketExistente}`,
      flags: 64
    });
  }
const channel = await guild.channels.create({
  name: `ticket-doação-${interaction.user.username.toLowerCase()}`,
  type: ChannelType.GuildText,
  parent: CATEGORIA_TICKET,
  permissionOverwrites: [
    {
      id: guild.id,
      deny: ['ViewChannel']
    },
    {
      id: interaction.user.id,
      allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
    },
    // 👇 LIBERA SUPORTE
    ...CARGOS_SUPORTE.map(roleId => ({
      id: roleId,
      allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
    }))
  ]
});

      const embed = new EmbedBuilder()
        .setTitle('🎫 Ticket Aberto')
        .setDescription('Use os botões abaixo para gerenciar o ticket.')
        .setColor(COR);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fechar Ticket')
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId('open_call')
          .setLabel('Abrir Call')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('add_user')
          .setLabel('Adicionar Usuário')
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({
        content: `Ticket Financeiro criado: ${channel}`,
        flags: 64
      });
    }

    // ================= FECHAR TICKET =================
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
      

  const channel = interaction.channel;
  const member = interaction.member;

  // 🔒 PERMISSÃO: ADMIN OU CARGO ESPECÍFICO
  if (
    !member.permissions.has(PermissionFlagsBits.Administrator) &&
    !member.roles.cache.has('1499068977098522724')
  ) {
    return interaction.reply({
      content: '❌ Você não tem permissão para fechar este ticket.',
      flags: 64
    });
  }
const file = await transcript.createTranscript(channel, {
  limit: -1,
  returnType: 'attachment',
  filename: `transcript-${channel.name}.html`
});

await interaction.reply({
  content: '🔒 Fechando ticket...',
  flags: 64
});

const canalLog = client.channels.cache.get(TICKET_TRANSCRIPT);

if (canalLog) {

  const embed = new EmbedBuilder()
    .setTitle('📄 Transcript de Ticket')
    .setColor(COR)
    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
    .addFields(
      { name: '📁 Ticket', value: channel.name, inline: true },
      { name: '👤 Fechado por', value: `<@${interaction.user.id}>`, inline: true },
      { name: '🕒 Data', value: `<t:${Math.floor(Date.now() / 1000)}:f>` }
    )
    .setFooter({ text: `ID do canal: ${channel.id}` });

  // 📤 ENVIA PRIMEIRO
  const msg = await canalLog.send({
    embeds: [embed],
    files: [file]
  });

  // 🔗 PEGA O LINK DO ARQUIVO
  const attachment = msg.attachments.first();
  if (!attachment) return;

  // 🔘 BOTÃO COM LINK
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('📥 Baixar Transcript')
      .setStyle(ButtonStyle.Link)
      .setURL(attachment.url)
  );

  // ✏️ EDITA A MENSAGEM PARA ADICIONAR BOTÃO
  await msg.edit({
    components: [row]
  });
}

      setTimeout(() => {
        channel.delete().catch(() => null);
      }, 3000);
      
    }

    // ================= ABRIR CALL =================
    if (interaction.isButton() && interaction.customId === 'open_call') {
  const member = interaction.member;

  // 🔒 PERMISSÃO: ADMIN OU CARGO ESPECÍFICO
  if (
    !member.permissions.has(PermissionFlagsBits.Administrator) &&
    !member.roles.cache.has('1499068977098522724')
  ) {
    return interaction.reply({
      content: '❌ Você não tem permissão para abrir call neste ticket.',
      flags: 64
    });
  }

      const voice = await interaction.guild.channels.create({
        name: `call-${interaction.user.username}`,
        type: ChannelType.GuildVoice,
        parent: CATEGORIA_TICKET
      });

      return interaction.reply({
        content: `📞 Call criada: ${voice}`,
        flags: 64
      });
    }

    // ================= ADICIONAR USUÁRIO =================
    if (interaction.isButton() && interaction.customId === 'add_user') {
  const member = interaction.member;

  // 🔒 PERMISSÃO: ADMIN OU CARGO ESPECÍFICO
  if (
    !member.permissions.has(PermissionFlagsBits.Administrator) &&
    !member.roles.cache.has('1499068977098522724')
  ) {
    return interaction.reply({
      content: '❌ Você não tem permissão para adicionar pessoas neste ticket.',
      flags: 64
    });
  }

  //=====================================================================================
      const modal = new ModalBuilder()
        .setCustomId('ticket_add_user')
        .setTitle('Adicionar usuário');

      const input = new TextInputBuilder()
        .setCustomId('user_id')
        .setLabel('ID do usuário')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));

      return interaction.showModal(modal);
    }

// ================= MODAL ADD USER =================
if (interaction.isModalSubmit() && interaction.customId === 'ticket_add_user') {

  const rawInput = interaction.fields.getTextInputValue('user_id');

  // 🔥 limpa @, <@!123>, etc
  const userId = rawInput.replace(/[<@!>]/g, '');

  const channel = interaction.channel;
  const guild = interaction.guild;

  try {
    // 🔍 busca o membro correto
    const targetMember = await guild.members.fetch(userId);

    await channel.permissionOverwrites.create(targetMember, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    return interaction.reply({
      content: `✅ Usuário <@${userId}> adicionado ao ticket!`,
      flags: 64
    });

  } catch (err) {
    console.error(err);

    return interaction.reply({
      content: '❌ Usuário inválido ou não está no servidor.',
      flags: 64
    });
  }
}

        // ===== BOTÃO INICIAR =====
    if (interaction.isButton() && interaction.customId === 'iniciar_allowlist') {

      const modal = new ModalBuilder()
        .setCustomId('allowlistModal')
        .setTitle('Formulário Allowlist');

      const perguntas = [
        { id: 'rdm_vdm', label: 'O que é RDM e VDM?', style: TextInputStyle.Paragraph },
        { id: 'meta_power', label: 'O que é Metagaming e Powergaming?', style: TextInputStyle.Paragraph },
        { id: 'situacao', label: 'Situação: abordado por 2 armados, o que faz?', style: TextInputStyle.Paragraph },
        { id: 'experiencia', label: 'Já jogou RP antes? Se sim, onde?', style: TextInputStyle.Short },
        { id: 'info_pessoal', label: 'Nome real e idade', style: TextInputStyle.Short }
      ];

      modal.addComponents(
        ...perguntas.map(p =>
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId(p.id)
              .setLabel(p.label)
              .setStyle(p.style)
              .setRequired(true)
          )
        )
      );

      return interaction.showModal(modal);
    }

    // ===== MODAL FORM =====
    if (interaction.isModalSubmit() && interaction.customId === 'allowlistModal') {

      const respostas = {
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        rdm_vdm: interaction.fields.getTextInputValue('rdm_vdm'),
        meta_power: interaction.fields.getTextInputValue('meta_power'),
        situacao: interaction.fields.getTextInputValue('situacao'),
        experiencia: interaction.fields.getTextInputValue('experiencia'),
        info: interaction.fields.getTextInputValue('info_pessoal')
      };

      client.allowlistData.set(interaction.user.id, respostas);

      const embed = new EmbedBuilder()
        .setTitle('📋 Nova Allowlist')
        .setColor(COR)
        .addFields(
          { name: 'Usuário', value: `<@${interaction.user.id}>` },
          { name: 'ID', value: interaction.user.id },
          { name: 'Tag', value: interaction.user.tag },
          { name: 'RDM/VDM', value: respostas.rdm_vdm },
          { name: 'Meta/Power', value: respostas.meta_power },
          { name: 'Situação', value: respostas.situacao },
          { name: 'Experiência', value: respostas.experiencia },
          { name: 'Info', value: respostas.info }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`reprovar_${interaction.user.id}`).setLabel('Reprovar').setStyle(ButtonStyle.Danger)
      );

      const canal = client.channels.cache.get(CANAL_STAFF);
      await canal.send({ embeds: [embed], components: [row] });

      await interaction.reply({ content: '✅ Allowlist enviada!', flags: 64 });
    }

    // ===== BOTÕES =====
    if (interaction.isButton()) {

      const [acao, userId] = interaction.customId.split('_');
      const dados = client.allowlistData.get(userId);
      const membro = await interaction.guild.members.fetch(userId).catch(() => null);

      if (!membro) return;

      const canalResultado = client.channels.cache.get('1497610772061098237');
      const canalLog = client.channels.cache.get(CANAL_LOG);
      const avatarBot = interaction.client.user.displayAvatarURL();

      // ===== APROVAR =====
      if (acao === 'aprovar') {

        await membro.roles.add(ID_CARGO);

        const embed = new EmbedBuilder()
          .setTitle('✅ Aprovação')
          .setColor(COR_SUCESSO)
          .setThumbnail(avatarBot)
          .setImage('https://i.imgur.com/r5ClKMh.png')
          .setFooter({ text: 'Direitos reservados Audev' })
          .addFields({ name: 'Usuário', value: `<@${userId}>` });

        await canalResultado.send({ content: `<@${userId}>`, embeds: [embed] });
        await membro.send({ embeds: [embed] }).catch(() => null);

        if (dados) {
          await canalLog.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('LOG - ALLOWLIST')
                .setColor(COR_SUCESSO)
                .addFields(
        { name: 'Usuário', value: `<@${userId}>` },
        { name: 'ID', value: userId },
        { name: 'Tag', value: dados.userTag },

        { name: 'RDM/VDM', value: dados.rdm_vdm },
        { name: 'Meta/Power', value: dados.meta_power },
        { name: 'Situação', value: dados.situacao },
        { name: 'Experiência', value: dados.experiencia },
        { name: 'Info', value: dados.info },

        { name: 'Staff', value: `<@${interaction.user.id}>` }
                )
            ]
          });

          salvarLog({ tipo: 'APROVADO', userId, staff: interaction.user.tag, respostas: dados });
        }

        await interaction.reply({ content: 'Aprovado', flags: 64 });
        await interaction.message.delete().catch(() => null);
        client.allowlistData.delete(userId);
      }

      // ===== REPROVAR =====
      if (acao === 'reprovar') {

        const modal = new ModalBuilder()
          .setCustomId(`modal_reprovar_${userId}`)
          .setTitle('Motivo da reprovação');

        const input = new TextInputBuilder()
          .setCustomId('motivo')
          .setLabel('Motivo')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));

        return interaction.showModal(modal);
      }
    }

    // ===== FINAL REPROVAÇÃO =====
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reprovar_')) {

      const userId = interaction.customId.split('_')[2];
      const motivo = interaction.fields.getTextInputValue('motivo');

      const dados = client.allowlistData.get(userId);
      const membro = await interaction.guild.members.fetch(userId).catch(() => null);

      const canalResultado = client.channels.cache.get('1497610756105961653');
      const canalLog = client.channels.cache.get(CANAL_LOG);
      const avatarBot = interaction.client.user.displayAvatarURL();

      const embed = new EmbedBuilder()
        .setTitle('❌ Reprovação')
        .setColor(COR_ERRO)
        .setThumbnail(avatarBot)
        .setImage('https://i.imgur.com/PhynE8R.png')
        .setFooter({ text: 'Direitos reservados Audev' })
        .addFields(
          { name: 'Usuário', value: `<@${userId}>` },
          { name: 'Motivo', value: motivo }
        );

      await canalResultado.send({ content: `<@${userId}>`, embeds: [embed] });
      if (membro) await membro.send({ embeds: [embed] }).catch(() => null);

      if (dados) {
        await canalLog.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('LOG - ALLOWLIST')
              .setColor(COR_ERRO)
              .addFields(
        { name: 'Usuário', value: `<@${userId}>` },
        { name: 'ID', value: userId },
        { name: 'Tag', value: dados.userTag },

        { name: 'RDM/VDM', value: dados.rdm_vdm },
        { name: 'Meta/Power', value: dados.meta_power },
        { name: 'Situação', value: dados.situacao },
        { name: 'Experiência', value: dados.experiencia },
        { name: 'Info', value: dados.info },

        { name: 'Motivo', value: motivo },
        { name: 'Staff', value: `<@${interaction.user.id}>` }
              )
          ]
        });

        salvarLog({ tipo: 'REPROVADO', userId, motivo, staff: interaction.user.tag, respostas: dados });
      }

      await interaction.reply({ content: 'Reprovado', flags: 64 });

      if (interaction.message) {
        await interaction.message.delete().catch(() => null);
      }

      client.allowlistData.delete(userId);
    }



  } catch (err) {
    log('ERRO', 'Falha em interactionCreate', 'red');
    console.error(err);
  }



});

// LOGIN
client.login(process.env.TOKEN);