export const USER = {
  id: 'u-108',
  name: 'Ajeet Sharma',
  batch: 'Batch 1',
  squad: 'Squad 3',
}

export const ORG = {
  employees: 80,
  seats: 50,
  batches: ['Batch 1', 'Batch 2'],
  squads: 10,
}

export const SEATS = Array.from({ length: 50 }, (_, index) => {
  const seatNumber = index + 1
  const isDesignated = seatNumber <= 40

  return {
    id: seatNumber,
    seatNumber: `S-${String(seatNumber).padStart(2, '0')}`,
    type: isDesignated ? 'Designated' : 'Floating',
  }
})

export const RELEASED_SEATS = [9, 17, 28]

export const SAMPLE_BOOKINGS = [
  { seatId: 2, userId: 'u-101', userName: 'Neha', batch: 'Batch 1' },
  { seatId: 6, userId: 'u-102', userName: 'Ravi', batch: 'Batch 1' },
  { seatId: 11, userId: 'u-103', userName: 'Maya', batch: 'Batch 2' },
  { seatId: 21, userId: 'u-104', userName: 'Aman', batch: 'Batch 2' },
  { seatId: 34, userId: 'u-105', userName: 'Dev', batch: 'Batch 1' },
  { seatId: 41, userId: 'u-106', userName: 'Pooja', batch: 'Batch 2' },
  { seatId: 44, userId: 'u-107', userName: 'Sana', batch: 'Batch 1' },
]
