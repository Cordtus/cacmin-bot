// src/handlers/violations.ts
import { Telegraf, Context } from 'telegraf';
import { query } from '../database';
import { Violation } from '../types';

/**
 * Registers handlers for managing user violations.
 */
export const registerViolationHandlers = (bot: Telegraf<Context>) => {
  // Command to fetch user violations
  bot.command('violations', (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) {
      return ctx.reply('Could not determine your user ID.');
    }

    const violations = query<Violation>('SELECT * FROM violations WHERE user_id = ?', [userId]);

    if (violations.length === 0) {
      ctx.reply('No violations found.');
    } else {
      const message = violations
        .map(
          (violation) =>
            `Violation #${violation.id}: Rule ${violation.ruleId}, Bail: ${violation.bailAmount}`
        )
        .join('\n');
      ctx.reply(message);
    }
  });
};
