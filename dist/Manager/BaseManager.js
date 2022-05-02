"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseManager = void 0;
const erela_js_1 = require("erela.js");
class BaseManager {
    constructor(resolver) {
        this.resolver = resolver;
        this.baseURL = 'https://api.music.apple.com/v1/catalog/us';
        this.cache = new Map();
    }
    async checkFromCache(id, requester) {
        if (this.cache.has(id) && this.resolver.plugin.options.cacheTrack) {
            const track = this.cache.get(id);
            return this.buildSearch(track.name ? 'PLAYLIST_LOADED' : 'TRACK_LOADED', this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(track.tracks.map((item) => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester))) : track.tracks.map((item) => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester)), undefined, track.name);
        }
    }
    buildSearch(loadType, tracks, error, name) {
        return {
            loadType,
            tracks: tracks ?? [],
            playlist: name ? { name, duration: tracks?.reduce((acc, cur) => acc + (cur.duration || 0), 0) ?? 0 } : undefined,
            exception: error ? { message: error, severity: 'COMMON' } : undefined
        };
    }
    async autoResolveTrack(tracks) {
        const resolvedTracks = await Promise.all(tracks.map(async (track) => {
            try {
                await track.resolve();
            }
            catch (_e) {
                return null;
            }
            return track;
        }).filter((track) => Boolean(track)));
        return resolvedTracks.filter((track) => track !== null);
    }
    buildUnresolved(track) {
        return {
            uri: track.uri,
            title: track.name,
            author: track.artist,
            duration: track.duration
        };
    }
}
exports.BaseManager = BaseManager;
