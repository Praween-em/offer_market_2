export interface ServiceCategory {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    created_at: string;
}

export interface ServiceProvider {
    id: string;
    user_id: string;
    category_id: string;
    display_name: string;
    bio?: string;
    experience_years: number;
    starting_price?: number;
    service_area?: string;
    whatsapp_number?: string;
    phone_number?: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Included relations
    service_categories?: ServiceCategory;
    services?: Service[];
    service_portfolios?: ServicePortfolio[];
}

export interface Service {
    id: string;
    provider_id: string;
    title: string;
    description?: string;
    price?: number;
    price_unit: string;
    is_active: boolean;
    created_at: string;
}

export interface ServicePortfolio {
    id: string;
    provider_id: string;
    image_url: string;
    caption?: string;
    display_order: number;
    created_at: string;
}

export interface ServiceLead {
    id: string;
    provider_id: string;
    user_id?: string;
    user_phone: string;
    user_name?: string;
    service_requested?: string;
    status: 'new' | 'contacted' | 'completed' | 'cancelled';
    created_at: string;
    metadata?: any;
}
