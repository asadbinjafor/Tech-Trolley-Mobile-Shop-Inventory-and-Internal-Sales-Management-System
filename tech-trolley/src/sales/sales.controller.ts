import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { AddSalePaymentDto } from './dtos/add-payment.dto';
import { JwtAuthGuard } from '../auth/jwtGuard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/user-role.enum';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SALESPERSON)
  @Post()
  @ApiOperation({
    summary: 'Create a sale',
    description:
      'Creates a COMPLETED sale, records the sale items, and issues stock from ' +
      'inventory in a single transaction. The total is computed by the server ' +
      'as subTotal - discount + vat.',
  })
  @ApiBody({ type: CreateSaleDto })
  @ApiCreatedResponse({ description: 'Sale created and stock issued.' })
  @ApiBadRequestResponse({
    description: 'Validation error or insufficient stock.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token.' })
  @ApiForbiddenResponse({ description: 'Insufficient role.' })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    return this.salesService.create(createSaleDto, req.user.id);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SALESPERSON)
  @Get()
  @ApiOperation({ summary: 'List all sales' })
  @ApiOkResponse({ description: 'Array of sales.' })
  findAll() {
    return this.salesService.findAll();
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SALESPERSON)
  @Get(':id')
  @ApiOperation({ summary: 'Get a sale with its items and payments' })
  @ApiParam({ name: 'id', description: 'Sale UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Sale, its items, and its payments.' })
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findOne(id);
  }

  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Post(':id/payments')
  @ApiOperation({
    summary: 'Record a sale payment (customer inflow)',
    description:
      'Records a customer payment against the sale AND credits the chosen ' +
      'financial account (inflow) in a single database transaction. If the ' +
      'account is missing or inactive, nothing is saved (full rollback). ' +
      'Customer dues are still derived from payment rows and remain accurate.',
  })
  @ApiParam({
    name: 'id',
    description: 'Sale UUID to pay against',
    format: 'uuid',
  })
  @ApiBody({
    type: AddSalePaymentDto,
    examples: {
      cash: {
        summary: 'Cash payment',
        value: {
          amount: 50000,
          paymentMethod: 'Cash',
          accountId: 'a3f1c2d4-5678-4abc-9def-0123456789ab',
          transactionId: 'TXN123',
          date: '2026-07-26',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Payment recorded and account balance increased.',
  })
  @ApiBadRequestResponse({
    description:
      'Validation error, sale is returned, amount not positive, or the ' +
      'financial account is missing/inactive (transaction rolled back).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token.' })
  @ApiForbiddenResponse({ description: 'Insufficient role.' })
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  addPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentDto: AddSalePaymentDto,
  ) {
    return this.salesService.addPayment(id, paymentDto);
  }
}
