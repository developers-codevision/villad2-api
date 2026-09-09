-- Private descriptions for all menu products
-- Based on product names and common knowledge about Cuban hotel menu items

-- Minibar products (1-8)
UPDATE menu_products SET private_description = 'Galletas de diferentes marcas, ideal para snack rápido. Contiene gluten, harina de trigo, mantequilla, azúcar.' WHERE id = 1;
UPDATE menu_products SET private_description = 'Dulces variados: chocolate, caramelos, gomitas. ideal para antojo. Contiene azúcar, lácteos según variedad.' WHERE id = 2;
UPDATE menu_products SET private_description = 'Agua purificada botella 500ml. Sin gas, sin calorías. Hidratación básica.' WHERE id = 3;
UPDATE menu_products SET private_description = 'Jugos naturales de frutas tropicales: mango, piña, guayaba. Envasados, sin preservantes artificiales.' WHERE id = 4;
UPDATE menu_products SET private_description = 'Refrescos nacionales e internacionales: Coca-Cola, Sprite, Fanta. Lata 355ml. Contiene azúcar, cafeína en colas.' WHERE id = 5;
UPDATE menu_products SET private_description = 'Bebida energizante: Red Bull o similar. Lata 250ml. Contiene cafeína, taurina, azúcar. No recomendado antes de dormir.' WHERE id = 6;
UPDATE menu_products SET private_description = 'Cerveza nacional cubana: Cristal, Bucanero o Mayabe. Botella 355ml. Lúpulo, cebada, levadura. 4.5-5% alcohol.' WHERE id = 7;
UPDATE menu_products SET private_description = 'Cerveza importada: Heineken, Corona o similar. Botella 330ml. Mayor cuerpo y sabor que la nacional.' WHERE id = 8;

-- Desayuno económico (9-11)
UPDATE menu_products SET private_description = 'Jugo de frutas tropicales fresco o envasado, leche entera o descremada. Opciones según disponibilidad. Sin gluten.' WHERE id = 9;
UPDATE menu_products SET private_description = 'Sandwich de jamón y queso en pan cubano, o tortilla natural de huevos con tostada. Incluye mantequilla. Contiene gluten, lácteos, huevos.' WHERE id = 10;
UPDATE menu_products SET private_description = 'Café con leche cubano, café negro, o té negro o verde. Leche de vaca. Sin cafeína en té verde.' WHERE id = 11;

-- Desayuno standard (12-16)
UPDATE menu_products SET private_description = 'Tostadas de pan cubano con mantequilla. Pan fresco del día. Contiene gluten, lácteos.' WHERE id = 12;
UPDATE menu_products SET private_description = 'Frutas tropicales frescas: papaya, mango, piña, plátano. Cortadas al momento. Sin conservantes.' WHERE id = 13;
UPDATE menu_products SET private_description = 'Jugo de frutas tropicales fresco o envasado, leche entera o descremada. Sin gluten.' WHERE id = 14;
UPDATE menu_products SET private_description = 'Entremés de jamón y queso, o sandwich de jamón y queso, o tortilla natural con tostada. Opciones según preferencia.' WHERE id = 15;
UPDATE menu_products SET private_description = 'Café con leche cubano, café negro, o té. Bebida caliente del desayuno.' WHERE id = 16;

-- Desayuno Villa D2 (17-23)
UPDATE menu_products SET private_description = 'Tostadas de pan cubano con mantequilla. Base del desayuno completo.' WHERE id = 17;
UPDATE menu_products SET private_description = 'Frutas tropicales frescas de temporada. Ricas en vitaminas y fibra.' WHERE id = 18;
UPDATE menu_products SET private_description = 'Jugo de frutas tropicales fresco, leche entera o descremada. Bebida complementaria.' WHERE id = 19;
UPDATE menu_products SET private_description = 'Entremés o sandwich de jamón y queso. Proteína del desayuno.' WHERE id = 20;
UPDATE menu_products SET private_description = 'Tortilla de huevos, huevos fritos, revueltos o cocidos. Preparación al gusto. Contiene huevos.' WHERE id = 21;
UPDATE menu_products SET private_description = 'Bollería fresca: croissants, pastelitos, muffins. Horneados diariamente. Contiene gluten, lácteos, huevos.' WHERE id = 22;
UPDATE menu_products SET private_description = 'Café con leche cubano, café negro o té. Bebida caliente para acompañar.' WHERE id = 23;

