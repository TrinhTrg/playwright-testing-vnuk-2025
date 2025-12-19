export enum Station {
    SAI_GON = 'Sài Gòn',
    PHAN_THIET = 'Phan Thiết',
    HUE = 'Huế',
    DA_NANG = 'Đà Nẵng',
    QUANG_NGAI = 'Quảng Ngãi',
    NHA_TRANG = 'Nha Trang',
  }
  
  export function getStationFromText(text: string): Station | null {
    const station = Object.values(Station).find((s) => s === text);
    return station || null;
  }