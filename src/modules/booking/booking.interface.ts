export interface IBooking {
    id: number;
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
    total_price: number;
    status: 'active' | 'cancelled' | 'returned';
}

export interface ICreateBookingRequest {
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
}

export interface IUpdateBookingRequest {
    status: 'cancelled' | 'returned';
}

export interface IBookingWithDetails extends IBooking {
    vehicle?: {
        vehicle_name: string;
        daily_rent_price?: number;
        registration_number?: string;
        type?: string;
        availability_status?: string;
    };
    customer?: {
        name: string;
        email: string;
    };
}