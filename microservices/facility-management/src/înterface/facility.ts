export interface Facility {
    tenantId: string;
    name: string;
    maxCapacity: number;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    floor: number[];
    facilityId: string;
}