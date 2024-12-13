import User from '../models/user.js';
import crom from 'cron';

cron.schedule('0 0 * * 0', async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      user.coins += 100;
      await user.save;
    }
  } catch (error) {
    console.error('Error checking borrowed items:', error);
  }
});
