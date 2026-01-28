const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const configManager = require('../../configManager');

module.exports = {
    cooldown : 0,
    data: new SlashCommandBuilder()
            .setName('help')
            .setDescription("show all command list"),

    async execute(interaction){
        const helpEmbed = {
            color: 0x0099ff,
            title: 'Bot Help',
            description: 'Available commands:',
            fields: [
                {
                    name: '📥 Download Commands',
                    value: '• `/download <url>` - Slash command version\n• Add "crop" after URL to crop video'
                },
                {
                    name: '⚙️ Setup Commands',
                    value: '• `/setup` - Configure bot settings\n• `/initial-setup` - First-time setup'
                },
                {
                    name: '🔄 Other Commands',
                    value: '• `/ping` - Slash command version'
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Use slash commands (/) for better experience'
            }
        };
        await interaction.reply({
            embeds: [helpEmbed]

        })
    }



}