-- Lavandería mujeres (24-29)
UPDATE menu_products SET private_description = 'Lavado y planchado de blusa. Ropa interior femenina. Tiempo de entrega: 24-48 horas.' WHERE id = 24;
UPDATE menu_products SET private_description = 'Lavado de braga o ropa interior femenina. Garmento delicado, lavado a mano o ciclo suave.' WHERE id = 25;
UPDATE menu_products SET private_description = 'Lavado y planchado de falda. Prenda formal o casual. Plancha estándar.' WHERE id = 26;
UPDATE menu_products SET private_description = 'Lavado de medias o calcetines femeninos. Ropa interior, lavado estándar.' WHERE id = 27;
UPDATE menu_products SET private_description = 'Lavado de sujetador o bra. Prenda delicada, lavado a mano recomendado.' WHERE id = 28;
UPDATE menu_products SET private_description = 'Lavado y planchado de vestido. Prenda formal o casual. Cuidado especial según tela.' WHERE id = 29;

-- Lavandería hombres (30-37)
UPDATE menu_products SET private_description = 'Lavado de calcetines o socks masculinos. Ropa interior, lavado estándar.' WHERE id = 30;
UPDATE menu_products SET private_description = 'Lavado de calzoncillos o ropa interior masculina. Lavado estándar, ciclo normal.' WHERE id = 31;
UPDATE menu_products SET private_description = 'Lavado y planchado de camisa. Formal o casual. Plancha con vapor.' WHERE id = 32;
UPDATE menu_products SET private_description = 'Lavado y planchado de camiseta. Algodón o mezclilla. Plancha estándar.' WHERE id = 33;
UPDATE menu_products SET private_description = 'Lavado y planchado de pantalón largo. Formal o casual. Plancha con doblez.' WHERE id = 34;
UPDATE menu_products SET private_description = 'Lavado y planchado de pantalón corto. Casual. Plancha ligera.' WHERE id = 35;
UPDATE menu_products SET private_description = 'Lavado de pijama o ropa de dormir. Tela ligera, lavado suave.' WHERE id = 36;
UPDATE menu_products SET private_description = 'Lavado de pañuelo o bufanda. Accesorio delicado, lavado a mano.' WHERE id = 37;

-- Lavandería niños (38-46)
UPDATE menu_products SET private_description = 'Lavado de calcetines infantiles. Ropa de niños, lavado estándar.' WHERE id = 38;
UPDATE menu_products SET private_description = 'Lavado de calzoncillos infantiles. Ropa interior de niños, lavado suave.' WHERE id = 39;
UPDATE menu_products SET private_description = 'Lavado y planchado de camisa infantil. Ropa formal de niños.' WHERE id = 40;
UPDATE menu_products SET private_description = 'Lavado y planchado de camiseta infantil. Ropa casual de niños.' WHERE id = 41;
UPDATE menu_products SET private_description = 'Lavado y planchado de pantalón infantil. Ropa de niños, plancha estándar.' WHERE id = 42;
UPDATE menu_products SET private_description = 'Lavado y planchado de pantalón corto infantil. Ropa de verano para niños.' WHERE id = 43;
UPDATE menu_products SET private_description = 'Lavado de pijama infantil. Ropa de dormir para niños, lavado suave.' WHERE id = 44;
UPDATE menu_products SET private_description = 'Lavado y planchado de vestido infantil. Ropa formal para niñas.' WHERE id = 45;
UPDATE menu_products SET private_description = 'Lavado de toallas. Toallas de baño o playa, lavado estándar con suavizante.' WHERE id = 46;

