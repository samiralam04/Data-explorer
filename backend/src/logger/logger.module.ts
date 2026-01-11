import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.ms(),
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),
                // Add file transport if needed, for now console is enough as per typical container logs
            ],
        }),
    ],
    exports: [WinstonModule],
})
export class LoggerModule { }
