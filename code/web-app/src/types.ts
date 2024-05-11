
export interface Field {
    id: string;
    name: string;
    type: string;
}

export interface Template {
    id: string;
    name: string;
    template: string;
    fields: Field[];
}

