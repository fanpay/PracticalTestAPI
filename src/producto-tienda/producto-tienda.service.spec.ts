/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductoTiendaService } from './producto-tienda.service';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { TipoProducto } from '../shared/enums/tipo-producto';

describe('ProductoTiendaService', () => {

  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let tiendasList : TiendaEntity[];

  const seedDatabase = async () => {
    tiendaRepository.clear();
    productoRepository.clear();
 
    tiendasList = [];
    for(let i = 0; i < 5; i++){
        const tienda: TiendaEntity = await tiendaRepository.save({
          nombre: faker.lorem.sentence(),
          ciudad: faker.lorem.sentence(),
          direccion: faker.lorem.sentence()
        })
        tiendasList.push(tienda);
    }
 
    producto = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: faker.lorem.sentence(),
      precio: faker.lorem.sentence()
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProduct should add a tienda to a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: TipoProducto.PERECEDERO,
      precio: faker.lorem.sentence()
    })
 
    const result: ProductoEntity = await service.addStoreToProduct(newProducto.id, newTienda.id);
   
    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(newTienda.nombre)
    expect(result.tiendas[0].ciudad).toBe(newTienda.ciudad)
    expect(result.tiendas[0].direccion).toBe(newTienda.direccion)
  });

  it('addStoreToProduct should thrown exception for an invalid tienda', async () => {
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: TipoProducto.PERECEDERO,
      precio: faker.lorem.sentence()
    })
 
    await expect(() => service.addStoreToProduct(newProducto.id, '0')).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('addStoreToProduct should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(() => service.addStoreToProduct('0', newTienda.id)).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('findStoresFromProduct should return tienda from producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: TipoProducto.PERECEDERO,
      precio: faker.lorem.sentence()
    })
 
    const result: ProductoEntity = await service.addStoreToProduct(newProducto.id, newTienda.id);
    const storedTienda: TiendaEntity = await service.findStoreFromProduct(newProducto.id, newTienda.id,)
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toBe(result.tiendas[0].nombre);
    expect(storedTienda.ciudad).toBe(result.tiendas[0].ciudad);
    expect(storedTienda.direccion).toBe(result.tiendas[0].direccion);
  });

  it('findStoresFromProduct should throw an exception for an invalid tienda', async () => {
    await expect(()=> service.findStoreFromProduct(producto.id, "0")).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('findStoresFromProduct should throw an exception for an invalid producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.findStoreFromProduct("0", tienda.id)).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('findStoresFromProduct should throw an exception for an tienda not associated to the producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(()=> service.findStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty('message', 'La tienda con el id indicado no está asociada al producto con el id indicado');
  });

  it('findStoresFromProduct should return tiendas from producto', async ()=>{
    
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: TipoProducto.PERECEDERO,
      precio: faker.lorem.sentence()
    })
 
    await service.addStoreToProduct(newProducto.id, newTienda.id);
    const tiendas: TiendaEntity[] = await service.findStoresFromProduct(newProducto.id);
    expect(tiendas.length).toBe(1)
  });

  it('findStoresFromProduct should throw an exception for an invalid producto', async () => {
    await expect(()=> service.findStoresFromProduct("0")).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('updateStoresFromProduct should update tiendas list for a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const updatedProducto: ProductoEntity = await service.updateStoresFromProduct(producto.id, [newTienda]);
    expect(updatedProducto.tiendas.length).toBe(1);
 
    expect(updatedProducto.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(updatedProducto.tiendas[0].ciudad).toBe(newTienda.ciudad);
    expect(updatedProducto.tiendas[0].direccion).toBe(newTienda.direccion);
  });

  it('updateStoresFromProduct should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(()=> service.updateStoresFromProduct("0", [newTienda])).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('updateStoresFromProduct should throw an exception for an invalid tienda', async () => {
    const nuevaTienda: TiendaEntity = tiendasList[0];
    nuevaTienda.id = "0";
 
    await expect(()=> service.updateStoresFromProduct(producto.id, [nuevaTienda])).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('deleteStoreFromProduct should remove a tienda from a producto', async () => {
    
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: TipoProducto.PERECEDERO,
      precio: faker.lorem.sentence()
    })
 
    await service.addStoreToProduct(newProducto.id, newTienda.id);
   
    await service.deleteStoreFromProduct(newProducto.id, newTienda.id);
 
    const storedProducto: ProductoEntity = await productoRepository.findOne({where: {id: newProducto.id}, relations: ["tiendas"]});
    const deletedTienda: TiendaEntity = storedProducto.tiendas.find(a => a.id === newTienda.id); 
    expect(deletedTienda).toBeUndefined(); 
  });

  it('deleteStoreFromProduct should thrown an exception for an invalid tienda', async () => {
    await expect(()=> service.deleteStoreFromProduct(producto.id, "0")).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('deleteStoreFromProduct should thrown an exception for an invalid producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.deleteStoreFromProduct("0", tienda.id)).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('deleteStoreFromProduct should thrown an exception for an non asocciated tienda', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(()=> service.deleteStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty('message', 'La tienda con el id indicado no está asociada al producto con el id indicado');
  });
});
