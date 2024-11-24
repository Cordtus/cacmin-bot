import { Telegraf, Context } from 'telegraf';
import { query, execute } from '../database';
import { GlobalAction } from '../types';

export const registerActionHandlers = (bot: Telegraf<Context>) => {
  bot.command('viewactions', async (ctx) => {
    const actions = query<GlobalAction>('SELECT * FROM global_restrictions');
    if (actions.length === 0) {
      return ctx.reply('No restricted actions found.');
    }

    const message = actions
      .map((action) => `Type: ${action.restriction}, Action: ${action.restricted_action || 'N/A'}`)
      .join('\n');
    ctx.reply(`Restricted Actions:\n${message}`);
  });

  bot.command('addaction', async (ctx) => {
    const [restriction, restrictedAction] = ctx.message?.text.split(' ').slice(1);
    if (!restriction) {
      return ctx.reply('Usage: /addaction <restriction> [restrictedAction]');
    }

    execute('INSERT INTO global_restrictions (restriction, restricted_action) VALUES (?, ?)', [restriction, restrictedAction || null]);
    ctx.reply(`Action '${restriction}' has been added.`);
  });

  bot.command('removeaction', async (ctx) => {
    const [restriction] = ctx.message?.text.split(' ').slice(1);
    if (!restriction) {
      return ctx.reply('Usage: /removeaction <restriction>');
    }

    execute('DELETE FROM global_restrictions WHERE restriction = ?', [restriction]);
    ctx.reply(`Action '${restriction}' has been removed.`);
  });
};
