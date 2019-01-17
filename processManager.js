const fs= require('fs');
const cp= require('child_process');

(async()=> {
  const subProcess= cp.spawn('node', ['example.js'], {
    detached: true,
    shell: true,
    cwd: __dirname
  });
  r= {
    stdOut: '',
    stdErr: ''
  }
  subProcess.stdout.on('data', d=> {
    r.stdOut+= d;
  });
  subProcess.stderr.on('data', d=> {
    r.stdErr+= d;
  });
  subProcess.once('close', sig=> {
    console.log('1 closed: ', r.stdOut);
    console.log(r.stdErr);
    logger.write('browser disconnected');
  });
  console.log('spawned');
  process.exit();
})();