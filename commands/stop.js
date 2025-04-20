const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Pauses the current song'),
    execute: async ({ client, interaction }) => {
        // Get the queue for the server
        const queue = client.player.getPlaylist(interaction.guildId);

        // Check if the queue is empty or not playing
        if (!queue || !queue.playing) {
            await interaction.reply({ content: 'There are no songs in the queue', ephemeral: true });
            return;
        }

        // Pause the current song
        queue.setPaused(true);

        await interaction.reply({ content: 'Player has been paused.', ephemeral: true });
    },
};
