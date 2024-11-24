// src/handlers/restrictions.ts
import { Telegraf, Context } from 'telegraf';
import { hasRole } from '../utils/roles';
import { addUserRestriction, removeUserRestriction, getUserRestrictions } from '../services/userService';

export const registerRestrictionHandlers = (bot: Telegraf<Context>) => {
  // Command to add a restriction
  bot.command('addrestriction', async (ctx) => {
    const [userId, restriction, restrictedAction, restrictedUntil] = ctx.message?.text.split(' ').slice(1) || [];
    if (!userId || !restriction) {
      return ctx.reply('Usage: /addrestriction <userId> <restriction> [restrictedAction] [restrictedUntil]');
    }
  
    const untilTimestamp = restrictedUntil ? parseInt(restrictedUntil, 10) : undefined;
  
    // Transform restrictedAction and metadata to match expected types
    const action = restrictedAction || undefined;
    const metadata: Record<string, any> | undefined = undefined; // Explicitly set as undefined if not provided
  
    addUserRestriction(
      parseInt(userId, 10),
      restriction,
      action, // Ensure type matches `string | undefined`
      metadata, // Pass undefined instead of null
      untilTimestamp
    );
  
    ctx.reply(`Restriction '${restriction}' added for user ${userId}.`);
  });

  // Command to remove a restriction
  bot.command('removerestriction', async (ctx) => {
    if (!hasRole(ctx.from?.id!, 'admin') && !hasRole(ctx.from?.id!, 'elevated')) {
      return ctx.reply('You do not have permission to manage restrictions.');
    }

    const [userId, restriction] = ctx.message?.text.split(' ').slice(1) || [];
    if (!userId || !restriction) {
      return ctx.reply('Usage: /removerestriction <userId> <restriction>');
    }

    removeUserRestriction(parseInt(userId, 10), restriction);
    ctx.reply(`Restriction '${restriction}' removed for user ${userId}.`);
  });

  // Command to list restrictions
  bot.command('listrestrictions', async (ctx) => {
    if (!hasRole(ctx.from?.id!, 'admin') && !hasRole(ctx.from?.id!, 'elevated')) {
      return ctx.reply('You do not have permission to view restrictions.');
    }

    const [userId] = ctx.message?.text.split(' ').slice(1) || [];
    if (!userId) {
      return ctx.reply('Usage: /listrestrictions <userId>');
    }

    const restrictions = getUserRestrictions(parseInt(userId, 10));
    if (restrictions.length === 0) {
      return ctx.reply(`No restrictions found for user ${userId}.`);
    }

    const message = restrictions
      .map((r) => `Type: ${r.restriction}, Action: ${r.restrictedAction || 'N/A'}, Until: ${r.restrictedUntil || 'Permanent'}`)
      .join('\n');
    ctx.reply(`Restrictions for user ${userId}:\n${message}`);
  });
};
