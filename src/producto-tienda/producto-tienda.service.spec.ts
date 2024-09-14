/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductoTiendaService } from './producto-tienda.service';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

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

  it('addTiendaToProducto should add a tienda to a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: 'Perecedero',
      precio: faker.lorem.sentence()
    })
 
    const result: ProductoEntity = await service.addTiendaToProducto(newProducto.id, newTienda.id);
   
    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(newTienda.nombre)
    expect(result.tiendas[0].ciudad).toBe(newTienda.ciudad)
    expect(result.tiendas[0].direccion).toBe(newTienda.direccion)
  });

  it('addTiendaToProducto should thrown exception for an invalid tienda', async () => {
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: 'Perecedero',
      precio: faker.lorem.sentence()
    })
 
    await expect(() => service.addTiendaToProducto(newProducto.id, '0')).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('addTiendaToProducto should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(() => service.addTiendaToProducto('0', newTienda.id)).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('findTiendaFromProducto should return tienda from producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: 'Perecedero',
      precio: faker.lorem.sentence()
    })
 
    const result: ProductoEntity = await service.addTiendaToProducto(newProducto.id, newTienda.id);
    const storedTienda: TiendaEntity = await service.findTiendaFromProducto(newProducto.id, newTienda.id,)
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toBe(result.tiendas[0].nombre);
    expect(storedTienda.ciudad).toBe(result.tiendas[0].ciudad);
    expect(storedTienda.direccion).toBe(result.tiendas[0].direccion);
  });

  it('findTiendaFromProducto should throw an exception for an invalid tienda', async () => {
    await expect(()=> service.findTiendaFromProducto(producto.id, "0")).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('findTiendaFromProducto should throw an exception for an invalid producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.findTiendaFromProducto("0", tienda.id)).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('findTiendaFromProducto should throw an exception for an tienda not associated to the producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(()=> service.findTiendaFromProducto(producto.id, newTienda.id)).rejects.toHaveProperty('message', 'La tienda con el id indicado no está asociada al producto con el id indicado');
  });

  it('findTiendasFromProducto should return tiendas from producto', async ()=>{
    
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: 'Perecedero',
      precio: faker.lorem.sentence()
    })
 
    await service.addTiendaToProducto(newProducto.id, newTienda.id);
    const tiendas: TiendaEntity[] = await service.findTiendasFromProducto(newProducto.id);
    expect(tiendas.length).toBe(1)
  });

  it('findTiendasFromProducto should throw an exception for an invalid producto', async () => {
    await expect(()=> service.findTiendasFromProducto("0")).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('updateTiendasFromProducto should update tiendas list for a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const updatedProducto: ProductoEntity = await service.updateTiendasFromProducto(producto.id, [newTienda]);
    expect(updatedProducto.tiendas.length).toBe(1);
 
    expect(updatedProducto.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(updatedProducto.tiendas[0].ciudad).toBe(newTienda.ciudad);
    expect(updatedProducto.tiendas[0].direccion).toBe(newTienda.direccion);
  });

  it('updateTiendasFromProducto should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(()=> service.updateTiendasFromProducto("0", [newTienda])).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('updateTiendasFromProducto should throw an exception for an invalid tienda', async () => {
    const nuevaTienda: TiendaEntity = tiendasList[0];
    nuevaTienda.id = "0";
 
    await expect(()=> service.updateTiendasFromProducto(producto.id, [nuevaTienda])).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('deleteTiendaFromProducto should remove a tienda from a producto', async () => {
    
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.sentence(),
      tipo: 'Perecedero',
      precio: faker.lorem.sentence()
    })
 
    await service.addTiendaToProducto(newProducto.id, newTienda.id);
   
    await service.deleteTiendaFromProducto(newProducto.id, newTienda.id);
 
    const storedProducto: ProductoEntity = await productoRepository.findOne({where: {id: newProducto.id}, relations: ["tiendas"]});
    const deletedTienda: TiendaEntity = storedProducto.tiendas.find(a => a.id === newTienda.id); 
    expect(deletedTienda).toBeUndefined(); 
  });

  it('deleteTiendaFromProducto should thrown an exception for an invalid tienda', async () => {
    await expect(()=> service.deleteTiendaFromProducto(producto.id, "0")).rejects.toHaveProperty('message', 'No se encuentra ninguna tienda con ese id');
  });

  it('deleteTiendaToProducto should thrown an exception for an invalid producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.deleteTiendaFromProducto("0", tienda.id)).rejects.toHaveProperty('message', 'No se encuentra ningún producto con ese id');
  });

  it('deleteTiendaFromProducto should thrown an exception for an non asocciated tienda', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.sentence(),
      ciudad: 'BTA',
      direccion: faker.lorem.sentence()
    });
 
    await expect(()=> service.deleteTiendaFromProducto(producto.id, newTienda.id)).rejects.toHaveProperty('message', 'La tienda con el id indicado no está asociada al producto con el id indicado');
  });
});
