import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateScoreDto {
  @IsString()
  playerName: string;

  @IsInt()
  @IsPositive()
  score: number;
}
