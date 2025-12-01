import { DesktopItem } from "../DesktopIcon";

export const ICON_SIZE = 64;
export const TEXT_HEIGHT = 20;
export const GRID_COLUMNS = 20;

export const getGridDimensions = () => {
  const cellWidth = window.innerWidth / GRID_COLUMNS;
  const gridRows = Math.floor(window.innerHeight / (ICON_SIZE + TEXT_HEIGHT));
  const cellHeight = window.innerHeight / gridRows;
  return { cellWidth, cellHeight };
};

export const snapToGrid = (x: number, y: number) => {
  const { cellWidth, cellHeight } = getGridDimensions();
  const col = Math.round(x / cellWidth);
  const row = Math.round(y / cellHeight);
  return {
    x: col * cellWidth,
    y: row * cellHeight,
  };
};

export const isCellOccupied = (items: DesktopItem[], x: number, y: number, excludeId?: string) => {
  return items.some((item) => 
    Math.abs(item.x - x) < 10 && 
    Math.abs(item.y - y) < 10 && 
    item.id !== excludeId
  );
};

export const findNextAvailablePosition = (items: DesktopItem[], startX: number, startY: number, excludeId: string) => {
  const { cellHeight } = getGridDimensions();
  let snapped = snapToGrid(startX, startY);

  let safetyCounter = 0;
  while (isCellOccupied(items, snapped.x, snapped.y, excludeId) && safetyCounter < 100) {
    snapped.y += cellHeight;
    safetyCounter++;
  }
  return snapped;
};