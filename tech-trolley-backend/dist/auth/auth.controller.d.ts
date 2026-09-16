import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
    register(registerDto: RegisterDto): Promise<import("../users/entities/users.entity").User>;
    logout(): {
        message: string;
    };
    getMe(req: any): any;
}
