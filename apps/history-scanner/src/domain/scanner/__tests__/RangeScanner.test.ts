import { CheckPointGenerator } from '../../check-point/CheckPointGenerator';
import { StandardCheckPointFrequency } from '../../check-point/StandardCheckPointFrequency';
import { HttpQueue } from 'http-helper';
import { mock } from 'jest-mock-extended';
import { ok } from 'neverthrow';
import { CategoryScanner } from '../CategoryScanner';
import { BucketScanner } from '../BucketScanner';
import { RangeScanner } from '../RangeScanner';
import { Logger } from 'logger';
import { ExceptionLogger } from 'exception-logger';

it('should verify', async function () {
	const checkPointGenerator = new CheckPointGenerator(
		new StandardCheckPointFrequency()
	);

	const categoryScanner = mock<CategoryScanner>();
	const bucketScanner = mock<BucketScanner>();
	categoryScanner.scanHASFilesAndReturnBucketHashes.mockResolvedValue(
		ok({
			bucketHashes: new Set(['a', 'b']),
			bucketListHashes: new Map<number, string>()
		})
	);
	categoryScanner.scanOtherCategories.mockResolvedValue(
		ok({ ledger: 50, hash: 'hash' })
	);
	bucketScanner.scan.mockResolvedValue(ok(undefined));

	const httpQueue = mock<HttpQueue>();
	httpQueue.sendRequests.mockResolvedValue(ok(undefined));
	const historyArchiveRangeScanner = new RangeScanner(
		checkPointGenerator,
		categoryScanner,
		bucketScanner,
		httpQueue,
		mock<Logger>(),
		mock<ExceptionLogger>()
	);

	const result = await historyArchiveRangeScanner.scan(
		{ value: 'url' },
		1,
		50,
		0,
		0
	);
	expect(result.isOk()).toBeTruthy();
	if (result.isErr()) throw result.error;
	expect(result.value.latestLedgerHeader?.ledger).toEqual(50);
	expect(result.value.latestLedgerHeader?.hash).toEqual('hash');

	expect(
		categoryScanner.scanHASFilesAndReturnBucketHashes
	).toHaveBeenCalledTimes(1); //three chunks
	expect(categoryScanner.scanOtherCategories).toHaveBeenCalledTimes(1); //three chunks
	expect(bucketScanner.scan).toHaveBeenCalledTimes(1);
});
