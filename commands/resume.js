const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the current song'),
    execute: async ({ client, interaction }) => {
        // Get the queue for the server
        const queue = client.player.getQueue(interaction.guildId);

        // Check if the queue is empty or not playing
        if (!queue || !queue.playing) {
            await interaction.reply({ content: 'No songs in the queue', ephemeral: true });
            return;
        }

        // Resume the current song
        queue.setPaused(false);

        await interaction.reply({ content: 'Player has been resumed.', ephemeral: true });
    },
};
