const configManager = require('./configManager');

class Logger {
    constructor(client) {
        this.client = client;
    }

    // Fungsi untuk mengirim log ke channel
    async sendToLogChannel(content, embed = null) {
        try {
            const logChannelId = await configManager.get('logChannel');
            if (!logChannelId) {
                console.log('📝 [Console Only]', content);
                return false;
            }

            const channel = await this.client.channels.fetch(logChannelId);
            if (!channel) {
                console.error('❌ Log channel not found:', logChannelId);
                return false;
            }

            const messageContent = {
                content: content.length > 2000 ? content.substring(0, 1997) + '...' : content
            };

            if (embed) {
                messageContent.embeds = [embed];
            }

            await channel.send(messageContent);
            return true;
        } catch (error) {
            console.error('❌ Error sending log:', error);
            return false;
        }
    }

    // Log untuk command execution
    async logCommand(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const embed = {
            color: 0x0099FF,
            title: '🎯 Command Executed',
            fields: [
                {
                    name: 'Command',
                    value: `\`/${interaction.commandName}\``,
                    inline: true
                },
                {
                    name: 'User',
                    value: `${interaction.user.tag} (${interaction.user.id})`,
                    inline: true
                },
                {
                    name: 'Channel',
                    value: `<#${interaction.channel.id}>`,
                    inline: true
                },
                {
                    name: 'Guild',
                    value: interaction.guild?.name || 'DM',
                    inline: true
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Command Logger'
            }
        };

        await this.sendToLogChannel(
            `📝 **Command**: \`/${interaction.commandName}\` by **${interaction.user.tag}** in <#${interaction.channel.id}>`,
            embed
        );
    }

    // Log untuk message commands
    async logMessageCommand(message, commandName) {
        const embed = {
            color: 0x7289DA,
            title: '💬 Message Command',
            fields: [
                {
                    name: 'Command',
                    value: `\`${commandName}\``,
                    inline: true
                },
                {
                    name: 'User',
                    value: `${message.author.tag} (${message.author.id})`,
                    inline: true
                },
                {
                    name: 'Channel',
                    value: `<#${message.channel.id}>`,
                    inline: true
                },
                {
                    name: 'Content',
                    value: message.content.length > 500 
                        ? message.content.substring(0, 497) + '...' 
                        : message.content,
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Message Command Logger'
            }
        };

        await this.sendToLogChannel(
            `💬 **Message Command**: \`${commandName}\` by **${message.author.tag}**`,
            embed
        );
    }

    // Log untuk download success
    async logDownloadSuccess(user, url, platform) {
        const embed = {
            color: 0x00FF00,
            title: '✅ Download Success',
            fields: [
                {
                    name: 'User',
                    value: `${user.tag} (${user.id})`,
                    inline: true
                },
                {
                    name: 'Platform',
                    value: platform || 'Unknown',
                    inline: true
                },
                {
                    name: 'URL',
                    value: url.length > 100 ? url.substring(0, 97) + '...' : url,
                    inline: false
                },
                {
                    name: 'Time',
                    value: `<t:${Math.floor(Date.now() / 1000)}:T>`,
                    inline: true
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Download Logger'
            }
        };

        await this.sendToLogChannel(
            `✅ **Download Success**: ${user.tag} downloaded from ${platform || 'unknown platform'}`,
            embed
        );
    }

    // Log untuk download error
    async logDownloadError(user, url, error) {
        const embed = {
            color: 0xFF0000,
            title: '❌ Download Failed',
            fields: [
                {
                    name: 'User',
                    value: `${user.tag} (${user.id})`,
                    inline: true
                },
                {
                    name: 'URL',
                    value: url.length > 100 ? url.substring(0, 97) + '...' : url,
                    inline: false
                },
                {
                    name: 'Error',
                    value: error.message.length > 500 
                        ? error.message.substring(0, 497) + '...' 
                        : error.message,
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Error Logger'
            }
        };

        await this.sendToLogChannel(
            `❌ **Download Failed**: ${user.tag} - ${error.message}`,
            embed
        );
    }

    // Log untuk config changes
    async logConfigChange(user, action, key, oldValue, newValue) {
        const embed = {
            color: 0xFFA500,
            title: '⚙️ Configuration Changed',
            fields: [
                {
                    name: 'Admin',
                    value: `${user.tag} (${user.id})`,
                    inline: true
                },
                {
                    name: 'Action',
                    value: action,
                    inline: true
                },
                {
                    name: 'Setting',
                    value: `\`${key}\``,
                    inline: true
                },
                {
                    name: 'Old Value',
                    value: String(oldValue).length > 100 
                        ? String(oldValue).substring(0, 97) + '...' 
                        : String(oldValue),
                    inline: false
                },
                {
                    name: 'New Value',
                    value: String(newValue).length > 100 
                        ? String(newValue).substring(0, 97) + '...' 
                        : String(newValue),
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Config Logger'
            }
        };

        await this.sendToLogChannel(
            `⚙️ **Config Updated**: ${user.tag} changed \`${key}\` from \`${oldValue}\` to \`${newValue}\``,
            embed
        );
    }

    // Log untuk bot events
    async logEvent(event, description) {
        const embed = {
            color: 0x9B59B6,
            title: `📊 ${event}`,
            description: description,
            timestamp: new Date(),
            footer: {
                text: 'Event Logger'
            }
        };

        await this.sendToLogChannel(`📊 **${event}**: ${description}`, embed);
    }
}

module.exports = Logger;