import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/settings.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const setting = this.settingRepository.create(createSettingDto);
    return this.settingRepository.save(setting);
  }

  async findAll(): Promise<Setting[]> {
    return this.settingRepository.find({
      order: {
        key: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }

    return setting;
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    return setting;
  }

  async update(
    id: number,
    updateSettingDto: UpdateSettingDto,
  ): Promise<Setting> {
    const setting = await this.findOne(id);

    Object.assign(setting, updateSettingDto);
    return this.settingRepository.save(setting);
  }

  async updateByKey(key: string, value: number): Promise<Setting> {
    const setting = await this.findByKey(key);
    setting.value = value;
    return this.settingRepository.save(setting);
  }

  async remove(id: number): Promise<void> {
    const setting = await this.findOne(id);
    await this.settingRepository.remove(setting);
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: 'early_check_in_price',
        description: 'Porcentaje adicional por early check-in (8% del precio de la habitación)',
        value: 8,
        type: 'percentage',
      },
      {
        key: 'late_check_out_price',
        description: 'Porcentaje adicional por late check-out (8% del precio de la habitación)',
        value: 8,
        type: 'percentage',
      },
      {
        key: 'transfer_one_way_price',
        description: 'Precio del transfer de ida (airport pickup)',
        value: 40,
        type: 'currency',
      },
      {
        key: 'transfer_round_trip_price',
        description: 'Precio del transfer de ida y vuelta (airport return)',
        value: 35,
        type: 'currency',
      },
      {
        key: 'breakfast_price',
        description: 'Precio del desayuno por persona',
        value: 8,
        type: 'currency',
      },
    ];

    for (const settingData of defaultSettings) {
      const existingSetting = await this.settingRepository.findOne({
        where: { key: settingData.key },
      });

      if (!existingSetting) {
        const setting = this.settingRepository.create(settingData);
        await this.settingRepository.save(setting);
      }
    }
  }

  async getPrices(): Promise<{
    earlyCheckInPrice: number;
    lateCheckOutPrice: number;
    transferOneWayPrice: number;
    transferRoundTripPrice: number;
    breakfastPrice: number;
  }> {
    try {
      const [
        earlyCheckIn,
        lateCheckOut,
        transferOneWay,
        transferRoundTrip,
        breakfast,
      ] = await Promise.all([
        this.findByKey('early_check_in_price'),
        this.findByKey('late_check_out_price'),
        this.findByKey('transfer_one_way_price'),
        this.findByKey('transfer_round_trip_price'),
        this.findByKey('breakfast_price'),
      ]);

      return {
        earlyCheckInPrice: Number(earlyCheckIn.value),
        lateCheckOutPrice: Number(lateCheckOut.value),
        transferOneWayPrice: Number(transferOneWay.value),
        transferRoundTripPrice: Number(transferRoundTrip.value),
        breakfastPrice: Number(breakfast.value),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        await this.initializeDefaultSettings();
        return this.getPrices();
      }
      throw error;
    }
  }
}
