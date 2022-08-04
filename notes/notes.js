// ========================================================
// Self resribing function
// ========================================================
import childProcess from "node:child_process";
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { watch } from 'node:fs';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
console.log('__filename', __filename);
let lastWatch = Date.now();
watch(__filename, (eventType, filename) => {
  if(Date.now() - lastWatch < 1000) {
    lastWatch = Date.now();
    console.log('too soon', eventType, filename);
    
    return;
  }
  console.log(`event type is: ${eventType}`);
  console.log('restarting...');
  console.log(`filename provided: ${filename}`);
  childProcess.spawn(process.argv.shift(), process.argv, {
    cwd: process.cwd(),
    detached: true,
    stdio: "inherit",
  });
  process.exit(0);
  // if (filename) {
  //   if (restartHandler) {
  //     clearTimeout(restartHandler);
  //   } else {
  //     restartHandler = setTimeout(() => {

  //       // process.exit(0);
  //     }, 1000);
  //   }
  // } else {
  //   console.log('filename not provided');
  // }
});