import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'TripExplorerDB';
const DB_VERSION = 1;
const LINES_STORE_NAME = 'lines';

export interface LineDefinition {
  id: string; // Unique ID for the line (e.g., UUID)
  name: string; // User-defined name for the line/trip
  projectName: string; // Associates the line with a project
  poiIds: string[]; // Ordered list of POI IDs (feature.properties.id) that make up the waypoints
  // Optional: Add fields like createdAt, updatedAt if needed
}

interface TripExplorerDBSchema extends DBSchema {
  [LINES_STORE_NAME]: {
    key: string; // 'id' of LineDefinition
    value: LineDefinition;
    indexes: { 'projectName_idx': string }; // Index by projectName
  };
}

let dbPromise: Promise<IDBPDatabase<TripExplorerDBSchema>> | null = null;

const getDB = (): Promise<IDBPDatabase<TripExplorerDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<TripExplorerDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
        if (!db.objectStoreNames.contains(LINES_STORE_NAME)) {
          const linesStore = db.createObjectStore(LINES_STORE_NAME, { keyPath: 'id' });
          linesStore.createIndex('projectName_idx', 'projectName');
          console.log(`Object store '${LINES_STORE_NAME}' created.`);
        }
        // Handle other version upgrades here if needed in the future
      },
    });
  }
  return dbPromise;
};


export const addLineToDB = async (line: LineDefinition): Promise<void> => {
  const db = await getDB();
  await db.put(LINES_STORE_NAME, line);
};

export const getLinesFromDB = async (projectName: string): Promise<LineDefinition[]> => {
  const db = await getDB();
  return db.getAllFromIndex(LINES_STORE_NAME, 'projectName_idx', projectName);
};

export const updateLineInDB = async (line: LineDefinition): Promise<void> => {
  const db = await getDB();
  // 'put' also works for updates if the key exists
  await db.put(LINES_STORE_NAME, line);
};

export const deleteLineFromDB = async (lineId: string): Promise<void> => {
  const db = await getDB();
  await db.delete(LINES_STORE_NAME, lineId);
};

// Potentially a function to get a single line by ID, if needed later
export const getLineByIdFromDB = async (lineId: string): Promise<LineDefinition | undefined> => {
  const db = await getDB();
  return db.get(LINES_STORE_NAME, lineId);
};

// Example of how to clear lines for a project (e.g., if a project is deleted)
export const clearLinesForProjectFromDB = async (projectName: string): Promise<void> => {
  const db = await getDB();
  const linesToDelete = await db.getAllFromIndex(LINES_STORE_NAME, 'projectName_idx', projectName);
  const tx = db.transaction(LINES_STORE_NAME, 'readwrite');
  await Promise.all(linesToDelete.map(line => tx.store.delete(line.id)).concat(tx.done));
};
