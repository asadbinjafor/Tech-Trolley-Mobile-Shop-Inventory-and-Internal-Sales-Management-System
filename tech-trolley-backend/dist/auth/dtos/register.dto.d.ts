import { UserRole } from '../user-role.enum';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive?: boolean;
}
