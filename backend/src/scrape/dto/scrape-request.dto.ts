import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScrapeRequestDto {
    @ApiProperty({ description: 'The target URL to scrape', example: 'https://www.worldofbooks.com/en-gb/category/fiction' })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    url: string;
}
