import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './score.entity';
import { UsersService } from '../users/users.service';
import { CreateScoreDto, GetUser } from './dto/create-score.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private readonly repo: Repository<Score>,
    private readonly usersService: UsersService,
  ) {}

  async createScore(currentUser: any, dto: CreateScoreDto) {
    const user = await this.usersService.findById(currentUser.userId);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const { playerName, score } = dto;

    // Authorization rule:
    // - if not admin, playerName must match own username
    if (
      currentUser.role !== UserRole.ADMIN &&
      playerName !== user.username
    ) {
      throw new ForbiddenException(
        'You can only submit scores for yourself',
      );
    }

    const scoreEntity = this.repo.create({
      playerName,     // name shown on leaderboard
      score,          // numeric score
      user,           // who submitted it
    });

    return this.repo.save(scoreEntity);
  }

  async getLeaderboard() {
    const scores = await this.repo.find({
      order: { score: 'DESC' },
      take: 10,
    });

    return scores.map((s) => ({
      playerName: s.playerName,
      score: s.score,
    }));
  }

  async latestScoreUser(currentUser: any) {
    console.log(currentUser,"ini");
    
    const user = await this.usersService.findByIdAndScore(
      currentUser.username,
    );
  
    if (!user || !user.scores || user.scores.length === 0) {
      return null;
    }

    const latestScore = user.scores[0];
  
    return {
      playerName: user.username,
      score: latestScore.score,
      createdAt: latestScore.createdAt,
    };
  }
  

  
}
