import { useState, useEffect, useMemo } from 'react';
import { api } from '$/utils/api';

const MAX_BATCH_SIZE = 12;
const BATCH_INTERVAL = 1000;

const ramCache = new Map();
const pendingRequests = new Map();
const queue = [];
let isProcessing = false;

const DB_NAME = 'SkinCache';
const STORE_NAME = 'skins';

export const resetAllCaches = async () => {
    ramCache.clear();
    pendingRequests.clear();
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).clear();
    } catch (e) {
        indexedDB.deleteDatabase(DB_NAME);
    }
};

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const getFromDisk = async (key) => {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const request = transaction.objectStore(STORE_NAME).get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    } catch { return null; }
};

const saveToDisk = async (key, val) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(val, key);
    } catch {}
};

export const getSkin = async (nameOrNames) => {
    if (Array.isArray(nameOrNames)) {
        return Promise.all(nameOrNames.map(n => getSingleSkin(n)));
    }
    return getSingleSkin(nameOrNames);
};

async function getSingleSkin(name) {
    if (!name) return null;
    if (ramCache.has(name)) return ramCache.get(name);

    const cached = await getFromDisk(name);
    if (cached) {
        ramCache.set(name, cached);
        return cached;
    }

    if (pendingRequests.has(name)) return pendingRequests.get(name).promise;

    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    pendingRequests.set(name, { promise, resolve, reject });
    queue.push(name);

    if (!isProcessing) processQueue();
    return promise;
}

const processQueue = async () => {
    if (queue.length === 0) {
        isProcessing = false;
        return;
    }

    isProcessing = true;
    const batchNames = queue.splice(0, MAX_BATCH_SIZE);

    try {
        const json = await api.requestSkins(batchNames.join(','));
        if (json.skins && Array.isArray(json.skins)) {
            await Promise.all(batchNames.map(async (name) => {
                const req = pendingRequests.get(name);
                if (!req) return;
                try {
                    const skinData = json.skins.find(s => s.name === name) || json.skins[0];
                    if (skinData) {
                        const res = await fetch(skinData.url);
                        const { textures } = await res.json();
                        const skinUrl = textures.SKIN.url;

                        ramCache.set(name, skinUrl);
                        await saveToDisk(name, skinUrl);
                        req.resolve(skinUrl);
                    } else {
                        req.resolve(null);
                    }
                } catch (err) {
                    req.reject(err);
                } finally {
                    pendingRequests.delete(name);
                }
            }));
        }
    } catch (error) {
        batchNames.forEach(name => {
            pendingRequests.get(name)?.reject(error);
            pendingRequests.delete(name);
        });
    }
    setTimeout(processQueue, BATCH_INTERVAL);
};

export const Avatar = ({ username, name, styles }) => {
    const [avatar, setAvatar] = useState(null);

    const hue = useMemo(() => {
        return avatar === null ? stringToHue(username || name) : 0;
    }, [avatar, username, name]);

    useEffect(() => {
        setAvatar(null);
        if (!username) return;

        let isMounted = true;
        getSkin(username).then(async (skinUrl) => {
            if (!skinUrl || !isMounted) return;
            try {
                const head = await getHeadFromSkin(skinUrl, 32);
                if (isMounted) setAvatar(head);
            } catch (e) {
                console.error(e);
            }
        });

        return () => { isMounted = false; };
    }, [username]);

    return (
        <img
        src={avatar || './baby_fox.png'}
        alt={username}
        style={{
            width: 32,
            height: 32,
            borderRadius: '100%',
            backgroundColor: '#223',
            imageRendering: 'pixelated',
            filter: avatar === null ? `hue-rotate(${hue}deg)` : 'none',
            ...styles
        }}
        />
    );
};

const stringToHue = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
    }
    return (hash >>> 0) % 360;
};

export async function getHeadFromSkin(skinUrl, size = 64) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = skinUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 8, 8, 8, 8, 0, 0, size, size);
            ctx.drawImage(img, 40, 8, 8, 8, 0, 0, size, size);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
    });
}
