import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDashboardStats(): Promise<any> {
    const [salesResult] = await this.dataSource.query(`SELECT COALESCE(SUM(total), 0) as "totalSales" FROM sale WHERE status = 'COMPLETED'`);
    const [purchasesResult] = await this.dataSource.query(`SELECT COALESCE(SUM(total), 0) as "totalPurchases" FROM purchase WHERE status = 'CONFIRMED'`);
    const [expensesResult] = await this.dataSource.query(`SELECT COALESCE(SUM(amount), 0) as "totalExpenses" FROM expense`);
    const [customersResult] = await this.dataSource.query(`SELECT COUNT(*) as "totalCustomers" FROM customer`);
    const [productsResult] = await this.dataSource.query(`SELECT COUNT(*) as "totalProducts" FROM product`);

    return {
      totalSales: Number(salesResult.totalSales),
      totalPurchases: Number(purchasesResult.totalPurchases),
      totalExpenses: Number(expensesResult.totalExpenses),
      totalCustomers: Number(customersResult.totalCustomers),
      totalProducts: Number(productsResult.totalProducts),
    };
  }

  async getSalesChartData(): Promise<any> {
    const result = await this.dataSource.query(`
      SELECT date, SUM(total) as total
      FROM sale
      WHERE status = 'COMPLETED'
      GROUP BY date
      ORDER BY date ASC
      LIMIT 30
    `);
    return result;
  }
}
