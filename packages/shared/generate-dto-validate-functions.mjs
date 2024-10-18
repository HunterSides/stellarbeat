import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import {
	NodeV1Schema,
	NodeSnapshotV1Schema,
	OrganizationV1Schema,
	OrganizationSnapshotV1Schema,
	NetworkV1Schema
} from './lib/index.js';
import standaloneCode from 'ajv/dist/standalone/index.js';

// For CJS, it generates an exports array, will generate
// `exports["#/definitions/Foo"] = ...;exports["#/definitions/Bar"] = ... ;`
const ajv = new Ajv({
	schemas: [
		NodeV1Schema,
		NodeSnapshotV1Schema,
		OrganizationV1Schema,
		OrganizationSnapshotV1Schema,
		NetworkV1Schema
	],
	code: { source: true }
});
addFormats(ajv);
const moduleCode = standaloneCode(ajv);

// Ensure the directory structure exists
const outputFilePath = 'lib/dto/generated/validators.js';
mkdirSync(dirname(outputFilePath), { recursive: true });

// Now you can write the module code to file
writeFileSync(outputFilePath, moduleCode);
