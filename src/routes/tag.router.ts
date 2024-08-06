import { Router } from 'express';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  getTagByName,
} from '../controllers/tags.controller';

export const tagRouter = (): Router => {
  const router = Router();

  router.post('/', createTag);
  router.get('/', getAllTags);
  router.get('/:id', getTagById);
  router.get('/name/:name', getTagByName);
  router.put('/:id', updateTag);
  router.delete('/:id', deleteTag);

  return router;
};
