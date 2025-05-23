import { AsyncCrawlQueue } from '../crawl-queue';

describe('CrawlQueue', () => {
	it('should initialize the crawl queue', () => {
		const crawlQueue = new AsyncCrawlQueue(10);
		crawlQueue.initialize(() => {});
		expect(crawlQueue).toHaveProperty('_crawlQueue');
	});

	it('should push a crawl task', () => {
		const crawlQueue = new AsyncCrawlQueue(10);
		crawlQueue.initialize(() => {});
		crawlQueue.push({} as any, () => {});
		expect(crawlQueue.length()).toEqual(1);
	});

	it('should return the length of the queue', () => {
		const crawlQueue = new AsyncCrawlQueue(10);
		crawlQueue.initialize(() => {});
		crawlQueue.push({} as any, () => {});
		crawlQueue.push({} as any, () => {});
		expect(crawlQueue.length()).toEqual(2);
	});

	it('should throw an error if crawl queue is not set up', () => {
		const crawlQueue = new AsyncCrawlQueue(10);
		expect(() => crawlQueue.length()).toThrow('Crawl queue not set up');
	});

	it('should call execute the workers and call the drain function', (resolve) => {
		const crawlQueue = new AsyncCrawlQueue(10);
		let counter = 0;

		crawlQueue.initialize((task: any, done: () => void) => {
			//process task
			counter++;
			done();
		});

		crawlQueue.push({ task: 'task' } as any, () => {
			//task done callback
		});

		crawlQueue.onDrain(() => {
			expect(counter).toEqual(1);
			expect(crawlQueue.length()).toEqual(0);
			expect(crawlQueue.activeTasks()).toEqual([]);
			resolve();
		});
	});

	it('should return the active workers', async () => {
		const crawlQueue = new AsyncCrawlQueue(10);
		crawlQueue.initialize(async () => {});

		crawlQueue.push({} as any, () => {
			setTimeout(() => {
				expect(crawlQueue.activeTasks().length).toEqual(1);
			}, 1000);
		});
	});
});
