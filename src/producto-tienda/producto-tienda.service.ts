/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class ProductoTiendaService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,

    @InjectRepository(TiendaEntity)
    private readonly tiendaRepository: Repository<TiendaEntity>,
  ) {}
  
  async addStoreToProduct(productoId: string, tiendaId: string): Promise<ProductoEntity> {
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
    if (!tienda)
      throw new BusinessLogicException('No se encuentra ninguna tienda con ese id', BusinessError.NOT_FOUND);
   
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ['tiendas']}) 
    if (!producto)
      throw new BusinessLogicException('No se encuentra ningún producto con ese id', BusinessError.NOT_FOUND);
 
    producto.tiendas = [...producto.tiendas, tienda];
    return await this.productoRepository.save(producto);
  } 
     
  async findStoresFromProduct(productoId: string): Promise<TiendaEntity[]> {
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ['tiendas']});
    if (!producto)
      throw new BusinessLogicException('No se encuentra ningún producto con ese id', BusinessError.NOT_FOUND)
    
    return producto.tiendas;
  }  
   
  async findStoreFromProduct(productoId: string, tiendaId: string): Promise<TiendaEntity>{
    
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}, relations: ['productos']});

    if (!tienda)
      throw new BusinessLogicException('No se encuentra ninguna tienda con ese id', BusinessError.NOT_FOUND)

    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ['tiendas']});

    if (!producto)
      throw new BusinessLogicException('No se encuentra ningún producto con ese id', BusinessError.NOT_FOUND)

    const tiendaProducto: TiendaEntity = producto.tiendas.find(e => e.id === tienda.id);

    if (!tiendaProducto)
        throw new BusinessLogicException('La tienda con el id indicado no está asociada al producto con el id indicado', BusinessError.PRECONDITION_FAILED)
    return tiendaProducto;
  } 

  async updateStoresFromProduct(productoId: string, tiendas: TiendaEntity[]): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ['tiendas']});
    if (!producto)
      throw new BusinessLogicException('No se encuentra ningún producto con ese id', BusinessError.NOT_FOUND)
    for (const element of tiendas) {
      const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: element.id}});
      if (!tienda)
        throw new BusinessLogicException('No se encuentra ninguna tienda con ese id', BusinessError.NOT_FOUND)
    }
    producto.tiendas = tiendas;
    return await this.productoRepository.save(producto);
  }  
   
  async deleteStoreFromProduct(productoId: string, tiendaId: string){
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
    if (!tienda)
      throw new BusinessLogicException('No se encuentra ninguna tienda con ese id', BusinessError.NOT_FOUND)

    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ['tiendas']});
    if (!producto)
      throw new BusinessLogicException('No se encuentra ningún producto con ese id', BusinessError.NOT_FOUND)

    const productoTienda: TiendaEntity = producto.tiendas.find(e => e.id === tienda.id);

    if (!productoTienda)
        throw new BusinessLogicException('La tienda con el id indicado no está asociada al producto con el id indicado', BusinessError.PRECONDITION_FAILED)

    producto.tiendas = producto.tiendas.filter(e => e.id !== tiendaId);
    await this.productoRepository.save(producto);
  } 
}
