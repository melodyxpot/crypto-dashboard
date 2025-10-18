import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LinksModule } from './links/links.module';
import { CryptoModule } from './crypto/crypto.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LinksModule,
    CryptoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
