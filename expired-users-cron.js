const cron = require("cron");
const User = require("./Model/User");
const job = new cron.CronJob("0 */10 * * * *", async () => {
  // Find expired users
  const expiredUsers = await User.find({
    isValide: false,
    createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) },
  });

  // Delete expired users
  for (const user of expiredUsers) {
    await User.deleteOne({ _id: user._id });
    console.log(`User ${user.email} has been deleted due to non-validation.`);
  }
});

module.exports = job;
