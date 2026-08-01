import { Menu } from '../entities/menu.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { CategoryProduct } from '../entities/category-product.entity';
import { Subtitulo } from '../entities/subtitulo.entity';
import { ServiceConfig } from '../entities/service-config.entity';
import defaultDataSource from '../../data-source';
import * as fs from 'fs';
import * as path from 'path';

interface ParsedProduct {
  name: string;
  price: number | null;
}

interface ParsedCategory {
  name: string;
  price: number | null;
  products: ParsedProduct[];
}

interface ParsedMenu {
  name: string;
  description: string;
  schedule: string;
  categories: ParsedCategory[];
}

interface Token {
  type: 'category' | 'header' | 'product' | 'plain';
  text: string;
}

function unescapeMarkdown(text: string): string {
  return text.replace(/\\([.()$])/g, '$1');
}

function parsePrice(str: string): number | null {
  if (!str) return null;
  const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function stripTrailingFiller(name: string): string {
  return name.replace(/[\s.…_·•\-\$]+$/, '').replace(/[\s\/]+$/, '').trim();
}

function cleanName(name: string): string {
  let cleaned = stripTrailingFiller(name.replace(/\*+/g, '').trim());
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

function isFooterLine(text: string): boolean {
  const lower = text.toLowerCase();
  if (/^(precios? en|unit prices?|prices? in|los precios)/.test(lower)) return true;
  if (lower.includes('10% servicio') || lower.includes('10% service')) return true;
  if (lower.includes('servicio habitación') || lower.includes('room service')) return true;
  return false;
}

function isScheduleText(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('horario') || lower.includes('schedule') || lower.includes('servicio 24 horas');
}

function hasTime(text: string): boolean {
  return /\d{1,2}:\d{2}/.test(text) || /\d{1,2}\s*(am|pm)/i.test(text);
}

function cleanSchedule(text: string): string {
  return cleanName(text.replace(/^(Horario|Schedule)\s*[:]?\s*/i, ''));
}

function isImageLine(line: string): boolean {
  return line.includes('data:image') || line.startsWith('![');
}

function isWebsiteLine(line: string): boolean {
  return line.includes('villad2.com') || line.includes('www.') || /^https?:/.test(line) || line.includes('<www.');
}

const SKIP_CATEGORIES = new Set([
  'menu bar terraza',
  'carta de vinos / cavas / espumosos',
  'snack',
]);

function isSkipCategory(name: string): boolean {
  return SKIP_CATEGORIES.has(name.toLowerCase()) || isWebsiteLine(name);
}

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\*\*(.*?)\*\*)|(_(.*?)_)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > lastIndex) {
      const plain = line.slice(lastIndex, m.index).trim();
      if (plain) tokens.push({ type: 'plain', text: plain });
    }
    if (m[1]) {
      const raw = m[1];
      const content = m[2].replace(/[*_]+/g, ' ').replace(/\s+/g, ' ').trim();
      const type = raw.includes('_') ? 'category' : 'header';
      if (content) tokens.push({ type, text: content });
    } else {
      tokens.push({ type: 'product', text: m[4] });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < line.length) {
    const plain = line.slice(lastIndex).trim();
    if (plain) tokens.push({ type: 'plain', text: plain });
  }
  return tokens;
}

function splitProducts(text: string): ParsedProduct[] {
  const re = /(.+?)\s+(\d{1,2}[.,]\d{1,2})(?=\s|$)/g;
  const products: ParsedProduct[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const name = cleanName(m[1]);
    if (name) products.push({ name, price: parsePrice(m[2]) });
    lastIndex = m.index + m[0].length;
  }
  let rest = text.slice(lastIndex).trim();
  if (/^\d{1,2}[.,]\d{1,2}$/.test(rest)) {
    rest = '';
  }
  if (rest) {
    const name = cleanName(rest);
    if (name) products.push({ name, price: null });
  }
  if (products.length === 0) {
    const name = cleanName(text);
    if (name) products.push({ name, price: null });
  }
  return products;
}

