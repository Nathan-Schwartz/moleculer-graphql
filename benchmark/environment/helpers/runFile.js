const exec = (cmd, args = []) => require('child_process')
  .spawn(cmd, args, { stdio: 'inherit', shell: true })
  .on('error', console.error);

const run = (path) => exec('node', [path]);

module.exports = run;