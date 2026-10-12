// Shared dimensions of the Long Room, used by the scene, the player and the page.

export const HALL = {
  halfWidth: 9, // inner face of the side walls
  aisleHalf: 5, // where the alcoves (and the gallery edge) begin
  zMin: -34,
  zMax: 34,
  galleryY: 6,
  wallTop: 11,
};

// Ground bookcases stand perpendicular to the walls; alcoves sit between them.
export const BOOKCASE_ZS = Array.from({ length: 14 }, (_, i) => -30 + i * 4);
export const ALCOVE_ZS = BOOKCASE_ZS.slice(0, -1).map((z) => z + 2);

// Shelf boards (heights) whose rows show real, titled books: upper then lower.
export const REAL_BOOK_SHELF_YS = [1.9, 1.0];

// Straight staircase from the hall floor up to the entrance-end gallery.
// Player.tsx uses this to glide the avatar up the steps.
export const LONG_ROOM_STAIRS = { centerX: -2.5, startZ: 14, endZ: 26, width: 2.5, rise: HALL.galleryY };

export const SPAWN_POINT = { x: 1.5, y: 2, z: 24 };