function extractCategoryPrice(content: string): { price: number | null; rest: string } {
  const fillerOnly = content.match(/^[\s.…_·•]*\$?\s*(\d{1,2}[.,]\d{1,2})[\s.…_·•]*$/);
  if (fillerOnly) return { price: parsePrice(fillerOnly[1]), rest: '' };
  const leading = content.match(/^(\d{1,2}[.,]\d{1,2})\s+(.+)$/);
  if (leading) return { price: parsePrice(leading[1]), rest: leading[2] };
  return { price: null, rest: content };
}

function parseMarkdownFile(filePath: string): ParsedMenu {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rawLines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const fileName = path.basename(filePath, '.md');
  let menuName = fileName
    .replace(/^Carta\s+(de\s+|del\s+)?/i, '')
    .replace(/\s*VD2.*$/i, '')
    .replace(/\s*D2.*$/i, '')
    .replace(/Usd\s*en\s*Ingles/i, '')
    .trim();
  menuName = menuName.charAt(0).toUpperCase() + menuName.slice(1);
  if (!menuName) menuName = fileName;

  let schedule = '';
  const categories: ParsedCategory[] = [];
  let current: ParsedCategory | null = null;

  const parsedLines: { line: string; tokens: Token[] }[] = [];
  for (const line of rawLines) {
    if (isImageLine(line) || isWebsiteLine(line)) continue;
    const tokens = tokenize(line);
    if (tokens.length === 0) continue;
    parsedLines.push({ line, tokens });
  }

  const startsWithCategory = (pl: { tokens: Token[] }) => pl.tokens[0].type === 'category';

  for (let i = 0; i < parsedLines.length; i++) {
    const pl = parsedLines[i];

    if (startsWithCategory(pl)) {
      const name = cleanName(pl.tokens[0].text);

      if (isSkipCategory(name)) continue;
      if (isScheduleText(name)) {
        if (name.toLowerCase().includes('servicio 24 horas')) {
          if (!schedule) schedule = 'Servicio 24 horas';
        } else if (hasTime(name)) {
          if (!schedule) schedule = cleanSchedule(name);
        }
        continue;
      }

      let hasChildren = false;
      for (let j = i + 1; j < parsedLines.length; j++) {
        if (startsWithCategory(parsedLines[j])) break;
        if (parsedLines[j].tokens.some(t => t.type === 'product' || t.type === 'plain')) {
          hasChildren = true;
          break;
        }
      }
      const specialCategory = /^(Entremés|Picadera)/i.test(name);
      const isCategory = hasChildren || specialCategory;

      if (isCategory) {
        current = { name, price: null, products: [] };
        categories.push(current);
        for (const token of pl.tokens.slice(1)) {
          if (token.type === 'category') {
            const midName = cleanName(token.text);
            if (isScheduleText(midName)) continue;
            if (isSkipCategory(midName)) continue;
            current = { name: midName, price: null, products: [] };
            categories.push(current);
            continue;
          }
          const text = unescapeMarkdown(token.text).trim();
          if (isFooterLine(text)) continue;
          const { price, rest } = extractCategoryPrice(text);
          if (price !== null && current.products.length === 0) {
            current.price = price;
          }
          if (rest) {
            for (const p of splitProducts(rest)) {
              if (p.name) current.products.push(p);
            }
          }
        }
        continue;
      }

      if (!current) {
        current = { name: 'General', price: null, products: [] };
        categories.push(current);
      }
      const productName = cleanName(name);
      let productPrice: number | null = null;
      for (const token of pl.tokens.slice(1)) {
        if (token.type === 'category') continue;
        const text = unescapeMarkdown(token.text).trim();
        const { price } = extractCategoryPrice(text);
        if (price !== null) productPrice = price;
      }
      if (productName && !isFooterLine(productName)) {
        current.products.push({ name: productName, price: productPrice });
      }
      continue;
    }

    for (const token of pl.tokens) {
      if (token.type === 'category') {
        const name = cleanName(token.text);
        if (isSkipCategory(name)) continue;
        if (isScheduleText(name)) {
          if (name.toLowerCase().includes('servicio 24 horas')) {
            if (!schedule) schedule = 'Servicio 24 horas';
          } else if (hasTime(name)) {
            if (!schedule) schedule = cleanSchedule(name);
          }
          continue;
        }
        current = { name, price: null, products: [] };
        categories.push(current);
        continue;
      }

      if (token.type === 'header') {
        if (hasTime(token.text) && !schedule) schedule = cleanSchedule(token.text);
        continue;
      }

      const text = unescapeMarkdown(token.text).trim();
      if (isFooterLine(text)) continue;
      if (isScheduleText(text)) {
        if (text.toLowerCase().includes('servicio 24 horas')) {
          if (!schedule) schedule = 'Servicio 24 horas';
        } else if (hasTime(text)) {
          if (!schedule) schedule = cleanSchedule(text);
        }
        continue;
      }
      if (SKIP_CATEGORIES.has(text.toLowerCase())) continue;

      if (!current) {
        current = { name: 'General', price: null, products: [] };
        categories.push(current);
      }
      for (const p of splitProducts(text)) {
        if (p.name) current.products.push(p);
      }
    }
  }

  return { name: menuName, description: '', schedule, categories };
}