-- Picadera (47, 163-182)
UPDATE menu_products SET private_description = 'Entremés clásico: jamón serrano, queso manchego y aceitunas verdes. Ración para compartir. Contiene lácteos, frutos secos según queso.' WHERE id = 47;
UPDATE menu_products SET private_description = 'Picadera especial de la casa: selección de embutidos, quesos, vegetales y pan. Ración generosa para 2-3 personas. Contiene gluten, lácteos.' WHERE id = 163;
UPDATE menu_products SET private_description = 'Sandwich de jamón cocido en pan blanco o integral. Jamón de pavo o cerdo. Contiene gluten.' WHERE id = 164;
UPDATE menu_products SET private_description = 'Sandwich de queso derretido en pan blanco. Qeso gouda o mozzarella. Contiene lácteos, gluten.' WHERE id = 165;
UPDATE menu_products SET private_description = 'Sandwich combinado: jamón y queso derretido en pan cubano. Clásico y sustancioso. Contiene gluten, lácteos.' WHERE id = 166;
UPDATE menu_products SET private_description = 'Croqueta de jamón casera o albóndiga de carne de la casa con salsa. Porción individual. Contiene gluten, lácteos.' WHERE id = 167;
UPDATE menu_products SET private_description = 'Hamburguesa de carne molida a la parrilla, lechuga, tomate, cebolla en pan tuestado. Contiene gluten, lácteos.' WHERE id = 168;
UPDATE menu_products SET private_description = 'Pan cubano con croqueta de jamón o albóndiga. Snack ligero, ideal para merendar. Contiene gluten.' WHERE id = 169;
UPDATE menu_products SET private_description = 'Pan cubano con hamburguesa mini. Porción individual, rápido y sustancioso. Contiene gluten.' WHERE id = 170;
UPDATE menu_products SET private_description = 'Hamburguesa especial de la casa con queso, lechuga, tomate, salsa secreta. Pan brioche. Contiene gluten, lácteos, huevos.' WHERE id = 171;
UPDATE menu_products SET private_description = 'Pan cubano con tortilla de huevos natural. Ligero y nutritivo. Contiene gluten, huevos.' WHERE id = 172;
UPDATE menu_products SET private_description = 'Pan cubano con tortilla, jamón y queso. Desayuno rápido o merienda. Contiene gluten, lácteos, huevos.' WHERE id = 173;
UPDATE menu_products SET private_description = 'Mini hot dog en pan suave con mostaza y ketchup. Snack para niños o merienda. Contiene gluten.' WHERE id = 174;
UPDATE menu_products SET private_description = 'Hot dog completo en pan suave con mostaza, ketchup, mayonesa. Salchicha de pavo o cerdo. Contiene gluten, huevos.' WHERE id = 175;
UPDATE menu_products SET private_description = 'Pizza napolitana individual: masa fina, salsa de tomate, mozzarella, albahaca fresca. Horneada en horno de leña. Contiene gluten, lácteos.' WHERE id = 176;
UPDATE menu_products SET private_description = 'Pizza con jamón y queso derretido. Masa fina, salsa de tomate. Porción individual. Contiene gluten, lácteos.' WHERE id = 177;
UPDATE menu_products SET private_description = 'Pizzeta napolitana pequeña: masa fina, tomate, mozzarella. Para quien quiere menos cantidad. Contiene gluten, lácteos.' WHERE id = 178;
UPDATE menu_products SET private_description = 'Pizzeta de jamón y queso pequeña. Porción individual ligera. Contiene gluten, lácteos.' WHERE id = 179;
UPDATE menu_products SET private_description = 'Palomita de maíz tostada o papas fritas crocantes. Snack para acompañar bebidas. Contiene sal, aceite.' WHERE id = 180;
UPDATE menu_products SET private_description = 'Copa de helado artesanal: vainilla, chocolate o fresa. Postre fresco y dulce. Contiene lácteos.' WHERE id = 181;
UPDATE menu_products SET private_description = 'Malteada cremosa: chocolate, fresa o vainilla con leche y hielo batido. Bebida postre. Contiene lácteos, azúcar.' WHERE id = 182;

-- Tourist tours (67-73)
UPDATE menu_products SET private_description = 'Servicio de traslado guiado o sin guía a cualquier destino turístico en La Habana o alrededores. Incluye transporte y conductor. No incluye entrada a museos.' WHERE id = 67;
UPDATE menu_products SET private_description = 'Visita guiada a museos de La Habana: Museo de la Revolución, Fusterlandia, etc. Entrada no incluida. Transporte desde el hostal.' WHERE id = 68;
UPDATE menu_products SET private_description = 'Recorrido por la vida nocturna de La Habana: cabarets, música en vivo, bares. Transporte incluido. No incluye consumiciones.' WHERE id = 69;
UPDATE menu_products SET private_description = 'Tour gastronómico por La Habana: restaurantes tradicionales, paladares. Degustación incluida según itinerario.' WHERE id = 70;
UPDATE menu_products SET private_description = 'Actividades culturales: talleres de arte, visitas a galerías, clases de salsa. Experiencia inmersiva en la cultura cubana.' WHERE id = 71;
UPDATE menu_products SET private_description = 'Paseos por el Malecón, Parque Lenin, zonas verdes. Caminata guiada o en bicicleta. Naturaleza y arquitectura.' WHERE id = 72;
UPDATE menu_products SET private_description = 'Excursiones de día completo: Viñales, Varadero, Trinidad. Transporte, guía y almuerzo incluidos según paquete.' WHERE id = 73;

