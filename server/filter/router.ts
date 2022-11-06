import type {NextFunction, Request, Response} from 'express';
import {Types} from 'mongoose';
import express from 'express';
import FilterCollection from './collection';
import UserCollection from '../user/collection';
import * as filterValidator from './middleware';
import * as userValidator from '../user/middleware';
import * as util from './util';
import {IntentType} from '../intent/util';

const router = express.Router();

/**
 * View all of the freets through filter
 *
 * @name GET /api/filters/view?filterId=FILTER_ID
 * 
 * @throws {403} - If the user is not logged in
 * @throws {403} - If the user is not a valid modifier and it is private
 * @throws {403} - If the user is not logged in
 * 
 */
 router.get(
  '/view',
  [
    userValidator.isUserLoggedIn,
    filterValidator.isFilterExists,
    filterValidator.isValidFilterViewer
  ],
  async (req: Request, res: Response) => {
    const freets = await FilterCollection.applyFilter(req.query.filterId as string, req.session.userId);
    res.status(200).json({freets: freets});
  }
);

/**
 * Get top X most popular filters
 *
 * @name GET /api/filters?prefix=prefix
 *
 * @throws {403} - If the user is not logged in
 */
router.get(
  '',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const filters = await FilterCollection.findByName(req.query.prefix as string, req.session.userId);
    res.status(200).json({filters: filters});
  }
);

/**
 * Get all filters for a freet by a user
 *
 * @name GET /api/filters/mine
 * 
 * @throws {403} - If the user is not logged in
 */
router.get(
  '/mine',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    const filters = await FilterCollection.findByUser(req.session.userId);
    res.status(200).json({filters: filters});
  },
);

/**
 * Create a filter
 *
 * @name POST /api/filters
 * 
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the user is not found
 * @throws {400} - If the tag or intent is not valid
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
  ],
  async (req: Request, res: Response) => {
    // validate users
    for (let userId of req.body.include[0]){
      const validFormat = Types.ObjectId.isValid(req.params.freetId);
      const user = validFormat ? await UserCollection.findOneByUserId(userId) : '';
      if (!user) {
        res.status(404).json({
          error: `Freet with freet ID ${req.params.freetId} does not exist.`
        });
        return;
      }
    }
    // validate tags
    for (let tag of req.body.include[1]){
      const pattern = new RegExp("^[\\w]+$");
      if (!pattern.test(tag)) {
          res.status(400).json({
          error: {
              invalidTag: 'Tags must contain only upper and lower case letters, or underscores and must be non-empty'
          }
          });
          return;
      }
    }
    // validate intents
    for (let intent of req.body.include[2]){
      if (!(intent in IntentType)) {
        res.status(400).json({
          error: `${req.body.intent} is not a valid intent`
        });
        return;
      }
    }

    const filter = await FilterCollection.addOne(
      req.body.name,
      req.session.userId,
      req.body.public,
      req.body.include,
      // req.body.exclude
    );

    res.status(201).json({
      message: `You successfully create a filter.`,
      filters: util.constructFilterResponse(filter)
    });
  }
);

/**
 * Delete filter
 *
 * @name DELETE /api/filters/:filterId
 *
 * @throws {403} - If the user is not logged in
 * @throws {403} - If the user is not a valid modifier
 * @throws {404} - If the filter does not exist
 */
router.delete(
  '/:filterId',
  [
    userValidator.isUserLoggedIn,
    filterValidator.isFilterExists,
    filterValidator.isValidFilterModifier
    // TODO: is a valid filter
  ],
  async (req: Request, res: Response) => {
    const deleted = await FilterCollection.deleteOne(req.params.filterId);
    if (deleted) {
      res.status(200).json({
        message: `You successfully deleted your filter.`,
      });
    } else {
      res.status(404).json({
        error: {
          filterNotFound: `Could not delete filter with id ${req.params.filterId}`
        },
      });
    }
  }
);


export {router as filterRouter};
