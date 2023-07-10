import { Role } from "@prisma/client";

export class CreateUserDto {
    name: string;
    phone: string;
    email: string;
    password: string;
    About?: string;
    Portfolio?: string;
    attach_photo?: string;
    Street_Address?: string;
    City?: string;
    State?: string;
    Postal_Code?: number;
    Country?: string;
    Position_Last_Held?: string;
    company?: string;
    Start_date?: Date;
    End_date?: Date;
    contract_id?: string[];
    role: Role;
  }
  