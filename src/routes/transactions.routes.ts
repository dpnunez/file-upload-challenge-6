import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transationcRepository = getCustomRepository(TransactionsRepository);

  const balance = await transationcRepository.getBalance();
  const transactions = await transationcRepository.find();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id: transactionId } = request.params;

  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ transactionId });

  return response.status(204).json({ message: 'deleteado com sucesso!' });
});

transactionsRouter.post(
  '/import',
  upload.single('table'),
  async (request, response) => {
    const { path } = request.file;

    const importTransaction = new ImportTransactionsService();
    const transactions = await importTransaction.execute({ path });

    return response.json(transactions);
  },
);

export default transactionsRouter;
