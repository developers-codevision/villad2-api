import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';
import { Room } from './rooms/entities/room.entity';
import {
  Promotion,
  PromotionStatus,
} from './promotions/entities/promotion.entity';
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
    number: '1',
    name: 'Isla de Pinos',
    description: 'Es la primera habitación de la planta baja - asociada con la Isla de Pinos - de acuerdo a la temática de la Villa. / This is the first room on the ground floor - associated with the Isle of Pines - according to the Villa theme.',
    pricePerNight: 42,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 5,
    roomType: RoomType.STANDARD_ECONOMIC,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto / Split type air conditioning with temperature control and remote control',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto / Flat screen TV and TV encoder box with remote control',
      'Ventilador de pared / Wall fan',
      'Refrigerador tipo Minibar / Minibar refrigerator',
      'Caja de seguridad / Safety deposit box',
      'Mueble para el minibar con escritorio / Minibar furniture with desk',
      'Espejo alargado para verse a cuerpo completo / Full-length mirror',
      'Iluminación central / Central lighting',
      'Sensor de humos con alarma sonora / Smoke detector with audible alarm',
      'Apliques de luces laterales / Side wall lights',
      'Cama matrimonial estándar / Standard double bed',
      '2 mesitas de noche / 2 nightstands',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Lavamanos y WC de color blancos / White washbasin and toilet',
      'Extractor de aire con temporizador / Air extractor with timer',
      'Secador de pelo / Hair dryer',
      'Espejo / Mirror',
      'Mampara de cristal de dos puertas deslizantes / Glass shower enclosure with two sliding doors',
      'Ducha fija y móvil tipo teléfono / Fixed and handheld telephone-type shower',
      'Dispensador de shampú y gel / Shampoo and gel dispenser',
      'Dispensador de jabón de manos / Hand soap dispenser',
      'Toalleros y accesorios de alta calidad / High-quality towel racks and accessories',
      'Puerta plegable / Folding door',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/1 Isla de Pinos.webp'],
    additionalPhotos: [
      'media/rooms/20240414_111644.webp',
      'media/rooms/20240414_111725.webp',
      'media/rooms/20240414_111742.webp',
    ],
  },
  {
    number: '2',
    name: 'Pinar del Río',
    description: 'Es la 2da habitación de la planta baja - asociada con la antigua provincia de Pinar del Río - de acuerdo a la temática de la Villa. / This is the 2nd room on the ground floor - associated with the former province of Pinar del Río - according to the Villa theme.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 5,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto / Split type air conditioning with temperature control and remote control',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto / Flat screen TV and TV encoder box with remote control',
      'Ventilador de pared / Wall fan',
      'Refrigerador tipo Minibar / Minibar refrigerator',
      'Caja de seguridad / Safety deposit box',
      'Colgador para ropas con tabla superior para colocar maletas / Clothes hanger with top shelf for luggage',
      'Mueble para el minibar con escritorio / Minibar furniture with desk',
      'Espejo alargado para verse a cuerpo completo / Full-length mirror',
      'Iluminación central / Central lighting',
      'Sensor de humos con alarma sonora / Smoke detector with audible alarm',
      'Apliques de luces laterales / Side wall lights',
      'Tomacorrientes con 2 puertos USB / Power outlet with 2 USB ports',
      'Cama matrimonial estándar / Standard double bed',
      '2 mesitas de noche / 2 nightstands',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Extractor de aire con temporizador / Air extractor with timer',
      'Secador de pelo / Hair dryer',
      'Ducha fija y móvil tipo teléfono / Fixed and handheld telephone-type shower',
      'Dispensador de shampú y gel / Shampoo and gel dispenser',
      'Dispensador de jabón de manos / Hand soap dispenser',
      'Toalleros y accesorios de alta calidad / High-quality towel racks and accessories',
      'Puerta plegable / Folding door',
      'Lavamanos y WC de color rojo / Red washbasin and toilet',
      'Espejo con apliques de luces led / Mirror with LED light fixtures',
      'Mampara de cristal de un pano fijo / Single fixed glass shower panel',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/2 Pinar del Rio.webp'],
    additionalPhotos: [
      'media/rooms/20240106_170212.webp',
      'media/rooms/20240106_170258.webp',
      'media/rooms/20240106_170324.webp',
    ],
  },
  {
    number: '3',
    name: 'Matanzas',
    description: 'Es la tercera habitación de la planta baja - asociada con la antigua provincia de Matanzas - de acuerdo a la temática de la Villa. / This is the third room on the ground floor - associated with the former province of Matanzas - according to the Villa theme.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 5,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto / Split type air conditioning with temperature control and remote control',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto / Flat screen TV and TV encoder box with remote control',
      'Ventilador de pared / Wall fan',
      'Refrigerador tipo Minibar / Minibar refrigerator',
      'Caja de seguridad / Safety deposit box',
      'Colgador para ropas con tabla superior para colocar maletas / Clothes hanger with top shelf for luggage',
      'Mueble para el minibar con escritorio / Minibar furniture with desk',
      'Espejo alargado para verse a cuerpo completo / Full-length mirror',
      'Iluminación central / Central lighting',
      'Sensor de humos con alarma sonora / Smoke detector with audible alarm',
      'Apliques de luces laterales / Side wall lights',
      'Tomacorrientes con 2 puertos USB / Power outlet with 2 USB ports',
      'Cama matrimonial estándar / Standard double bed',
      '2 mesitas de noche / 2 nightstands',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Lavamanos y WC de color blancos / White washbasin and toilet',
      'Extractor de aire con temporizador / Air extractor with timer',
      'Secador de pelo / Hair dryer',
      'Mampara de cristal de dos puertas deslizantes / Glass shower enclosure with two sliding doors',
      'Ducha fija y móvil tipo teléfono / Fixed and handheld telephone-type shower',
      'Dispensador de shampú y gel / Shampoo and gel dispenser',
      'Dispensador de jabón de manos / Hand soap dispenser',
      'Toalleros y accesorios de alta calidad / High-quality towel racks and accessories',
      'Puerta plegable / Folding door',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/3 Matanzas.webp'],
    additionalPhotos: [
      'media/rooms/20240106_170816.webp',
      'media/rooms/20240106_170839.webp',
      'media/rooms/20240414_112346.webp',
    ],
  },
  {
    number: '4',
    name: 'La Habana',
    description: 'Es la primera habitación de la planta alta - asociada con la antigua provincia de La Habana - de acuerdo a la temática de la Villa - tiene un gran tamaño y cuenta además con un sofá cama adicional. En esta habitación pueden dormir hasta 4 personas. / This is the first room on the upper floor - associated with the former province of Havana - according to the Villa theme. It is large and also has an additional sofa bed. Up to 4 people can sleep in this room.',
    pricePerNight: 60,
    baseCapacity: 2,
    extraCapacity: 2,
    extraGuestCharge: 15,
    roomType: RoomType.SUITE_BALCONY,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto / Split type air conditioning with temperature control and remote control',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto / Flat screen TV and TV encoder box with remote control',
      'Ventilador de pared / Wall fan',
      'Refrigerador tipo Minibar / Minibar refrigerator',
      'Caja de seguridad / Safety deposit box',
      'Mueble para el minibar con escritorio / Minibar furniture with desk',
      'Espejo alargado para verse a cuerpo completo / Full-length mirror',
      'Iluminación central / Central lighting',
      'Sensor de humos con alarma sonora / Smoke detector with audible alarm',
      'Apliques de luces laterales / Side wall lights',
      'Cama matrimonial estándar / Standard double bed',
      '2 mesitas de noche / 2 nightstands',
      'Armario para ropas con cajones inferiores / Wardrobe with lower drawers',
      'Sofá cama / Sofa bed',
      'Acceso a balcón / Balcony access',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Extractor de aire con temporizador / Air extractor with timer',
      'Secador de pelo / Hair dryer',
      'Ducha fija y móvil tipo teléfono / Fixed and handheld telephone-type shower',
      'Dispensador de shampú y gel / Shampoo and gel dispenser',
      'Dispensador de jabón de manos / Hand soap dispenser',
      'Toalleros y accesorios de alta calidad / High-quality towel racks and accessories',
      'Puerta plegable / Folding door',
      'Lavamanos y WC de color rojo / Red washbasin and toilet',
      'Espejo con apliques de luces led / Mirror with LED light fixtures',
      'Mampara de cristal de una puerta deslizante / Single sliding glass shower door',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/4 La Habana.webp'],
    additionalPhotos: [
      'media/rooms/20240106_171348.webp',
      'media/rooms/20240106_171436.webp',
      'media/rooms/20240412_145928.webp',
      'media/rooms/20240412_145941.webp',
      'media/rooms/20240414_113107.webp',
    ],
  },
  {
    number: '5',
    name: 'Las Villas',
    description: 'Es la segunda habitación de la planta alta - asociada con la antigua provincia de Las Villas - de acuerdo a la temática de la Villa. / This is the second room on the upper floor - associated with the former province of Las Villas - according to the Villa theme.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 5,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto / Split type air conditioning with temperature control and remote control',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto / Flat screen TV and TV encoder box with remote control',
      'Ventilador de pared / Wall fan',
      'Refrigerador tipo Minibar / Minibar refrigerator',
      'Caja de seguridad / Safety deposit box',
      'Colgador para ropas con tabla superior para colocar maletas / Clothes hanger with top shelf for luggage',
      'Mueble para el minibar con escritorio / Minibar furniture with desk',
      'Espejo alargado para verse a cuerpo completo / Full-length mirror',
      'Iluminación central / Central lighting',
      'Sensor de humos con alarma sonora / Smoke detector with audible alarm',
      'Apliques de luces laterales / Side wall lights',
      'Tomacorrientes con 2 puertos USB / Power outlet with 2 USB ports',
      'Cama matrimonial estándar / Standard double bed',
      '2 mesitas de noche / 2 nightstands',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Lavamanos y WC de color blancos / White washbasin and toilet',
      'Extractor de aire con temporizador / Air extractor with timer',
      'Secador de pelo / Hair dryer',
      'Mampara de cristal de dos puertas deslizantes / Glass shower enclosure with two sliding doors',
      'Ducha fija y móvil tipo teléfono / Fixed and handheld telephone-type shower',
      'Dispensador de shampú y gel / Shampoo and gel dispenser',
      'Dispensador de jabón de manos / Hand soap dispenser',
      'Toalleros y accesorios de alta calidad / High-quality towel racks and accessories',
      'Puerta plegable / Folding door',
      'Espejo con apliques de luces led / Mirror with LED light fixtures',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/5 Las Villas.webp'],
    additionalPhotos: [
      'media/rooms/20240106_171614.webp',
      'media/rooms/20240106_171654.webp',
      'media/rooms/20240106_171738.webp',
    ],
  },
  {
    number: '6',
    name: 'Camagüey',
    description: 'Es la tercera habitación de la planta alta - asociada con la antigua provincia de Camagüey - de acuerdo a la temática de la Villa. / This is the third room on the upper floor - associated with the former province of Camagüey - according to the Villa theme.',
    pricePerNight: 48,
    baseCapacity: 2,
    extraCapacity: 0,
    extraGuestCharge: 5,
    roomType: RoomType.STANDARD,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto / Split type air conditioning with temperature control and remote control',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto / Flat screen TV and TV encoder box with remote control',
      'Ventilador de pared / Wall fan',
      'Refrigerador tipo Minibar / Minibar refrigerator',
      'Caja de seguridad / Safety deposit box',
      'Colgador para ropas con tabla superior para colocar maletas / Clothes hanger with top shelf for luggage',
      'Mueble para el minibar con escritorio / Minibar furniture with desk',
      'Espejo alargado para verse a cuerpo completo / Full-length mirror',
      'Iluminación central / Central lighting',
      'Sensor de humos con alarma sonora / Smoke detector with audible alarm',
      'Apliques de luces laterales / Side wall lights',
      'Tomacorrientes con 2 puertos USB / Power outlet with 2 USB ports',
      'Cama matrimonial estándar / Standard double bed',
      '2 mesitas de noche / 2 nightstands',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Extractor de aire con temporizador / Air extractor with timer',
      'Secador de pelo / Hair dryer',
      'Ducha fija y móvil tipo teléfono / Fixed and handheld telephone-type shower',
      'Dispensador de shampú y gel / Shampoo and gel dispenser',
      'Dispensador de jabón de manos / Hand soap dispenser',
      'Toalleros y accesorios de alta calidad / High-quality towel racks and accessories',
      'Puerta plegable / Folding door',
      'Espejo con apliques de luces led / Mirror with LED light fixtures',
      'Mampara de cristal de una puerta deslizante / Single sliding glass shower door',
      'Lavamanos y WC de color verde en dos tonos / Two-tone green washbasin and toilet',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/6 Camaguey.webp'],
    additionalPhotos: [
      'media/rooms/20240106_172019.webp',
      'media/rooms/20240412_150459.webp',
      'media/rooms/20240414_114020.webp',
    ],
  },
  {
    number: '7',
    name: 'Oriente',
    description: 'Es la cuarta habitación de la planta alta - asociada con la antigua provincia de Oriente - de acuerdo a la temática de la Villa - es la habitación más grande - apropiada para familias - pueden dormir cómodamente hasta 4 personas. / This is the fourth room on the upper floor - associated with the former province of Oriente - according to the Villa theme. It is the largest room - suitable for families - where up to 4 people can sleep comfortably.',
    pricePerNight: 54,
    baseCapacity: 2,
    extraCapacity: 2,
    extraGuestCharge: 15,
    roomType: RoomType.STANDARD_PLUS,
    roomAmenities: [
      'Aire acondicionado tipo Split con control de temperatura y control remoto / Split type air conditioning with temperature control and remote control',
      'Televisor de pantalla plana y caja codificadora para TV con control remoto / Flat screen TV and TV encoder box with remote control',
      'Ventilador de pared / Wall fan',
      'Refrigerador tipo Minibar / Minibar refrigerator',
      'Caja de seguridad / Safety deposit box',
      'Mueble para el minibar con escritorio / Minibar furniture with desk',
      'Armario amplio para ropas con tabla superior para colocar maletas / Large wardrobe with top shelf for luggage',
      'Espejo alargado para verse a cuerpo completo / Full-length mirror',
      'Iluminación central / Central lighting',
      'Sensor de humos con alarma sonora / Smoke detector with audible alarm',
      'Apliques de luces laterales / Side wall lights',
      'Dos camas de 1.20 x 1.90m / Two beds of 1.20 x 1.90m',
      '2 mesitas de noche / 2 nightstands',
      'Iluminación central de 2 luces LED separadas ligeramente / Central lighting with 2 slightly separated LED lights',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Extractor de aire con temporizador / Air extractor with timer',
      'Secador de pelo / Hair dryer',
      'Mampara de cristal de dos puertas deslizantes / Glass shower enclosure with two sliding doors',
      'Ducha fija y móvil tipo teléfono / Fixed and handheld telephone-type shower',
      'Dispensador de shampú y gel / Shampoo and gel dispenser',
      'Dispensador de jabón de manos / Hand soap dispenser',
      'Toalleros y accesorios de alta calidad / High-quality towel racks and accessories',
      'Puerta plegable / Folding door',
      'Espejo con apliques de luces led / Mirror with LED light fixtures',
      'Lavamanos y WC de color negro / Black washbasin and toilet',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/ 7 Oriente.webp'],
    additionalPhotos: [
      'media/rooms/20231102_212739.webp',
      'media/rooms/20231102_212857.webp',
      'media/rooms/20240414_114407.webp',
    ],
  },
  {
    number: '8',
    name: 'Apartamento Independiente',
    description: 'Apartamento independiente con entrada privada - totalmente equipado para máximo confort. Incluye sala - cocina - baño y habitación privada. Perfecto para familias o estancias prolongadas. / Independent apartment with private entrance - fully equipped for maximum comfort. Includes living room - kitchen - bathroom and private bedroom. Perfect for families or extended stays.',
    pricePerNight: 85,
    baseCapacity: 2,
    extraCapacity: 2,
    extraGuestCharge: 20,
    roomType: RoomType.SUITE_BALCONY,
    roomAmenities: [
      'Entrada privada independiente / Private independent entrance',
      'Sala de estar / Living room',
      'Cocina equipada / Equipped kitchen',
      'Refrigerador de tamaño completo / Full-size refrigerator',
      'Microondas / Microwave',
      'Cafetera / Coffee maker',
      'Aire acondicionado / Air conditioning',
      'Televisor de pantalla plana / Flat screen TV',
      'Caja de seguridad / Safety deposit box',
      'Cama matrimonial king size / King size double bed',
      'Sofá cama en sala / Sofa bed in living room',
      'Balcón privado / Private balcony',
      'WiFi de alta velocidad / High-speed WiFi',
    ],
    bathroomAmenities: [
      'Agua fría y caliente / Hot and cold water',
      'Baño completo moderno / Modern full bathroom',
      'Ducha con hidromasaje / Shower with hydromassage',
      'Secador de pelo / Hair dryer',
      'Toalleros eléctricos / Electric towel warmers',
      'Espejo con luz LED / Mirror with LED light',
    ],
    status: RoomStatus.VACIA_LIMPIA,
    mainPhoto: ['media/rooms/8 Apartamento.webp'],
    additionalPhotos: [
      'media/rooms/20250303_161443.webp',
      'media/rooms/20250310_124749.webp',
      'media/rooms/20250325_124326.webp',
      'media/rooms/IMG-20250427-WA0016.webp',
      'media/rooms/IMG-20250427-WA0024.webp',
      'media/rooms/IMG-20250427-WA0021.webp',
      'media/rooms/IMG-20250427-WA0011.webp',
    ],
  },
];

