const IMG_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(
    posterPath: string | null,
    size: "w185" | "w342" | "w500" | "w1280" = "w342"
) {
    if (!posterPath) return "";
    return `${IMG_BASE}/${size}${posterPath}`;
}
