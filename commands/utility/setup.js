const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const configManager = require('../../configManager');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure the bot settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Set the channel for downloads')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to use for downloads')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Toggle channel restriction')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable/disable channel restriction')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('autocrop')
                .setDescription('Toggle auto-crop for videos')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable/disable auto-crop')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('prefix')
                .setDescription('Set the prefix for message commands')
                .addStringOption(option =>
                    option.setName('prefix')
                        .setDescription('The new prefix (1 character)')
                        .setRequired(true)
                        .setMaxLength(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('adminrole')
                .setDescription('Set the admin role for bot management')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to use as admin')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('logchannel')
                .setDescription('Set the channel for bot logs')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel for logs')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset all settings to default')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const config = await configManager.get();

        try {
            switch (subcommand) {
                case 'channel': {
                    const channel = interaction.options.getChannel('channel');
                    await configManager.update('channelid', channel.id);
                    await configManager.update('onlyONEchannel', true);

                    await interaction.editReply({
                        content: `✅ Download channel set to: ${channel}\n🔒 Channel restriction enabled.`
                    });
                    break;
                }

                case 'toggle': {
                    const enabled = interaction.options.getBoolean('enabled');
                    await configManager.update('onlyONEchannel', enabled);

                    if (enabled && !config.channelid) {
                        await interaction.editReply({
                            content: `✅ Channel restriction enabled.\n⚠️ Please set a channel using \`/setup channel\``
                        });
                    } else {
                        await interaction.editReply({
                            content: `✅ Channel restriction ${enabled ? 'enabled' : 'disabled'}.`
                        });
                    }
                    break;
                }

                case 'autocrop': {
                    const enabled = interaction.options.getBoolean('enabled');
                    await configManager.update('autoCropVideos', enabled);

                    await interaction.editReply({
                        content: `✅ Auto-crop ${enabled ? 'enabled' : 'disabled'}.`
                    });
                    break;
                }

                case 'prefix': {
                    const prefix = interaction.options.getString('prefix');
                    await configManager.update('prefix', prefix);

                    await interaction.editReply({
                        content: `✅ Command prefix set to: \`${prefix}\``
                    });
                    break;
                }

                case 'adminrole': {
                    const role = interaction.options.getRole('role');
                    await configManager.update('adminRole', role.id);

                    await interaction.editReply({
                        content: `✅ Admin role set to: ${role}`
                    });
                    break;
                }

                case 'logchannel': {
                    const channel = interaction.options.getChannel('channel');
                    await configManager.update('logChannel', channel.id);

                    await interaction.editReply({
                        content: `✅ Log channel set to: ${channel}`
                    });
                    const testEmbed = {
                        color: 0x00FF00,
                        title: '📋 Log System Activated',
                        description: `Log channel has been configured by ${interaction.user}`,
                        fields: [
                            {
                                name: '👤 Configured By',
                                value: `${interaction.user.tag} (${interaction.user.id})`,
                                inline: true
                            },
                            {
                                name: '📅 Date',
                                value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                                inline: true
                            }
                        ],
                        footer: {
                            text: 'Bot logging system'
                        },
                        timestamp: new Date()
                    };

                    await channel.send({
                        content: '✅ **Log system initialized!**',
                        embeds: [testEmbed]
                    });
                    break;
                }

                case 'view': {
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('Bot Configuration')
                        .setDescription('Current settings:')
                        .addFields(
                            {
                                name: '📝 Prefix',
                                value: `\`${config.prefix || '!'}\``,
                                inline: true
                            },
                            {
                                name: '🔒 Channel Restriction',
                                value: config.onlyONEchannel ? 'Enabled' : 'Disabled',
                                inline: true
                            },
                            {
                                name: '📁 Download Channel',
                                value: config.channelid ? `<#${config.channelid}>` : 'Not set',
                                inline: true
                            },
                            {
                                name: '✂️ Auto-crop',
                                value: config.autoCropVideos ? 'Enabled' : 'Disabled',
                                inline: true
                            },
                            {
                                name: '👑 Admin Role',
                                value: config.adminRole ? `<@&${config.adminRole}>` : 'Not set',
                                inline: true
                            },
                            {
                                name: '📋 Log Channel',
                                value: config.logChannel ? `<#${config.logChannel}>` : 'Not set',
                                inline: true
                            }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Use /setup to modify settings' });

                    await interaction.editReply({ embeds: [embed] });
                    break;
                }

                case 'reset': {
                    await configManager.reset();

                    await interaction.editReply({
                        content: '✅ All settings have been reset to default values.'
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('Setup command error:', error);
            await interaction.editReply({
                content: '❌ An error occurred while updating the configuration.'
            });
        }
    },
};