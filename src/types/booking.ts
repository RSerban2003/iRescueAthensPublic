export interface BookingForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: 'online' | 'instore';
} 