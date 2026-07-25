import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { PublicService } from './public.service';

@Controller()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get()
  async menuPage(@Res() res: Response) {
    const data = await this.publicService.getMenuData();
    res.render('public/index', { ...data, layout: false });
  }

  @Get('qr')
  async qrCode(@Res() res: Response) {
    const url = process.env.HOSTAL_SUBDOMAIN || 'http://localhost:3000';
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });
    res.render('public/qr', { qrDataUrl, url, layout: false });
  }
}
