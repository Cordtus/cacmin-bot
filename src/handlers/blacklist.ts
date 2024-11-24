import { Telegraf, Context } from 'telegraf';
import { query, execute } from '../database';
import { User } from '../types';

export const registerBlacklistHandlers = (bot: Telegraf<Context>) => {
  bot.command('viewblacklist', async (ctx) => {
    const blacklist = query<User>('SELECT id, username FROM users WHERE blacklist = 1');
    if (blacklist.length === 0) {
      return ctx.reply('The blacklist is empty.');
    }

    const message = blacklist.map((user) => `ID: ${user.id}, Username: ${user.username}`).join('\n');
    ctx.reply(`Blacklisted Users:\n${message}`);
  });

  bot.command('addblacklist', (ctx) => {
    const [userId] = ctx.message?.text.split(' ').slice(1);
  
    if (!userId || isNaN(Number(userId))) {
      console.warn('Addblacklist command invoked with invalid user ID.');
      return ctx.reply('Usage: /addblacklist <userId>');
    }
  
    try {
      execute('UPDATE users SET blacklist = 1 WHERE id = ?', [parseInt(userId, 10)]);
      console.log(`User ${userId} added to blacklist.`);
      ctx.reply(`User ${userId} has been blacklisted.`);
    } catch (error) {
      console.error(`Error blacklisting user ${userId}:`, error);
      ctx.reply('An error occurred while processing the request.');
    }
  });

  bot.command('removeblacklist', async (ctx) => {
    const [userId] = ctx.message?.text.split(' ').slice(1);
    if (!userId) {
      return ctx.reply('Usage: /removeblacklist <userId>');
    }

    execute('UPDATE users SET blacklist = 0 WHERE id = ?', [parseInt(userId, 10)]);
    ctx.reply(`User ${userId} has been removed from the blacklist.`);
  });
};