-- Transfers (74-85)
UPDATE menu_products SET private_description = 'Servicio de transfer y traslados privados en vehículo air-conditioned. Conductor profesional, puntualidad garantizada.' WHERE id = 74;
UPDATE menu_products SET private_description = 'Recogida en aeropuerto José Martí (Terminal 1, 2 o 3) entre 8am y 6pm. Espera con cartel con nombre del huésped. Precio por vehículo.' WHERE id = 75;
UPDATE menu_products SET private_description = 'Recogida en aeropuerto José Martí entre 7pm y 7am. Tarifa nocturna por disponibilidad y riesgo. Confirmar con anticipación.' WHERE id = 76;
UPDATE menu_products SET private_description = 'Traslado de regreso al aeropuerto José Martí entre 8am y 6pm. Salida 3 horas antes del vuelo. Incluye espera.' WHERE id = 77;
UPDATE menu_products SET private_description = 'Traslado de regreso al aeropuerto entre 7pm y 7am. Tarifa nocturna. Confirmar disponibilidad con 24h de anticipación.' WHERE id = 78;
UPDATE menu_products SET private_description = 'Traslado solitario a embajadas, consulados u hospitales en La Habana. Sin esperar, directo al destino.' WHERE id = 79;
UPDATE menu_products SET private_description = 'Traslado ida y regreso a embajadas, consulados u hospitales. Espera incluida hasta 1 hora. Precio por viaje.' WHERE id = 80;
UPDATE menu_products SET private_description = 'Recogida en terminal de ómnibus nacional entre 8am y 6pm. Coordinar hora exacta de llegada del bus.' WHERE id = 81;
UPDATE menu_products SET private_description = 'Recogida en terminal de ómnibus nacional entre 7pm y 7am. Tarifa nocturna. Confirmar con anticipación.' WHERE id = 82;
UPDATE menu_products SET private_description = 'Recogida en terminal de Villanueva (Villa Clara) entre 8am y 6pm. Para turistas que llegan por tierra.' WHERE id = 83;
UPDATE menu_products SET private_description = 'Recogida en terminal de Villanueva entre 7pm y 7am. Tarifa nocturna. Coordinar con anticipación.' WHERE id = 84;
UPDATE menu_products SET private_description = 'Traslado a otros destinos o aeropuertos fuera de La Habana. Precio variable según distancia. Consultar disponibilidad.' WHERE id = 85;

-- Vinos (86-88)
UPDATE menu_products SET private_description = 'Copa de vino: blanco (Sauvignon Blanc), rosado (rosé), tinto (Cabernet Sauvignon) u Oporto. Vino importado, servicio en cristalería limpia.' WHERE id = 86;
UPDATE menu_products SET private_description = 'Botella completa de vino: blanco, rosado, tinto u Oporto. Ideal para compartir. Selección de vinos importados.' WHERE id = 87;
UPDATE menu_products SET private_description = 'Cava española o champagne francés. Bebida espumosa para celebraciones. Servida en flauta o copa de cava.' WHERE id = 88;

-- Transfer detail services already covered in 74-85

-- Wine list items (86-88 already done)

-- Bar Terraza (190-242)

-- Bebidas (190-192)
UPDATE menu_products SET private_description = 'Cerveza nacional cubana fría: Cristal, Bucanano o Mayabe. Botella 355ml. Temperatura de servicio: 4°C.' WHERE id = 190;
UPDATE menu_products SET private_description = 'Cerveza importada: Heineken, Corona, Budweiser o similar. Botella 330ml. Mayor cuerpo que la nacional.' WHERE id = 191;
UPDATE menu_products SET private_description = 'Energizante Red Bull o similar. Lata 250ml. Ideal para contrastar con el alcohol. Contiene cafeína alta.' WHERE id = 192;

