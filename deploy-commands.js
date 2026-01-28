const { REST, Routes } = require('discord.js');
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const configManager = require('./configManager');

const token = process.env.TOKEN || "";
const clientId = process.env.clientId || "";
const guildId = process.env.guildId || "";
if (!token) {
	console.error('TOKEN is not defined in environment variables');
	process.exit(1);
}

if (!clientId) {
	console.error('CLIENT_ID is not defined in environment variables');
	process.exit(1);
}

if (!guildId) {
	console.error('GUILD_ID is not defined in environment variables');
	process.exit(1);
}



// and deploy your commands!
(async () => {
	try {
		const config = configManager.load();

		// Validate config
		// if (!config.clientId || config.clientId === "") {
		// 	console.error('❌ Client ID is not set in config.json');
		// 	console.log('💡 Run the bot first and use /initial-setup command');
		// 	process.exit(1);
		// }

		const commands = [];
		// Grab all the command folders from the commands directory you created earlier
		const foldersPath = path.join(__dirname, 'commands');
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			// Grab all the command files from the commands directory you created earlier
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
			// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);
				if ('data' in command && 'execute' in command) {
					commands.push(command.data.toJSON());
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}

		// Construct and prepare an instance of the REST module
		const rest = new REST().setToken(token);

		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		if (error.code === 50035) {
			console.log('\n💡 Possible solutions:');
			console.log('   1. Make sure your CLIENT_ID is correct');
			console.log('   2. Make sure your TOKEN is valid');
			console.log('   3. Make sure your bot is added to the guild');
		}
		console.error(error);
	}
})();