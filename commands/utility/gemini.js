const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ai')
		.setDescription('Chat with gemini'),
	async execute(interaction) {
		await interaction.reply(`Pong!`);
	},
};