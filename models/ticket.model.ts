import { Station } from '../types/station.type';
import { SeatType } from '../types/seat-type.type';

export class Ticket {
  constructor(
    public departDate: Date,
    public departFrom: Station,
    public arriveAt: Station,
    public seatType: SeatType,
    public amount: number
  ) {}

  // Helper method để so sánh 2 tickets
  equals(other: Ticket): boolean {
    return (
      this.departDate.getTime() === other.departDate.getTime() &&
      this.departFrom === other.departFrom &&
      this.arriveAt === other.arriveAt &&
      this.seatType === other.seatType &&
      this.amount === other.amount
    );
  }
}