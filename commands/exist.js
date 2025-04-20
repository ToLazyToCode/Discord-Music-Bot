const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exit')
        .setDescription('Kick the bot from the channel.'),
    execute: async ({ client, interaction }) => {
        // Get the current queue
        const queue = client.player.getPlaylist(interaction.guildId);

        if (!queue || !queue.playing) {
            await interaction.reply({ content: 'There are no songs in the queue', ephemeral: true });
            return;
        }

        // Deletes all the songs from the queue and exits the channel
        queue.destroy();

        await interaction.reply({ content: 'Why you do this to me?', ephemeral: true });
    },
};
