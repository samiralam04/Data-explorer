import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PathItem {
    @ApiProperty()
    @IsString()
    path: string;

    @ApiProperty()
    @IsNotEmpty()
    timestamp: number;
}

export class ViewHistoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @ApiProperty({ type: [PathItem] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PathItem)
    pathJson: PathItem[];
}
