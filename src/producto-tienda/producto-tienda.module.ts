import { Module } from '@nestjs/common';
import { ProductoEntity } from 'src/producto/producto.entity';
import { ProductoTiendaService } from './producto-tienda.service';
import { TiendaEntity } from 'src/tienda/tienda.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoTiendaController } from './producto-tienda.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity, TiendaEntity])],
  providers: [ProductoTiendaService],
  controllers: [ProductoTiendaController],
})
export class ProductoTiendaModule {}
