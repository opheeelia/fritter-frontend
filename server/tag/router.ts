import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import TagCollection from './collection';
import * as tagValidator from './middleware';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as util from './util';

const router = express.Router();


/**
 * View all of the freets that contain the label
 *
 * @name GET /api/tags/view?tag=tagLabel
 *
 */
 router.get(
  '/view',
  async (req: Request, res: Response) => {
    const freets = await TagCollection.findFreetsLabeledBy(req.query.tag as string);
    res.status(200).json({freets: freets});
  }
);

/**
 * Get most popular tags
 *
 * @name GET /api/tags
 *
 */
router.get(
  '/',
  async (req: Request, res: Response) => {
    const prefix = req.query.prefix ? req.query.prefix as string : "";
    const labels = await TagCollection.findAllLabels(prefix);
    res.status(200).json({tags: labels});
  }
);

/**
 * Get the tags of a freet
 *
 * @name GET /api/tags/:freetId
 *
 */
router.get(
  '/:freetId',
  async (req: Request, res: Response) => {
    const freetId = req.params.freetId;
    const labels = await TagCollection.findAllFreetTags(freetId);
    res.status(200).json({tags: labels});
  }
);

/**
 * Add tags to a freet
 *
 * @name POST /api/tags/:freetId
 * 
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freet does not exist
 * @throws {403} - If the user is not a valid modifier of the freet
 * @throws {400} - If the tag already exists for that freet
 * @throws {400} - If the tag contains non alphanumeric characters
 * @return {TagResponse} - The created tag freet mapping
 */
router.post(
  '/:freetId',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier,
    tagValidator.areTagsNew,
    tagValidator.areValidTags
  ],
  async (req: Request, res: Response) => {
    const tags = await TagCollection.addAll(req.body.tagLabels, req.params.freetId);

    res.status(201).json({
      message: `You successfully tagged freet ${req.body.freetId} with ${req.body.tagLabels}.`,
      tags: tags.map((tag)=>util.constructTagResponse(tag))
    });
  }
);

/**
 * Delete a tag
 *
 * @name DELETE /api/tags/:freetId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freet is not valid
 */
 router.delete(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier,
  ],
  async (req: Request, res: Response) => {
    await TagCollection.deleteForFeet(req.params.freetId);
    res.status(200).json({
      message: 'Deletion successful.'
    });
  }
);

export {router as tagRouter};
