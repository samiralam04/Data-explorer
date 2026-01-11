import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ViewHistoryDto } from './dto/view-history.dto';

@Injectable()
export class HistoryService {
    constructor(private readonly prisma: PrismaService) { }

    async saveHistory(dto: ViewHistoryDto) {
        return this.prisma.viewHistory.create({
            data: {
                session_id: dto.sessionId,
                path_json: JSON.stringify(dto.pathJson)
            }
        });
    }
}
