import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  transactionId: string;
}

class DeleteTransactionService {
  public async execute({ transactionId }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactionToBeDeleted = await transactionsRepository.findOne(
      transactionId,
    );

    if (!transactionToBeDeleted) {
      throw new AppError('Transaction não encontrada', 404);
    }

    await transactionsRepository.delete({ id: transactionId });
  }
}

export default DeleteTransactionService;
