import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { DebtEntity } from './debt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DebtEntity])],
  controllers: [DebtController],
  providers: [DebtService],
  exports: [DebtService],
})
export class DebtModule {}