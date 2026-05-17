const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const chalk = require('chalk');

// 🔥 padrão de log
function log(type, message, color) {
  const time = new Date().toLocaleTimeString();
  console.log(chalk[color](`[${time}] [${type}] ${message}`));
}

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

// 🔒 valida pasta
if (!fs.existsSync(foldersPath)) {
  log('ERRO', 'Pasta "commands" não encontrada.', 'red');
  process.exit(1);
}

const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);

  // 🔒 valida subpasta
  if (!fs.lstatSync(commandsPath).isDirectory()) {
    log('AVISO', `Ignorando arquivo fora de pasta: ${folder}`, 'yellow');
    continue;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  if (commandFiles.length === 0) {
    log('AVISO', `Nenhum comando encontrado em: ${folder}`, 'yellow');
    continue;
  }

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        log('LOAD', `Comando carregado: ${command.data.name}`, 'green');
      } else {
        log('ERRO', `Comando inválido: ${filePath}`, 'red');
      }

    } catch (err) {
      log('ERRO', `Falha ao carregar: ${file}`, 'red');
      console.error(err);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    log('DEPLOY', `Iniciando deploy de ${commands.length} comandos...`, 'blue');

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    log('SUCESSO', `${data.length} comandos registrados com sucesso.`, 'green');

  } catch (error) {
    log('ERRO', 'Falha ao registrar comandos.', 'red');
    console.error(error);
  }
})();