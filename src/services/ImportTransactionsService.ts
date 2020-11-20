import fs from 'fs';
import csv from 'csv-parser';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import loadCSV from '../helpers/csv';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

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
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const transactions: RowInfo[] = await loadCSV(path);
    const categories: string[] = transactions.map(
      transaction => transaction.category,
    );

    const existenceCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });
    const existenceCategoriesTitle = existenceCategories.map(
      (category: Category) => category.title,
    );
    const addCategoryTitles = categories
      .filter(category => !existenceCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories: Category[] = [
      ...newCategories,
      ...existenceCategories,
    ];

    const createdTransactions = transactionRepository.create(
      transactions.map(value => ({
        title: value.title,
        value: value.value,
        type: value.type,
        category: finalCategories.find(
          category => category.title === value.category,
        ),
      })),
    );
    // CSV reading

    // // Instance creation (sequencial) [Refactor]
    // for (const transaction of transactionsToCreate) {
    //   const response = await createTransaction.execute(transaction);
    //   transactions.push(response);
    // }

    return createdTransactions;
  }
}

export default ImportTransactionsService;
