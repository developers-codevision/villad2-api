import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await user.validatePassword(pass))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };

    const tokens = await this.getTokens(payload);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    console.log(user.refreshToken);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.getTokens({
      username: user.username,
      sub: user.id,
      roles: user.roles,
    });

    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private async getTokens(payload: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_ACCESS_SECRET',
          'your-default-access-secret',
        ),
        expiresIn: this.configService.get<number>(
          'JWT_ACCESS_EXPIRES_IN',
          9000000,
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'your-default-refresh-secret',
        ),
        expiresIn: this.configService.get<number>(
          'JWT_REFRESH_EXPIRES_IN',
          900000000,
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(createUserDto: any) {
    const userExists = await this.usersService.findByUsername(
      createUserDto.username,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.usersService.create(createUserDto);

    const tokens = await this.getTokens({
      username: newUser.username,
      sub: newUser.id,
      roles: newUser.roles,
    });

    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
      },
    };
  }

  async logout(userId: string) {
    return this.usersService.removeRefreshToken(userId);
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verify(token, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'your-default-refresh-secret',
        ),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
