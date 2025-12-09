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
  
    // POST /scores – authenticated + stricter rate limit
    @Post('scores')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({
      default: {
        limit: 5,              // at most 5 calls
        ttl: seconds(60),      // per 60 seconds (per IP/user)
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
  