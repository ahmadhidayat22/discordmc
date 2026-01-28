const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const configManager = require('../../configManager');

module.exports = {
    cooldown: 0,
    data: new SlashCommandBuilder()
        .setName('initial-setup')
        .setDescription('Initial bot setup (run this first)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const guild = interaction.guild;
        const config = await configManager.get();

        // Update guild ID and client ID
        await configManager.update('guildId', guild.id);
        await configManager.update('clientId', interaction.client.user.id);

        // Create embed with setup instructions
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🎉 Bot Setup Complete!')
            .setDescription('Basic configuration has been set up. Here are the next steps:')
            .addFields(
                {
                    name: '📝 Current Settings',
                    value: `• Guild ID: \`${guild.id}\`\n• Bot ID: \`${interaction.client.user.id}\`\n• Default Prefix: \`${config.prefix}\``
                },
                {
                    name: '⚙️ Recommended Setup Commands',
                    value: 'Run these commands to customize your bot:\n' +
                        '1. `/setup channel` - Set download channel\n' +
                        '2. `/setup adminrole` - Set admin role\n' +
                        '3. `/setup logchannel` - Set log channel\n' +
                        '4. `/setup view` - View all settings'
                },
                {
                    name: '🚀 Deploy Commands',
                    value: 'Run `node deploy-commands.js` in your terminal to register all slash commands.'
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Bot is ready to use!' });

        await interaction.editReply({ embeds: [embed] });
    },
};