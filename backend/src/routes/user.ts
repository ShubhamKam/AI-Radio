import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { UserActivityModel } from '../models/UserActivity';
import { CurationEngine } from '../services/curationEngine';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    const preferences = await UserModel.getPreferences(req.user!.id);

    res.json({
      success: true,
      user,
      preferences,
    });
  } catch (error) {
    next(error);
  }
});

// Update preferences
router.put('/preferences', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const preferences = await UserModel.updatePreferences(req.user!.id, req.body);
    res.json({ success: true, preferences });
  } catch (error) {
    next(error);
  }
});

// Like/Dislike
router.post('/activity/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { entityType, entityId } = req.body;

    if (!entityType || !entityId) {
      throw new AppError('Entity type and ID are required', 400);
    }

    const activity = await UserActivityModel.create({
      user_id: req.user!.id,
      activity_type: 'like',
      entity_type: entityType,
      entity_id: entityId,
    });

    res.json({ success: true, activity });
  } catch (error) {
    next(error);
  }
});

router.post('/activity/dislike', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { entityType, entityId } = req.body;

    if (!entityType || !entityId) {
      throw new AppError('Entity type and ID are required', 400);
    }

    const activity = await UserActivityModel.create({
      user_id: req.user!.id,
      activity_type: 'dislike',
      entity_type: entityType,
      entity_id: entityId,
    });

    res.json({ success: true, activity });
  } catch (error) {
    next(error);
  }
});

// Get user history
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await UserActivityModel.getUserHistory(req.user!.id, limit);
    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
});

// Subscribe/Unsubscribe
router.post('/subscribe', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { subscriptionType, subscriptionValue } = req.body;

    if (!subscriptionType || !subscriptionValue) {
      throw new AppError('Subscription type and value are required', 400);
    }

    await query(
      `INSERT INTO subscriptions (user_id, subscription_type, subscription_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, subscription_type, subscription_value) DO NOTHING`,
      [req.user!.id, subscriptionType, subscriptionValue]
    );

    await UserActivityModel.create({
      user_id: req.user!.id,
      activity_type: 'subscribe',
      entity_type: subscriptionType,
      entity_id: subscriptionValue,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/unsubscribe', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { subscriptionType, subscriptionValue } = req.body;

    await query(
      `DELETE FROM subscriptions 
       WHERE user_id = $1 AND subscription_type = $2 AND subscription_value = $3`,
      [req.user!.id, subscriptionType, subscriptionValue]
    );

    await UserActivityModel.create({
      user_id: req.user!.id,
      activity_type: 'unsubscribe',
      entity_type: subscriptionType,
      entity_id: subscriptionValue,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get knowledge nudges
router.get('/nudges', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await query(
      `SELECT * FROM knowledge_nudges 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [req.user!.id, limit]
    );
    res.json({ success: true, nudges: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get personalized content
router.get('/personalized', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const content = await CurationEngine.getPersonalizedContent(req.user!.id, limit);
    res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
});

export default router;
