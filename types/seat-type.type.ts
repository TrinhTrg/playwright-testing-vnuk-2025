export enum SeatType {
    HARD_SEAT = 'Hard seat',
    SOFT_SEAT = 'Soft seat',
    SOFT_SEAT_AIR_CONDITIONER = 'Soft seat with air conditioner',
    HARD_BED = 'Hard bed',
    SOFT_BED = 'Soft bed',
    SOFT_BED_AIR_CONDITIONER = 'Soft bed with air conditioner',
  }
  
  export function getSeatTypeFromText(text: string): SeatType | null {
    const seatType = Object.values(SeatType).find((s) => s === text);
    return seatType || null;
  }