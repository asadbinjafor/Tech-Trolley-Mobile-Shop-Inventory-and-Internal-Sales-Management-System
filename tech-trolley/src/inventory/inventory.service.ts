import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryUnit } from './inventory-units.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryUnit)
    private inventoryRepository: Repository<InventoryUnit>,
  ) {}

  async receiveStock(purchaseId: string, items: any[]): Promise<void> {
    for (const item of items) {
      if (item.imeis && item.imeis.length > 0) {
        for (const imei of item.imeis) {
          const unit = this.inventoryRepository.create({
            variantId: item.variantId,
            imei,
            quantity: 1,
            purchaseId,
            status: 'IN_STOCK',
          });
          await this.inventoryRepository.save(unit);
        }
      } else {
        const unit = this.inventoryRepository.create({
          variantId: item.variantId,
          quantity: item.quantity,
          purchaseId,
          status: 'IN_STOCK',
        });
        await this.inventoryRepository.save(unit);
      }
    }
  }

  async checkAvailability(variantId: string, quantity: number): Promise<boolean> {
    const units = await this.inventoryRepository.find({
      where: { variantId, status: 'IN_STOCK' },
    });
    const available = units.reduce((acc, curr) => acc + curr.quantity, 0);
    return available >= quantity;
  }

  async issueStock(saleId: string, items: any[]): Promise<void> {
    for (const item of items) {
      if (item.imeis && item.imeis.length > 0) {
        for (const imei of item.imeis) {
          const unit = await this.inventoryRepository.findOne({ where: { imei, status: 'IN_STOCK' } });
          if (!unit) throw new BadRequestException(`IMEI ${imei} is not available in stock`);
          unit.status = 'SOLD';
          unit.saleId = saleId;
          await this.inventoryRepository.save(unit);
        }
      } else {
        const availableUnits = await this.inventoryRepository.find({
          where: { variantId: item.variantId, status: 'IN_STOCK' },
        });
        let remaining = item.quantity;
        for (const unit of availableUnits) {
          if (remaining <= 0) break;
          if (unit.quantity <= remaining) {
            remaining -= unit.quantity;
            unit.status = 'SOLD';
            unit.saleId = saleId;
            await this.inventoryRepository.save(unit);
          } else {
            const newUnit = this.inventoryRepository.create({
              variantId: item.variantId,
              quantity: unit.quantity - remaining,
              purchaseId: unit.purchaseId,
              status: 'IN_STOCK',
            });
            await this.inventoryRepository.save(newUnit);
            unit.quantity = remaining;
            unit.status = 'SOLD';
            unit.saleId = saleId;
            await this.inventoryRepository.save(unit);
            remaining = 0;
          }
        }
        if (remaining > 0) {
          throw new BadRequestException('Insufficient stock for variant ' + item.variantId);
        }
      }
    }
  }

  async checkStock(): Promise<any> {
    const units = await this.inventoryRepository.find();
    return {
      serializedInStock: units.filter(u => u.imei && u.status === 'IN_STOCK').length,
      quantityInStock: units.filter(u => !u.imei && u.status === 'IN_STOCK').reduce((acc, curr) => acc + curr.quantity, 0),
      soldUnits: units.filter(u => u.status === 'SOLD').length,
      damagedUnits: units.filter(u => u.status === 'DAMAGED').length,
    };
  }

  async searchImei(imei: string): Promise<InventoryUnit> {
    const unit = await this.inventoryRepository.findOne({ where: { imei } });
    if (!unit) throw new NotFoundException('IMEI not found');
    return unit;
  }
}