-- Café y té (193-197)
UPDATE menu_products SET private_description = 'Té negro, verde, manzanilla o hierbabuena. Infusión caliente, servida con azúcar al gusto. Sin cafeína en manzanilla.' WHERE id = 193;
UPDATE menu_products SET private_description = 'Café espresso cubano, fuerte y aromático. Taza pequeña, concentrado. Origen: café arábico cubano.' WHERE id = 194;
UPDATE menu_products SET private_description = 'Café cortado: espresso con un chorrito de leche caliente. Equilibrio entre intensidad y suavidad.' WHERE id = 195;
UPDATE menu_products SET private_description = 'Cappuccino: espresso con espuma de leche vaporizada. Bebida cremosa, ideal para la tarde.' WHERE id = 196;
UPDATE menu_products SET private_description = 'Café americano: espresso diluido con agua caliente. Bebida suave, mayor volumen que el espresso.' WHERE id = 197;

-- Cócteles (198-209)
UPDATE menu_products SET private_description = 'Daiquirí: ron blanco, limón fresco, azúcar. Shakeado con hielo, servido en copa de martini. Clásico cubano, refrescante.' WHERE id = 198;
UPDATE menu_products SET private_description = 'Mojito: ron blanco, hierbabuena fresca, limón, azúcar, soda. Molido en el vaso, servido con hielo. El cóctel más famoso de Cuba.' WHERE id = 199;
UPDATE menu_products SET private_description = 'Cuba Libre: ron Dorado, cola, limón. Mezcla clásica de Cuba. Servido en vaso alto con hielo.' WHERE id = 200;
UPDATE menu_products SET private_description = 'Cubata: ron Dorado solo o con un toque de limón. Para who want straight rum. Servido en vaso bajo.' WHERE id = 201;
UPDATE menu_products SET private_description = 'Ron Collins: ron blanco, limón, azúcar, soda. Bebida refrescante tipo long drink. Servido en vaso Collins.' WHERE id = 202;
UPDATE menu_products SET private_description = 'Margarita: tequila, Triple Sec o Cointreau, limón. Servida en copa de margarita con borde de sal. Refrescante y cítrica.' WHERE id = 203;
UPDATE menu_products SET private_description = 'Cubanito: ron Dorado, limón, azúcar, soda. Versión cubana del mojito sin hierbabuena. Refrescante.' WHERE id = 204;
UPDATE menu_products SET private_description = 'Piña Colada: ron blanco, crema de coco, jugo de piña. Shakeado con hielo, servido en vasoHuracán. Tropical y dulce.' WHERE id = 205;
UPDATE menu_products SET private_description = 'Sangría: vino tinto, frutas frescas cortadas, brandy, azúcar. Mezcla española refrescante, servida en jarra.' WHERE id = 206;
UPDATE menu_products SET private_description = 'Gin Tonic: ginebra London Dry, tónica Schweppes o Fever Tree, rodaja de limón o pepino. Bebida aromática y burbujeante.' WHERE id = 207;
UPDATE menu_products SET private_description = 'Vodka Tonic: vodka importado, tónica, rodaja de limón. Bebida ligera y refrescante, ideal para el calor.' WHERE id = 208;
UPDATE menu_products SET private_description = 'Chelada: cerveza fría con limón y sal. Bebida cubana refrescante, perfecta para el mediodía. Sin alcohol añadido.' WHERE id = 209;

-- Whisky (210-215)
UPDATE menu_products SET private_description = 'Whisky Old Partner: whisky escocés blended, suave y afrutado. Servido solo, con hielo o con agua. 18,00 la botella completa.' WHERE id = 210;
UPDATE menu_products SET private_description = 'Whisky Clan Campbell: blended escocés, notas de miel y vainilla. Botella 750ml. 25,00 precio completo.' WHERE id = 211;
UPDATE menu_products SET private_description = 'Chivas Regal 12 años: blended escocés premium, notas de hierbas, miel y frutas secas. 35,00 la botella.' WHERE id = 212;
UPDATE menu_products SET private_description = 'Johnnie Walker Black Label: blended escocés, ahumado, specias, caramelo. 39,00 la botella completa.' WHERE id = 213;
UPDATE menu_products SET private_description = 'Whisky Ballantines: blended escocés, suave, notas de manzana y canela. 30,00 la botella.' WHERE id = 214;
UPDATE menu_products SET private_description = 'Whisky Jim Beam: bourbon americano, dulce, notas de vainilla y roble. 22,00 la botella. Originario de Kentucky.' WHERE id = 215;

