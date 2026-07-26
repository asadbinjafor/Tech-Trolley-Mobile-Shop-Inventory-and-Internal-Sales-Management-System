import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './shop.entity';
import { UpdateShopDto } from './dtos/update-shop.dto';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async getShopSettings(): Promise<Shop> {
    const shops = await this.shopRepository.find();
    if (shops.length === 0) {
      throw new NotFoundException('Shop settings not found. Please seed the database.');
    }
    return shops[0];
  }

  async updateShopSettings(updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.getShopSettings();
    Object.assign(shop, updateShopDto);
    return this.shopRepository.save(shop);
  }
}
