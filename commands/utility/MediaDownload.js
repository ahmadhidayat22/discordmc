const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs-extra');
const path = require('path');
const config = require('../../config.json');
const ffmpegPath = require('ffmpeg-static'); // <--- TAMBAHAN 1

// Pastikan folder temp ada
const tempDir = path.join(__dirname, '../../temp_downloads');
fs.ensureDirSync(tempDir);

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('download')
        .setDescription('Download video dari Instagram, YouTube, TikTok, dll')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Link video yang ingin didownload')
                .setRequired(true)),
    
    async execute(interaction) {
        if (config.onlyONEchannel && config.channelid !== interaction.channel.id) {
            const reply = await interaction.reply({ content: `Hanya bisa digunakan di channel <#${config.channelid}>`, ephemeral: true });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 3000);
            return;
        }

        const videoUrl = interaction.options.getString('url');
        await interaction.deferReply();

        const cookiePath = path.join(__dirname, '../../cookies.txt');
        const outputFileName = `video-${interaction.id}.mp4`;
        const outputPath = path.join(tempDir, outputFileName);

        try {
            console.log(`Mulai download: ${videoUrl}`); // Debugging Log

            await youtubedl(videoUrl, {
                output: outputPath,
                noWarnings: true,
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                cookies: fs.existsSync(cookiePath) ? cookiePath : undefined,
                noCheckCertificates: true,
                maxFilesize: '50m',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                
                // --- TAMBAHAN 2: Tentukan lokasi FFmpeg ---
                ffmpegLocation: ffmpegPath 
            });

            if (!fs.existsSync(outputPath)) {
                throw new Error('File hasil merge tidak ditemukan. Cek apakah FFmpeg bekerja.');
            }

            const stats = fs.statSync(outputPath);
            const fileSizeInMegabytes = stats.size / (1024 * 1024);

            // if (fileSizeInMegabytes > 30) { 
            //     await interaction.editReply(`Video terlalu besar (${fileSizeInMegabytes.toFixed(2)} MB). Discord membatasi upload.`);
            //     fs.removeSync(outputPath); 
            //     return;
            // }

            const fileAttachment = new AttachmentBuilder(outputPath, { name: 'video.mp4' });

            await interaction.editReply({
                files: [fileAttachment]
            });

            fs.removeSync(outputPath);

        } catch (error) {
            console.error('Download Error:', error);
            

            const files = fs.readdirSync(tempDir);
            files.forEach(file => {
                if (file.includes(interaction.id)) {
                    fs.removeSync(path.join(tempDir, file));
                }
            });

            let errorMessage = 'Gagal mendownload video.';
            if (error.message && error.message.includes('Sign in to confirm your age')) errorMessage = 'Gagal: Video dibatasi umur/butuh login.';
            
            await interaction.editReply({ content: errorMessage, ephemeral: true });
        }
    },
};