const promotionsData = [
  {
    title: 'Oferta para reuniones de trabajo - Lanzamientos de productos / Business Meetings - Product Launches Offer',
    maxPeople: 15,
    minPeople: 5,
    time: '4 horas',
    services: [
      'Local climatizado con TV de 75" / Climate-controlled venue with 75" TV',
      'Servicio de café - agua y bollería / Coffee - water and pastries service',
      'Ofertas puntuales de la carta del hostal / Special offers from the hostel menu',
    ],
    description: '',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE,
  },
  {
    title: 'Oferta de alojamiento para parejas / Couples Accommodation Offer',
    maxPeople: 2,
    minPeople: 0,
    time: '20 horas',
    services: [
      'Habitación doble con confort hotelero - baño privado / Double room with hotel comfort - private bathroom',
      'Uso y disfrute de la Terraza-BAR Archipiélago / Use and enjoyment of the Archipiélago Terrace-BAR',
      'Música - ambiente agradable / Music - pleasant atmosphere',
      'Karaoke y pantalla de proyección de audiovisuales / Karaoke and audiovisual projection screen',
      'Juegos de mesa de diversos tipos / Various board games',
    ],
    description: '',
    checkInTime: '16:00',
    checkOutTime: '12:00',
    status: PromotionStatus.ACTIVE,
  },
  {
    title: 'Oferta para disfrute de transmisión de eventos deportivos / Sports Events Broadcasting Offer',
    maxPeople: 15,
    minPeople: 5,
    time: '4 horas',
    services: [
      'Local climatizado con TV de 75" / Climate-controlled venue with 75" TV',
      'Ofertas puntuales de la carta del hostal / Special offers from the hostel menu',
    ],
    description: '',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE,
  },
  {
    title: 'Oferta para familias y amigos con previa reservación / Families and Friends Offer with Advance Reservation',
    maxPeople: 30,
    minPeople: 5,
    time: '',
    services: [
      'Uso y disfrute de la Terraza bar Archipiélago / Use and enjoyment of the Archipiélago Terrace bar',
      'Música - ambiente agradable / Music - pleasant atmosphere',
      'Karaoke y pantalla de proyección de videos / Karaoke and video projection screen',
      'Juegos de mesa de diversos tipos / Various board games',
      'Ofertas puntuales de la carta del hostal / Special offers from the hostel menu',
      'Completa con congris - vianda frita - ensalada mixta y plato fuerte / Complete with congris rice - fried vegetables - mixed salad and main course',
      'Un líquido incluido / One beverage included',
    ],
    description: '',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE,
  },
  {
    title: 'Alquiler del local para bodas / cumpleaños / Baby shower / Venue Rental for Weddings / Birthdays / Baby Showers',
    maxPeople: 40,
    minPeople: 0,
    time: '4 horas',
    services: [
      'Uso y disfrute de la terraza bar Archipiélago / Use and enjoyment of the Archipiélago Terrace bar',
      'Mesas y sillas. Servicio en mesas / Tables and chairs. Table service',
      'Baño y limpieza del local / Bathroom and venue cleaning',
    ],
    description:
      'Independientemente del alquiler - el hostal puede contratar decoración - payasos - maestro de ceremonia - ceremonias de boda - etc. - o el cliente puede subcontratarlos. / Regardless of the rental - the hostel can arrange decoration - clowns - master of ceremonies - wedding ceremonies - etc. - or the client can subcontract them. No outside beverages allowed',
    checkInTime: '',
    checkOutTime: '',
    status: PromotionStatus.ACTIVE,
  },
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
    console.log(
      `   ✓ Hay ${pendingMigrations ? 'migraciones pendientes' : 'sin migraciones pendientes'}\n`,
    );

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
      roles: ['admin'],
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
