import { STORAGE_KEYS } from "./storage";

export type WishItem = {
    id: number;
    title: string;
    poster_path: string | null;
};

export function loadWishlist(): WishItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
        return raw ? (JSON.parse(raw) as WishItem[]) : [];
    } catch {
        return [];
    }
}

export function saveWishlist(items: WishItem[]) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items));
}

export function toggleWish(item: WishItem) {
    const list = loadWishlist();
    const exists = list.some((x) => x.id === item.id);
    const next = exists ? list.filter((x) => x.id !== item.id) : [item, ...list];
    saveWishlist(next);
    return next;
}
