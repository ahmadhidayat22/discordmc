const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const MediaDownloader = require('media-downloader-ez'); // Make sure this path is correct
const config = require('../../config.json'); // Make sure this path is correct
require('dotenv').config();
const ytbCookie = process.env.YTBCookie || "";

// Helper function for deleting messages
function deleteMessage(message, delay = 3000) {
    if (!message || !message.delete) return;
    setTimeout(() => {
        message.delete().catch(console.error);
    }, delay);
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('download')
        .setDescription('Download videos from social media (Instagram, YouTube, TikTok, X, Facebook)')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL of the video to download')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('crop')
                .setDescription('Crop the video (default: from config)')
                .setRequired(false)),
    async execute(interaction) {
        // Check if command is only allowed in specific channel
        if (config.onlyONEchannel && config.channelid !== interaction.channel.id) {
            const reply = await interaction.reply({
                content: `Only in channel <#${config.channelid}>`,
                ephemeral: true
            });
            setTimeout(() => interaction.deleteReply().catch(console.error), 3000);
            return;
        }

        // Get options from interaction
        const videoUrl = interaction.options.getString('url');
        const cropOption = interaction.options.getBoolean('crop');
        
        // Check if URL is valid
        if (!MediaDownloader.isVideoLink(videoUrl)) {
            const reply = await interaction.reply({
                content: 'Please specify a valid video URL from Instagram, YouTube, X, TikTok, Facebook...',
                ephemeral: true
            });
            setTimeout(() => interaction.deleteReply().catch(console.error), 3000);
            return;
        }

        // Defer reply since download might take time
        await interaction.deferReply();

        try {
            // Download the video
            let attachment;
            if (cropOption !== null) {
                // Use explicit crop option if provided
                attachment = await MediaDownloader(videoUrl, { autocrop: cropOption, YTBmaxduration: 160, });
            } else {
                // Use config setting
                attachment = await MediaDownloader(videoUrl, { autocrop: config.autoCropVideos, YTBmaxduration: 160, });
            }

            // Convert to Discord Attachment
            const discordAttachment = new AttachmentBuilder(attachment.path || attachment, {
                name: 'video.mp4'
            });

            // Send the downloaded video
            await interaction.editReply({
                // content: `Downloaded by: \`${interaction.user.username}\``,
                files: [discordAttachment]
            });

        } catch (error) {
            console.error('Download error:', error);
            await interaction.editReply({
                content: 'Error downloading video. Please check the URL and try again.',
                ephemeral: true
            });
        }
    },
};
