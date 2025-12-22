import { WebSocketServer } from 'ws';
import { BinanceFuturesClient } from './BinanceClient';

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 3001 });
const binanceClient = new BinanceFuturesClient();
const symbol = 'BTCUSDT';

binanceClient.connect(symbol, '1m');

let currentSubscriptions: any[] = []

wss.on('connection', (ws) => {
  console.log('Клиент подключился!');

  ws.send(JSON.stringify({
    type: 'status',
    data: binanceClient.statusValue,
  }));

  const subCandle = binanceClient.candles$.subscribe((candle) =>
    ws.send(JSON.stringify({ type: 'candles', data: candle }))
  );
  const subPositions = binanceClient.positions$.subscribe((positions) =>
    ws.send(JSON.stringify({ type: 'positions', data: positions }))
  );
  const subStatus = binanceClient.status$.subscribe((status) =>
    ws.send(JSON.stringify({ type: 'status', data: status }))
  );

  currentSubscriptions.push(subCandle, subPositions, subStatus);

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message.toString());

      if (msg.type === 'marketOrder') {
        const result = await binanceClient.marketOrder(msg.payload);
        ws.send(JSON.stringify({ type: 'orderResult', data: result }));
      }

      if (msg.type === 'strategy') {
        const result = await binanceClient.strategy(msg.payload);
        ws.send(JSON.stringify({ type: 'strategy', data: result }));
      }

      if (msg.type === 'symbolInfo') {
        const result = await binanceClient.getSymbolInfo(msg.payload);
        ws.send(JSON.stringify({ type: 'symbolInfo', data: result }));
      }

      if (msg.type === 'accountInfo') {
        const result = await binanceClient.accountInfo();
        ws.send(JSON.stringify({ type: 'accountInfo', data: result }));
      }

      if (msg.type === 'openTPandSL') {
        const result = await binanceClient.getOpenTPandSL(msg.payload);
        ws.send(JSON.stringify({ type: 'openTPandSL', data: result }));
      }

      if (msg.type === 'forceClose') {
        const result = await binanceClient.forceClosePosition(msg.symbol, msg.positionSide);
        ws.send(JSON.stringify({ type: 'closeResult', data: result }));
      }
    } catch (err: any) {
      ws.send(JSON.stringify({ type: 'error', message: err.message || 'Ошибка' }));
    }
  });

  ws.on('close', () => {
    console.log('Клиент отключился');
    currentSubscriptions.forEach(sub => sub.unsubscribe());
    currentSubscriptions = [];
  });
});

console.log(`WS сервер запущен на порту ${process.env.PORT || 3001}`);