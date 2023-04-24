import { SpotifyItemType } from '@lavaclient/spotify'

import type { Addable } from '@lavaclient/queue'
import { type PlayParams } from './types'

export const Play =
  ({ next }: { next: boolean }) =>
    async ({
      userVc,
      send,
      sendIfError,
      userTextChannel,
      bot,
      query,
      guild,
      player,
      requesterId
    }: PlayParams): Promise<void> => {
      let tracks: Addable[] = []
      let msg = ''
      if (query !== '') {
        if (bot.music.spotify.isSpotifyUrl(query)) {
          const item = await bot.music.spotify.load(query)
          switch (item?.type) {
            case SpotifyItemType.Track: {
              const track = await item.resolveYoutubeTrack()
              tracks = [track]
              msg = `Queued track [**${item.name}**](${query}).`
              break
            }
            case SpotifyItemType.Artist: {
              tracks = await item.resolveYoutubeTracks()
              msg = `Queued the **Top ${tracks.length} tracks** for [**${item.name}**](${query}).`
              break
            }
            case SpotifyItemType.Album:
            case SpotifyItemType.Playlist: {
              tracks = await item.resolveYoutubeTracks()
              msg = `Queued **${tracks.length} tracks** from ${SpotifyItemType[item.type].toLowerCase()} [**${
              item.name
            }**](${query}).`
              break
            }
            default: {
              await sendIfError("Sorry, couldn't find anything :/")
              return
            }
          }
        } else {
          const results = await bot.music.rest.loadTracks(/^https?:\/\//.test(query) ? query : `ytsearch:${query}`)

          switch (results.loadType) {
            case 'LOAD_FAILED':
            case 'NO_MATCHES': {
              await sendIfError('uh oh something went wrong')
              return
            }
            case 'PLAYLIST_LOADED': {
              tracks = results.tracks
              msg = `Queued playlist [**${results.playlistInfo.name}**](${query}), it has a total of **${tracks.length}** tracks.`
              break
            }
            case 'TRACK_LOADED':
            case 'SEARCH_RESULT': {
              const [track] = results.tracks
              tracks = [track]
              msg = `Queued [**${track.info.title}**](${track.info.uri})`
              break
            }
          }
        }
      }
      /* create a player and/or join the member's userVc. */
      if (!player?.connected) {
        player ??= bot.music.createPlayer(guild.id)
        player.queue.channel = userTextChannel
        player.connect(userVc.id, { deafened: true })
      }

      /* reply with the queued message. */
      const started = player.playing || player.paused
      if (msg !== '') {
      // TODO: make it better (this checks if play was used to unpause)
        await send(msg, next != null ? 'At the top of the queue.' : '', started)
        player.queue.add(tracks, { requester: requesterId, next })
      } else {
        await send('Resumed playback')
        await player.pause(false)
      }
      /* do queue tings. */
      if (!started) {
        await player.queue.start()
      }
    }
