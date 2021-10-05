import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { SyncModule } from '../sync/sync.module';
import { LoggerModule } from 'nestjs-pino';
import { v4 } from 'uuid';

@Module({
	imports: [
		ConfigModule.forRoot(),
		SyncModule,
		LoggerModule.forRoot({
			pinoHttp: {
				prettyPrint: process.env.NODE_ENV !== 'production',
				genReqId: () => v4(),
				level: 'debug',
			},
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
