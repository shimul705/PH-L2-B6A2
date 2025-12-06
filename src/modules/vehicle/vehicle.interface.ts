export interface IVehicle {
    id?: number;
    vehicle_name: string;
    type: 'car' | 'bike' | 'van' | 'SUV';
    registration_number: string;
    daily_rent_price: number;
    availability_status: 'available' | 'booked';
}

export interface ICreateVehicleRequest {
    vehicle_name: string;
    type: 'car' | 'bike' | 'van' | 'SUV';
    registration_number: string;
    daily_rent_price: number;
    availability_status?: 'available' | 'booked';
}

export interface IUpdateVehicleRequest {
    vehicle_name?: string;
    type?: 'car' | 'bike' | 'van' | 'SUV';
    registration_number?: string;
    daily_rent_price?: number;
    availability_status?: 'available' | 'booked';
}