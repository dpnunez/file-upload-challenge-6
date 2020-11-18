import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    // Data validation
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Tipo invalido', 400);
    }

    // Category verification
    const categoryAlreadyExist = await categoryRepository.findOne({
      where: { title: category },
    });

    if (categoryAlreadyExist) {
      const { id: category_id } = categoryAlreadyExist;
      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id,
      });
      await transactionRepository.save(transaction);

      return transaction;
    }

    // Category creation
    const createdCategory = categoryRepository.create({ title: category });
    const { id: category_id } = await categoryRepository.save(createdCategory);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
