import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = transactions.reduce(
      (acc, transaction) => {
        const { value } = transaction;
        switch (transaction.type) {
          case 'income':
            return {
              ...acc,
              income: acc.income + Number(value),
              total: acc.total + Number(value),
            };
          case 'outcome':
            return {
              ...acc,
              outcome: acc.outcome + Number(value),
              total: acc.total - Number(value),
            };
          default:
            return acc;
        }
      },
      { income: 0, outcome: 0, total: 0 },
    );
    return balance;
    // TODO
  }
}

export default TransactionsRepository;