async function seed() {
  const ds = await defaultDataSource.initialize();
  console.log('Conectado a la base de datos (MariaDB).');

  const menuRepo = ds.getRepository(Menu);
  const catRepo = ds.getRepository(Category);
  const prodRepo = ds.getRepository(Product);
  const catProdRepo = ds.getRepository(CategoryProduct);
  const configRepo = ds.getRepository(ServiceConfig);

  const menusDir = path.resolve(__dirname, '../../../../menus/md');
  const files = fs.readdirSync(menusDir).filter(f => f.endsWith('.md'));

  let menuOrder = 1;
  let totalProducts = 0;

  for (const file of files) {
    const filePath = path.join(menusDir, file);
    const menuData = parseMarkdownFile(filePath);

    const menu = await menuRepo.save(menuRepo.create({
      name: menuData.name,
      description: menuData.description,
      schedule: menuData.schedule,
      order: menuOrder++,
      active: true,
    }));

    let catOrder = 0;
    for (const catData of menuData.categories) {
      if (!catData.products.length) continue;

      const category = await catRepo.save(catRepo.create({
        name: catData.name,
        price: catData.price,
        order: catOrder++,
        active: true,
        menuId: menu.id,
      }));

      let prodOrder = 0;
      for (const prodData of catData.products) {
        const product = await prodRepo.save(prodRepo.create({
          name: prodData.name,
          price: prodData.price,
          active: true,
        }));

        await catProdRepo.save(catProdRepo.create({
          categoryId: category.id,
          productId: product.id,
          order: prodOrder++,
        }));

        totalProducts++;
      }
    }

    const catCount = menuData.categories.filter(c => c.products.length > 0).length;
    const prodCount = menuData.categories.reduce((s, c) => s + c.products.length, 0);
    console.log(`OK "${menu.name}" - ${catCount} categorias, ${prodCount} productos, horario: "${menu.schedule}"`);
  }

  const existing = await configRepo.count();
  if (existing === 0) {
    const defaults = [
      { key: 'service_hours', value: 'Lunes a Viernes 7:00 AM - 10:00 PM | Sábados y Domingos 8:00 AM - 11:00 PM' },
      { key: 'intro_text', value: 'Bienvenidos al menú digital de nuestro hostal.' },
      { key: 'footer_text', value: 'Gracias por su preferencia. Todos los precios incluyen IVA.' },
    ];
    for (const s of defaults) {
      await configRepo.save(configRepo.create(s));
    }
    console.log('OK Contenido estatico creado.');
  }

  console.log(`\nSeed completado: ${files.length} menus, ${totalProducts} productos.`);
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
