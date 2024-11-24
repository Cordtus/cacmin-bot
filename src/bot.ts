import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from './config';
import { initDb } from './database';
import { registerRoleHandlers } from './handlers/roles';
import { registerViolationHandlers } from './handlers/violations';
import { registerRestrictionHandlers } from './handlers/restrictions';
import { registerActionHandlers } from './handlers/actions';
import { registerBlacklistHandlers } from './handlers/blacklist';

const bot = new Telegraf(BOT_TOKEN);
const db = initDb();

// Register handlers
registerRoleHandlers(bot);
registerActionHandlers(bot);
registerBlacklistHandlers(bot);
registerViolationHandlers(bot);
registerRestrictionHandlers(bot);

// Start the bot
bot.launch();
console.log('Bot is running...');
