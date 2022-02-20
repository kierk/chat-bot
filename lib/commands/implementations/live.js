const moment = require('moment');
const formatDuration = require('../../chat-utils/format-duration');
const Command = require('../command-interface');
const CommandOutput = require('../command-output');

function live(input, services) {
  return services.dggApi.getStreamInfo().then((data) => {
    const now = moment();
    let totalViewers = 0;
    let twitchViewers = 0;
    let youtubeViewers = 0;
    let startedAt = 0;

    const { twitch } = data;
    const { youtube } = data;

    if (!twitch && !youtube) return new CommandOutput(null, 'Could not retrieve live status.');

    if ((!twitch || !twitch.live) && (!youtube || !youtube.live)) {
      const endedAt = twitch.ended_at ? twitch.ended_at : youtube.ended_at;
      if (endedAt) {
        const formattedDuration = formatDuration(moment.duration(now.diff(endedAt)));
        return new CommandOutput(
          null,
          `Stream was last online ${formattedDuration} ago. Time Streamed: ${formatDuration(
            moment.duration(twitch.duration, 'seconds'),
          )}`,
        );
      }
      return new CommandOutput(null, 'Stream is offline.');
    }

    if (twitch && twitch.live) {
      twitchViewers = parseInt(twitch.viewers, 10);
      totalViewers += twitchViewers;
      startedAt = twitch.started_at;
    }

    if (youtube && youtube.live) {
      youtubeViewers = parseInt(youtube.viewers, 10);
      totalViewers += youtubeViewers;
      startedAt = youtube.started_at;
    }

    const formattedDuration = formatDuration(moment.duration(now.diff(startedAt)));
    if (twitchViewers && youtubeViewers) {
      return new CommandOutput(
        null,
        `Viewers: ${totalViewers}, TTV: ${twitchViewers}, YT: ${youtubeViewers}. Stream live as of ${formattedDuration} ago`,
      );
    }

    return new CommandOutput(
      null,
      `Viewers: ${totalViewers}. Stream live as of ${formattedDuration} ago`,
    );
  });
}

module.exports = new Command(live, true, false, null);
