import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  excerpt!: string;

  @IsBoolean()
  @IsOptional()
  isPremium: boolean = false;
}
