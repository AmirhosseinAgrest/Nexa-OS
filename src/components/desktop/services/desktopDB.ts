import { openDB } from "idb";
import { DesktopItem } from "../DesktopIcon"; 

const DB_NAME = "nexa-os";
const STORE_NAME = "desktopItems";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

export const desktopDB = {
  async saveItem(item: DesktopItem) {
    const db = await dbPromise;
    return db.put(STORE_NAME, item);
  },

  async deleteItem(id: string) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
  },

  async getAllItems(): Promise<DesktopItem[]> {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },
  
  async saveAllItems(items: DesktopItem[]) {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, "readwrite");
    await Promise.all(items.map(item => tx.store.put(item)));
    await tx.done;
  }
};