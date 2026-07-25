import { IsString } from 'class-validator';

export class UpdateStaticContentDto {
  @IsString()
  value: string;
}
