import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';
import { Room } from './rooms/entities/room.entity';
import { Promotion, PromotionStatus } from './promotions/entities/promotion.entity';
import { RoomType, RoomStatus } from './rooms/enums/room-enums.enum';
import { User } from './users/entities/user.entity';

config({ path: path.join(__dirname, '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUsername = process.env.DB_USERNAME || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_DATABASE || 'hostal';

const dataSource = new DataSource({
  type: 'mariadb',
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbName,
  entities: [Room, Promotion, User],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
});

const adminDataSource = new DataSource({
  type: 'mariadb',
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  logging: false,
});

const roomsData = [
  {
    number: 'P-101',
    name: 'Isla de Pinos',
    description: 'Es la primera habitación de la planta baja, asociada con la Isla de Pinos, de acuerdo a la temática de la Villa.',
    pricePerNight: 42,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 10,
    roomType: RoomType.STANDARD_ECONOMIC,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto',
      'Ventilador de pared',
      'Refrigerador tipo Minibar',
      'Caja de seguridad',
      'Mueble para el minibar con escritorio',
      'Espejo alargado para verse a cuerpo completo',
      'Iluminación central',
      'Sensor de humos con alarma sonora',
      'Apliques de luces laterales',
      'Cama matrimonial estándar',
      '2 mesitas de noche'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Lavamanos y WC de color blancos',
      'Extractor de aire con temporizador',
      'Secador de pelo',
      'Espejo',
      'Mampara de cristal de dos puertas deslizantes',
      'Ducha fija y móvil tipo teléfono',
      'Dispensador de shampú y gel',
      'Dispensador de jabón de manos',
      'Toalleros y accesorios de alta calidad',
      'Puerta plegable'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/1 Isla de Pinos.jpg'],
    additionalPhotos: [
      'media/rooms/20240414_111644.jpg',
      'media/rooms/20240414_111725.jpg',
      'media/rooms/20240414_111742.jpg'
    ]
  },
  {
    number: 'P-102',
    name: 'Pinar del Río',
    description: 'Es la 2da habitación de la planta baja, asociada con la antigua provincia de Pinar del Río, de acuerdo a la temática de la Villa.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 10,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto',
      'Ventilador de pared',
      'Refrigerador tipo Minibar',
      'Caja de seguridad',
      'Colgador para ropas con tabla superior para colocar maletas',
      'Mueble para el minibar con escritorio',
      'Espejo alargado para verse a cuerpo completo',
      'Iluminación central',
      'Sensor de humos con alarma sonora',
      'Apliques de luces laterales',
      'Tomacorrientes con 2 puertos USB',
      'Cama matrimonial estándar',
      '2 mesitas de noche'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Extractor de aire con temporizador',
      'Secador de pelo',
      'Ducha fija y móvil tipo teléfono',
      'Dispensador de shampú y gel',
      'Dispensador de jabón de manos',
      'Toalleros y accesorios de alta calidad',
      'Puerta plegable',
      'Lavamanos y WC de color rojo',
      'Espejo con apliques de luces led',
      'Mampara de cristal de un pano fijo'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/2 Pinar del Rio.jpg'],
    additionalPhotos: [
      'media/rooms/20240106_170212.jpg',
      'media/rooms/20240106_170258.jpg',
      'media/rooms/20240106_170324.jpg'
    ]
  },
  {
    number: 'P-103',
    name: 'Matanzas',
    description: 'Es la tercera habitación de la planta baja, asociada con la antigua provincia de Matanzas, de acuerdo a la temática de la Villa.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 10,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto',
      'Ventilador de pared',
      'Refrigerador tipo Minibar',
      'Caja de seguridad',
      'Colgador para ropas con tabla superior para colocar maletas',
      'Mueble para el minibar con escritorio',
      'Espejo alargado para verse a cuerpo completo',
      'Iluminación central',
      'Sensor de humos con alarma sonora',
      'Apliques de luces laterales',
      'Tomacorrientes con 2 puertos USB',
      'Cama matrimonial estándar',
      '2 mesitas de noche'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Lavamanos y WC de color blancos',
      'Extractor de aire con temporizador',
      'Secador de pelo',
      'Mampara de cristal de dos puertas deslizantes',
      'Ducha fija y móvil tipo teléfono',
      'Dispensador de shampú y gel',
      'Dispensador de jabón de manos',
      'Toalleros y accesorios de alta calidad',
      'Puerta plegable'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/3 Matanzas.jpg'],
    additionalPhotos: [
      'media/rooms/20240106_170816.jpg',
      'media/rooms/20240106_170839.jpg',
      'media/rooms/20240414_112346.jpg'
    ]
  },
  {
    number: 'P-201',
    name: 'La Habana',
    description: 'Es la primera habitación de la planta alta, asociada con la antigua provincia de La Habana, de acuerdo a la temática de la Villa, tiene un gran tamaño y cuenta además con un sofá cama adicional. En esta habitación pueden dormir hasta 4 personas.',
    pricePerNight: 60,
    baseCapacity: 2,
    extraCapacity: 2,
    extraGuestCharge: 15,
    roomType: RoomType.SUITE_BALCONY,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto',
      'Ventilador de pared',
      'Refrigerador tipo Minibar',
      'Caja de seguridad',
      'Mueble para el minibar con escritorio',
      'Espejo alargado para verse a cuerpo completo',
      'Iluminación central',
      'Sensor de humos con alarma sonora',
      'Apliques de luces laterales',
      'Cama matrimonial estándar',
      '2 mesitas de noche',
      'Armario para ropas con cajones inferiores',
      'Sofá cama',
      'Acceso a balcón'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Extractor de aire con temporizador',
      'Secador de pelo',
      'Ducha fija y móvil tipo teléfono',
      'Dispensador de shampú y gel',
      'Dispensador de jabón de manos',
      'Toalleros y accesorios de alta calidad',
      'Puerta plegable',
      'Lavamanos y WC de color rojo',
      'Espejo con apliques de luces led',
      'Mampara de cristal de una puerta deslizante'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/4 La Habana.jpg'],
    additionalPhotos: [
      'media/rooms/20240106_171348.jpg',
      'media/rooms/20240106_171436.jpg',
      'media/rooms/20240412_145928.jpg',
      'media/rooms/20240412_145941.jpg',
      'media/rooms/20240414_113107.jpg'
    ]
  },
  {
    number: 'P-202',
    name: 'Las Villas',
    description: 'Es la segunda habitación de la planta alta, asociada con la antigua provincia de Las Villas, de acuerdo a la temática de la Villa.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 10,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto',
      'Ventilador de pared',
      'Refrigerador tipo Minibar',
      'Caja de seguridad',
      'Colgador para ropas con tabla superior para colocar maletas',
      'Mueble para el minibar con escritorio',
      'Espejo alargado para verse a cuerpo completo',
      'Iluminación central',
      'Sensor de humos con alarma sonora',
      'Apliques de luces laterales',
      'Tomacorrientes con 2 puertos USB',
      'Cama matrimonial estándar',
      '2 mesitas de noche'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Lavamanos y WC de color blancos',
      'Extractor de aire con temporizador',
      'Secador de pelo',
      'Mampara de cristal de dos puertas deslizantes',
      'Ducha fija y móvil tipo teléfono',
      'Dispensador de shampú y gel',
      'Dispensador de jabón de manos',
      'Toalleros y accesorios de alta calidad',
      'Puerta plegable',
      'Espejo con apliques de luces led'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/5 Las Villas.jpg'],
    additionalPhotos: [
      'media/rooms/20240106_171614.jpg',
      'media/rooms/20240106_171654.jpg',
      'media/rooms/20240106_171738.jpg'
    ]
  },
  {
    number: 'P-203',
    name: 'Camagüey',
    description: 'Es la tercera habitación de la planta alta, asociada con la antigua provincia de Camagüey, de acuerdo a la temática de la Villa.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 10,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto',
      'Ventilador de pared',
      'Refrigerador tipo Minibar',
      'Caja de seguridad',
      'Colgador para ropas con tabla superior para colocar maletas',
      'Mueble para el minibar con escritorio',
      'Espejo alargado para verse a cuerpo completo',
      'Iluminación central',
      'Sensor de humos con alarma sonora',
      'Apliques de luces laterales',
      'Tomacorrientes con 2 puertos USB',
      'Cama matrimonial estándar',
      '2 mesitas de noche'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Extractor de aire con temporizador',
      'Secador de pelo',
      'Ducha fija y móvil tipo teléfono',
      'Dispensador de shampú y gel',
      'Dispensador de jabón de manos',
      'Toalleros y accesorios de alta calidad',
      'Puerta plegable',
      'Espejo con apliques de luces led',
      'Mampara de cristal de una puerta deslizante',
      'Lavamanos y WC de color verde en dos tonos'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/6 Camaguey.jpg'],
    additionalPhotos: [
      'media/rooms/20240106_172019.jpg',
      'media/rooms/20240412_150459.jpg',
      'media/rooms/20240414_114020.jpg'
    ]
  },
  {
    number: 'P-204',
    name: 'Oriente',
    description: 'Es la cuarta habitación de la planta alta, asociada con la antigua provincia de Oriente, de acuerdo a la temática de la Villa, es la habitación más grande, apropiada para familias, pueden dormir cómodamente hasta 4 personas.',
    pricePerNight: 54,
    baseCapacity: 2,
    extraCapacity: 2,
    extraGuestCharge: 15,
    roomType: RoomType.STANDARD_PLUS,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto',
      'Ventilador de pared',
      'Refrigerador tipo Minibar',
      'Caja de seguridad',
      'Mueble para el minibar con escritorio',
      'Armario amplio para ropas con tabla superior para colocar maletas',
      'Espejo alargado para verse a cuerpo completo',
      'Iluminación central',
      'Sensor de humos con alarma sonora',
      'Apliques de luces laterales',
      'Dos camas de 1,20 x 1,90m',
      '2 mesitas de noche',
      'Iluminación central de 2 luces LED separadas ligeramente'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Extractor de aire con temporizador',
      'Secador de pelo',
      'Mampara de cristal de dos puertas deslizantes',
      'Ducha fija y móvil tipo teléfono',
      'Dispensador de shampú y gel',
      'Dispensador de jabón de manos',
      'Toalleros y accesorios de alta calidad',
      'Puerta plegable',
      'Espejo con apliques de luces led',
      'Lavamanos y WC de color negro'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/ 7 Oriente.jpg'],
    additionalPhotos: [
      'media/rooms/20231102_212739.jpg',
      'media/rooms/20231102_212857.jpg',
      'media/rooms/20240414_114407.jpg'
    ]
  },
  {
    number: 'APT-001',
    name: 'Apartamento Independiente',
    description: 'Apartamento independiente con entrada privada, totalmente equipado para máximo confort. Incluye sala, cocina, baño y habitación privada. Perfecto para familias o estancias prolongadas.',
    pricePerNight: 85,
    baseCapacity: 2,
    extraCapacity: 3,
    extraGuestCharge: 20,
    roomType: RoomType.SUITE_BALCONY,
    roomAmenities: [
      'Entrada privada independiente',
      'Sala de estar',
      'Cocina equipada',
      'Refrigerador de tamaño completo',
      'Microondas',
      'Cafetera',
      'Aire acondicionado',
      'Televisor de pantalla plana',
      'Caja de seguridad',
      'Cama matrimonial king size',
      'Sofá cama en sala',
      'Balcón privado',
      'WiFi de alta velocidad'
    ],
    bathroomAmenities: [
      'Agua fría y caliente',
      'Baño completo moderno',
      'Ducha con hidromasaje',
      'Secador de pelo',
      'Toalleros eléctricos',
      'Espejo con luz LED'
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/8 Apartamento.jpg'],
    additionalPhotos: [
      'media/rooms/20250303_161443.jpg',
      'media/rooms/20250310_124749.jpg',
      'media/rooms/20250325_124326.jpg',
      'media/rooms/IMG-20250427-WA0016.jpg',
      'media/rooms/IMG-20250427-WA0024.jpg',
      'media/rooms/IMG-20250427-WA0021.jpg',
      'media/rooms/IMG-20250427-WA0011.jpg'
    ]
  }
];

const promotionsData = [
  {
    title: 'Oferta para reuniones de trabajo / Lanzamientos de productos',
    maxPeople: 15,
    minPeople: 5,
    time: '4 horas',
    services: [
      'Local climatizado con TV de 75"',
      'Servicio de café, agua y bollería',
      'Ofertas puntuales de la carta del hostal'
    ],
    description: '',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE
  },
  {
    title: 'Oferta de alojamiento para parejas',
    maxPeople: 0,
    minPeople: 0,
    time: '20 horas',
    services: [
      'Habitación doble con confort hotelero, baño privado',
      'Uso y disfrute de la Terraza-BAR Archipiélago',
      'Música, ambiente agradable',
      'Karaoke y pantalla de proyección de audiovisuales',
      'Juegos de mesa de diversos tipos'
    ],
    description: '',
    checkInTime: '16:00',
    checkOutTime: '12:00',
    status: PromotionStatus.ACTIVE
  },
  {
    title: 'Oferta para disfrute de transmisión de eventos deportivos',
    maxPeople: 15,
    minPeople: 5,
    time: '4 horas',
    services: [
      'Local climatizado con TV de 75"',
      'Ofertas puntuales de la carta del hostal'
    ],
    description: '',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE
  },
  {
    title: 'Oferta para familias y amigos con previa reservación',
    maxPeople: 30,
    minPeople: 5,
    time: '',
    services: [
      'Uso y disfrute de la Terraza bar Archipiélago',
      'Música, ambiente agradable',
      'Karaoke y pantalla de proyección de videos',
      'Juegos de mesa de diversos tipos',
      'Ofertas puntuales de la carta del hostal',
      'Completa con congri, vianda frita, ensalada mixta y plato fuerte',
      'Un líquido incluido'
    ],
    description: '',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE
  },
  {
    title: 'Alquiler del local para bodas / cumpleaños / Baby shower',
    maxPeople: 40,
    minPeople: 0,
    time: '4 horas',
    services: [
      'Uso y disfrute de la terraza bar Archipiélago',
      'Mesas y sillas. Servicio en mesas',
      'Baño y limpieza del local'
    ],
    description: 'Independientemente del alquiler, el hostal puede contratar decoración, payasos, maestro de ceremonia, ceremonias de boda, etc., o el cliente puede subcontratarlos. No se permite entrada de bebidas (solo contratadas en el hostal). Se puede subcontratar buffet y cake.',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE
  }
];

async function seed() {
  console.log('===========================================');
  console.log('  INICIANDO SEED DE LA BASE DE DATOS');
  console.log('===========================================\n');

  try {
    console.log('1. Conectando al servidor MySQL...');
    await adminDataSource.initialize();
    console.log('   ✓ Conexión establecida\n');

    console.log(`2. Eliminando base de datos "${dbName}" si existe...`);
    await adminDataSource.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log('   ✓ Base de datos eliminada\n');

    console.log(`3. Creando base de datos "${dbName}"...`);
    await adminDataSource.query(`CREATE DATABASE ${dbName}`);
    console.log('   ✓ Base de datos creada\n');

    await adminDataSource.destroy();

    console.log('4. Conectando a la nueva base de datos...');
    await dataSource.initialize();
    console.log('   ✓ Conexión establecida\n');

    console.log('5. Obteniendo migraciones pendientes...');
    const pendingMigrations = await dataSource.showMigrations();
    console.log(`   ✓ Hay ${pendingMigrations ? 'migraciones pendientes' : 'sin migraciones pendientes'}\n`);

    console.log('6. Ejecutando migraciones...');
    const migrations = await dataSource.runMigrations();
    console.log(`   ✓ ${migrations.length} migraciones ejecutadas\n`);

    const roomRepo = dataSource.getRepository(Room);
    const promotionRepo = dataSource.getRepository(Promotion);
    const userRepo = dataSource.getRepository(User);

    console.log('7. Insertando habitaciones...');
    for (const roomData of roomsData) {
      const room = roomRepo.create(roomData);
      await roomRepo.save(room);
      console.log(`   ✓ "${room.name}" creada`);
    }

    console.log('\n7. Insertando promociones...');
    for (const promoData of promotionsData) {
      const promo = promotionRepo.create(promoData);
      await promotionRepo.save(promo);
      console.log(`   ✓ "${promo.title}" creada`);
    }

    console.log('\n8. Creando superusuario...');
    const superUser = userRepo.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@hostal.com',
      fullName: 'Administrador del Sistema',
      phone: '+53 55555555',
      isActive: true,
      isVerified: true,
      roles: ['admin']
    });
    await userRepo.save(superUser);
    console.log('   ✓ Superusuario creado');
    console.log('     - Username: admin');
    console.log('     - Password: admin123');

    console.log('\n===========================================');
    console.log('  ✅ SEED COMPLETADO EXITOSAMENTE');
    console.log('===========================================');
    console.log(`   - Habitaciones: ${roomsData.length}`);
    console.log(`   - Promociones: ${promotionsData.length}`);
    console.log(`   - Usuarios: 1 (admin)`);

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
