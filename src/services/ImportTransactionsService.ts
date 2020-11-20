import fs from 'fs';
import csv from 'csv-parser';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface RowInfo {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}
interface Request {
  path: string;
}
class ImportTransactionsService {
  async execute({ path }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const transactionsToCreate: RowInfo[] = [];
    const transactions: Transaction[] = [];

    // CSV reading
    await new Promise(resolve => {
      fs.createReadStream(path, 'utf8')
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.replace(' ', ''),
            mapValues: ({ value }) => value.replace(' ', ''),
          }),
        )
        .on('data', async data =>
          transactionsToCreate.push({ ...data, value: Number(data.value) }),
        )
        .on('end', () => {
          resolve();
        });
    });

    // Instance creation (sequencial) [Refactor]
    for (const transaction of transactionsToCreate) {
      const response = await createTransaction.execute(transaction);
      transactions.push(response);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
