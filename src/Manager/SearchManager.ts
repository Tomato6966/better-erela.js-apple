import { SearchResult, TrackUtils } from 'erela.js'
import { fetch } from 'undici'
import { BaseManager } from './BaseManager'

export class SearchManager extends BaseManager {
  public async fetch (query: string, requester: unknown): Promise<SearchResult> {
    try {
      if (!this.resolver.token) await this.resolver.fetchAccessToken()

      const response = await fetch(`${this.baseURL}/search?types=songs,music-videos&term=${query.replaceAll(" ", "+")}`, { headers: { Authorization: this.resolver.token ?? '', referer: 'https://music.apple.com', origin: 'https://music.apple.com' } })

      if (response.status === 401) {
        await this.resolver.fetchAccessToken()
        return this.fetch(id, requester)
      }

      const data = await response.json() as APIREsponse
      if (data.errors && !data.results) return this.buildSearch('NO_MATCHES', undefined, 'Could not find any suitable track(s), unexpected apple music response', undefined)
      const resData = [...(data.results.songs?.data||[]), ...(data.results["music-videos"]?.data||[])]
      const filteredData = resData?.filter((x) => x.type === 'music-videos' || x.type === "songs")
      if(!filteredData) return this.buildSearch('NO_MATCHES', undefined, 'Could not find any suitable track(s), unexpected apple music response', undefined)
      if (this.resolver.plugin.options.cacheTrack) {
        for(const track of filteredData) {
            this.cache.set(track.id, {
                tracks: [{
                  name: track.attributes.name, uri: track.attributes.url, artist: track.attributes.artistName, duration: track.attributes.durationInMillis, thumbnail: track.attributes.artwork?.url
                }]
            })
        }
      }
      return this.buildSearch('TRACK_LOADED', this.resolver.plugin.options.convertUnresolved
        ? await this.autoResolveTrack(filteredData.map(x => 
            TrackUtils.buildUnresolved(this.buildUnresolved({
                name: x.attributes.name, uri: x.attributes.url, artist: x.attributes.artistName, duration: x.attributes.durationInMillis, thumbnail: x.attributes.artwork?.url
              }), requester)))
        : filteredData.map(x => 
            TrackUtils.buildUnresolved(this.buildUnresolved({
                name: x.attributes.name, uri: x.attributes.url, artist: x.attributes.artistName, duration: x.attributes.durationInMillis, thumbnail: x.attributes.artwork?.url
              }), requester)), undefined, undefined)
    } catch (e) {
      return this.buildSearch('NO_MATCHES', undefined, 'Could not find any suitable track(s), unexpected apple music response', undefined)
    }
  }
}

interface APIREsponse {
    errors?: unknown[];
    results?: {
        id: string;
        type: 'music-videos'|"songs";
        songs: any;
        "music-videos": any,
    }[]
}
