import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getDashboardData() {
    return {
      title: 'Panel de Administración',
      hostalName: process.env.HOSTAL_NAME || 'Hostal',
    };
  }
}
