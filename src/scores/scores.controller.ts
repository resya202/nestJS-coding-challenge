import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { ScoresService } from './scores.service';
  import { CreateScoreDto } from './dto/create-score.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { Throttle, seconds } from '@nestjs/throttler';
  
  @Controller()
  export class ScoresController {
    constructor(private readonly scoresService: ScoresService) {}
  
    // POST /scores 
    @Post('scores')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({
      default: {
        limit: 5,              
        ttl: seconds(60),      
      },
    })
    createScore(@Req() req, @Body() dto: CreateScoreDto) {
      return this.scoresService.createScore(req.user, dto);
    }
  
    // GET /leaderboard – public
    @Get('leaderboard')
    getLeaderboard() {
      return this.scoresService.getLeaderboard();
    }
  }
  