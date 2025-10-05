import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditorService } from './creditor.service';
import { CreditorController } from './creditor.controller';
import { CreditorEntity } from './creditor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditorEntity])],
  controllers: [CreditorController],
  providers: [CreditorService],
  exports: [CreditorService],
})
export class CreditorModule {}