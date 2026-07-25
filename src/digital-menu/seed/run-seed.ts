import { Menu } from '../entities/menu.entity';
import { MenuCategory } from '../entities/menu-category.entity';
import { MenuProduct } from '../entities/menu-product.entity';
import { MenuStaticContent } from '../entities/menu-static-content.entity';
import defaultDataSource from '../../data-source';

async function seed() {
  const ds = await defaultDataSource.initialize();
  console.log('Conectado a la base de datos (MariaDB).');

  const menuRepo = ds.getRepository(Menu);
  const catRepo = ds.getRepository(MenuCategory);
  const prodRepo = ds.getRepository(MenuProduct);
  const staticRepo = ds.getRepository(MenuStaticContent);

  // ─── MENUS ──────────────────────────────────────
  const menuDesayunos = await menuRepo.save(menuRepo.create({
    name: 'Desayunos', description: 'Menú de desayunos', order: 1, active: true,
  }));
  const menuAlmuerzos = await menuRepo.save(menuRepo.create({
    name: 'Almuerzos', description: 'Menú de almuerzos', order: 2, active: true,
  }));
  const menuBebidas = await menuRepo.save(menuRepo.create({
    name: 'Bebidas', description: 'Menú de bebidas', order: 3, active: true,
  }));
  const menuCenas = await menuRepo.save(menuRepo.create({
    name: 'Cenas', description: 'Menú de cenas', order: 4, active: true,
  }));
  console.log('Menús creados.');

  // ─── CATEGORIES ─────────────────────────────────
  const catCafes = await catRepo.save(catRepo.create({ name: 'Cafés', order: 1, active: true, menuId: menuBebidas.id }));
  const catJugos = await catRepo.save(catRepo.create({ name: 'Jugos Naturales', order: 2, active: true, menuId: menuBebidas.id }));
  const catRefrescos = await catRepo.save(catRepo.create({ name: 'Refrescos', order: 3, active: true, menuId: menuBebidas.id }));
  const catLicuados = await catRepo.save(catRepo.create({ name: 'Licuados', order: 4, active: true, menuId: menuBebidas.id }));

  const catDesayunoClasico = await catRepo.save(catRepo.create({ name: 'Desayunos Clásicos', order: 1, active: true, menuId: menuDesayunos.id }));
  const catDesayunoLight = await catRepo.save(catRepo.create({ name: 'Desayunos Light', order: 2, active: true, menuId: menuDesayunos.id }));

  const catEntradas = await catRepo.save(catRepo.create({ name: 'Entradas', order: 1, active: true, menuId: menuAlmuerzos.id }));
  const catSopas = await catRepo.save(catRepo.create({ name: 'Sopas', order: 2, active: true, menuId: menuAlmuerzos.id }));
  const catPlatosFuertes = await catRepo.save(catRepo.create({ name: 'Platos Fuertes', order: 3, active: true, menuId: menuAlmuerzos.id }));
  const catPostres = await catRepo.save(catRepo.create({ name: 'Postres', order: 4, active: true, menuId: menuAlmuerzos.id }));

  const catCenaLigera = await catRepo.save(catRepo.create({ name: 'Cenas Ligeras', order: 1, active: true, menuId: menuCenas.id }));
  const catCenaCompleta = await catRepo.save(catRepo.create({ name: 'Cenas Completas', order: 2, active: true, menuId: menuCenas.id }));
  console.log('Categorías creadas.');

  // ─── PRODUCTS ───────────────────────────────────
  const allProducts = [
    { name: 'Café Americano', description: 'Café negro tradicional', price: 2.50, menuId: menuBebidas.id, categoryId: catCafes.id },
    { name: 'Café con Leche', description: 'Café con leche caliente', price: 3.00, menuId: menuBebidas.id, categoryId: catCafes.id },
    { name: 'Capuchino', description: 'Espresso con leche espumada', price: 3.50, menuId: menuBebidas.id, categoryId: catCafes.id },
    { name: 'Mocaccino', description: 'Capuchino con chocolate', price: 4.00, menuId: menuBebidas.id, categoryId: catCafes.id },
    { name: 'Espresso Doble', description: 'Doble shot de espresso', price: 3.00, menuId: menuBebidas.id, categoryId: catCafes.id },

    { name: 'Jugo de Naranja', description: 'Naranja recién exprimida', price: 3.50, menuId: menuBebidas.id, categoryId: catJugos.id },
    { name: 'Jugo de Papaya', description: 'Papaya fresca licuada', price: 3.50, menuId: menuBebidas.id, categoryId: catJugos.id },
    { name: 'Jugo de Fresa', description: 'Fresas frescas licuadas', price: 4.00, menuId: menuBebidas.id, categoryId: catJugos.id },
    { name: 'Jugo Verde', description: 'Espinaca, apio, manzana y limón', price: 4.50, menuId: menuBebidas.id, categoryId: catJugos.id },

    { name: 'Coca-Cola', description: 'Lata 355ml', price: 2.00, menuId: menuBebidas.id, categoryId: catRefrescos.id },
    { name: 'Sprite', description: 'Lata 355ml', price: 2.00, menuId: menuBebidas.id, categoryId: catRefrescos.id },
    { name: 'Agua Mineral', description: 'Botella 500ml', price: 1.50, menuId: menuBebidas.id, categoryId: catRefrescos.id },
    { name: 'Agua con Gas', description: 'Botella 500ml', price: 1.50, menuId: menuBebidas.id, categoryId: catRefrescos.id },

    { name: 'Licuado de Banana', description: 'Banana, leche y miel', price: 4.50, menuId: menuBebidas.id, categoryId: catLicuados.id },
    { name: 'Licuado de Mango', description: 'Mango, leche y azúcar', price: 4.50, menuId: menuBebidas.id, categoryId: catLicuados.id },
    { name: 'Smoothie de Frutos Rojos', description: 'Fresa, mora y yogur', price: 5.00, menuId: menuBebidas.id, categoryId: catLicuados.id },

    { name: 'Desayuno Americano', description: 'Huevos al gusto, tocino, pan tostado y café', price: 7.00, menuId: menuDesayunos.id, categoryId: catDesayunoClasico.id },
    { name: 'Desayuno Continental', description: 'Pan, mantequilla, mermelada, jugo y café', price: 5.50, menuId: menuDesayunos.id, categoryId: catDesayunoClasico.id },
    { name: 'Huevos Rancheros', description: 'Huevos fritos sobre tortilla con salsa roja', price: 6.50, menuId: menuDesayunos.id, categoryId: catDesayunoClasico.id },
    { name: 'Omelette Mixto', description: 'Jamón, queso, champiñones y pimientos', price: 7.00, menuId: menuDesayunos.id, categoryId: catDesayunoClasico.id },
    { name: 'Hotcakes con Miel', description: 'Tres hotcakes con miel de maple y fruta', price: 6.00, menuId: menuDesayunos.id, categoryId: catDesayunoClasico.id },

    { name: 'Yogur con Granola', description: 'Yogur natural, granola casera y fruta fresca', price: 5.00, menuId: menuDesayunos.id, categoryId: catDesayunoLight.id },
    { name: 'Tostadas Integrales', description: 'Aguacate, tomate y huevo pochado', price: 5.50, menuId: menuDesayunos.id, categoryId: catDesayunoLight.id },
    { name: 'Bowl de Frutas', description: 'Mix de frutas de temporada', price: 4.50, menuId: menuDesayunos.id, categoryId: catDesayunoLight.id },

    { name: 'Ceviche Mixto', description: 'Pescado y mariscos en jugo de limón', price: 8.00, menuId: menuAlmuerzos.id, categoryId: catEntradas.id },
    { name: 'Ensalada César', description: 'Lechuga romana, crutones, parmesano y aderezo', price: 6.50, menuId: menuAlmuerzos.id, categoryId: catEntradas.id },
    { name: 'Guacamole con Totopos', description: 'Aguacate fresco, cebolla, cilantro y totopos', price: 5.50, menuId: menuAlmuerzos.id, categoryId: catEntradas.id },
    { name: 'Bruschettas', description: 'Pan tostado con tomate, albahaca y aceite de oliva', price: 5.00, menuId: menuAlmuerzos.id, categoryId: catEntradas.id },

    { name: 'Sopa de Verduras', description: 'Verduras frescas de temporada', price: 5.00, menuId: menuAlmuerzos.id, categoryId: catSopas.id },
    { name: 'Crema de Calabaza', description: 'Calabaza asada con un toque de crema', price: 5.50, menuId: menuAlmuerzos.id, categoryId: catSopas.id },
    { name: 'Caldo de Pollo', description: 'Pollo, verduras y arroz', price: 6.00, menuId: menuAlmuerzos.id, categoryId: catSopas.id },

    { name: 'Pollo a la Parrilla', description: 'Pechuga de pollo con ensalada y papas', price: 10.00, menuId: menuAlmuerzos.id, categoryId: catPlatosFuertes.id },
    { name: 'Lomo Saltado', description: 'Lomo de res salteado con verduras y arroz', price: 12.00, menuId: menuAlmuerzos.id, categoryId: catPlatosFuertes.id },
    { name: 'Pescado Frito', description: 'Filete de pescado con arroz y ensalada', price: 10.00, menuId: menuAlmuerzos.id, categoryId: catPlatosFuertes.id },
    { name: 'Tacos al Pastor', description: 'Tres tacos de cerdo adobado con piña', price: 9.00, menuId: menuAlmuerzos.id, categoryId: catPlatosFuertes.id },
    { name: 'Pasta Alfredo', description: 'Fettuccine en salsa cremosa con pollo', price: 11.00, menuId: menuAlmuerzos.id, categoryId: catPlatosFuertes.id },
    { name: 'Hamburguesa Artesanal', description: 'Carne Angus, queso, lechuga, tomate y papas fritas', price: 9.50, menuId: menuAlmuerzos.id, categoryId: catPlatosFuertes.id },

    { name: 'Flan de Caramelo', description: 'Flan casero con caramelo', price: 4.00, menuId: menuAlmuerzos.id, categoryId: catPostres.id },
    { name: 'Brownie con Helado', description: 'Brownie de chocolate con helado de vainilla', price: 5.00, menuId: menuAlmuerzos.id, categoryId: catPostres.id },
    { name: 'Tiramisú', description: 'Postre italiano con café y mascarpone', price: 5.50, menuId: menuAlmuerzos.id, categoryId: catPostres.id },
    { name: 'Ensalada de Frutas', description: 'Mix de frutas frescas con miel', price: 3.50, menuId: menuAlmuerzos.id, categoryId: catPostres.id },

    { name: 'Sopa de Pollo', description: 'Caldo ligero de pollo con verduras', price: 5.50, menuId: menuCenas.id, categoryId: catCenaLigera.id },
    { name: 'Wrap de Pollo', description: 'Tortilla integral con pollo y verduras', price: 7.00, menuId: menuCenas.id, categoryId: catCenaLigera.id },
    { name: 'Ensalada Mediterránea', description: 'Mix de hojas verdes, tomate, aceitunas y queso feta', price: 6.50, menuId: menuCenas.id, categoryId: catCenaLigera.id },

    { name: 'Salmón a la Plancha', description: 'Salmón con vegetales salteados', price: 13.00, menuId: menuCenas.id, categoryId: catCenaCompleta.id },
    { name: 'Pechuga Rellena', description: 'Pechuga de pollo rellena de espinaca y queso', price: 11.00, menuId: menuCenas.id, categoryId: catCenaCompleta.id },
    { name: 'Filete de Res', description: 'Filete de res a la parrilla con puré de papa', price: 14.00, menuId: menuCenas.id, categoryId: catCenaCompleta.id },
  ];

  for (const p of allProducts) {
    await prodRepo.save(prodRepo.create(p));
  }
  console.log(`${allProducts.length} productos creados.`);

  // ─── STATIC CONTENT ────────────────────────────
  const staticDefaults = [
    { key: 'service_hours', value: 'Lunes a Viernes 7:00 AM - 10:00 PM | Sábados y Domingos 8:00 AM - 11:00 PM' },
    { key: 'intro_text', value: 'Bienvenidos al menú digital de nuestro hostal. Explore nuestras opciones y disfrute de una experiencia gastronómica única preparada con ingredientes frescos y de la mejor calidad.' },
    { key: 'footer_text', value: 'Gracias por su preferencia. Todos los precios incluyen IVA. Aceptamos pagos en efectivo y tarjeta.' },
  ];
  for (const s of staticDefaults) {
    await staticRepo.save(staticRepo.create(s));
  }
  console.log('Contenido estático creado.');

  console.log('\n✅ Seed completado exitosamente!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Error durante el seed:', err);
  process.exit(1);
});
