import { WebSocketServer } from 'ws';
import { BinanceFuturesClient } from './BinanceClient';

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 3001 });


const binanceClient = new BinanceFuturesClient();
binanceClient.connect('BTCUSDT', '1m');


let currentSubscriptions: any[] = []


wss.on('connection', (ws) => {
  console.log('Клиент подключился');

  // Отправляем текущий статус сразу после подключения
  ws.send(JSON.stringify({
    type: 'status',
    data: binanceClient.statusValue,
  }));

  // Подписываемся на данные и рассылаем этому клиенту
  const subCandle = binanceClient.candles$.subscribe((candle) =>
    ws.send(JSON.stringify({ type: 'candle', data: candle }))
  );
  const subPositions = binanceClient.positions$.subscribe((positions) =>
    ws.send(JSON.stringify({ type: 'positions', data: positions }))
  );
  const subStatus = binanceClient.status$.subscribe((status) =>
    ws.send(JSON.stringify({ type: 'status', data: status }))
  );

  currentSubscriptions.push(subCandle, subPositions, subStatus);

  // Обработка команд от клиента
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

      if (msg.type === 'forceClose') {
        const result = await binanceClient.forceClosePosition(msg.symbol, msg.positionSide);
        ws.send(JSON.stringify({ type: 'closeResult', data: result }));
      }

      // Добавь другие команды по аналогии
    } catch (err: any) {
      ws.send(JSON.stringify({ type: 'error', message: err.message || 'Ошибка' }));
    }
  });

  ws.on('close', () => {
    console.log('Клиент отключился');
    // Отписка от RxJS для этого клиента
    currentSubscriptions.forEach(sub => sub.unsubscribe());
    currentSubscriptions = [];
  });
});

console.log(`WS сервер запущен на порту ${process.env.PORT || 3001}`);