/** CLI: comprobación de salud de la base local. */
import { healthCheck, closeDatabase } from '../db/index.js';

const h = healthCheck();
closeDatabase();
console.log(JSON.stringify(h, null, 2));
process.exit(h.ok ? 0 : 1);
