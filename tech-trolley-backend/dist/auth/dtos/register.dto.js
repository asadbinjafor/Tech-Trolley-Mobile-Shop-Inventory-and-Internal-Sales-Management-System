"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const user_role_enum_1 = require("../user-role.enum");
class RegisterDto {
    name;
    email;
    password;
    role;
    isActive;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sales Employee' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sales@techtrolley.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'StrongPass1!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8, {
        message: 'Password must contain at least 8 characters.',
    }),
    (0, class_validator_1.MaxLength)(12, {
        message: 'Password must contain no more than 12 characters.',
    }),
    (0, class_validator_1.Matches)(/[A-Z]/, {
        message: 'Password must include at least one uppercase letter.',
    }),
    (0, class_validator_1.Matches)(/[a-z]/, {
        message: 'Password must include at least one lowercase letter.',
    }),
    (0, class_validator_1.Matches)(/[0-9]/, {
        message: 'Password must include at least one number.',
    }),
    (0, class_validator_1.Matches)(/[^A-Za-z0-9\s]/, {
        message: 'Password must include at least one special symbol.',
    }),
    (0, class_validator_1.Matches)(/^\S*$/, {
        message: 'Password must not contain spaces.',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_role_enum_1.UserRole, example: user_role_enum_1.UserRole.SALESPERSON }),
    (0, class_validator_1.IsEnum)(user_role_enum_1.UserRole),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "isActive", void 0);
//# sourceMappingURL=register.dto.js.map