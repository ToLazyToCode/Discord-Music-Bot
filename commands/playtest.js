const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playtest')
        .setDescription('Plays a test audio file in the voice channel.'),
    execute: async (interaction) => {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to join a voice channel first!', ephemeral: true });
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        try {
            // Create an audio resource from the local file
            const resource = createAudioResource('./resources/test.mp3');

            // Play the audio resource
            player.play(resource);
            connection.subscribe(player);
            player.on('stateChange', (oldState, newState) => {
                console.log(`Audio player state changed from ${oldState.status} to ${newState.status}`);
            });

            console.log(`Resource volume: ${resource.volume?.volume}`);
            console.log(`Resource duration: ${resource.playbackDuration}`);


            await interaction.reply('Now playing the test audio file!');
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to play the test audio file.', ephemeral: true });
        }
    },
};
