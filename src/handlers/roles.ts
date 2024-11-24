// src/handlers/roles.ts
import { Telegraf, Context } from 'telegraf';
import { User } from '../types';
import { query, execute } from '../database';
import { ownerOnly, elevatedAdminOnly } from '../middleware/index';

export const registerRoleHandlers = (bot: Telegraf<Context>) => {
  // Command to set the group owner
  bot.command('setowner', async (ctx) => {
    const admins = await ctx.getChatAdministrators();
    const owner = admins.find((admin) => admin.status === 'creator');
    
    if (!owner) {
      return ctx.reply('Could not determine the group owner.');
    }
  
    execute('INSERT OR REPLACE INTO users (id, username, role) VALUES (?, ?, ?)', [
      owner.user.id,
      owner.user.username,
      'owner',
    ]);
    ctx.reply(`Group owner set to @${owner.user.username}.`);
  });

  // Command to elevate a user
  bot.command('elevate', elevatedAdminOnly, (ctx) => {
    const userId = ctx.from?.id;
    const [username] = ctx.message?.text.split(' ').slice(1);
  
    if (!username) {
      console.warn(`Elevate command used by user ${userId} with missing username.`);
      return ctx.reply('Usage: /elevate <username>');
    }
  
    try {
      const user = query<User>('SELECT * FROM users WHERE username = ?', [username])[0];
      if (!user) {
        console.warn(`Elevate command failed: User ${username} not found.`);
        return ctx.reply('User not found.');
      }
  
      execute('UPDATE users SET role = ? WHERE id = ?', ['elevated', user.id]);
      console.log(`User ${username} elevated successfully by user ${userId}.`);
      ctx.reply(`${username} has been granted elevated privileges.`);
    } catch (error) {
      console.error(`Error processing elevate command for ${username} by user ${userId}:`, error);
      ctx.reply('An error occurred while processing the request.');
    }
  });

  // Command to assign admin role
  bot.command('makeadmin', ownerOnly, (ctx) => {
    const [username] = ctx.message?.text.split(' ').slice(1);
  
    if (!username) {
      console.warn('Makeadmin command invoked without a username.');
      return ctx.reply('Usage: /makeadmin <username>');
    }
  
    try {
      const user = query<User>('SELECT * FROM users WHERE username = ?', [username])[0];
      if (!user) {
        console.warn(`Makeadmin command failed: User ${username} not found.`);
        return ctx.reply('User not found.');
      }
  
      execute('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id]);
      console.log(`User ${username} promoted to admin by owner.`);
      ctx.reply(`${username} has been made an admin.`);
    } catch (error) {
      console.error(`Error promoting user ${username} to admin:`, error);
      ctx.reply('An error occurred while processing the request.');
    }
  });

  // Command to revoke elevated/admin roles
  bot.command('revoke', ownerOnly, (ctx) => {
    const [username] = ctx.message?.text.split(' ').slice(1);
  
    if (!username) {
      console.warn('Revoke command invoked without a username.');
      return ctx.reply('Usage: /revoke <username>');
    }
  
    try {
      const user = query<User>('SELECT * FROM users WHERE username = ?', [username])[0];
      if (!user) {
        console.warn(`Revoke command failed: User ${username} not found.`);
        return ctx.reply('User not found.');
      }
  
      execute('UPDATE users SET role = ? WHERE id = ?', ['pleb', user.id]);
      console.log(`User ${username}'s privileges revoked by owner.`);
      ctx.reply(`${username}'s privileges have been revoked.`);
    } catch (error) {
      console.error(`Error revoking user ${username}'s privileges:`, error);
      ctx.reply('An error occurred while processing the request.');
    }
  });
};
