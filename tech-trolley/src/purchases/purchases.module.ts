import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { Purchase } from './purchase.entity';
import { PurchaseItem } from './purchase-item.entity';
import { PurchasePayment } from './purchase-payment.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, PurchaseItem, PurchasePayment]),
    InventoryModule,
    AccountsModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
