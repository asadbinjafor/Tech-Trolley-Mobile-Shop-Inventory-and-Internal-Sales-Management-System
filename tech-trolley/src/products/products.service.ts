import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { ProductVariant } from './product-variants.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateProductStatusDto } from './dtos/update-product-status.dto';
import { CreateVariantDto } from './dtos/create-variant.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async updateStatus(id: string, updateProductStatusDto: UpdateProductStatusDto): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = updateProductStatusDto.isActive;
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async addVariant(productId: string, createVariantDto: CreateVariantDto): Promise<ProductVariant> {
    await this.findOne(productId); // Ensure product exists
    const variant = this.variantsRepository.create({ ...createVariantDto, productId });
    return this.variantsRepository.save(variant);
  }

  async getVariants(productId: string): Promise<ProductVariant[]> {
    await this.findOne(productId); // Ensure product exists
    return this.variantsRepository.find({ where: { productId } });
  }
}
