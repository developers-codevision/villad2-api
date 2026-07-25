import { Menu } from '../entities/menu.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { CategoryProduct } from '../entities/category-product.entity';
import { Subtitulo } from '../entities/subtitulo.entity';
import { ServiceConfig } from '../entities/service-config.entity';
import defaultDataSource from '../../data-source';

async function seed() {
  const ds = await defaultDataSource.initialize();
  console.log('Conectado a MariaDB.');

  const menuRepo = ds.getRepository(Menu);
  const catRepo = ds.getRepository(Category);
  const prodRepo = ds.getRepository(Product);
  const cpRepo = ds.getRepository(CategoryProduct);
  const subtituloRepo = ds.getRepository(Subtitulo);
  const configRepo = ds.getRepository(ServiceConfig);

  const menuBebidas = await menuRepo.save(menuRepo.create({ name: 'Bebidas', description: 'Menú de bebidas', order: 1, active: true }));
  const menuDesayunos = await menuRepo.save(menuRepo.create({ name: 'Desayunos', description: 'Menú de desayunos', schedule: '7:30 am a 10 am', order: 2, active: true }));
  const menuAlmuerzos = await menuRepo.save(menuRepo.create({ name: 'Almuerzos', description: 'Menú de almuerzos', order: 3, active: true }));
  const menuCenas = await menuRepo.save(menuRepo.create({ name: 'Cenas', description: 'Menú de cenas', order: 4, active: true }));
  const menuBar = await menuRepo.save(menuRepo.create({ name: 'Bar Terraza', description: 'Menú del bar', schedule: '4:00 pm a 12 am', order: 5, active: true }));
  const menuPicadera = await menuRepo.save(menuRepo.create({ name: 'Picadera', description: 'Menú de picaderas y snacks', order: 6, active: true }));
  const menuLavanderia = await menuRepo.save(menuRepo.create({ name: 'Lavandería', description: 'Servicio de lavado y planchado', schedule: '9:00 am a 4:00 pm', order: 7, active: true }));
  const menuTransfer = await menuRepo.save(menuRepo.create({ name: 'Transfer y Traslados', description: 'Servicios de transfer y traslados', order: 8, active: true }));
  console.log('Menús creados.');

  const catCafes = await catRepo.save(catRepo.create({ name: 'Cafés', order: 1, active: true, menuId: menuBebidas.id }));
  const catJugos = await catRepo.save(catRepo.create({ name: 'Jugos Naturales', order: 2, active: true, menuId: menuBebidas.id }));
  const catRefrescos = await catRepo.save(catRepo.create({ name: 'Refrescos', order: 3, active: true, menuId: menuBebidas.id }));
  const catLicuados = await catRepo.save(catRepo.create({ name: 'Licuados', order: 4, active: true, menuId: menuBebidas.id }));
  const catDesayunoEco = await catRepo.save(catRepo.create({ name: 'Desayuno Económico / Simple breakfast', order: 1, active: true, menuId: menuDesayunos.id }));
  const catDesayunoStd = await catRepo.save(catRepo.create({ name: 'Desayuno Standard / Standard breakfast', order: 2, active: true, menuId: menuDesayunos.id }));
  const catDesayunoVd2 = await catRepo.save(catRepo.create({ name: 'Desayuno Villa D2 / Villa D2 breakfast', order: 3, active: true, menuId: menuDesayunos.id }));
  const catEntradas = await catRepo.save(catRepo.create({ name: 'Entradas', order: 1, active: true, menuId: menuAlmuerzos.id }));
  const catSopas = await catRepo.save(catRepo.create({ name: 'Sopas', order: 2, active: true, menuId: menuAlmuerzos.id }));
  const catPlatosFuertes = await catRepo.save(catRepo.create({ name: 'Platos Fuertes', order: 3, active: true, menuId: menuAlmuerzos.id }));
  const catPostres = await catRepo.save(catRepo.create({ name: 'Postres', order: 4, active: true, menuId: menuAlmuerzos.id }));
  const catCenaLigera = await catRepo.save(catRepo.create({ name: 'Cenas Ligeras', order: 1, active: true, menuId: menuCenas.id }));
  const catCenaCompleta = await catRepo.save(catRepo.create({ name: 'Cenas Completas', order: 2, active: true, menuId: menuCenas.id }));
  const catCocteles = await catRepo.save(catRepo.create({ name: 'Cocteles', order: 1, active: true, menuId: menuBar.id }));
  const catLicores = await catRepo.save(catRepo.create({ name: 'Whiskys / Rones / Tequilas / Vodkas', order: 2, active: true, menuId: menuBar.id }));
  const catCervezas = await catRepo.save(catRepo.create({ name: 'Cervezas', order: 3, active: true, menuId: menuBar.id }));
  const catSandwiches = await catRepo.save(catRepo.create({ name: 'Sandwiches', order: 1, active: true, menuId: menuPicadera.id }));
  const catPizzas = await catRepo.save(catRepo.create({ name: 'Pizzas', order: 2, active: true, menuId: menuPicadera.id }));
  const catLadies = await catRepo.save(catRepo.create({ name: 'Señoras / Ladies', order: 1, active: true, menuId: menuLavanderia.id }));
  const catGentlemen = await catRepo.save(catRepo.create({ name: 'Caballeros / Gentlemen', order: 2, active: true, menuId: menuLavanderia.id }));
  const catChildren = await catRepo.save(catRepo.create({ name: 'Niños / Children', order: 3, active: true, menuId: menuLavanderia.id }));
  console.log('Categorías creadas.');

  await subtituloRepo.save(subtituloRepo.create({ menuId: menuDesayunos.id, text: 'Precios en Usd + 10% Servicio / Prices in Usd plus 10% for the service', order: 1 }));
  await subtituloRepo.save(subtituloRepo.create({ menuId: menuDesayunos.id, text: 'Servicio habitación $5 Usd de cargo adicional / Room service $5 usd additional charge', order: 2 }));
  await subtituloRepo.save(subtituloRepo.create({ menuId: menuBar.id, text: 'Prices in Usd + 10% Service', order: 1 }));
  await subtituloRepo.save(subtituloRepo.create({ menuId: menuLavanderia.id, text: 'Precios unitarios en Usd + 10% Servicio / Unit prices in Usd + 10% Service', order: 1 }));
  await subtituloRepo.save(subtituloRepo.create({ menuId: menuTransfer.id, text: 'Precios en Usd / Prices in Usd', order: 1 }));
  await subtituloRepo.save(subtituloRepo.create({ menuId: menuPicadera.id, text: 'Precios en Usd + 10% Servicio / Prices in Usd plus 10% for the service', order: 1 }));
  await subtituloRepo.save(subtituloRepo.create({ menuId: menuPicadera.id, text: 'Servicio habitación $5 Usd de cargo adicional / Room service $5 usd additional charge', order: 2 }));
  console.log('Subtítulos creados.');

  async function addProduct(data: any) {
    const p = await prodRepo.save(prodRepo.create({ name: data.name, description: data.description || undefined, price: data.price }));
    await cpRepo.save(cpRepo.create({ categoryId: data.categoryId, productId: p.id }));
    return p;
  }

  await addProduct({ name: 'Café Americano / American coffee', price: 2.50, categoryId: catCafes.id });
  await addProduct({ name: 'Café con Leche / Coffee with milk', price: 3.00, categoryId: catCafes.id });
  await addProduct({ name: 'Capuchino / Cappuccino', price: 3.50, categoryId: catCafes.id });
  await addProduct({ name: 'Espresso Doble / Double espresso', price: 3.00, categoryId: catCafes.id });
  await addProduct({ name: 'Jugo de Naranja / Orange juice', price: 3.50, categoryId: catJugos.id });
  await addProduct({ name: 'Jugo de Fresa / Strawberry juice', price: 4.00, categoryId: catJugos.id });
  await addProduct({ name: 'Coca-Cola', price: 2.00, categoryId: catRefrescos.id });
  await addProduct({ name: 'Agua Natural 500ml / Natural Water 500ml', price: 1.10, categoryId: catRefrescos.id });
  await addProduct({ name: 'Licuado de Banana / Banana milkshake', price: 4.50, categoryId: catLicuados.id });
  await addProduct({ name: 'Smoothie de Frutos Rojos / Red fruits smoothie', price: 5.00, categoryId: catLicuados.id });
  await addProduct({ name: 'Jugo de frutas tropicales / Tropical fruit juice', price: 0, categoryId: catDesayunoEco.id });
  await addProduct({ name: 'Sandwich de jamón y queso / Ham and Cheese sandwich', price: 0, categoryId: catDesayunoEco.id });
  await addProduct({ name: 'Café con leche / Café / Té / Coffee with milk / Coffee / Tea', price: 0, categoryId: catDesayunoEco.id });
  await addProduct({ name: 'Tostadas de pan con mantequilla / Toast with butter', price: 0, categoryId: catDesayunoStd.id });
  await addProduct({ name: 'Frutas tropicales / Tropical fruit', price: 0, categoryId: catDesayunoStd.id });
  await addProduct({ name: 'Bollería / Sweets', price: 0, categoryId: catDesayunoVd2.id });
  await addProduct({ name: 'Mojito', price: 2.00, categoryId: catCocteles.id });
  await addProduct({ name: 'Cuba Libre', price: 2.00, categoryId: catCocteles.id });
  await addProduct({ name: 'Piña Colada', price: 3.00, categoryId: catCocteles.id });
  await addProduct({ name: 'Daiquirí', price: 2.00, categoryId: catCocteles.id });
  await addProduct({ name: 'Cerveza Nacional / Cuban Beer', price: 1.60, categoryId: catCervezas.id });
  await addProduct({ name: 'Cerveza Importada / Imported Beer', price: 1.10, categoryId: catCervezas.id });
  await addProduct({ name: 'Ceviche Mixto / Mixed ceviche', price: 8.00, categoryId: catEntradas.id });
  await addProduct({ name: 'Ensalada César / Caesar salad', price: 6.50, categoryId: catEntradas.id });
  await addProduct({ name: 'Sopa de Verduras / Vegetable soup', price: 5.00, categoryId: catSopas.id });
  await addProduct({ name: 'Pollo a la Parrilla / Grilled chicken', price: 10.00, categoryId: catPlatosFuertes.id });
  await addProduct({ name: 'Lomo Saltado / Sautéed beef loin', price: 12.00, categoryId: catPlatosFuertes.id });
  await addProduct({ name: 'Flan de Caramelo / Caramel flan', price: 4.00, categoryId: catPostres.id });
  await addProduct({ name: 'Brownie con Helado / Brownie with ice cream', price: 5.00, categoryId: catPostres.id });
  await addProduct({ name: 'Wrap de Pollo / Chicken wrap', price: 7.00, categoryId: catCenaLigera.id });
  await addProduct({ name: 'Ensalada Mediterránea / Mediterranean salad', price: 6.50, categoryId: catCenaLigera.id });
  await addProduct({ name: 'Salmón a la Plancha / Grilled salmon', price: 13.00, categoryId: catCenaCompleta.id });
  await addProduct({ name: 'Filete de Res / Beef steak', price: 14.00, categoryId: catCenaCompleta.id });
  await addProduct({ name: 'Sandwich de Jamón / Ham Sandwich', price: 3.50, categoryId: catSandwiches.id });
  await addProduct({ name: 'Sandwich Jamón y Queso / Ham and Cheese Sandwich', price: 4.00, categoryId: catSandwiches.id });
  await addProduct({ name: 'Pizza napolitana / Neapolitan pizza', price: 3.00, categoryId: catPizzas.id });
  await addProduct({ name: 'Pizza de Jamón y Queso / Ham and Cheese pizza', price: 3.60, categoryId: catPizzas.id });
  await addProduct({ name: 'Blusa / Blouse', price: 2.00, categoryId: catLadies.id });
  await addProduct({ name: 'Falda / Skirt', price: 2.00, categoryId: catLadies.id });
  await addProduct({ name: 'Camisa / Shirt', price: 2.00, categoryId: catGentlemen.id });
  await addProduct({ name: 'Pantalón / Trousers', price: 2.00, categoryId: catGentlemen.id });
  await addProduct({ name: 'Camisa / Shirt', price: 1.00, categoryId: catChildren.id });
  await addProduct({ name: 'Vestido / Dress', price: 1.00, categoryId: catChildren.id });

  const catTransfer = await catRepo.save(catRepo.create({ name: 'Aeropuerto José Martí', order: 1, active: true, menuId: menuTransfer.id }));
  const catEmbajadas = await catRepo.save(catRepo.create({ name: 'Embajadas / Consulados / Hospitales', order: 2, active: true, menuId: menuTransfer.id }));
  await addProduct({ name: 'Recogida aeropuerto 8am-6pm / Airport pickup 8am-6pm', price: 40.00, categoryId: catTransfer.id });
  await addProduct({ name: 'Recogida aeropuerto 7pm-7am / Airport pickup 7pm-7am', price: 50.00, categoryId: catTransfer.id });
  await addProduct({ name: 'Retorno al aeropuerto 8am-6pm / Return to airport 8am-6pm', price: 35.00, categoryId: catTransfer.id });
  await addProduct({ name: 'Ida a embajadas / One way to embassies', price: 10.00, categoryId: catEmbajadas.id });
  await addProduct({ name: 'Ida y regreso embajadas / Round trip to embassies', price: 18.00, categoryId: catEmbajadas.id });

  console.log('Productos creados.');

  await configRepo.save(configRepo.create({ key: 'service_charge_pct', value: '10', description: 'Porcentaje de servicio' }));
  await configRepo.save(configRepo.create({ key: 'room_service_fee', value: '5.00', description: 'Cargo por servicio a la habitación' }));
  await configRepo.save(configRepo.create({ key: 'intro_text', value: 'Bienvenidos al menú digital de nuestro hostal. / Welcome to our hostel digital menu.' }));
  await configRepo.save(configRepo.create({ key: 'footer_text', value: 'Gracias por su preferencia. / Thank you for your preference.' }));
  console.log('Config creada.');

  console.log('\n✅ Seed completado!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
