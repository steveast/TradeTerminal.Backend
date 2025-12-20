// binance-ws-server.ts
import { WebSocketServer, WebSocket } from 'ws';
import { BinanceFuturesClient } from './BinanceClient'; // твой класс

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 3001 });

const binanceClient = new BinanceFuturesClient(
  process.env.BINANCE_API_KEY!,
  process.env.BINANCE_API_SECRET!,
);

// Текущие настройки (по умолчанию)
let currentSymbol = 'BTCUSDT';
let currentInterval = '1m';
let currentSubscriptions: any[] = [];

// Функция для смены тикера
async function switchSymbol(symbol: string, interval: string) {
  if (symbol === currentSymbol && interval === currentInterval) {
    return;
  }

  currentSymbol = symbol.toUpperCase();
  currentInterval = interval;

  console.log(`Смена тикера: ${currentSymbol} ${currentInterval}`);

  try {
    await binanceClient.changeSymbol(currentSymbol, currentInterval);
    broadcast({ type: 'symbolChanged', symbol: currentSymbol, interval: currentInterval });
  } catch (err) {
    console.error('Ошибка при смене символа:', err);
    broadcast({ type: 'error', message: 'Не удалось сменить тикер' });
  }
}

// Инициализация при старте сервера
switchSymbol('BTCUSDT', '1m').catch(console.error);

function broadcast(data: any) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Клиент подключился');

  // Отправляем текущий статус сразу после подключения
  ws.send(JSON.stringify({
    type: 'status',
    data: binanceClient.statusValue,
  }));
  ws.send(JSON.stringify({
    type: 'symbolChanged',
    symbol: currentSymbol,
    interval: currentInterval,
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

      if (msg.type === 'changeSymbol') {
        await switchSymbol(msg.symbol.toUpperCase(), msg.interval || '1m');
      }

      if (msg.type === 'marketOrder') {
        const result = await binanceClient.marketOrder(msg.payload);
        ws.send(JSON.stringify({ type: 'orderResult', data: result }));
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