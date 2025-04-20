const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows first 10 songs in the queue'),

    execute: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        // Check if there are songs in the queue
        if (!queue || !queue.playing) {
            await interaction.reply({ content: 'There are no songs in the queue', ephemeral: true });
            return;
        }

        // Get the first 10 songs in the queue
        const queueString = queue.tracks.slice(0, 10).map((song, i) => {
            return `${i + 1}) \`[${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`;
        }).join('\n');

        // Get the current song
        const currentSong = queue.current;

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Currently Playing**\n` +
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>` : 'None') +
                        `\n\n**Queue**\n${queueString}`
                    )
                    .setThumbnail(currentSong.thumbnail)
            ]
        });
    }
};