-- Brandy (216-217)
UPDATE menu_products SET private_description = 'Brandy Soberano: brandy español, envejecido, notas de frutas secas y especias. 18,00 la botella. Servido en snifter.' WHERE id = 216;
UPDATE menu_products SET private_description = 'Brandy Carlos III: brandy español premium, suave y aromático. 22,00 la botella. Ideal para después de cenar.' WHERE id = 217;

-- Ron (218-221, 223, 236-239)
UPDATE menu_products SET private_description = 'Havana Club Profundo: ron añejo cubano, 7 años de maduración, notas de vainilla, caramelo y roble. 1.10 por copa, 18,00 la botella.' WHERE id = 218;
UPDATE menu_products SET private_description = 'Havana Club Blanco: ron blanco cubano, ligero, refrescante, ideal para cócteles como mojito y daiquirí. 0.95 por copa, 14,00 la botella.' WHERE id = 219;
UPDATE menu_products SET private_description = 'Legendario Añejo: ron cubano premium, 15 años de maduración, notas de chocolate, café y especias. Para saborear solo.' WHERE id = 220;
UPDATE menu_products SET private_description = 'Havana Club Reserva: ron cubano añejo, 3 años, notas de vainilla, miel y roble. 1.10 por copa, 18,00 la botella.' WHERE id = 221;
UPDATE menu_products SET private_description = 'Ron Black Tears: ron cubano artesanal, 15 años, notas de frutas secas, chocolate y tabaco. 18,00 la botella. Edición limitada.' WHERE id = 223;
UPDATE menu_products SET private_description = 'Havana Club Ritual: ron cubano para cocktelería, equilibrado, notas de vainilla y caramelo. 18,00 la botella. Ideal para mezclar.' WHERE id = 236;
UPDATE menu_products SET private_description = 'Ron Bacardi o Black Tears: Bacardi carta blanca o dorada, ron cubano premium. Selección del bartender.' WHERE id = 237;
UPDATE menu_products SET private_description = 'Ron oscuro doble superior: ron añejo cubano, mínimo 8 años, notas intensas de roble, caramelo y especias. Para degustación.' WHERE id = 238;
UPDATE menu_products SET private_description = 'Ron Barceló Dark Gran Añejo: ron dominicano, 12 años, notas de miel, especias y roble. 1.70 por copa, 25,00 la botella.' WHERE id = 239;

-- Ginebra (224-225)
UPDATE menu_products SET private_description = 'Home\'s Gin: ginebra artesanal o local, botánicos suaves, cítricos. Para gin tonic o cócteles.' WHERE id = 224;
UPDATE menu_products SET private_description = 'Beefeater Gin: ginebra London Dry británica, botánicos clásicos (enebro, regaliz, cilantro). 4.50 por copa, premium.' WHERE id = 225;

-- Tabaco (233-234)
UPDATE menu_products SET private_description = 'Cigarrillos cubanos: Cohiba, Montecristo, Romeo y Julieta. Marca y precio variable según disponibilidad. Tabaco premium.' WHERE id = 233;
UPDATE menu_products SET private_description = 'Tabaco cubano puro: puro torcido a mano, Vuelta Abajo. Tipo de floral o churchill. Para fumadores expertos.' WHERE id = 234;

-- Otros (235)
UPDATE menu_products SET private_description = 'Aperitivos o digestivos: Campari, Aperol, Jägermeister, Amaretto. Bebidas para antes o después de comer. Variedad de sabores.' WHERE id = 235;

-- Tequila y Vodka (240-242)
UPDATE menu_products SET private_description = 'Tequila Olmeca Blanco: tequila 100% agave, sin añejar, notas frescas de agave y cítricos. 2.50 por copa, 28,00 la botella.' WHERE id = 240;
UPDATE menu_products SET private_description = 'Tequila Olmeca Reposado: tequila reposado 6 meses en barrica, notas de vainilla, roble y miel. 2.80 por copa, 30,00 la botella.' WHERE id = 241;
UPDATE menu_products SET private_description = 'Vodka importado: Absolut, Smirnoff o Grey Goose. Limpio, neutro, ideal para martinis, tonic o shots. 22,00 la botella.' WHERE id = 242;
