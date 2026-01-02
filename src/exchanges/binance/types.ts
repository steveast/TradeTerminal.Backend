export type ICandle = {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
};

export type IPosition = {
  askNotional: number;              // номинал заявок на продажу
  bidNotional: number;              // номинал заявок на покупку
  breakEvenPrice: number;           // цена безубыточности
  entryPrice: number;               // цена входа
  initialMargin: number;            // использованная начальная маржа
  isolated: boolean;                // изолированная маржа
  isolatedWallet: number;           // баланс изолированного кошелька
  leverage: number;                 // кредитное плечо
  maintMargin: number;              // поддерживающая маржа
  maxNotional: number;              // максимальный допустимый номинал
  notional: number;                 // номинал позиции
  openOrderInitialMargin: number;   // маржа под открытые ордера
  positionAmt: number;              // размер позиции
  positionInitialMargin: number;    // начальная маржа позиции
  positionSide: 'LONG' | 'SHORT' | 'BOTH'; // сторона позиции
  symbol: string;                   // торговая пара
  unrealizedProfit: number;         // нереализованный PnL
  updateTime: number;               // время обновления
  stopLoss: IAlgoOrder;
  takeProfit: IAlgoOrder;
};

export interface IAlgoOrder {
  algoId: number;
  clientAlgoId: string;
  algoType: 'CONDITIONAL';
  orderType: 'TAKE_PROFIT_MARKET' | string;
  symbol: string;
  side: 'BUY' | 'SELL';
  positionSide: 'LONG' | 'SHORT';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  quantity: number;
  algoStatus: 'NEW' | 'TRIGGERED' | 'CANCELED' | 'EXPIRED';
  actualOrderId: number;
  actualPrice: number;
  triggerPrice: number;
  price: number;
  icebergQuantity: number | null;
  tpOrderType: number;
  selfTradePreventionMode: 'EXPIRE_MAKER' | 'NONE';
  workingType: 'MARK_PRICE' | 'CONTRACT_PRICE';
  priceMatch: 'NONE' | 'OPPONENT' | 'QUEUE';
  closePosition: boolean;
  priceProtect: boolean;
  reduceOnly: boolean;
  createTime: number;
  updateTime: number;
  triggerTime: number;
  goodTillDate: number;
}

export interface ILimitOrder {
  orderId: number;
  symbol: string;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'EXPIRED';
  clientOrderId: string;
  price: number;
  avgPrice: number;
  origQty: number;
  executedQty: number;
  cumQuote: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT';
  reduceOnly: boolean;
  closePosition: boolean;
  side: 'BUY' | 'SELL';
  positionSide: 'LONG' | 'SHORT';
  stopPrice: number;
  workingType: 'MARK_PRICE' | 'CONTRACT_PRICE';
  priceProtect: boolean;
  origType: string;
  priceMatch: 'NONE' | 'OPPONENT' | 'QUEUE';
  selfTradePreventionMode: 'EXPIRE_MAKER' | 'NONE';
  goodTillDate: number;
  time: number;
  updateTime: number;
}
