const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song'),

    execute: async ({ client, interaction }) => {
        // Get the queue for the server
        const queue = client.player.getQueue(interaction.guildId);

        // If there is no queue or nothing is playing, return
        if (!queue || !queue.playing) {
            await interaction.reply({ content: 'There are no songs in the queue', ephemeral: true });
            return;
        }

        const currentSong = queue.current;

        // Skip the current song
        queue.skip();

        // Return an embed to the user saying the song has been skipped
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`${currentSong.title} has been skipped!`)
                    .setThumbnail(currentSong.thumbnail)
            ],
            ephemeral: true
        });
    },
};
