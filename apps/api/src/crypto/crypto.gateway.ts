import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { CryptoService } from "./crypto.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class CryptoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CryptoGateway.name);
  private broadcastInterval: NodeJS.Timeout | null = null;

  constructor(private readonly cryptoService: CryptoService) {}

  afterInit() {
    this.logger.log("WebSocket Gateway initialized");
    this.startBroadcasting();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const initialData = {
      type: "initial",
      pairs: this.cryptoService.getAllPairs(),
      connected: this.cryptoService.isConnected(),
    };
    client.emit("crypto-update", initialData);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private startBroadcasting() {
    this.broadcastInterval = setInterval(() => {
      const pairs = this.cryptoService.getAllPairs();
      const connected = this.cryptoService.isConnected();

      this.server.emit("crypto-update", {
        type: "update",
        pairs,
        connected,
      });
    }, 2000);
  }

  onModuleDestroy() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
  }
}
