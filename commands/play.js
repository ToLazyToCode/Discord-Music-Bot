const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const { spawn } = require('child_process');

const queues = new Map();

async function getAudioUrl(videoUrl) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['commands/play.py', videoUrl]);

        pythonProcess.stdout.on('data', (data) => {
            try {
                const result = JSON.parse(data.toString().trim());
                if (result.audio_url) {
                    resolve(result.audio_url);
                } else {
                    reject(result.error || 'Unknown error');
                }
            } catch (error) {
                reject(error);
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`Python process exited with code ${code}`);
            }
        });
    });
}

function processQueue(guildId) {
    const queue = queues.get(guildId);

    if (!queue || queue.songs.length === 0) {
        queues.delete(guildId);
        return;
    }

    const { songs, player } = queue;
    const song = songs.shift();

    getAudioUrl(song.url)
        .then(audioUrl => {
            const resource = createAudioResource(audioUrl, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true,
                ffmpegOptions: {
                    before_options: '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 15 -analyzeduration 0 -probesize 32M -buffer_size 64K',
                    options: '-vn'
                }
            });

            player.play(resource);

            // Ensure song actually starts before marking it as "playing"
            player.on(AudioPlayerStatus.Playing, () => {
                console.log('Playing audio...');
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Finished playing, moving to next song...');
                setTimeout(() => processQueue(guildId), 1000); // Small delay to prevent early stopping
            });
        })
        .catch(error => {
            console.error('Error playing song:', error);
            processQueue(guildId);
        });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music in a voice channel')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL of the YouTube video')
                .setRequired(true)),
    async execute({ interaction }) {
        const videoUrl = interaction.options.getString('url');
        const guildId = interaction.guildId;
        const memberVoiceChannel = interaction.member.voice.channel;

        if (!memberVoiceChannel) {
            return await interaction.reply('You need to join a voice channel first!');
        }

        let queue = queues.get(guildId);
        if (!queue) {
            const connection = joinVoiceChannel({
                channelId: memberVoiceChannel.id,
                guildId: memberVoiceChannel.guild.id,
                adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
            connection.subscribe(player);

            queue = { songs: [], player, connection, isPlaying: false };
            queues.set(guildId, queue);
        }

        queue.songs.push({ url: videoUrl });

        if (!queue.isPlaying) {
            queue.isPlaying = true;
            await interaction.reply('Now playing your music!');
            processQueue(guildId);
        } else {
            await interaction.reply('Song added to the queue!');
        }
    },
};
