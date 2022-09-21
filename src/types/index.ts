export interface AppleMusicOptions {
    cacheTrack?: boolean;
    maxCacheLifeTime?: number;
    convertUnresolved?: boolean;
    /** Default: ["am", "applemusic", "musicapple", "music apple"] */
    querySource?: string[];
}

export interface AppleMusicTrack {
    name: string;
    duration: number;
    uri: string;
    artist: string;
    thumbnail?: string;
}

export interface AppleMusicMetaTagResponse {
    MEDIA_API: {
        token: string;
    }
}
